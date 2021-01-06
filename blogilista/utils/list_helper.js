const _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const reducer = (sum, blog) => {
        return sum + blog.likes
    }

    return blogs.length === 0
        ? 0
        : blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    return blogs.length === 0
        ? 0
        : blogs.reduce((prev, current) => (prev.likes > current.likes) ? prev : current)
}

const mostBlogs = (blogs) => {
    const authors = blogs.map(blog => blog.author)
    const most = _.chain(authors).countBy().toPairs().max().value()
    return (
        {
            author: most[0],
            blogs: most[1]
        }
    )
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs
}