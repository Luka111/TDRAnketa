'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Language = mongoose.model('Language'),
  _ = require('lodash');


/**
 * Find language by id
 */
exports.language = function(req, res, next, id) {
  Language.load(id, function(err, language) {
    if (err) return next(err);
    if (!language) return next(new Error('Failed to load language ' + id));
    req.language = language;
    next();
  });
};

/**
 * Create an language
 */
exports.create = function(req, res) {
  req.body._id = req.body.languageId;
  delete req.body.languageId;
  var language = new Language(req.body);

  language.save(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot save the language'
      });
    }
    res.json(language);

  });
};

/**
 * Update an language
 */
exports.update = function(req, res) {
  var language = req.language;

  language = _.extend(language, req.body);

  language.save(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot update the language'
      });
    }
    res.json(language);

  });
};

/**
 * Delete an language
 */
exports.destroy = function(req, res) {
  var language = req.language;

  language.remove(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot delete the language'
      });
    }
    res.json(language);

  });
};

/**
 * Show an language
 */
exports.show = function(req, res) {
  res.json(req.language);
};

/**
 * List of Languages
 */
exports.all = function(req, res) {
  Language.find().sort('_id').exec(function(err, languages) {
    if (err) {
      return res.json(500, {
        error: 'Cannot list the languages'
      });
    }
    res.json(languages);

  });
};
