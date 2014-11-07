'use strict';
/*global jQuery:false */

angular.module('mean.polls').controller('PollsController', ['$scope', '$rootScope', '$window', '$stateParams', '$location', 'Global', 'Polls', 'Questionnaires', 'queryQuestionnaires', 'PollsQuery', 'DistinctUsers', 'PollStats', 'identityService','clientStorage','QuestionnaireHandler',
  function($scope, $rootScope, $window, $stateParams, $location, Global, Polls, Questionnaires, queryQuestionnaires, PollsQuery, DistinctUsers, PollStats, identityService, clientStorage, QuestionnaireHandler) {
    function setQuestionnaireFromCS(q){
      console.log('got questionnaire',q);
    }
    clientStorage.get('global','questionnaire',setQuestionnaireFromCS);
    $scope.global = Global;

    $scope.content = [];
    $scope.distinctUsers = [];
    $scope.distinctSupervisors = [];
    $scope.distinctCountries = [];

    $scope.hasAuthorization = function(poll) {
      if (!poll) return false;
      if(!($rootScope && $rootScope.user && $rootScope.user.roles && $rootScope.user.roles.indexOf)){
        return false;
      }
      return ($rootScope.user.roles.indexOf('manager') !== -1);
    };
    $scope.contentMissing = false;

    //Language config
    $scope.languageShortcodeArray = $scope.global.languageShortcodes;

    function sendPoll(obj,lokation){
      var poll;
      //fetch from clientStorage
      poll.$save(function(response){
        //$timeout
      });
    }

    function savePoll(obj,lokation){
      obj.geoLocation = {'type':'Point',coordinates:[lokation.coords.longitude,lokation.coords.latitude]};
      var poll = new Polls(obj);
      clientStorage.save('results',(new Date()).getTime(),poll,function(result){
        $scope.$apply(function(){
          $scope.questionnaire.reset();
        });
      });
    }

    $scope.create = function(isValid) {
      if(!$scope.questionnaire) return;
      if (isValid) {
        $scope.questionnaire.save();
      }
    };

    $scope.remove = function(poll) {
      if (poll) {
        poll.$remove();

        for (var i in $scope.polls) {
          if ($scope.polls[i] === poll) {
            $scope.polls.splice(i, 1);
          }
        }
        $location.url('/polls');
      } else {
        $scope.poll.$remove(function(response) {
          $location.url('/polls');
        });
      }
    };

    $scope.update = function(isValid) {
      if (isValid) {
        var poll = $scope.poll;
        if (!poll.updated) {
          poll.updated = [];
        }
        poll.updated.push(new Date().getTime());

        poll.$update(function() {
          $location.path('polls/' + poll._id);
        });
      }
    };

    $scope.find = function() {
      Polls.query(function(polls) {
        $scope.polls = polls;
      });
    };

    //Find polls and clear criteria
    $scope.findAndClearCriteria = function(){
      $scope.find();
      for (var i in $scope.criteria){
        $scope.criteria[i] = null;
      }
    };

    //Find polls and find questionnaires
    $scope.findPollsAndQuestionnaires = function(){
      $scope.find();
      $scope.findAllQuestionnaires();
      $scope.findDistinctUsers();
    };

    //Find polls by language (for managers)
    $scope.findPollsByLang = function(){
      PollsQuery.query({
        questionnaireLanguage: $scope.myLanguage
      },function(polls){
        $scope.polls = polls;
      });
    };

    //Find polls for supervisor (only their operaters polls)
    $scope.findPollsForSupervisor = function(){
      PollsQuery.query({
        operaters: $rootScope.user.operaters
      },function(polls){
        $scope.polls = polls;
      });
    };

    function exchangeArray(arrydst,arrysrc){
      arrydst.splice(0);
      arrydst.push.apply(arrydst,arrysrc);
    }

    function sortOutDistinctUsers(usersandsupervisors){
      var du=[], ds=[], dc=[];
      for(var i in usersandsupervisors){
        var us = usersandsupervisors[i];
        if(us.user){
          console.log(us.user);
          du.push({user:us.user});
        }
        if(us.supervisor){
          ds.push({user:us.supervisor});
        }
        if(us.country){
          dc.push(us.country);
        }
      }
      exchangeArray($scope.distinctUsers,du);
      exchangeArray($scope.distinctSupervisors,ds);
      exchangeArray($scope.distinctCountries,makeLanguageArrayOfObj(dc));
      jQuery(window).resize();
      $scope.disableQuery = false;
    }

    //FIND DISTINCT USERS THAT CREATED POLLS (OPERATERS) 
    $scope.findDistinctUsers = function(){
      $scope.disableQuery = true;
      $scope.distinctUsers = [];
      $scope.distinctSupervisors = [];
      $scope.distinctCountries = [];
      DistinctUsers.query({dateFrom:truncDay($scope.stats.dateFrom),dateTo:truncDay($scope.stats.dateTo)},sortOutDistinctUsers);
    };

    $scope.findOne = function() {
      Polls.get({
        pollId: $stateParams.pollId
      }, function(poll) {
        $scope.poll = poll;
      });
    };

    //findOne editing version with populating answer options
    $scope.findOneAndPopulateAnswers = function(){
      Polls.get({
        pollId: $stateParams.pollId
      }, function(poll) {
        $scope.poll = poll;
        $scope.checkedAnswers = [];
        var questionCounter = 0;
        for (var i=0; i<poll.questionnaire.content.length; i++){
          var form = poll.questionnaire.content[i];
          for (var j=0; j<form.content.length; j++){
            var question = form.content[j];
            var titleAnswerObj = {};
            titleAnswerObj.answers = [];
            if (question.title !== ''){
              //Question
              titleAnswerObj.title = question.title; 
              titleAnswerObj.required = question.required;
              titleAnswerObj.answerId = questionCounter;
              for (var k=0; k<question.content.length; k++){
                var answer = question.content[k];
                titleAnswerObj.answers.push(answer);
              }
              //In case the questionnaire is changed, and there are more questions
              //We are adding 'empty' objects so double-bind is still working
              if (poll.answers.length <= questionCounter){
                poll.answers.push({title : question.title,answer : ''});
              }
              $scope.checkedAnswers.push(titleAnswerObj);
              questionCounter++;
            }
          }
        }
      });
    };
    
    //Carousel fundamental
    $scope.slideIndex = 0;

    //Find all questionnaires
    $scope.findAllQuestionnaires = function(){
      Questionnaires.query(function(questionnaires){
        $scope.allQuestionnaires = questionnaires;
      });
    };

    $scope.initFunctionIndicators = {
      findQuestionnaires : false,
      findMyPolls : false,
      findQuestionnairesByLang : false,
      findQuestionnaireAndInitAnswers : false
    }

    function preventQueryIfNotUser(fnName){
      if ($rootScope.user.roles[0] === ''){
        $scope.initFunctionIndicators[fnName]= true;
        return;
      }
    }

    //Questionnaires query
    $scope.findQuestionnaires = function(){
      preventQueryIfNotUser('findQuestionnaires');
      queryQuestionnaires.query({
        active : true,
        language : $rootScope.user.language
      },function(questionnaires) {
        $scope.questionnaires = questionnaires;
        if ($scope.languageShortcodeArray[0] !== 'all'){
          $scope.languageShortcodeArray.unshift('all');
        }
      });
      $scope.language = $rootScope.user.language;
    };

    //Find polls for user
    $scope.findMyPolls = function(){
      preventQueryIfNotUser('findMyPolls');
      PollsQuery.query({
        user: $rootScope.user._id,
        dateFrom: truncDay(new Date())
      },function(polls){
        $scope.polls = polls;
      });
    };

    //Find Questionnaires by lang
    $scope.findQuestionnairesByLang = function(lang){
      preventQueryIfNotUser('findQuestionnairesByLang');
      queryQuestionnaires.query({
        active : true,
        language: lang
      },function(questionnaires) {
        $scope.questionnaires = questionnaires;
      });
    };

    //Check if Top admin or Client admin
    $scope.ifTopOrClientAdmin = function(){
      return ($rootScope.user.roles.indexOf('top-admin') !== -1) || ($rootScope.user.roles.indexOf('client-admin') !== -1);
    };
    
    //Redirect to the create poll page
    $scope.redirectToCreate = function(questionnaireId){
      window.questionnaireId = questionnaireId;
      $location.path('polls/create/' + questionnaireId);
    };

    //Function for finding poll and initializing Answers array
    //Executed when poll.html is loaded

    function reallyFindQuestionnaireAndInitAnswers(){
      if (!window.questionnaireId){
        if (!!$stateParams.questionnaireId){
          window.questionnaireId = $stateParams.questionnaireId;
        }else{
          $scope.noQuestionnaire = true;
          return;
        }
      }
      //Always adding questionnaireId to url if possible (known)
      var urlParams = $location.url().split('/');
      if (urlParams[urlParams.length-1] === ''){
        if (!!window.questionnaireId){
          urlParams[urlParams.length-1] = window.questionnaireId;
          var newUrlParams = urlParams.join('/'); 
          $location.path(newUrlParams);
        }
      }
      Questionnaires.get({
        questionnaireId: window.questionnaireId 
      }, function(questionnaire) {
        initAnswers(questionnaire);
        $scope.showQuestionnaire = true;
      });
    }
    function applyQuestionnareData(q){
      $scope.questionnaire = new QuestionnaireHandler($scope,q);
    }
    function dodaFindQuestionnaireAndInitAnswers(q){
      if(q){
        $scope.$apply(applyQuestionnareData.bind(null,q));
      }else{
        reallyFindQuestionnaireAndInitAnswers();
      }
    }

    $scope.findQuestionnaireAndInitAnswers = function() {
      preventQueryIfNotUser('findQuestionnaireAndInitAnswers');
      //Recovery from URL, never forget chosen questionnaire
      clientStorage.get('global','questionnaire',dodaFindQuestionnaireAndInitAnswers);
    };

    function initAnswers(questionnaire){
      if($scope.questionnaire){
        $scope.questionnaire.destroy();
      }
      QuestionnaireHandler.produce($scope,questionnaire);
      //$scope.questionnaire = new QuestionnaireHandler($scope,questionnaire);
    }

    //Removing current questionnaire and let the operator choose another one
    $scope.removeQuestionnaire = function(){
      if($scope.questionnaire){
        $scope.questionnaire.destroy();
      }
      $scope.questionnaire = null;
      $location.path('polls/active');
    };
    

    //Helper function for disabling
    var disableQuestions = function(form,question,qfId){
      form.disable(question,qfId);
      if (form._id === $scope.loadedForms[$scope.loadedForms.length-1]._id) $scope.questionnaire.addToLoadedForms();
    };

    //Helper function for enabling 
    var enableQuestions = function(form,question,qfId){
      form.enable(question);
    };

    //Change slide
    $scope.changeSlide = function(index){
      if (index >= $scope.loadedForms.length){
        return;
      }
      $scope.slideIndex = index;
    };

    //Remove answer, only if the question is not required
    $scope.removeAnswer = function(question){
      if (!question.required){
        question.answer = '';
        question.isToggled = !question.isToggled;
      }
    };

    //POLLS QUERYING
    //Statics

    $scope.criteria = {
      questionnaire : null,
      user : null,
      questionnaireLanguage : null,
      dateFrom : null,
      dateTo : null
    };

    $scope.dateFromSelected = false;

    $scope.pollsQueryAndSelect = function(){
      $scope.dateFromSelected = true;
      $scope.pollsQuery();
    };

    function truncDay(date){
      var returnDate;
      if(date){
        if(!(date instanceof Date)){
          date = new Date(date);
        }
        returnDate = (date.getMonth()+1) + '-' + date.getDate() + '-' + date.getFullYear();
      }
      return returnDate;
    }

    $scope.pollsQuery = function(){
      var dateFromCriteria = truncDay($scope.criteria.dateFrom);
      var dateToCriteria = truncDay($scope.criteria.dateTo);
      PollsQuery.query({
        questionnaire: $scope.criteria.questionnaire,
        user: $scope.criteria.user,
        questionnaireLanguage: $scope.criteria.questionnaireLanguage,
        dateFrom: dateFromCriteria,
        dateTo: dateToCriteria
      },function(polls){
        $scope.polls = polls;
      });
    };

    $scope.removeCriteria = function(param){
      if (param ==='dateFrom'){
        $scope.criteria.dateTo = null;
        $scope.dateFromSelected = false;
      }
      $scope.criteria[param] = null;
      $scope.pollsQuery();
    };

    $scope.dateOptions = {
      closeOnDateSelection:true,
      formatYear: 'yy',
      startingDay: 1
    };

    $scope.open1 = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.opened1 = !$scope.opened1;
    };

    $scope.open2 = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.opened2 = !$scope.opened2;
    };

    //POLL STATS

    function chooseTabHeading(index){
      switch(index){
        case 2:
          if ($scope.myRole === 'top-admin' || $scope.myRole === 'client-admin'){
            return 'By Country/Questionnaire';
          }else{
            return 'By Questionnaire';
          }
          break;
        case 3:
          if ($scope.myRole === 'top-admin' || $scope.myRole === 'client-admin'){
            return 'By Country/User';
          }else{
            return 'By User';
          }
          break;
        case 4:
          if ($scope.myRole === 'top-admin' || $scope.myRole === 'client-admin'){
            return 'By Country/User/Questionnaire';
          }else{
            return 'By User/Questionnaire';
          }
          break;
      }
    }
    $scope.tab2Heading = chooseTabHeading(2);
    $scope.tab3Heading = chooseTabHeading(3);
    $scope.tab4Heading = chooseTabHeading(4);

    function createGraphConfig(name){
      return{
         title: name,
         tooltips: true,
         labels: false,
         mouseover: function() {},
         mouseout: function() {},
         click: function() {},
         legend: {
            display: true,
           //could be 'left, right'
           position: 'right'
         }
      };
    }

    function createGraphData(results, group, conditionalFieldArray, conditionalValueArray){
      var countryGraphData = {
        series: [],
        data: []
      };
      for (var i=0; i<results.length; i++){
        var conditional = true;
        if (!!conditionalFieldArray && !!conditionalValueArray){
          for (var j=0; j<conditionalFieldArray.length; j++){
            var conditionalField = conditionalFieldArray[j];
            var conditionalValue = conditionalValueArray[j];
            if(results[i][conditionalField] !== conditionalValue) conditional = false;
          }
        }
        if(!!conditional){
          countryGraphData.series.push(results[i][group]);
          var dataObj = {
            x : '',
            y : []
          };
          dataObj.x = results[i][group];
          dataObj.y.push(results[i].total);
          countryGraphData.data.push(dataObj);
        }
      }
      return countryGraphData;
    }

    function processByCountry(pollstats){
      var ret = [];
      for(var i in pollstats){
        var ps = pollstats[i];
        if(!ps._id){continue;}
        ret.push({
          country: ps._id.country,
          total: ps.total
        });
      }
      $scope.results = ret;
      $scope.countryGridOptions = {
        data : 'results',
      };
      $scope.countryGraphConfig = createGraphConfig('Polls by country');
      $scope.drawPie(null,'country','countryGraphData',null);
    }

    $scope.pointer = {};

    function processByQuestionnaire(pollstats){ //possible leading country, check role
      var ret = [];
      for(var i in pollstats){
        var ps = pollstats[i];
        if(!ps._id){continue;}
        ret.push({
          country: ps._id.country,
          questionnaire: ps._id.questionnaire,
          total: ps.total
        });
      }
      $scope.results = ret;
      var isAdmin = $scope.myRole === 'top-admin' || $scope.myRole === 'client-admin';
      var groupArray = (isAdmin) ? ['country'] : [];
      $scope.countryQuestionnaireGridOptions = {
        data : 'results',
        groups : groupArray,
        groupsCollapsedByDefault : false,
        columnDefs: [
          {field: 'country', visible: false},
          {field: 'questionnaire'},
          {field: 'total'}
        ]
      };
      $scope.countryQuestionnaireGraphConfig = createGraphConfig('Polls by questionnaire');
      if (!!isAdmin){
        $scope.countryResults = makeDataArrayFromResults('country');
        $scope.pointer.currentlySelected = $scope.countryResults[0];
      }else{
        $scope.pointer.currentlySelected = $scope.myLanguage;
      }
      if (!!$scope.pointer.currentlySelected){
        $scope.drawPie([$scope.pointer.currentlySelected],'questionnaire','countryQuestionnaireGraphData',['country']);
      }
    }

    function makeDataArrayFromResults(field,conditionalFieldArray,conditionalValueArray){
      var dataArray = [];
      for (var i=0; i<$scope.results.length; i++){
        var conditional = true;
        if (!!conditionalFieldArray && !!conditionalValueArray){
          for (var j=0; j<conditionalFieldArray.length; j++){
            var conditionalField = conditionalFieldArray[j];
            var conditionalValue = conditionalValueArray[j];
            if($scope.results[i][conditionalField] !== conditionalValue) conditional = false;
          }
        }
        if (dataArray.length === 0 && !!conditional){
          dataArray.push($scope.results[i][field]);
          continue;
        }
        if (dataArray.indexOf($scope.results[i][field]) === -1 && !!conditional){
          dataArray.push($scope.results[i][field]);
        }
      }
      return dataArray;
    }

    $scope.drawPie = function(country,group,scopeProp,conditionalField){
      $scope[scopeProp] = createGraphData($scope.results, group, conditionalField, country);
    };

    function processByUser(pollstats){ //possible leading country, check role
      var ret = [];
      for(var i in pollstats){
        var ps = pollstats[i];
        if(!ps._id){continue;}
        ret.push({
          country: ps._id.country,
          user: ps._id.user,
          total: ps.total
        });
      }
      $scope.results = ret;
      var isAdmin = $scope.myRole === 'top-admin' || $scope.myRole === 'client-admin';
      var groupArray = (isAdmin) ? ['country'] : [];
      $scope.countryUserGridOptions= {
        data : 'results',
        groups : groupArray,
        groupsCollapsedByDefault : false,
        columnDefs: [
          {field: 'country', visible: false},
          {field: 'user'},
          {field: 'total'}
        ]
      };
      $scope.countryUserGraphConfig = createGraphConfig('Polls by user');
      if (!!isAdmin){
        $scope.countryResults = makeDataArrayFromResults('country');
        $scope.pointer.currentlySelected = $scope.countryResults[0];
      }else{
        $scope.pointer.currentlySelected = $scope.myLanguage;
      }
      if (!!$scope.pointer.currentlySelected){
        $scope.drawPie([$scope.pointer.currentlySelected],'user','countryUserGraphData',['country']);
      }
    }

    function processByUserQuestionnaire(pollstats){ //possible leading country, check role
      var ret = [];
      for(var i in pollstats){
        var ps = pollstats[i];
        if(!ps._id){continue;}
        ret.push({
          country: ps._id.country,
          questionnaire: ps._id.questionnaire,
          user: ps._id.user,
          total: ps.total
        });
      }
      $scope.results = ret;
      var isAdmin = $scope.myRole === 'top-admin' || $scope.myRole === 'client-admin';
      var groupArray = (isAdmin) ? ['country','user'] : ['user'];
      $scope.countryUserQuestionnaireGridOptions= {
        data : 'results',
        groups : groupArray,
        groupsCollapsedByDefault : false,
        columnDefs: [
          {field: 'country', visible: false},
          {field: 'user',visible: false},
          {field: 'questionnaire'},
          {field: 'total'}
        ]
      };
      $scope.countryUserQuestionnaireGraphConfig = createGraphConfig('Polls by questionnaire');
      if (!!isAdmin){
        $scope.countryResults = makeDataArrayFromResults('country');
        $scope.pointer.currentlySelected = $scope.countryResults[0];
      }else{
        $scope.pointer.currentlySelected = $scope.myLanguage;
      }
      $scope.userResults = makeDataArrayFromResults('user',['country'],[$scope.pointer.currentlySelected]);
      $scope.pointer.currentlySelected2 = $scope.userResults[0];
      if (!!$scope.pointer.currentlySelected){
        $scope.drawPie([$scope.pointer.currentlySelected,$scope.pointer.currentlySelected2],'questionnaire','countryUserQuestionnaireGraphData',['country','user']);
      }
    }

    $scope.createUserResults = function(){
        $scope.userResults = makeDataArrayFromResults('user',['country'],[$scope.pointer.currentlySelected]);
        $scope.pointer.currentlySelected2 = $scope.userResults[0];
        $scope.drawPie([$scope.pointer.currentlySelected,$scope.pointer.currentlySelected2],'questionnaire','countryUserQuestionnaireGraphData',['country','user']);
    };

    $scope.locationQueryResults = [];

    function processByLocation(pollstats){
      var helper = $scope.locationQueryResults.slice();
      for(var i in pollstats){
        var ps = pollstats[i];
        if(!ps._id){continue;}
        if (!!ps.geoLocation){
          helper.push({
            created: ps.created,
            user: ps.user,
            country: ps.questionnaireLanguage,
            geoLocation: ps.geoLocation
          });
        }
      }
      $scope.locationQueryResults = helper;
    }

    var queryBank = {
      1: processByCountry,
      2: processByQuestionnaire,
      3: processByUser,
      4: processByUserQuestionnaire,
      5: processByLocation
    };

    function checkForError(pollstats){
      if(pollstats.error){
        $scope.error = pollstats.error;
        return true;
      }
    }

    function pollStatsReceived(pollindex, cummulative, pollstats){
      $scope.disableQuery = false;
      var pollStatsProcessor = queryBank[pollindex];
      if(typeof pollStatsProcessor !== 'function'){
        return;
      }
      $scope.emptyResult = pollstats.length<1;
      if($scope.emptyResult){
        if (pollindex === 5 && !cummulative){
          $scope.locationQueryResults = [];
        }
        return;
      }
      if(!checkForError(pollstats[0])){
        pollStatsProcessor(pollstats);
      }
    }

    $scope.stats = {
      dateFrom : new Date(new Date() - 24*60*60*1000),
      dateTo : new Date(),
      users : {},
      countryOptions: {} 
    };

    $scope.convertFrom = function(){
      if (!!$scope.disableQuery){
        $scope.stats.dateFrom = $scope.dateFromCriteria;
      }
      $scope.dateFromCriteria = truncDay($scope.stats.dateFrom);
      if (new Date($scope.stats.dateFrom) >= new Date($scope.dateToCriteria)){
        var date = new Date($scope.dateFromCriteria);
        $scope.stats.dateTo = date.setDate(date.getDate() + 1);
        $scope.dateToCriteria = truncDay(new Date($scope.stats.dateTo));
      }
      if($scope.activeTab === 5){
        $scope.findDistinctUsers();
        $scope.emptyLocationResults();
      }else{
        $scope.queryPollStats($scope.activeTab);
      }
    };

    $scope.convertTo = function(){
      if (new Date($scope.stats.dateTo) <= new Date($scope.dateFromCriteria) || !!$scope.disableQuery){
        $scope.stats.dateTo = $scope.dateToCriteria;
      }else{
        $scope.dateToCriteria = truncDay($scope.stats.dateTo);
        if($scope.activeTab === 5){
          $scope.findDistinctUsers();
          $scope.emptyLocationResults();
        }else{
          $scope.queryPollStats($scope.activeTab);
        }
      }
    };

    //Clearing location results array by user id
    function clearLocationQueryResults(userId, roles, operaters, country){
      var helper = $scope.locationQueryResults.slice();
      if (!country){
        if (roles[1] === 'operater'){
          operaterDelete(helper, userId);
        }
        if (roles[1] === 'supervisor'){
          supervisorDelete(helper, operaters);
        }
      }else{
        countryDelete(helper, country);
      }
      $scope.locationQueryResults = helper;
      $scope.disableQuery = false;
    }

    //Clearing when switching user option tabs
    $scope.emptyLocationResults = function(){
      var i;
      for (i in $scope.stats.users){
        delete $scope.stats.users[i];
      }
      console.log('SCOPE.STATS.USERS',$scope.stats.users);
      for (i in $scope.stats.countryOptions){
        delete $scope.stats.countryOptions[i];
      }
      if (!!$scope.queryObj){
        delete $scope.queryObj.byUser;
        delete $scope.queryObj.usersArray;
        delete $scope.queryObj.byCountry;
      }
      $scope.locationQueryResults = [];
      $scope.queryPollStatsError = null;
      $scope.infoMsg = null;
    };
    
    //WHEN THE USER IS CHOSEN WE EXECUTE THIS FN, Date params are not required
    $scope.queryPollStatsByUser = function(qindex, row){
      $scope.disableQuery = true;
      var userIndex = row.entity.user._id;
      if (qindex !== 5){
        $scope.queryPollStatsError = 'Invalid query tab';
        return;
      }
      $scope.queryPollStatsError = null;
      $scope.queryObj = {
        q : qindex
      };
      var byUser = $scope.stats.users[userIndex];
      var checkedUser;
      if (!byUser){
        delete $scope.stats.users[userIndex];
        if (isObjectSizeZero($scope.stats.users)) $scope.infoMsg = null;
        clearLocationQueryResults(row.entity.user._id, row.entity.user.roles, row.entity.user.operaters);
        return;
      }else{
        checkedUser = row.entity.user;
        if (checkedUser.roles[1] === 'operater'){
          $scope.queryObj.byUser = checkedUser._id;
        }
        if (checkedUser.roles[1] === 'supervisor'){
          if (checkedUser.operaters.length === 0){
            return;
          }
          $scope.queryObj.usersArray = checkedUser.operaters;
        }
      }
      if (!!$scope.dateFromCriteria && !!$scope.dateToCriteria){
        $scope.queryObj.dateFrom = $scope.dateFromCriteria;
        $scope.queryObj.dateTo = $scope.dateToCriteria;
      }
      $scope.infoMsg = 'Displaying results between ' + $scope.dateFromCriteria + ' and ' + $scope.dateToCriteria;
      console.log('TRAZIM SA OVIM',$scope.queryObj);
      queryPollStats($scope.queryObj, true);
    };

    //WHEN THE COUNTRY IS CHOSEN WE EXECUTE THIS FN, Date params are not required
    $scope.queryPollStatsByCountry = function(qindex, row){
      $scope.disableQuery = true;
      var countryIndex = row.entity.shortcode;
      if (qindex !== 5){
        $scope.queryPollStatsError = 'Invalid query tab';
        return;
      }
      $scope.queryPollStatsError = null;
      $scope.queryObj = {
        q : qindex
      };
      var byCountry = $scope.stats.countryOptions[countryIndex];
      if (!byCountry){
        delete $scope.stats.countryOptions[countryIndex];
        if (isObjectSizeZero($scope.stats.countryOptions)) $scope.infoMsg = null;
        clearLocationQueryResults(null,null,null,row.entity.shortcode);
        return;
      }else{
        $scope.queryObj.country = row.entity.shortcode;
        //$scope.queryObj.country = $scope.stats.countryOptions[countryIndex];
      }
      if (!!$scope.dateFromCriteria && !!$scope.dateToCriteria){
        $scope.queryObj.dateFrom = $scope.dateFromCriteria;
        $scope.queryObj.dateTo = $scope.dateToCriteria;
      }
      $scope.infoMsg = 'Displaying results between ' + $scope.dateFromCriteria + ' and ' + $scope.dateToCriteria;
      queryPollStats($scope.queryObj, true);
    };

    //WHEN SEARCH BUTTON IS CLICKED WE EXECUTE THIS FN, Date params are required
    $scope.queryPollStats = function(qindex){
      $scope.disableQuery = true;
      if (!($scope.dateFromCriteria && $scope.dateToCriteria)){
        return;
      }
      if (qindex === 5 && isObjectSizeZero($scope.stats.users) && isObjectSizeZero($scope.stats.countryOptions)){
        $scope.queryPollStatsError = 'You have not selected anyone';
        return;
      }
      $scope.queryPollStatsError = null;
      $scope.queryObj = {
        q : qindex,
        dateFrom : $scope.dateFromCriteria,
        dateTo : $scope.dateToCriteria
      };
      if (qindex === 5)  $scope.locationQueryResults = [];
      if (!isObjectSizeZero($scope.stats.users)){
        if (!makeUsersArray()) return;
      }
      if (!isObjectSizeZero($scope.stats.countryOptions)){
        var countryOptions = [];
        for (var i in $scope.stats.countryOptions){
          countryOptions.push($scope.stats.countryOptions[i]);
        }
        $scope.queryObj.countryArray = countryOptions;
      }
      $scope.infoMsg = 'Displaying results between ' + $scope.dateFromCriteria + ' and ' + $scope.dateToCriteria;
      queryPollStats($scope.queryObj, false);
    };

    function isObjectSizeZero(obj){
      var bool = true, key;
      for (key in obj) {
        if (obj.hasOwnProperty(key)){
          bool = false;
          break;
        }
      }
      return bool;
    }

    function makeUsersArray(){
      var usersArray = [];
      for (var i in $scope.stats.users){
        var user = JSON.parse($scope.stats.users[i]);
        if (!!user._id){
          if (user.roles[1] === 'operater'){
            usersArray.push(user._id);
          }
          if (user.roles[1] === 'supervisor'){
            usersArray = usersArray.concat(user.operaters);
          }
        }
      }
      if (usersArray.length > 0){
        $scope.queryObj.usersArray = usersArray;
        return true;
      }else{
        return false;
      }
    }

    function operaterDelete(array, operaterId){
      for (var i=array.length-1; i>=0; i--){
        if (array[i].user === operaterId) array.splice(i,1);
      }
    }

    function supervisorDelete(array, operaters){
      for (var i=array.length-1; i>=0; i--){
        if (operaters.indexOf(array[i].user) !== -1){
          array.splice(i,1);
        }
      }
    }

    function countryDelete(array, country){
      for (var i=array.length-1; i>=0; i--){
        if (array[i].country === country) array.splice(i,1);
      }
    }

    function makeLanguageArrayOfObj(shortcodes){
      shortcodes = shortcodes || $scope.languageShortcodeArray; 
      console.log('shortcodes',shortcodes);
      var helper = [];
      for (var i=0; i<shortcodes.length; i++){
        helper.push({shortcode: shortcodes[i], country: $scope.global.countries[shortcodes[i]]});
      }
      return helper;
    }

    $scope.languageShortcodeArrayOfObj = makeLanguageArrayOfObj();

    $scope.distinctUsersGridOptions = {
      data : 'distinctUsers',
      enableRowSelection: false,
      columnDefs: [
        { displayName: 'Loaded', width :'20%', cellTemplate: '<center style="margin-top:8px;"><input type="checkbox" ng-model="stats.users[row.entity.user._id]" ng-change="queryPollStatsByUser(activeTab ,row)" ng-disabled="disableQuery"></input></center>' },
        { displayName: 'Username', field: 'user.username' }
      ]
    };

    $scope.supervisorGridOptions = {
      data : 'distinctSupervisors',
      enableRowSelection: false,
      columnDefs: [
        { displayName: 'Loaded', width :'20%', cellTemplate: '<center style="margin-top:8px;"><input type="checkbox" ng-model="stats.users[row.entity.user._id]" ng-change="queryPollStatsByUser(activeTab, row)" ng-disabled="disableQuery"></input></center>' },
        { displayName: 'Username', field: 'user.username' }
      ]
    };

    $scope.locationCountryGridOptions = {
      data : 'distinctCountries',
      enableRowSelection: false,
      columnDefs: [
        { displayName: 'Loaded', width :'20%', cellTemplate: '<center style="margin-top:8px;"><input type="checkbox" ng-model="stats.countryOptions[row.entity.shortcode]" ng-change="queryPollStatsByCountry(activeTab, row)" ng-disabled="disableQuery"></input></center>' },
        { displayName: 'Country', field: 'country' }
      ]
    };

    /*
    function locationGridOptionsFactory(data, gridName, propName){
      return {
        data : data,
        enableRowSelection: false,
        init: function(grid,$scope) {
          setTimeout(function() {
            $scope[gridName].$gridServices.DomUtilityService.RebuildGrid(
              $scope[gridName].$gridScope,
              $scope[gridName].ngGrid
            );
          },1000);
        },
        columnDefs: [
          { displayName: 'Loaded', width :'20%', cellTemplate: '<center style="margin-top:8px;"><input type="checkbox" ng-model="stats.users[row.entity.user._id]" ng-true-value="{{row.entity.user}}" ng-change="queryPollStatsByUser(activeTab, row)"></input></center>' },
          { displayName: 'Username', field: propName + '.username' }
        ]
      };
    }
    */

    //$scope.distinctUsersGridOptions = locationGridOptionsFactory('distinctUsers','distinctUsersGridOptions','user');
    //$scope.supervisorGridOptions = locationGridOptionsFactory('distinctSupervisors','supervisorGridOptions','supervisor');

    function purge(){
      if (!!$scope.countryGraphData) $scope.countryGraphData = null;
      if (!!$scope.countryGraphConfig) $scope.countryGraphConfig = null;
      if (!!$scope.countryGridOptions) $scope.countryGridOptions= null;
      if (!!$scope.countryQuestionnaireGraphData) $scope.countryQuestionnaireGraphData = null;
      if (!!$scope.countryQuestionnaireGraphConfig) $scope.countryQuestionnaireGraphData = null;
      if (!!$scope.countryQuestionnaireGridOptions) $scope.countryQuestionnaireGridOptions = null;
      if (!!$scope.countryUserGraphData) $scope.countryUserGraphData = null;
      if (!!$scope.countryUserGraphConfig) $scope.countryUserGraphConfig = null;
      if (!!$scope.countryUserGridOptions) $scope.countryUserGridOptions = null;
      if (!!$scope.countryUserQuestionnaireGraphData) $scope.countryUserQuestionnaireGraphData = null;
      if (!!$scope.countryUserQuestionnaireGraphConfig) $scope.countryUserQuestionnaireGraphConfig = null;
      if (!!$scope.countryUserQuestionnaireGridOptions) $scope.countryUserQuestionnaireGridOptions = null;
    }

    $scope.setActiveQuery = function(qindex){
      $scope.disableQuery = true;
      //clear everything we can
      purge();
      if (!$scope.dateFromCriteria) $scope.dateFromCriteria = truncDay(new Date(new Date() - 24*60*60*1000));
      if (!$scope.dateToCriteria) $scope.dateToCriteria = truncDay(new Date());
      $scope.emptyResult = false;
      $scope.activeTab = qindex;
      $scope.queryPollStatsError = null;
      if (qindex === 5){
        $scope.userStatsCriteria = true;
        $scope.results = [];
        $scope.findDistinctUsers();
        window.setTimeout(function(){
          jQuery(window).resize();
        }, 0);
        $scope.infoMsg = null;
        return;
      }else{
        $scope.userStatsCriteria = false;
      }
      $scope.queryObj = {
        q : qindex,
        dateFrom : $scope.dateFromCriteria,
        dateTo : $scope.dateToCriteria
      };
      $scope.infoMsg = 'Displaying results between ' + $scope.dateFromCriteria + ' and ' + $scope.dateToCriteria;
      if (!!$scope.queryObj){
        delete $scope.queryObj.byUser;
        delete $scope.queryObj.usersArray;
        $scope.queryObj.q = qindex;
      }
      queryPollStats($scope.queryObj,false);
    };

    function queryPollStats(queryObj, cummulative){
      PollStats.query(queryObj,pollStatsReceived.bind(null,$scope.activeTab,cummulative));
    }

    function executeOnLoggedin(){
      $scope.myRole = $rootScope.user.roles[1];
      $scope.myLanguage = $rootScope.user.language;
      if (!!$scope.initFunctionIndicators.findQuestionnaires){
        $scope.findQuestionnaires();
        return;
      }
      if (!!$scope.initFunctionIndicators.findMyPolls){
        $scope.findMyPolls();
        return;
      }
      if (!!$scope.initFunctionIndicators.findQuestionnairesByLang){
        $scope.findQuestionnairesByLang();
        return;
      }
      if (!!$scope.initFunctionIndicators.findQuestionnaireAndInitAnswers){
        $scope.findQuestionnaireAndInitAnswers();
        return;
      }
    }

    executeOnLoggedin();

    $rootScope.$on('loggedin', executeOnLoggedin);
  }

]);
