'use strict';


/**
  * helpers
  */

function traverseObj(obj,cb){
  for(var i in obj){
    cb(obj[i],i);
  }
}

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Poll = mongoose.model('Poll'),
  User = mongoose.model('User'),
  _ = require('lodash');

/**
 * Find poll by id
 */
exports.poll = function(req, res, next, id) {
  Poll.load(id, function(err, poll) {
    if (err) return next(err);
    if (!poll) return next(new Error('Failed to load poll ' + id));
    var options = {
      path: 'questionnaire.content',
      select: 'content',
      model: 'Form'
    };
    Poll.populate(poll, options, function(err,poll){
      options = {
        path: 'questionnaire.content.content',
        select: 'title required content kind',
        model: 'Question'
      };
      Poll.populate(poll, options, function(err,poll){
        req.poll = poll;
        next();
      });
    });
  });
};

/**
 * Create an poll
 */
exports.create = function(req, res) {
  var answers = new Poll(req.body);
  answers.user = req.user;
  console.log('poll',answers);

  answers.save(function(err) {
    if (err) {
      console.log('A mrtvi ERR',err);
      return res.json(500, {
        error: 'Cannot save the answers'
      });
    }
    console.log('OVO JE POLL UPISANI',answers);
    res.json(answers);

  });
};

/**
 * Update an poll
 */
exports.update = function(req, res) {
  var poll = req.poll;

  poll = _.extend(poll, req.body);

  poll.save(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot update the poll'
      });
    }
    res.json(poll);

  });
};

/**
 * Delete an poll
 */
exports.destroy = function(req, res) {
  var poll = req.poll;

  poll.remove(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot delete the poll'
      });
    }
    res.json(poll);

  });
};

/**
 * Show an poll
 */
exports.show = function(req, res) {
  res.json(req.poll);
};

/**
 * List of Polls
 */
exports.all = function(req, res) {
  Poll.find().sort('-created').populate('user', 'name username').populate('questionnaire','title').exec(function(err, polls) {
    if (err) {
      return res.json(500, {
        error: 'Cannot list the polls'
      });
    }
    res.json(polls);
  });
};

//FIND DISTINCT USERS THAT CREATED POLLS
function distinctLanguageProcessor(users,cb,errcb,err,data){
  if(err){
    errcb(err);
    return;
  }
  for(var i in data){
    users.push({country:data[i]});
  }
  cb(users);
}
function fillDistinctLanguages(queryObj,cb,errcb,users){
  Poll.find(queryObj).distinct('questionnaireLanguage').exec(distinctLanguageProcessor.bind(null,users,cb,errcb));
}
function distinctSupervisorProcessor(users,cb,errcb,err,data){
  if(err){
    errcb(err);
    return;
  }
  for(var i in data){
    users.push({supervisor:data[i]});
  }
  console.log(users);
  cb(users);
}
function fillDistinctSupervisors(cb,errcb,users){
  var u;
  var supervisormap = {};
  for(var i in users){
    u = users[i].user.toObject();
    supervisormap[u.myCreator] = 1;
    delete u.myCreator;
    users[i].user = u;
  }
  User.find({_id:{$in:Object.keys(supervisormap)}},{username:1, roles:1, operaters:1},distinctSupervisorProcessor.bind(null,users,cb,errcb));
}

function userPopulator(cb,err,users){
  for (var i=users.length-1; i>=0; i--){
    if (!users[i].user) users.splice(i,1);
  }
  cb(users);
}
function pollUsersHandler(cb,errcb,err,users){
  if (err) {
    errcb({
      error: 'Cannot find users'
    });
    return;
  }
  var userObj = [];
  for (var i=0; i<users.length; i++){
    userObj.push({user:users[i]});
  }
  Poll.populate(userObj,{path:'user',select:'name username roles operaters myCreator',model:'User'},userPopulator.bind(null,cb));
}
function fillDistinctUsers(queryObj,cb,errcb){
  Poll.find(queryObj).distinct('user').exec(pollUsersHandler.bind(null,cb,errcb));
}

exports.findDistinctUsers = function(req, res){
  var queryObj = {
    created:{
      $gte: req.query.dateFrom,
      $lte: req.query.dateTo
    }
  };
  var user = req.user;
  var userRole = user.roles[1]; //[0] is Authenticated
  switch (userRole){
    case 'manager':
      queryObj.questionnaireLanguage = user.language;
      break;
    case 'supervisor':
      queryObj.user = { $in : user.operaters };
      break;
  }
  //for clarity's sake
  var errcb = res.json.bind(res,500);
  var filllanguages = fillDistinctLanguages.bind(null,queryObj,res.json.bind(res),errcb);
  var fillsupervisors = fillDistinctSupervisors.bind(null,filllanguages,errcb);
  fillDistinctUsers(queryObj,fillsupervisors,errcb);
};

//POLLS QUERYING FUNCTIONS

exports.findPolls = function(req, res, next) {
  var queryObject = {};
  if (!!req.query.questionnaireLanguage){
    queryObject.questionnaireLanguage = req.query.questionnaireLanguage;
  }
  if (!!req.query.questionnaire){
    queryObject.questionnaire = req.query.questionnaire;
  }
  if (!!req.query.user){
    queryObject.user = req.query.user;
  }
  if (!!req.query.operaters){
    queryObject.user = { $in : req.query.operaters };
  }
  if (!!req.query.dateFrom){
    var dateFrom = new Date(req.query.dateFrom),dateTo;
    if (!req.query.dateTo){
      dateTo = new Date(dateFrom);
      dateTo.setDate(dateFrom.getDate() + 1);
    }else{
      dateTo = new Date(req.query.dateTo);
    }
    queryObject.created = { $gte : dateFrom , $lte : dateTo } ;
    console.log('DATEFROM',dateFrom,'DATETO',dateTo);
  }
  Poll.find(queryObject).populate('user','name username').populate('questionnaire','title').exec(function(err,polls){
    if (err) return next(err);
    if (!polls) return next(new Error('Failed to load polls'));
    console.log('OVO DOBIH',polls);
    res.json(polls);
  });
};

