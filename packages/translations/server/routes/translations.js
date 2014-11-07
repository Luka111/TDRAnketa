'use strict';

var translations = require('../controllers/translations');

// Translation authorization helpers
var hasAuthorization = function(req, res, next) {
  if (!req.user.isAdmin) {
    return res.send(401, 'User is not authorized');
  }
  next();
};

module.exports = function(Translations, app, auth) {

  app.route('/translations')
    .get(translations.all)
    .post(auth.requiresLogin, translations.create)
    .put(auth.requiresLogin, hasAuthorization, translations.update);
  app.route('/deleteTranslations')
    .post(auth.requiresLogin, translations.destroy);
  app.route('/translations/:translationId')
    .get(translations.show);

  // Finish with setting up the translationId param
  app.param('translationId', translations.translation);
};
