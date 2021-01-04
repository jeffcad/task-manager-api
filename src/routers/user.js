const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendDeleteEmail } = require('../email/account')

const router = new express.Router()

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send()
    }
})

router.post('/users/login', async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findByCredentials(email, password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send()
    }
})

// The filter here allows for removal of a single token in the array
// This allows user to be logged in with multiple devices
// User will only be logged out of current device
// Current device token is req.token, passed from auth middleware
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, (req, res) => {
    res.send(req.user)
})

// User can update their own profile only
// req.user is attached to req by auth middleware
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid update(s).' })
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(400).send()
    }
})

// User can delete their own profile only
// req.user is attached to req by auth middleware
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendDeleteEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(500).send()
    }
})

// Configure Multer for file upload
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {

        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File must be type .jpg, .jpeg, or .png'))
        }

        cb(undefined, true)
    }
})

// Uploads an avatar, either to create it or update it
// req.user is attached to req by auth middleware
// req.file is attached to req by Multer
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        const buffer = await sharp(req.file.buffer)
            .resize({ width: 250, height: 250 })
            .png()
            .toBuffer()
        req.user.avatar = buffer
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

// req.user is attached to req by auth middleware
router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

// Gets a URL for an avatar
// This route is not behind auth because avatars are for public display
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        // Set Content-Type below seems to not be necessary in this case
        // It also works with other image types even if it says png
        res.set('Content-Type', 'image/png').send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
})

module.exports = router