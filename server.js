const express = require('express');

const app = express();

const blogpostRouter = require('./blogpostRouter');

app.use('/blogposts', blogpostRouter);
app.use(express.json())

app.listen(process.env.PORT || 8080, () => {
    console.log(`Your app is listnening on port ${process.env.PORT || 8080}`)
})