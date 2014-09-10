'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Question = mongoose.model('Question'),
  _ = require('lodash');


/**
 * Find question by id
 */
exports.question = function(req, res, next, id) {
  Question.load(id, function(err, question) {
    if (err) return next(err);
    if (!question) return next(new Error('Failed to load question ' + id));
    req.question = question;
    next();
  });
};

/**
 * Create an question
 */
exports.create = function(req, res) {
  var question = new Question(req.body);
  question.user = req.user;
  console.log('QUESTION',question);

  question.save(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot save the question'
      });
    }
    res.json(question);

  });
};

/**
 * Update an question
 */
exports.update = function(req, res) {
  var question = req.question;

  question = _.extend(question, req.body);

  question.save(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot update the question'
      });
    }
    res.json(question);

  });
};

/**
 * Delete an question
 */
exports.destroy = function(req, res) {
  var question = req.question;

  question.remove(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot delete the question'
      });
    }
    res.json(question);

  });
};

/**
 * Show an question
 */
exports.show = function(req, res) {
  res.json(req.question);
};

/**
 * List of Questions
 */

//Helper function for querying image/video questions

function queryQuestion(req,res,Type){
  Question.findOne({'type' : Type},function(err,ques){
    if (err) {
      return res.json(500, {
        error: 'Cannot list the questions'
      });
    }
    console.log('Trazim Question',Type,'!');
    if (!ques){
      console.log('Nisam naso, upisujem u bazu!');
      var question = new Question({
        title:'',
        content: [],
        type: Type,
        label: ''
      });
      question.save(function(err) {
        if (err) {
          return res.json(500, {
            error: 'Cannot save the question'
          });
        }
      });
    }else{
      console.log('Naso sam, sve kul!');
    }
  });
}

exports.all = function(req, res) {
  queryQuestion(req,res,'Image');
  queryQuestion(req,res,'Video');
  //TODO inserting into db coming late and Image/Video questions are not in questions array after find()
  //After refreshing they are there, not big deal because it is rare, but need fix
  Question.find().sort('-created').populate('user', 'name username').exec(function(err, questions) {
    if (err) {
      return res.json(500, {
        error: 'Cannot list the questions'
      });
    }
    res.json(questions);

  });
};
