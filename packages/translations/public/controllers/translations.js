'use strict';

angular.module('mean.translations').controller('TranslationsController', ['$scope', '$rootScope', '$stateParams', '$location', 'Global', 'Translations', 'Languages', 'deleteTranslations', 'identityService',
  function($scope, $rootScope, $stateParams, $location, Global, Translations, Languages, DeleteTranslations, identityService) {
    $scope.global = Global;

    $scope.hasAuthorization = function(poll) {
      if (!poll) return false;
      return ($rootScope.user.roles.indexOf('top-admin') !== -1);
    };

    function TranslationObj(langId,orig,trans){
      this.languageId = langId ? langId : '';
      this.original = orig ? orig : '';
      this.translation = trans ? trans : '';
    }

    TranslationObj.prototype.destroy = function(){
      this.languageId = null;
      this.original = null;
      this.translation = null;
    };

    TranslationObj.prototype.reset = function(){
      this.languageId = '';
      this.original = '';
      this.translation = '';
    };

    TranslationObj.prototype.setItems = function(langId,orig,trans){
      this.languageId = langId;
      this.original = orig;
      this.translation = trans;
    };

    TranslationObj.prototype.isEmpty = function(){
      return !this.translation;
    };

    TranslationObj.prototype.equals = function(tObj){
      return this.translation === tObj.translation;
    };

    $scope.translationObj = new TranslationObj();

    $scope.create = function() {
      var translation = new Translations($scope.translationObj);
      translation.$save();
      $scope.translationObj.reset();
    };

    $scope.remove = function() {
      console.log('IDEM U BRISANJE SA OVIM',$scope.translationObj);
      var translation = new DeleteTranslations($scope.translationObj);
      translation.$save();
      $scope.translationObj.reset();
    };

    $scope.update = function() {
      var translation = new Translations($scope.translationObj);
      translation.$update();
      $scope.translationObj.reset();
    };

    $scope.find = function() {
      Translations.query(function(translations) {
        console.log('<<<<<<<<<<<',translations);
        $scope.findLanguages(execOnFoundLang.bind(this,translations));
      });
    };

    function execOnFoundLang(translations){
      $scope.translations = new LinearStructure(translations, $scope.languageArr);
      $scope.translationsGrid = {
        data: 'translations.transArr',
        enableCellSelection: true,
        enableRowSelection: false,
        enableCellEditOnFocus: true,
        columnDefs: $scope.translations.columnDefs
      };
    }

    $scope.$on('ngGridEventStartCellEdit',function(eve){
      var field = eve.targetScope.col.field;
      var item = eve.targetScope.row.entity[field];
      var original = eve.targetScope.row.entity.original;
      if (!$scope.oldTransObj){
        $scope.oldTransObj = new TranslationObj(field,original,item);
      }else{
        $scope.oldTransObj.setItems(field,original,item);
      }
    });

    $scope.$on('ngGridEventEndCellEdit',function(eve){
      var field = eve.targetScope.col.field;
      var item = eve.targetScope.row.entity[field];
      var original = eve.targetScope.row.entity.original;
      $scope.translationObj.setItems(field,original,item);
      console.log('STARI',$scope.oldTransObj,'NOVI',$scope.translationObj);
      if ($scope.translationObj.equals($scope.oldTransObj)){
        $scope.oldTransObj.reset();
        $scope.translationObj.reset();
        console.log('ISTI SUUUU - STARI',$scope.oldTransObj,'NOVI',$scope.translationObj);
        return;
      }else{
        if ($scope.translationObj.isEmpty() && !$scope.oldTransObj.isEmpty()){
          $scope.remove();
          $scope.oldTransObj.reset();
          $scope.translationObj.reset();
          console.log('REMOVE --- STARI',$scope.oldTransObj,'NOVI',$scope.translationObj);
          return;
        }
        if (!$scope.translationObj.isEmpty() && $scope.oldTransObj.isEmpty()){
          $scope.create();
          $scope.oldTransObj.reset();
          $scope.translationObj.reset();
          console.log('CREATE ---- STARI',$scope.oldTransObj,'NOVI',$scope.translationObj);
          return;
        }
        if (!$scope.translationObj.isEmpty() && !$scope.oldTransObj.isEmpty()){
          $scope.update();
          $scope.oldTransObj.reset();
          $scope.translationObj.reset();
          console.log('UPDATE --- STARI',$scope.oldTransObj,'NOVI',$scope.translationObj);
          return;
        }
      }
    });

    $scope.findLanguages = function(cb){
      Languages.query(function(languages) {
        $scope.languages = languages;
        $scope.languageArr = makeLangArr(); 
        if(!!cb){
          cb();
        }
      });
    };

    function LinearStructure(trans,languageArr){
      this.transArr = [];
      this.languages = languageArr;
      this.columnDefs = [];
      this.makeColumns();
      this.makeLinear(trans);
    }

    LinearStructure.prototype.makeColumns = function(){
      this.columnDefs.push({field:'original', displayName: 'Original', enableCellEdit: false});
      for (var i in this.languages){
        this.columnDefs.push({field:this.languages[i].id, displayName:this.languages[i].name, enableCellEdit:true});
      }
    };

    LinearStructure.prototype.makeLinear = function(trans){
      for (var i in trans){
        if (!trans[i]._id) continue;
        var newObj = {};
        newObj.original = trans[i]._id;
        for(var j in this.languages){
          var currTrans = this.findTranslation(trans[i].translations,this.languages[j].id);
          newObj[this.languages[j].id] = currTrans;
        }
        this.transArr.push(newObj);
      }
    };

    LinearStructure.prototype.findTranslation = function(translations,lang){
      for (var i in translations){
        if (translations[i].language === lang){
          return translations[i].translation;
        }
      }
      return null;
    };

    $scope.findOne = function() {
      Translations.get({
        translationId: $stateParams.translationId
      }, function(translation) {
        $scope.translation = translation;
      });
    };

    function makeLangArr(){
      var ret = [];
      for (var i in $scope.languages){
        var langId = $scope.languages[i]._id;
        if (!!langId){
          ret.push({id : $scope.languages[i]._id, name : $scope.languages[i].name});
        }
      }
      return ret;
    }
  }
]);
