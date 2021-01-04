const express = require('express')
const mongoose = require('mongoose')
const Task = require('../models/task')
const auth = require('../middleware/auth')

const router = new express.Router()

// req.user is attached to req by auth middleware
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send()
    }
})

// /tasks?completed=true
// /tasks?limit=10&skip=20
// /tasks?sortBy=createdAt_asc
// req.user is attached to req by auth middleware
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    // Match by completed status and description text
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    if (req.query.description) {
        match.description = new RegExp(req.query.description, 'i')
    }

    // Sort object, ie. { createdAt: -1 } for descending
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split('_')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        const tasks = await Task.find(
            { // Search by owner and spread of match object
                owner: req.user._id,
                ...match
            },
            null, // Used to select fields to return, null=all
            { // Options, will be ignored if not passed in query
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            })

        res.send(tasks)

        // Can also use these lines instead of above method
        // await req.user.populate({path: 'tasks', match, options: {limit: parseInt(req.query.limit), skip: parseInt(req.query.skip)}).execPopulate()
        // res.send(req.user.tasks)

    } catch (error) {
        res.status(500).send()
    }
})

// req.user is attached to req by auth middleware
router.get('/tasks/:id', auth, async (req, res) => {
    const taskId = req.params.id

    if (!mongoose.isValidObjectId(taskId)) {
        return res.status(400).send({ error: 'ID is not properly formatted.' })
    }

    try {
        const task = await Task.findOne({ _id: taskId, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (error) {
        res.status(500).send()
    }
})

// req.user is attached to req by auth middleware
router.patch('/tasks/:id', auth, async (req, res) => {
    const taskId = req.params.id

    if (!mongoose.isValidObjectId(taskId)) {
        return res.status(400).send({ error: 'ID is not properly formatted.' })
    }

    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid update key(s).' })
    }

    try {
        const task = await Task.findOne({ _id: taskId, owner: req.user._id })

        if (!task) {
            return res.status(404).send({ error: `Task was not found.` })
        }

        updates.forEach(update => task[update] = req.body[update])
        await task.save()

        res.send(task)
    } catch (error) {
        res.status(400).send()
    }
})

// req.user is attached to req by auth middleware
router.delete('/tasks/:id', auth, async (req, res) => {
    const taskId = req.params.id

    if (!mongoose.isValidObjectId(taskId)) {
        return res.status(400).send({ error: 'ID is not properly formatted.' })
    }

    try {
        const task = await Task.findOneAndDelete({ _id: taskId, owner: req.user._id })

        if (!task) {
            return res.status(404).send({ error: `Task was not found.` })
        }

        res.send(task)
    } catch (error) {
        res.status(500).send()
    }
})

module.exports = router