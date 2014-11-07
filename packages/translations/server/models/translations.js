'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Translation Schema
 */
var TranslationSchema = new Schema({
  languageId: {
    type: String,
    required: true,
    ref: 'Language'
  },
  original: {
    type: String,
    required: true,
    trim: true
  },
  translation: {
    type: String,
    trim: true
  }
});

/**
 * Statics
 */
TranslationSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('languageId', 'name').exec(cb);
};

TranslationSchema.statics.findByOriginalAndLang = function(tObj, cb){
  this.findOne({
    languageId : tObj.languageId,
    original : tObj.original
  }).exec(cb);
};

mongoose.model('Translation', TranslationSchema);
