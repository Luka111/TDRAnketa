'use strict';

angular.module('mean.languages').controller('LanguagesController', ['$scope', '$rootScope', '$stateParams', '$location', 'Global', 'Languages', 'identityService',
  function($scope, $rootScope, $stateParams, $location, Global, Languages, identityService) {
    $scope.global = Global;

    $scope.hasAuthorization = function(poll) {
      if (!poll) return false;
      return ($rootScope.user.roles.indexOf('top-admin') !== -1);
    };

    $scope.createVisible = false;

    $scope.create = function(isValid) {
      if (isValid) {
        var language = new Languages({
          languageId: this.languageId,
          name: this.languageName
        });
        language.$save(function(response) {
          $location.path('languages');
        });

        this.languageId= '';
        this.languageName= '';
      } else {
        $scope.submitted = true;
      }
      $scope.find();
    };

    $scope.remove = function(language) {
      if (language) {
        language.$remove();

        for (var i in $scope.languages) {
          if ($scope.languages[i] === language) {
            $scope.languages.splice(i, 1);
          }
        }
      } else {
        $scope.language.$remove(function(response) {
          $location.path('languages');
        });
      }
    };

    $scope.update = function(isValid) {
      if (isValid) {
        var language = $scope.language;
        if (!language.updated) {
          language.updated = [];
        }
        language.updated.push(new Date().getTime());

        language.$update(function() {
          $location.path('languages');
        });
      } else {
        $scope.submitted = true;
      }
    };

    $scope.find = function() {
      Languages.query(function(languages) {
        $scope.languages = languages;
      });
    };

    $scope.findOne = function() {
      Languages.get({
        languageId: $stateParams.languageId
      }, function(language) {
        $scope.language = language;
      });
    };
  }
]);
