'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Questionnaire Schema
 */
var QuestionnaireSchema = new Schema({
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
    ref: 'Form'
  }],
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  imageFiles : [{
    type: String,
    trim: true
  }],
  videoFiles : [{
    type: String,
    trim: true
  }],
  active : {
    type: Boolean,
    required: true
  },
  language : {
    type : String,
    required: true
  },
  backgroundImage : {
    type : String
  }
});

/**
 * Validations
 */
QuestionnaireSchema.path('title').validate(function(title) {
  return !!title;
}, 'Title cannot be blank');

QuestionnaireSchema.path('content').validate(function(content) {
  return !!content;
}, 'Content cannot be blank');

/**
 * Statics
 */
QuestionnaireSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('user', 'name username').populate('content').exec(cb);
};

mongoose.model('Questionnaire', QuestionnaireSchema);
