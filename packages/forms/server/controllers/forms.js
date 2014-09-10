'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Form = mongoose.model('Form'),
  _ = require('lodash');


/**
 * Find form by id
 */
exports.form = function(req, res, next, id) {
  Form.load(id, function(err, form) {
    if (err) return next(err);
    if (!form) return next(new Error('Failed to load form ' + id));
    var options = {
      path: 'content.user',
      select: 'name username',
      model: 'User'
    };
    Form.populate(form, options, function(err,forms){
      req.form = forms;
      next();
    });
  });
};

/**
 * Create an form
 */
exports.create = function(req, res) {
  var form = new Form(req.body);
  form.user = req.user;

  form.save(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot save the form'
      });
    }
    res.json(form);

  });
};

/**
 * Update an form
 */
exports.update = function(req, res) {
  console.log('Veruj mi da updatujem');
  var form = req.form;

  form = _.extend(form, req.body);

  form.save(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot update the form'
      });
    }
    res.json(form);

  });
};

/**
 * Delete an form
 */
exports.destroy = function(req, res) {
  var form = req.form;

  form.remove(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot delete the form'
      });
    }
    res.json(form);

  });
};

/**
 * Show an form
 */
exports.show = function(req, res) {
  res.json(req.form);
};

/**
 * List of Forms
 */
exports.all = function(req, res) {
  Form.find().sort('-created').populate('user', 'name username').populate('content','user title type content label required conditional kind').exec(function(err, forms) {
    if (err) {
      return res.json(500, {
        error: 'Cannot list the forms'
      });
    }
    var options = {
      path: 'content.user',
      select: 'name username',
      model: 'User'
    };
    Form.populate(forms, options, function(err,form){
      res.json(form);
    });

  });
};
