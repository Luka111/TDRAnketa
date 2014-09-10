'use strict';

//User queries

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Questionnaire = mongoose.model('Questionnaire'),
  _ = require('lodash');

/**
 * Find questionnaire by id
 */
exports.questionnaire = function(req, res, next, id) {
  Questionnaire.load(id, function(err, questionnaire) {
    if (err) return next(err);
    if (!questionnaire) return next(new Error('Failed to load questionnaire ' + id));
    var options = {
      path: 'content.user',
      select: 'name username',
      model: 'User'
    };
    Questionnaire.populate(questionnaire, options, function(err,questionnaires){
      console.log('popunio sam ti usera');
    });
    options = {
      path: 'content.content',
      select: 'title type content label required conditional kind',
      model: 'Question'
    };
    Questionnaire.populate(questionnaire, options, function(err,questionnaire){
      req.questionnaire = questionnaire;
      next();
      console.log('popunio sam ti content questiona');
    });
  });
};

/**
 * Create an questionnaire
 */
exports.create = function(req, res) {
  var questionnaire = new Questionnaire(req.body);
  questionnaire.user = req.user;

  questionnaire.save(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot save the questionnaire'
      });
    }
    res.json(questionnaire);

  });
};

/**
 * Update an questionnaire
 */
exports.update = function(req, res) {
  var questionnaire = req.questionnaire;

  questionnaire = _.extend(questionnaire, req.body);

  questionnaire.save(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot update the questionnaire'
      });
    }
    res.json(questionnaire);

  });
};

/**
 * Delete an questionnaire
 */
exports.destroy = function(req, res) {
  var questionnaire = req.questionnaire;

  questionnaire.remove(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot delete the questionnaire'
      });
    }
    res.json(questionnaire);

  });
};

/**
 * Show an questionnaire
 */
exports.show = function(req, res) {
  res.json(req.questionnaire);
};

/**
 * List of Questionnaires
 */

var onFound = function(res,err,questionnaires){
  if (err) {
    return res.json(500, {
      error: 'Cannot list the questionnaires'
    });
  }
  var options = {
    path: 'content.user',
    select: 'name username',
    model: 'User'
  };
  Questionnaire.populate(questionnaires, options, function(err,questionnaires){
    console.log('popunio sam ti usera');
  });
  options = {
    path: 'content.content',
    select: 'title type content label required conditional kind',
    model: 'Question'
  };
  Questionnaire.populate(questionnaires, options, function(err,questionnaire){
    res.json(questionnaire);
  });
};

exports.all = function(req, res) {
  Questionnaire.find().sort('-created').populate('user', 'name username').populate('content').exec(function(err, questionnaires) {
    onFound(res,err,questionnaires);
  });
};

//Questionnaire query function

exports.findQuestionnaires = function(req, res, next){
  var queryObject = {};
  if (!!req.query.language && req.query.language !== 'all'){
    queryObject.language = req.query.language;
  }
  if (!!req.query.active){
    queryObject.active = req.query.active;
  }
  Questionnaire.find(queryObject).sort('-created').populate('user', 'name username').populate('content').exec(function(err,questionnaires){
    onFound(res,err,questionnaires);
  });
};
