'use strict';

var languages = require('../controllers/languages');

// Language authorization helpers
var hasAuthorization = function(req, res, next) {
  if (!req.user.isAdmin) {
    return res.send(401, 'User is not authorized');
  }
  next();
};

module.exports = function(Languages, app, auth) {

  app.route('/languages')
    .get(languages.all)
    .post(auth.requiresLogin, languages.create);
  app.route('/languages/:languageId')
    .get(languages.show)
    .put(auth.requiresLogin, hasAuthorization, languages.update)
    .delete(auth.requiresLogin, hasAuthorization, languages.destroy);

  // Finish with setting up the languageId param
  app.param('languageId', languages.language);
};
