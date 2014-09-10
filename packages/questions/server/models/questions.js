'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Question Schema
 */
var QuestionSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    //required: true,
    trim: true
  },
  kind: {
    type: String,
    trim: true
  },
  required: {
    type: Boolean,
    //required: true,
    trim: true
  },
  conditional: {
    kind: String,
    value: String 
  },
  content: [{
    type: String,
    //required: true,
    trim: true
  }],
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    required: true
  },
  label: {
    type: String,
    trim: true
  }
});

/**
 * Validations
QuestionSchema.path('title').validate(function(title) {
  return !!title;
}, 'Title cannot be blank');

QuestionSchema.path('content').validate(function(content) {
  return !!content;
}, 'Content cannot be blank');
 */

/**
 * Statics
 */
QuestionSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('user', 'name username').exec(cb);
};

mongoose.model('Question', QuestionSchema);
