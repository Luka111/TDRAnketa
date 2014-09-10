'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  GeoJSON = require('mongoose-geojson-schema'),
  Schema = mongoose.Schema;


/**
 * Polls Schema
 */
var PollSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  geoLocation: GeoJSON.Point,
  questionnaire: {
    type: Schema.ObjectId,
    required: true,
    ref: 'Questionnaire'
  },
  questionnaireLanguage: {
    type: String,
    required: true
  },
  geolocation: {
  },
  answers: [{
    title: String,
    answer: String
  }]

});

PollSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('user', 'name username').populate('questionnaire').exec(cb);
};

mongoose.model('Poll', PollSchema);
