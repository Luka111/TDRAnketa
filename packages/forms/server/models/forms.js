'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Form Schema
 */
var FormSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: [{
    type: Schema.ObjectId,
    //Schema.Types.ObjectId ?
    required: true,
    ref: 'Question'
  }],
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

/**
 * Validations
 */
FormSchema.path('title').validate(function(title) {
  return !!title;
}, 'Title cannot be blank');

FormSchema.path('content').validate(function(content) {
  return !!content;
}, 'Content cannot be blank');

/**
 * Statics
 */
FormSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('user', 'name username').populate('content','user title content created type label').exec(cb);
};

mongoose.model('Form', FormSchema);
