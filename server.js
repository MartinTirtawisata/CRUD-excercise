const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { Blogpost, Author } = require('./models');
const {DATABASE_URL, PORT} = require('./config');

const app = express();

//log the HTTP layer
app.use(morgan("common"));
app.use(express.json());

//GET an author
app.get('/authors', (req, res) => {
    Author.find().then(authors => {
        res.json(authors);
    }).catch(err => {
        console.error(err);
        res.status(400).json({message: "Oh no, Error"});
    });
});

//CREATE an author
app.post('/authors', (req, res) => {
    const requiredFields = ['firstName', 'lastName','userName'];
    requiredFields.forEach(item => {
        if (!(item in req.body)){
            const message = `missing ${item} in your body`
            console.error(message);
            res.status(400).json({error: message})
        }
    })

    Author.findOne({userName: req.body.userName}).then(author => {
        if(author){
            const message = `the username ${author.userName} has been taken`
            res.status(400).json({error: message})
        } else {
            Author.create({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                userName: req.body.userName
            }).then(author => {
                res.status(201).json(author);
            }).catch(err => {
                console.error(err);
                res.status(500).json({message: "OH no, errorz"});
            })
        }
    }).catch(err => {
        console.error(err);
        res.status(500).json({message: "OH no, errorz"});
    });
})

//UPDATE an author
app.put('/authors/:author_id', (req, res) => {
    if (req.params.author_id !== req.body.id){
        const message = `${req.params.author_id} and ${req.body.id} don't match`
        console.error(message);
        res.status(400).json({messsage: message});
    }

    const requiredFields = ['firstName', 'lastName', 'userName']
    requiredFields.forEach(field => {
        if (!(field in req.body)){
            const message = `${field} is missing`
            console.error(message);
            res.status(400).json({messsage: message});
        }
    })

    Author.find({userName: req.body.userName}).then(author => {
        // if(author){
        //     res.status(400).json({message: "username taken"})
        // } else {
        Author.findByIdAndUpdate(req.params.author_id, {$set: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName
        }}).then(author => {
            console.log(author);
            res.status(203).json(author)
        }).catch(err => {
            console.error(err);
            res.status(500).json({message: "Error"});
            })
        // }
    });
});

app.delete('/authors/:id', (req, res) => {
    Author.findByIdAndRemove(req.params.id).then(author => {
        res.status(204).end();
    })
})




//GET all blogposts
app.get('/posts', (req, res) => {
    Blogpost.find()
        .then(posts => {
            console.log(posts);
            res.json(posts.map(post => {
                return {
                    id: post._id,
                    author: post.authorName,
                    content: post.content,
                    title: post.title
                };
            }));
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({message: "Internal server error"});
        });
});

//GET by id - add array of comments to the output
app.get('/posts/:id', (req, res) => {
    Blogpost.findById(req.params.id)
        .then((post) => {
            console.log(post);
            res.json({
                id: post._id,
                author: post.authorName,
                content: post.content,
                title: post.title,
                comments: post.comments
            })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: "Internal Service Error"});
        })
});

//POST a blogpost
app.post('/posts', (req, res) => {
    //checking the keys with the req.body
    const requiredFields = ['title', 'content', 'author_id'];
    for (i=0; i<requiredFields.length; i++){
        const field = requiredFields[i];
        if (!(field !== req.body)){
            const message = `Missing ${field} in the body`
            console.error(message)
            return res.status(400).send(message);
        }
    };

    Author.findById(req.body.author_id).then((author)=>{
        console.log(author)
        if (author){
            Blogpost.create({
                title: req.body.title,
                content: req.body.content,
                author: req.body.author_id
            }).then((post) => {
                console.log(post);
                res.status(201).json({
                    id: post._id,
                    author: `${author.firstName} ${author.lastName}`,
                    content: post.content,
                    title: post.title,
                    comments: post.comments
                })
            }).catch(err => {
                console.error(err);
                res.status(500).json({error: "error"})
            });
        }else{
            let message = "author not found";
            console.error(message);
            res.status(400).send(message);
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: "something went wrong"});
    });
});

// PUT blogpost
app.put('/posts/:id', (req, res) => {

    if (req.params.id && req.body.id !== req.body.id){
        console.error(`request path id (${req.params.id} and request body id (${req.body.id}) doesn't match`)
        res.status(400)
    }

    const blogUpdate = {}
    const updateField = ['title', 'content'];
    updateField.forEach(element => {
        if (element in req.body){
            blogUpdate[element] = req.body[element];
        }

    });

    Blogpost.findByIdAndUpdate(req.params.id, {$set: blogUpdate})
        .then((post) => {
            console.log(post);
            res.json({
                content: post.content,
                title: post.title,
            }).status(200).end()
        })
       
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