//Get Poll Stats
function doPopulate(populators,index,ps,cb){
  var l = (populators && populators.length)||0;
  if(index>=l){
    cb(ps);
  }else{
    populators[index].populate(ps,doPopulate.bind(null,populators,index+1,ps,cb));
  }
}

function sendPollStats(populators,res,err,ps){
  //console.log('got poll stats, err',err,'stats',ps);
  if(err){
    console.log(err.message);
    res.json([{error:err.message}]);
    return;
  }
  doPopulate(populators,0,ps,res.json.bind(res));
}

function Populator(sourcefieldname,sourcematchname,modelname,fieldname){
  this.sourcefieldname = sourcefieldname;
  this.sourcematchname = sourcematchname;
  this.model = mongoose.model(modelname);
  if(!this.model){
    throw 'No model named '+modelname;
  }
  this.fieldname = fieldname;
  this.sourcenames = {};
}
Populator.prototype.populate = function(ps,cb){
  traverseObj(ps,this.getUniqueName.bind(this));
  var findobj = {};
  findobj[this.sourcematchname] = {$in:Object.keys(this.sourcenames)};
  this.model.find(findobj,this.fieldname,this.processPopulatorQuery.bind(this,ps,cb));
};
Populator.prototype.getUniqueName = function(pse){
  this.sourcenames[pse._id[this.sourcefieldname]] = 'N/A';
};
Populator.prototype.populatorNameSetter = function(pqd){
  this.sourcenames[pqd[this.sourcematchname]] = pqd[this.fieldname];
};
Populator.prototype.populatorReplacer = function(pse){
  pse._id[this.sourcefieldname] = this.sourcenames[pse._id[this.sourcefieldname]];
};
Populator.prototype.processPopulatorQuery = function(ps,cb,err,data){
  traverseObj(data,this.populatorNameSetter.bind(this));
  traverseObj(ps,this.populatorReplacer.bind(this));
  cb();
};

var _pollQueries = {
  1: {
    match: {},
    group: {
      _id: { country: '$questionnaireLanguage' },
      total: {
        $sum: 1
      }
    }
  },
  2: {
    match: {},
    group: {
      _id: { country:'$questionnaireLanguage', questionnaire: '$questionnaire'},
      total: {
        $sum: 1
      }
    },
    populators: [
      new Populator('questionnaire','_id','Questionnaire','title')
    ]
  },
  3: {
    match: {},
    group: {
      _id: { country: '$questionnaireLanguage', user: '$user'},
      total: {
        $sum: 1
      }
    },
    populators: [
      new Populator('user','_id','User','name')
    ]
  },
  4: {
    match: {},
    group: {
      _id: { country: '$questionnaireLanguage', questionnaire: '$questionnaire', user:'$user'},
      total: {
        $sum: 1
      }
    },
    populators: [
      new Populator('questionnaire','_id','Questionnaire','title'),
      new Populator('user','_id','User','name')
    ]
  },
  5: { //This one is not for aggregate but for find
    find : true,
    match: {},
    select: { created : 1 , geoLocation : 1, user : 1, questionnaireLanguage : 1 }
  }
};

function prepareQuery(user,res,from,to,byUser,usersArray,byCountry,countryArray,q){
  var dateFrom = from ? new Date(from) : null;
  var dateTo = to ? new Date(to) : null;
  q.match.created={
    $gte : dateFrom || (new Date(new Date()-30*24*60*60*1000)),
    $lte : dateTo || (new Date())
  };
  var userRole = user.roles[1]; //[0] is Authenticated
  switch (userRole){
    case 'manager':
      q.match.questionnaireLanguage = user.language;
      break;
    case 'supervisor':
      if (!byUser){
        q.match.user = { $in : user.operaters };
      }
      break;
    default:
      if (!byCountry){
        delete q.match.questionnaireLanguage;
      }else{
        q.match.questionnaireLanguage = byCountry;
      }
      delete q.match.user;
  }
  if (!!byUser){
    q.match.user = byUser;
  }
  if (!!usersArray){
    if (!(usersArray instanceof Array)){
      var helper = [];
      helper.push(usersArray);
      usersArray = helper;
    }
    q.match.user = { $in : usersArray };
  }
  if (!!countryArray){
    if (!(countryArray instanceof Array)){
      var help = [];
      help.push(countryArray);
      countryArray = help;
    }
    q.match.questionnaireLanguage = { $in : countryArray};
  }
  if (!q.find){
    var pipeline = [];
    pipeline.push({$match:q.match});
    pipeline.push({$group:q.group});
    Poll.aggregate(pipeline,sendPollStats.bind(null,q.populators,res));
  }else{
    Poll.find(q.match, q.select, sendPollStats.bind(null,q.populators,res));
  }
}

exports.getStats = function(req, res, next){
  var q = _pollQueries[req.query.q];
  if(typeof q === 'undefined'){
    res.json([{error:'Invalid query type'}]);
    return;
  }
  var cb = prepareQuery.bind(null,req.user,res,req.query.dateFrom,req.query.dateTo,req.query.byUser,req.query.usersArray,req.query.country,req.query.countryArray,q);
  if(typeof q.preProc === 'function'){
    q.preProc(cb);
  }else{
    cb();
  }
};






