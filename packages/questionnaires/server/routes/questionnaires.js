'use strict';

var questionnaires = require('../controllers/questionnaires');
//var answers = require('../controllers/answers');

// Questionnaire authorization helpers
var hasAuthorization = function(req, res, next) {
  if (!req.user.isAdmin && req.questionnaire.user.id !== req.user.id) {
    return res.send(401, 'User is not authorized');
  }
  next();
};

module.exports = function(Questionnaires, app, auth) {

  app.route('/questionnaires')
    .get(questionnaires.all)
    .post(auth.requiresLogin, questionnaires.create);
  app.route('/questionnaires/:questionnaireId')
    .get(questionnaires.show)
    .put(auth.requiresLogin, hasAuthorization, questionnaires.update)
    .delete(auth.requiresLogin, hasAuthorization, questionnaires.destroy);
  app.route('/queryQuestionnaires')
    .get(auth.requiresLogin, questionnaires.findQuestionnaires); 

  // Finish with setting up the questionnaireId param
  app.param('questionnaireId', questionnaires.questionnaire);
};
