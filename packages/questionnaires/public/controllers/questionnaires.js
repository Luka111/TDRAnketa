'use strict';

angular.module('mean.questionnaires').controller('QuestionnairesController', ['$scope', '$rootScope', '$stateParams', '$location', 'Global', 'Questionnaires', 'Forms', 'queryQuestionnaires', 'identityService',
  function($scope, $rootScope, $stateParams, $location, Global, Questionnaires, Forms, queryQuestionnaires, identityService) {
    $scope.global = Global;

    $scope.hasAuthorization = function(poll) {
      if (!poll) return false;
      return ($rootScope.user.roles.indexOf('manager') !== -1);
    };

    // * Removing $rootScope.user fix

    function executeOnLoggedin(){
      $scope.myLanguage = $rootScope.user.language;
      if (!!$scope.findFailed) $scope.find();
    }

    executeOnLoggedin();

    $rootScope.$on('loggedin', executeOnLoggedin);

    // *

    $scope.content = [];

    $scope.contentMissing = false;

    $scope.active = false;

    $scope.languageShortcodeArray = $scope.global.languageShortcodes;

    $scope.language = $scope.languageShortcodeArray[0];


    $scope.backgroundImageSrc = '';

    $scope.create = function(isValid) {
      if (isValid) {
        if($scope.content.length === 0){
          $scope.contentMissing = true;
          return;
        }
        var imageFileNames = convertToMediaFileNameArray($scope.content,'Image');
        var videoFileNames = convertToMediaFileNameArray($scope.content,'Video');
        convertToIdArray($scope.content);
        var questionnaire = new Questionnaires({
          title: this.title,
          content: this.content,
          imageFiles: imageFileNames,
          videoFiles: videoFileNames,
          active : this.active,
          language : $rootScope.user.language,
          backgroundImage : this.backgroundImageSrc
        });
        questionnaire.$save(function(response) {
          $location.path('questionnaires/' + response._id);
        });

        this.title = '';
        this.content = '';
      } else {
        $scope.submitted = true;
      }
    };

    $scope.remove = function(questionnaire) {
      if (questionnaire) {
        questionnaire.$remove();

        for (var i in $scope.questionnaires) {
          if ($scope.questionnaires[i] === questionnaire) {
            $scope.questionnaires.splice(i, 1);
          }
        }
        $location.path('questionnaires');
      } else {
        $scope.questionnaire.$remove(function(response) {
          $location.path('questionnaires');
        });
      }
    };

    $scope.update = function(isValid) {
      if (isValid) {
        if($scope.questionnaire.content.length === 0){
          $scope.contentMissing = true;
          return;
        }
        $scope.questionnaire.imageFiles = convertToMediaFileNameArray($scope.questionnaire.content,'Image');
        $scope.questionnaire.videoFiles = convertToMediaFileNameArray($scope.questionnaire.content,'Video');
        $scope.questionnaire.backgroundImage = $scope.backgroundImageSrc;
        convertToIdArray($scope.questionnaire.content);
        var questionnaire = $scope.questionnaire;
        if (!questionnaire.updated) {
          questionnaire.updated = [];
        }
        questionnaire.updated.push(new Date().getTime());
        questionnaire.$update(function() {
          $location.path('questionnaires');
        });
      } else {
        $scope.submitted = true;
      }
    };

    $scope.findFailed = false;

    function onFind(questionnaires){
      $scope.questionnaires = questionnaires;
      //For displaying images and videos in listing
      for (var i=0; i<$scope.questionnaires.length; i++){
        var questionnaire = $scope.questionnaires[i];
        fillSrcAttribute(questionnaire);
      }
    }

    $scope.find = function() {
      if (!$rootScope.user.language){
        $scope.findFailed = true;
        return;
      }
      queryQuestionnaires.query({
        language: $rootScope.user.language
      },onFind);
    };

    function onFindOne(questionnaire){
      $scope.questionnaire = questionnaire;
      console.log('DAJ DA GA VIDIM',$scope.questionnaire);
      $scope.backgroundImageSrc = $scope.questionnaire.backgroundImage;
      fillSrcAttribute(questionnaire);
      $scope.readyCounter++;
    }

    $scope.findOne = function() {
      Questionnaires.get({
        questionnaireId: $stateParams.questionnaireId
      },onFindOne);
    };
    
    //Fill questions with src + fileType attribute 
    //THIS IS VERY IMPORTANT - in the database is written string that contains fileName + ' ' + fileType
    function fillSrcAttribute(questionnaire){
      var imageCounter = 0,
        videoCounter = 0;
      for (var i=0; i<questionnaire.content.length; i++){
        var form = questionnaire.content[i];
        for (var j=0; j<form.content.length; j++){
          var question = form.content[j];
          if (question.type === 'Image'){
            var ifn = questionnaire.imageFiles[imageCounter].split(' ');
            if (ifn[0] === '' || ifn[0] === 'undefined'){
              //Strange behavior from browser
              question.src = '';
            }else{
              var fileName_fileType = questionnaire.imageFiles[imageCounter++].split(' ');
              question.src = fileName_fileType[0];
              question.fileType = fileName_fileType[1];
            }
          }
          if (question.type === 'Video'){
            var vfn = questionnaire.videoFiles[videoCounter].split(' ');
            if (vfn[0] === '' || vfn[0] === 'undefined'){
              //Strange behavior from browser
              question.src = '';
            }else{
              var fileName_fileType2 = questionnaire.videoFiles[videoCounter++].split(' ');
              question.src = fileName_fileType2[0];
              question.fileType = fileName_fileType2[1];
              //Harcoded, necessary for Video ng-src. Angular or Browser bug still not sure
              question.fullSrc = '/packages/system/public/media/' + question.src;
            }
          }
        }
      }
    }
    
    //Carousel fundamental
    /***
    $scope.slideIndex = 0;
    */

    //Videogular config obj
    $scope.currentTime = 0;
    $scope.totalTime = 0;
    $scope.videogularConfig = {
      width: 800,
      height: 600,
      responsive: true,
      autoplay: false,
      theme: '/bower_components/videogular-themes-default/videogular.css',
      strech: 'fill',
      autohide: 'true',
      autohideTime: 2000
    };

    //Form query
    function findForms(forms){
      $scope.forms = forms;
      $scope.readyCounter++;
    }

    $scope.findForms = function() {
      Forms.query(findForms);
    };

    //Add form to content
    $scope.addForm = function(form,array){
      var index = $scope.forms.indexOf(form);
      $scope.contentMissing = false;
      for(var i=0; i<form.content.length; i++){
        if ((form.content[i].type === 'Image') || (form.content[i].type === 'Video')){
          if(!form.content[i].src){
            form.content[i].src = '';
          }
        }
      }
      array.push(form);
      if (index >= 0){
        $scope.forms.splice(index,1);
      }
    };

    //Remove form from content
    $scope.removeForm = function(index,array){
      var form = array[index];
      $scope.forms.push(form);
      array.splice(index,1);
    };

    //Convert normal array to ID array
    //TODO move to Global, because the same function is used in more modules (Forms)
    var convertToIdArray = function(array){
      for (var i=0; i<array.length; i++){
        array[i] = array[i]._id;
      }
    };

    //Convert form array to array of File Names
    var convertToMediaFileNameArray = function(array,type){
      var mediaFileNames = [];
      for(var i=0; i<array.length; i++){
        var form = array[i];
        for(var j=0; j < form.content.length; j++){
          var question = form.content[j];
          if (question.type === type){
            var fileName_fileType = question.src + ' ' + question.fileType;
            mediaFileNames.push(fileName_fileType);
          }
        }
      }
      return mediaFileNames;
    };

    //Defining counter/watcher for database loading finish
    $scope.readyCounter = 0;

    //Loader function which also splice the original forms array
    //TODO same thing for convertToIdArray 
    $scope.findAndSplice= function(){
      $scope.findOne();
      $scope.findForms();
      $scope.$watch('readyCounter', function(newVal, oldVal){
        console.log('readyCounter',$scope.readyCounter);
        if (newVal === 2){
          $scope.readyCounter = 0;
          //TODO Needs performance boost
          for (var i=0; i<$scope.questionnaire.content.length; i++){
            for(var j=$scope.forms.length-1; j>=0; j--){
              if ($scope.questionnaire.content[i]._id === $scope.forms[j]._id){
                $scope.forms.splice(j,1);
                break;
              }
            }
          }
        }
      });
    };

    //Uploading background image for questionnaire
    $scope.addBackgroundImage = function(file){
      if (file.type.indexOf('image') !== -1){
        console.log('Tip fajla je odgovarajuci',file);
        $scope.backgroundImageSrc = file.src;
      }else{
        console.log('Tip fajla nije odgovarajuci');
        return; 
      }
    };

    //Add file to Files Array
    $scope.addFile = function(file,index,array){
      var questionType = array[index].type.toLowerCase();
      if (file.type.indexOf(questionType) !== -1){
        console.log('Tip fajla je odgovarajuci',file);
        var srcArray = file.src.split('/');
        var fileName = srcArray[srcArray.length-1];
        var fileType = file.type;
        array[index].src = fileName;
        array[index].fileType = fileType;
        array[index].fullSrc = '/packages/system/public/media/' + fileName;
      }else{
        console.log('Tip fajla nije odgovarajuci');
        return; 
      }
    };

    //Remove background image 
    $scope.removeBackgroundImage = function(){
      $scope.backgroundImageSrc = '';
    };

    //Remove file
    $scope.removeFile = function(index,array){
      array[index].src = '';
    };

    //Moving file forward through array
    $scope.moveForwardFile = function(index,array){
      var fileName = array[index].src;
      var fullFileName = array[index].fullSrc;
      var fileType = array[index].type;
      var i = (index+1) % array.length;
      console.log(i);
      while(i !== index){
        console.log('Tip:',array[i].type,'SRC',array[i].src);
        if ((array[i].type === fileType) && (!array[i].src)){
          array[i].src = fileName;
          array[index].src = '';
          if (!!fullFileName){
            array[i].fullSrc = fullFileName;
            array[index].fullSrc = '';
          }
          break;
        }
        i = (i+1) % array.length;
      }
    };
    
    //Moving file backward through array
    $scope.moveBackwardFile = function(index,array){
      var fileName = array[index].src;
      var fileType = array[index].type;
      var fullFileName = array[index].fullSrc;
      var i = index;
      if (i !== 0){
        i--;
      }else{
        i = array.length - 1;
      }
      while(i !== index){
        if ((array[i].type === fileType) && (array[i].src === '')){
          array[i].src = fileName;
          array[index].src = '';
          if (!!fullFileName){
            array[i].fullSrc = fullFileName;
            array[index].fullSrc = '';
          }
          break;
        }
        if (i !== 0){
          i--;
        }else{
          i = array.length - 1;
        }
      }
    };

  }

]);
