const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blogi = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')



describe('when there is initially some blogs saved', () => {
    beforeEach(async () => {
        await Blogi.deleteMany({})
        await Blogi.insertMany(helper.initialBlogs)
    })
    
    

    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogit')
            .expect(200)
    
            .expect('Content-Type', /application\/json/)
    })
    
    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogit')
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })
    
    test('a specific blog is within the returned blogs', async () => {
        const response = await api.get('/api/blogit')
        const titles = response.body.map(b => b.title)
        expect(titles).toContain('First class tests')
    })
    
    describe('viewing a specific blog', () => {
        test('the identifier has the name id', async () => {
            const blogs = await helper.blogsInDb()
            const ids = blogs.map(blogi => blogi.id)
            expect(ids[0]).toBeDefined()
        })
        
    })
    
    describe('addition of a new blog', () => {
        test('a valid blog can be added', async () => {
            const newBlog = {
                title: "Type wars",
                author: "Robert C. Martin",
                url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
                likes: 2
            }
        
            await api
            .post('/api/blogit')
            .send(newBlog)
            .set('Authorization', 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im03c24iLCJpZCI6IjVmZjU3YjdhZDcxNzY5MWVlY2JjNTQzMSIsImlhdCI6MTYwOTkyMzYzNX0.QJmtLL5P6IXLvpBIzkm6d2AYnIgV2xvltvBLi3ba0QU')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        
            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd.length).toBe(helper.initialBlogs.length+1)

            const titles = blogsAtEnd.map(b=>b.title)
            expect(titles).toContain('Type wars')
        })
        
        test('empty likes field is filled with zero', async() => {
            const newBlog = {
                title: "TDD harms architecture",
                author: "Robert C. Martin",
                url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html"
            }
        
            await api
            .post('/api/blogit')
            .send(newBlog)
            .set('Authorization', 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im03c24iLCJpZCI6IjVmZjU3YjdhZDcxNzY5MWVlY2JjNTQzMSIsImlhdCI6MTYwOTkyMzYzNX0.QJmtLL5P6IXLvpBIzkm6d2AYnIgV2xvltvBLi3ba0QU')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        
            const returnedBlogs = await helper.blogsInDb()
            expect(returnedBlogs[returnedBlogs.length-1].likes).toBe(0)
        })
    })
    
    describe('fails with status code 400 if data invalid', () => {
        test('bad request', async() => {
            const newBlogi = {
                author: "Michael Chan",
                likes: 5
            }
        
            await api
            .post('/api/blogit')
            .send(newBlogi)
            .set('Authorization', 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im03c24iLCJpZCI6IjVmZjU3YjdhZDcxNzY5MWVlY2JjNTQzMSIsImlhdCI6MTYwOTkyMzYzNX0.QJmtLL5P6IXLvpBIzkm6d2AYnIgV2xvltvBLi3ba0QU')
            .expect(400)
        
            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
        })
        
    })
    
    describe('updating of a blog', () => {
        test('updating a blog is possible', async() => {
            const updatedBlog = {
                author: "Robert C. Martin",
                title: "First class tests",
                url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
                likes: 12,
            }
            await api
            .put('/api/blogit/5ff19d37253813061433c223', updatedBlog)
            .set('Authorization', 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im03c24iLCJpZCI6IjVmZjU3YjdhZDcxNzY5MWVlY2JjNTQzMSIsImlhdCI6MTYwOTkyMzYzNX0.QJmtLL5P6IXLvpBIzkm6d2AYnIgV2xvltvBLi3ba0QU')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        }) 
    })
    describe('when there is initially one user at db', ()=> {
        beforeEach(async() => {
            await User.deleteMany({})
            
            const passwordHash = await bcrypt.hash('sekret', 10)
            const user = new User({username: 'root', passwordHash})
    
            await user.save()
        })
    
        test('creation succeeds with a fresh username', async() => {
            const usersAtStart = await helper.usersInDb()
    
            const newUser = {
                username: 'm7sn',
                name: 'Muhsen Almasry',
                password: 'Passw0rd'
            }
    
            await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
    
            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length+1)
    
            const usernames = usersAtEnd.map(u=>u.username)
            expect(usernames).toContain(newUser.username)
        })
    })
})

afterAll(() => {
    mongoose.connection.close()
}) 