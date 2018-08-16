const express = require("express");
const router = express.Router();

const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const {BlogPosts} = require('./models');

BlogPosts.create(
    'TITLE','CONTENT','AUTHOR',
);
BlogPosts.create(
    'TITLE2','CONTENT2','AUTHOR2',
);

router.get('/', (req, res) => {
    res.json(BlogPosts.get());
})

router.post('/',jsonParser, (req, res) => {
    const reqField = ['title', 'content','author'];
    for (i=0;i<reqField.length;i++){
        if (!(reqField[i] in req.body)){
            console.error(`missing ${reqField[i]} in request body`)
            return res.status(400).send(`missing ${reqField[i]} in request body`)
        }
    }
    const addItem = BlogPosts.create(req.body.title, req.body.content, req.body.author);
    res.status(201).json(addItem);
})

router.delete('/:id', (req, res) => {
    BlogPosts.delete(req.params.id);
    res.status(204).end()
})

router.put('/:id', jsonParser, (req, res) => {
    const reqField = ['title', 'content', 'author'];
    for (i=0; i<reqField.length; i++){
        if (!(reqField[i] in req.body)){
            const message = `sorry, the following ${reqField[i]} is not found`
            console.error(message);
            res.status(400).send(message);
        }
    }

    if (req.params.id !== req.body.id){
        return res.status(400).send("error, no correct id was found")
    }

    const updatedItem = BlogPosts.update({
        id: req.params.id,
        title: req.body.title,
        content: req.body.content,
        author: req.body.author
    });
    res.status(204).end()
})



module.exports = router;