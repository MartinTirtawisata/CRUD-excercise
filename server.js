const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());
//log the HTTP layer
app.use(morgan("common"));

mongoose.Promise = global.Promise;

const { Blogpost, Author } = require('./models');

const {DATABASE_URL, PORT} = require('./config');

//GET all
// app.get('/posts', (req, res) => {
//     Blogpost.find()
//         .then((blogposts) => {
//             res.json({
//                 blogposts: blogposts.map((blogpost) => blogpost.serialize())
//             });
//         })
//         .catch(err => {
//             console.log(err);
//             res.status(500).json({message: "Internal server error"});
//         });
// });
app.get('/posts', (req, res) => {
    Blogpost.find().populate('author').then(function(err, post){
        if (err) {
            console.log(err)
        } else {
            console.log(post.author.firstName, post.author.lastName);
        }
    })
});

//GET by id
app.get('/posts/:id', (req, res) => {
    Blogpost.findById(req.params.id)
        .then((post) => {
            res.json({blogposts: post.serialize()});
        })
});

//POST a blogpost
app.post('/posts', (req, res) => {
    const requiredFields = ['title', 'content', 'author'];
    for (i=0; i<requiredFields.length; i++){
        const field = requiredFields[i];
        if (!(field !== req.body)){
            const message = `Missing ${field} in the body`
            //where should this message appear?
            console.error(message)
            return res.status(400).send(message);
        }
    };

    Blogpost.create({
        title: req.body.title,
        content: req.body.content,
        author: req.body.author
    }).then((post) => {
        res.status(201).json(post.serialize());
    }).catch((err) => {
        console.error(err);
        res.status(500).json({message: "Internal Service Error"})
    })
});

// PUT blogpost
app.put('/posts/:id', (req, res) => {

    if (req.params.id && req.body.id !== req.body.id){
        console.error(`request path id (${req.params.id} and request body id (${req.body.id}) doesn't match`)
        res.status(400)
    }

    const blogUpdate = {}
    const updateField = ['title', 'content', 'author'];
    updateField.forEach(element => {
        if (element in req.body){
            blogUpdate[element] = req.body[element];
        }

    });

    Blogpost.findByIdAndUpdate(req.params.id, {$set: blogUpdate})
        .then((post) => 
        res.status(204).end())
        .catch(err => 
            res.status(500).json({message: "Internal service error"}));
    
});

//DELETE posts
app.delete("/posts/:id", (req, res) => {
    Blogpost.findByIdAndRemove(req.params.id)
        .then(post => res.status(204).end())
        .catch((err) => res.status(500).json({message: "Internal Service Error"}));
})

//since both runServer and closeServer needs the same 'server' object; it is run outside
let server;

function runServer(databaseUrl, port = PORT) {
    return new Promise (function(resolve, reject) {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, function() {
                console.log(`Your app is listening to port ${port} !!!`)
                resolve();
            })
            .on("error", function(err){
                mongoose.disconnect();
                reject(err);
            });
        });   
    });
}

//?? Confused at this part ??
function closeServer (){
    return mongoose.disconnect().then(function(){
        return new Promise((resolve, reject), function(){
            console.log("Closing server");
            server.close(function(err){
                if (err) {
                    return reject(err);
                }
                resolve();
            })
        })
    })
}
//??what is require.main and module??
if (require.main === module){
    runServer(DATABASE_URL).catch(function(err){ console.error(err)})
}

module.exports = {app, runServer, closeServer};