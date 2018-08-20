'use strict';

const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({content: 'string'});
const authorSchema = mongoose.Schema({
  firstName: 'string',
  lastName: 'string',
  userName: {
    type: 'string',
    unique: true
  }
});

const blogpostSchema = mongoose.Schema({
  // id: {type: Number, required: true}, //no ID needed why?
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: { type: mongoose.Schema.Types.ObjectId, ref: "Author"},
  comment: [commentSchema],
  publishDate: Date
});

blogpostSchema.virtual('authorString').get(function(){
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogpostSchema.methods.serialize = function(){
  return {
    id: this._id,
    title: this.title,
    content: this.content,
    author: this.authorString
  };
};

const Author = mongoose.model('Author', authorSchema);
const Blogpost = mongoose.model('Blogpost', blogpostSchema);

module.exports = {Blogpost}
module.exports = { Author }
