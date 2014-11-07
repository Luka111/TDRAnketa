'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Language Schema
 */
var LanguageSchema = new Schema({
  _id: {
    type: String
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
});

/**
 * Statics
 */
LanguageSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).exec(cb);
};

mongoose.model('Language', LanguageSchema);
