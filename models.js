'use strict';

const mongoose = require('mongoose');


let authorSchema = mongoose.Schema({
  firstName: 'string',
  lastName: 'string',
  userName: {
    type: 'string',
    unique: true
  }
});

let commentSchema = mongoose.Schema({content: 'string'});

let blogpostSchema = mongoose.Schema({
  // id: {type: Number, required: true}, //no ID needed why?
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
  comments: [commentSchema],
  publishDate: Date
});

blogpostSchema.pre('find', function(next){
  this.populate('author');
  next();
});


blogpostSchema.pre('findOne', function(next){
  this.populate('author');
  next();
});

blogpostSchema.virtual('authorName').get(function(){
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});



blogpostSchema.methods.serialize = function(){
  return {
    id: this._id,
    author: this.authorName,
    title: this.title,
    content: this.content,
    comments: this.comments
  };
};

let Author = mongoose.model('Author', authorSchema);
const Blogpost = mongoose.model('Blogpost', blogpostSchema);

module.exports = {Blogpost, Author}

