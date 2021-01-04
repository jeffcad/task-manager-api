const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    setupDatabase
} = require('./fixtures/db')

beforeEach(setupDatabase)

test('should sign up a new user', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: "Jest",
            email: "jest@test.com",
            password: 'verysecure'
        })
        .expect(201)

    // Assert that the database was changed correctly, user was created
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: "Jest",
            email: "jest@test.com"
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('verysecure')
})

test('should login to existing account', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200)

    // Check that returned token in response is correct
    // Matching 2nd token in user because 1st was set in creation of userOne 
    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('should fail to login, non-existent user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'fail@test.com',
            password: userOne.password
        })
        .expect(400)
})

test('should read user profile', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('should delete user account', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    // check if avatar is binary data in a buffer
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('should update valid user field(s)', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Test Updated',
            age: 44
        })
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toMatchObject({ name: 'Test Updated', age: 44 })
})

test('should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({ country: 'Australia' })
        .expect(400)
})