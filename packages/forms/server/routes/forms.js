'use strict';

var forms = require('../controllers/forms');

// Form authorization helpers
var hasAuthorization = function(req, res, next) {
  if (!req.user.isAdmin && req.form.user.id !== req.user.id) {
    return res.send(401, 'User is not authorized');
  }
  next();
};

module.exports = function(Forms, app, auth) {

  app.route('/forms')
    .get(forms.all)
    .post(auth.requiresLogin, forms.create);
  app.route('/forms/:formId')
    .get(forms.show)
    .put(auth.requiresLogin, hasAuthorization, forms.update)
    .delete(auth.requiresLogin, hasAuthorization, forms.destroy);

  // Finish with setting up the formId param
  app.param('formId', forms.form);
};
