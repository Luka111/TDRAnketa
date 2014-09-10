'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Poll = mongoose.model('Poll'),
  _ = require('lodash'),
  async = require('async'),
  config = require('meanio').loadConfig(),
  crypto = require('crypto'),
  nodemailer = require('nodemailer'),
  templates = require('../template');

/**
 * Auth callback
 */
exports.authCallback = function(req, res) {
  res.redirect('/');
};

/**
 * Show login form
 */
exports.signin = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.redirect('#!/login');
};

/**
 * Logout
 */
exports.signout = function(req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * Session
 */
exports.session = function(req, res) {
  res.redirect('/');
};

/**
 * Create user
 */
exports.create = function(req, res, next) {
  var user = new User(req.body);

  user.provider = 'local';

  // because we set our user.provider to local our models/user.js validation will always be true
  req.assert('name', 'You must enter a name').notEmpty();
  req.assert('email', 'You must enter a valid email address').isEmail();
  req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
  req.assert('username', 'Username cannot be more than 20 characters').len(1, 20);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  // Hard coded for now. Will address this with the user permissions system in v0.3.5
  user.roles = ['authenticated'];
  user.roles.push(req.body.roles);
  user.save(function(err,user) {
    if (err) {
      switch (err.code) {
        case 11001:
          res.status(400).send([{
            msg: 'Email already taken',
            param: 'email'
          }]);
          break;
        case 11000:
          res.status(400).send([{
            msg: 'Username already taken',
            param: 'username'
          }]);
          break;
        default:
          var modelErrors = [];

          if (err.errors) {

            for (var x in err.errors) {
              modelErrors.push({
                param: x,
                msg: err.errors[x].message,
                value: err.errors[x].value
              });
            }

            res.status(400).send(modelErrors);
          }
      }

      return res.status(400);
    }
    /*
    ---EXCLUDED---
    req.logIn(user, function(err) {
      if (err) return next(err);
      return res.redirect('/');
    });
    */
    console.log('OVO SAM NAPRAVIO',user);
    res.json(user._id);
  });
};
/**
 * Send User
 */
exports.me = function(req, res) {
  res.json(req.user || null);
};

/**
 * Find user by id
 */
/* NOWHERE USED
exports.user = function(req, res, next, id) {
  User
    .findOne({
      _id: id
    })
    .exec(function(err, user) {
      if (err) return next(err);
      if (!user) return next(new Error('Failed to load User ' + id));
      req.profile = user;
      next();
    });
};
*/

/**
 * Resets the password
 */

exports.resetpassword = function(req, res, next) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function(err, user) {
    if (err) {
      return res.status(400).json({
        msg: err
      });
    }
    if (!user) {
      return res.status(400).json({
        msg: 'Token invalid or expired'
      });
    }
    req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    var errors = req.validationErrors();
    if (errors) {
      return res.status(400).send(errors);
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.save(function(err) {
      req.logIn(user, function(err) {
        if (err) return next(err);
        return res.send({
          user: user,
        });
      });
    });
  });
};

/**
 * Send reset password email
 */
function sendMail(mailOptions) {
  var transport = nodemailer.createTransport('SMTP', config.mailer);
  transport.sendMail(mailOptions, function(err, response) {
    if (err) return err;
    return response;
  });
}

/**
 * Callback for forgot password link
 */
exports.forgotpassword = function(req, res, next) {
  async.waterfall([

      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({
          $or: [{
            email: req.body.text
          }, {
            username: req.body.text
          }]
        }, function(err, user) {
          if (err || !user) return done(true);
          done(err, user, token);
        });
      },
      function(user, token, done) {
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        user.save(function(err) {
          done(err, token, user);
        });
      },
      function(token, user, done) {
        var mailOptions = {
          to: user.email,
          from: config.emailFrom
        };
        mailOptions = templates.forgot_password_email(user, req, token, mailOptions);
        sendMail(mailOptions);
        done(null, true);
      }
    ],
    function(err, status) {
      var response = {
        message: 'Mail successfully sent',
        status: 'success'
      };
      if (err) {
        response.message = 'User does not exist';
        response.status = 'danger';
      }
      res.json(response);
    }
  );
};

/**
 * Find user by id
 */
exports.user= function(req, res, next, id) {
  User.load(id, function(err, user) {
    if (err) return next(err);
    if (!user) return next(new Error('Failed to load user' + id));
    Poll.find({user : id}).sort('-created').populate('user','name username').populate('questionnaire', 'title').exec(function(err,polls){
      req.polls = polls;
      req.user = user;
      next();
    });
    //req.user = user;
    //next();
  });
};

/**
 * Update an article
 */
exports.update = function(req, res) {
  var user = req.user;
  console.log('AJ PRE',req.body);

  user = _.extend(user, req.body);

  user.save(function(err) {
    console.log('UPDATOVO U OVO',user);
    if (err) {
      return res.json(500, {
        error: 'Cannot update the user'
      });
    }
    res.json(user);

  });
};

/**
 * Delete an article
 */
exports.destroy = function(req, res) {
  var user = req.user;

  user.remove(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot delete the user'
      });
    }
    res.json(user);

  });
};

/**
 * Show an article
 */
exports.show = function(req, res) {
  var userAndPolls = {};
  userAndPolls.polls = req.polls;
  userAndPolls = _.extend(userAndPolls,req.user._doc);
  console.log('User AND POLLS',userAndPolls);
  res.json(userAndPolls);
};

/**
 * List of Articles
 */

exports.all = function(req, res) {
  User.find().select('email username name roles language').exec(function(err, users) {
    if (err) {
      return res.json(500, {
        error: 'Cannot list the users'
      });
    }
    res.json(users);
  });
};

/**
 * USERS QUERY
 */

exports.findUsers = function(req, res, next){
  var queryObject = {};
  if (!!req.query.language && req.query.language !== 'all'){
    queryObject.language = req.query.language;
  }
  if (!!req.query.userRole){
    queryObject.roles = req.query.userRole;
  }
  User.find(queryObject).select('email username name roles language operaters').exec(function(err,users){
    if (err) {
      return res.json(500, {
        error: 'Cannot list the users'
      });
    }
    res.json(users);
  });
};

/**
 * USERS QUERY
 */

exports.findUsersForSupervisor = function(req, res, next){
  if (!(req.query.operaters instanceof Array)){
    var makeArray = [];
    makeArray.push(req.query.operaters);
    req.query.operaters = makeArray;
  }
  User.find({'_id': { $in : req.query.operaters}}).select('email username name roles language').exec(function(err,users){
    if (err) {
      return res.json(500, {
        error: 'Cannot list the users'
      });
    }
    res.json(users);
  });
};

/**
 * INSERT NEW OPERATER
 */

exports.insertOperater = function(req, res, next){
  User.findOne({'_id':req.body.supervisorId}).exec(function(err,user){
    if (err) {
      return res.json(500, {
        error: 'Cannot find the supervisor'
      });
    }
    var updatedOperaters = user.operaters.slice();
    updatedOperaters.push(req.body.operaterId);
    console.log('Sta je ovo',updatedOperaters);
    user.update({ operaters : updatedOperaters },function(err){
      if (err) {
        return res.json(500, {
          error: 'Cannot update the supervisor'
        });
      }
      res.status(200).json(req.body.operaterId);
    });
  });
};



