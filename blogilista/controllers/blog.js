const blogiRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')

blogiRouter.get('/', async (req, res) => {
    const blogs = await Blog.find({}).populate('user', {username: 1, name: 1, id:1})
    res.json(blogs.map(blog => blog.toJSON()))
})

blogiRouter.get('/:id', async (req, res) => {
    const blogi = await (await Blog.findById(req.params.id)).populate()
    if (blogi) {
        res.json(blogi.toJSON())
    } else {
        res.status(404).end()
    }
})

//const getTokenFrom = req => {
//    const authorization = req.get('authorization')
//    if(authorization && authorization.toLowerCase(). startsWith('bearer ')) {
//        return authorization.substring(7)
//    }
//    return null
//}

blogiRouter.post('/', async (req, res, next) => {
    const body = req.body
    middleware.tokenExtractor(req)
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    if(!req.token || !decodedToken.id) {
        return res.status(401).json({error: 'token missing or invalid'})
    }

    const user = await User.findById(decodedToken.id)
    const blogi = new Blog({
        author: body.author,
        title: body.title,
        url: body.url,
        likes:body.likes || 0,
        date: new Date(),
        user: user._id
    })

    const savedBlogi = await blogi.save()
    user.blogit = user.blogit.concat(savedBlogi._id)
    await user.save()
    res.json(savedBlogi.toJSON())
})

blogiRouter.delete('/:id', async(req, res, next) => {
    middleware.tokenExtractor(req)
    const userId = jwt.verify(req.token, process.env.SECRET).id
    if(!userId) {
        return res.status(401).json({error: 'token missing or invalid'})
    }
    const blogi = await Blog.findById(req.params.id)
    if(blogi.user.toString() === userId.toString())
    {
        blogi.delete()
    }
    res.status(204).end()
})

blogiRouter.put('/:id', (req, res, next) => {
    const body = req.body

    const blogi = {
        author: body.author,
        title: body.title,
        url: body.title,
        likes: body.likes,
    }

    Blog.findByIdAndUpdate(req.params.id, blogi, { new: true })
    .then(updatedBlogi => {
        res.json(updatedBlogi.toJSON())
    })
    .catch(error => next(error))
})

module.exports = blogiRouter