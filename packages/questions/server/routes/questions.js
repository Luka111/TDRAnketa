'use strict';

var questions = require('../controllers/questions');

// Question authorization helpers
var hasAuthorization = function(req, res, next) {
  if (!req.user.isAdmin && req.question.user.id !== req.user.id) {
    return res.send(401, 'User is not authorized');
  }
  next();
};

module.exports = function(Questions, app, auth) {

  app.route('/questions')
    .get(questions.all)
    .post(auth.requiresLogin, questions.create);
  app.route('/questions/:questionId')
    .get(questions.show)
    .put(auth.requiresLogin, hasAuthorization, questions.update)
    .delete(auth.requiresLogin, hasAuthorization, questions.destroy);

  // Finish with setting up the questionId param
  app.param('questionId', questions.question);
};
