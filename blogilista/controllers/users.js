const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async(req, res) => {
    const users = await User.find({}).populate('blogit', {url: 1, title: 1, author: 1, id: 1})
    res.json(users.map(u=>u.toJSON()))
})

usersRouter.post('/', async(req, res, next) => {

    const body = req.body

    const saltRound = 10
    const passwordHash = await bcrypt.hash(body.password, saltRound)

    const user = new User( {
        username: body.username,
        name: body.name,
        passwordHash,
    })

    const savedUser = await user.save()
    res.json(savedUser)

})

module.exports = usersRouter
