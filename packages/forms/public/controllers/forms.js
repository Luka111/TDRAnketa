'use strict';

angular.module('mean.forms').controller('FormsController', ['$scope', '$rootScope', '$stateParams', '$location', 'Global', 'Forms', 'Questions', 'identityService',
  function($scope, $rootScope, $stateParams, $location, Global, Forms, Questions, identityService) {
    $scope.global = Global;

    $scope.hasAuthorization = function(poll) {
      if (!poll) return false;
      return ($rootScope.user.roles.indexOf('top-admin') !== -1);
    };

    $scope.content = [];

    $scope.addQuestion = function(question,array){
      var index = $scope.questions.indexOf(question);
      $scope.contentMissing = false;
      if(question === null){
        if(index === -1){
          question = $scope.videoQuestion;
        }else{
          if(index === -2){
            question = $scope.imageQuestion;
          }else{
            return;
          }
        }
      }
      array.push(question);
      if(index >= 0){
        $scope.questions.splice(index,1);
      }
    };

    $scope.removeQuestion = function(index,array){
      console.log('Izbacio:',array[index]);
      if (!((array[index].type === 'Image') || (array[index].type === 'Video'))){
        console.log('It is not image or video, going back to questions array!');
        $scope.questions.push(array[index]);
      }else{
        console.log('It IS image or video, i am not pushing back to questions array!');
      }
      array.splice(index,1);
    };

    $scope.convertToIdArray = function(array){
      for (var i=0; i<array.length; i++){
        array[i] = array[i]._id;
      }
    };

    $scope.contentMissing = false;

    $scope.create = function(isValid) {
      if (isValid) {
        if($scope.content.length === 0){
          $scope.contentMissing = true;
          return;
        }
        $scope.convertToIdArray($scope.content);
        var form = new Forms({
          title: this.title,
          content: this.content
        });
        form.$save(function(response) {
          $location.path('forms/' + response._id);
        });

        this.title = '';
        this.content = [];
      } else {
        $scope.submitted = true;
      }
    };

    $scope.remove = function(form) {
      if (form) {
        form.$remove();

        for (var i in $scope.forms) {
          if ($scope.forms[i] === form) {
            $scope.forms.splice(i, 1);
          }
        }
        $location.path('forms');
      } else {
        $scope.form.$remove(function(response) {
          $location.path('forms');
        });
      }
    };

    $scope.update = function(isValid) {
      if (isValid) {
        if($scope.form.content.length === 0){
          $scope.contentMissing = true;
          return;
        }
        $scope.convertToIdArray($scope.form.content);
        var form = $scope.form;
        if (!form.updated) {
          form.updated = [];
        }
        form.updated.push(new Date().getTime());

        form.$update(function() {
          $location.path('forms/' + form._id);
        });
      } else {
        $scope.submitted = true;
      }
    };

    $scope.find = function() {
      Forms.query(function(forms) {
        $scope.forms = forms;
      });
    };
    
    $scope.findQuestions = function() {
      Questions.query(function(questions) {
        $scope.questions = questions;
        $scope.readyCounter++;
        for(var i=$scope.questions.length-1; i>=0; i--){
          if($scope.questions[i].type === 'Image'){
            $scope.imageQuestion = $scope.questions[i];
            $scope.questions.splice(i,1);
          }
          if($scope.questions[i].type === 'Video'){
            $scope.videoQuestion = $scope.questions[i];
            $scope.questions.splice(i,1);
          }
        }
      });
    };

    $scope.findOne = function() {
      Forms.get({
        formId: $stateParams.formId
      }, function(form) {
        $scope.form = form;
        $scope.readyCounter++;
      });
    };

    $scope.readyCounter = 0;

    //Helper function for ng-init when EDITING
    $scope.findAndSplice= function(){
      $scope.findOne();
      $scope.findQuestions();
      $scope.$watch('readyCounter', function(newVal, oldVal){
        console.log('readyCounter',$scope.readyCounter);
        if (newVal === 2){
          $scope.readyCounter = 0;
          //Needs performance boost
          for (var i=0; i<$scope.form.content.length; i++){
            for(var j=$scope.questions.length-1; j>=0; j--){
              if ($scope.form.content[i]._id === $scope.questions[j]._id){
                $scope.questions.splice(j,1);
                break;
              }
            }
          }
        }
      });
    };

  }
]);
