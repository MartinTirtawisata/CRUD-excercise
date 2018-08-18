const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(express.json());

const blogpostRouter = require('./blogpostRouter');

//log the HTTP layer
app.use(morgan("common"));

//requests comes to /blogposts --> we route it to blogpostRouter
app.use('/blogposts', blogpostRouter);

//since both runServer and closeServer needs the same 'server' object; it is run outside
let server;

function runServer() {
    const myPort = process.env.PORT || 8080;
    return new Promise (function(resolve, reject) {
        server = app.listen(myPort, function() {
            console.log(`Your app is listening to port ${myPort} !!!`)
            resolve(server);
        })
        .on("error", function(err){
            reject(err);
        });
    });
}

//?? Confused at this part ??
function closeServer (){
    return new Promise (function(resolve, reject){
        console.log("closing the server woohoo");
        server.close(function(err){
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}
//??what is require.main and module??
if (require.amin === module){
    runServer().catch(function(err){ console.error(err)})
}

module.exports = {app, runServer, closeServer};