'use strict';

var polls = require('../controllers/polls');

// Poll authorization helpers
var hasAuthorization = function(req, res, next) {
  if (!req.user.isAdmin && req.poll.user.id !== req.user.id) {
    return res.send(401, 'User is not authorized');
  }
  next();
};

module.exports = function(Polls, app, auth) {

  app.route('/polls')
    .get(polls.all)
    .post(auth.requiresLogin, polls.create);
  app.route('/polls/:pollId')
    .get(polls.show)
    .put(auth.requiresLogin, hasAuthorization, polls.update)
    .delete(auth.requiresLogin, hasAuthorization, polls.destroy);
  app.route('/pollsQuery')
    .get(polls.findPolls);
  app.route('/distinctUsers')
    .get(polls.findDistinctUsers);
  app.route('/pollStats')
    .get(polls.getStats);

  // Finish with setting up the pollId param
  app.param('pollId', polls.poll);
};
