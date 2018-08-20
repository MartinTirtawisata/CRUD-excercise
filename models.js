'use strict';

const mongoose = require('mongoose');

const blogpostSchema = mongoose.Schema({
  // id: {type: Number, required: true}, //no ID needed why?
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: {
    firstName: {type: String, required: true},
    lastName: {type: String, required: true}
  },
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

const Blogpost = mongoose.model('Blogpost', blogpostSchema);

module.exports = {Blogpost}
