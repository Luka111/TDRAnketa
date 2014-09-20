'use strict';
angular.module('mean.users')
  .controller('LoginCtrl', ['$scope', '$rootScope', '$http', '$location', 
    function($scope, $rootScope, $http, $location) {
      // This object will be filled by the form
      $scope.user = {};

      /*
      if(!$rootScope.user.roles){
        console.log('NISTA',$http.defaults.headers.put,'cookie',document.cookie,'.');
        //$http.defaults.headers.put.cookie = 'connect.sidabajomojbate=s%3A7O2LmIN0o_6PBF6M7K_YUUAn4BIMCMs9.91tqc5pGIMHcHPzOkBi86MOjaqLSK1D1VD3861R8lv8';
        document.cookie = 'connect.sid=s%3AgHml_hqaoZ3v4DAUv-bnAjqRdZgRs2ki.gY2%2FuQeiuRgSJ7JlUglvg3KQA%2FvfGW8uDTWrJB5k1UM';
        location.reload();
      }
      */

      // Register the login() function
      $scope.login = function() {
        $http.post('/login', {
          username: $scope.user.username,
          password: $scope.user.password
        })
          .success(function(response) {
            // authentication OK
            $scope.loginError = 0;
            $rootScope.user = response.user;
            console.log('OD LOGIN-A',response.user);
            $rootScope.$emit('loggedin');
          })
          .error(function() {
            $scope.loginerror = 'Authentication failed.';
          });
      };
    }
  ])
  .controller('RegisterCtrl', ['$scope', '$rootScope', '$http', '$location', 'Global', 'identityService',
    function($scope, $rootScope, $http, $location, Global, identityService) {
      $scope.global = Global;
      $scope.languageShortcodeArray = $scope.global.languageShortcodes;
      $scope.user = {};
      //*
      function executeOnLoggedin(){
        //ONLY 1 ROLE (+ authenticated at 0)
        console.log('A CEKAJ MALO?',$rootScope.user);
        $scope.myRole = $rootScope.user.roles[1];
        $scope.user.role = chooseUserRole();
        $scope.user.language = ($rootScope.user.language === 'all') ? $scope.languageShortcodeArray[0] :  $rootScope.user.language;
      }

      executeOnLoggedin();

      $rootScope.$on('loggedin', executeOnLoggedin);
      //

      //Default operater
      function chooseUserRole(){
        if ($scope.myRole === 'top-admin') return 'manager';
        if ($scope.myRole === 'manager') return 'supervisor';
        if ($scope.myRole === 'supervisor') return 'operater';
      }
      $scope.userRoles = ['client-admin','manager'];
      
      $scope.register = function(valid) {
        var customValidation = 
          (!$scope.user.password ? false : $scope.user.password.length >= 8) &&
          ($scope.user.password === $scope.user.confirmPassword);
        if (!!valid && customValidation){
          $scope.usernameError = null;
          $scope.registerError = null;
          $http.post('/register', {
            email: $scope.user.email,
            password: $scope.user.password,
            confirmPassword: $scope.user.confirmPassword,
            username: $scope.user.username,
            name: $scope.user.name,
            roles: $scope.user.role,
            myCreator: $rootScope.user._id,
            language: $scope.user.language
          })
            .success(function(userId) {
              // authentication OK
              if ($scope.myRole === 'supervisor'){
                var operaterId = JSON.parse(userId);
                $http.post('/insertOperater',{
                  supervisorId : $rootScope.user._id,
                  operaterId : operaterId
                })
                  .success(function(insertedOId){
                    console.log('Successfuly inserted this operater',insertedOId);
                    $rootScope.user.operaters.push(JSON.parse(insertedOId));
                  })
                  .error(function(error){
                    console.log('Failed to insert operater. Error:',error);
                  });
              }
              $scope.registerError = 0;
              //$rootScope.user = $scope.user;
              //$rootScope.$emit('loggedin');
              $location.url('/users');
              console.log($rootScope.user);
            })
            .error(function(error) {
              // Error: authentication failed
              if (error === 'Username already taken') {
                $scope.usernameError = error;
              } else if (error === 'Email already taken') {
                $scope.emailError = error;
              } else $scope.registerError = error;
            });
        }else{
          $scope.submitted = true;
        }
      };
    }
  ])
  .controller('UsersController', ['$scope', '$rootScope', '$location', '$stateParams', 'Users', 'Global', 'UsersQuery', 'identityService',
    function($scope, $rootScope, $location, $stateParams, Users, Global, UsersQuery, identityService) {

      $scope.global = Global;
      $scope.roles = $scope.global.userRoles;
      $scope.languageShortcodeArray = $scope.global.languageShortcodes;

      //*
      function executeOnLoggedin(){
        $scope.myRole = $rootScope.user.roles[1];
        $scope.myLanguage = $rootScope.user.language;
        if (!!findUsersByLangFailed){
          $scope.findUsersByLang();
        }
      }

      executeOnLoggedin();

      $rootScope.$on('loggedin', executeOnLoggedin);
      //

      $scope.hasAuthorization = function(user) {
        if (!user) return false;
        return ($rootScope.user.roles.indexOf('top-admin') !== -1);
      };

      $scope.find = function(){
        Users.query(function(users){
          $scope.users = users;
        });
      };

      //Find users by language
      var findUsersByLangFailed = false;

      $scope.findUsersByLang = function(){
        if (!$scope.myLanguage){
          findUsersByLangFailed = true;
          return;
        }
        UsersQuery.query({
          language: $scope.myLanguage
        },function(users){
          $scope.users = users;
        });
      };

      //Find users for supervisors (only their operaters)
      $scope.findUsersForSupervisor = function(){
        UsersQuery.query({
          mode : 'supervisor',
          operaters : $rootScope.user.operaters
        },function(users){
          $scope.users = users;
        });
      };

      $scope.remove = function(user) {
        if (user) {
          user.$remove();

          for (var i in $scope.users) {
            if ($scope.users[i] === user) {
              $scope.users.splice(i, 1);
            }
          }
        } else {
          $scope.user.$remove(function(response) {
            $location.path('users');
          });
        }
      };

      $scope.update = function(isValid) {
        if (isValid) {
          //Default role for every logged in user
          $scope.user.roles = ['authenticated'];
          //1 ROLE SYSTEM, only 1 role is allowed per user
          $scope.user.roles.push($scope.user.role);
          var user = $scope.user;
          if (!user.updated) {
            user.updated = [];
          }
          user.updated.push(new Date().getTime());

          user.$update(function() {
            $location.path('users/' + user._id);
          });
        } else {
          $scope.submitted = true;
        }
      };

      $scope.findOne = function() {
        Users.get({
          userId: $stateParams.userId
        }, function(user) {
          $scope.user = user;
          $scope.user.role = $scope.user.roles[1];
        });
      };

    }
  ])
  .controller('ForgotPasswordCtrl', ['$scope', '$rootScope', '$http', '$location',
    function($scope, $rootScope, $http, $location) {
      $scope.user = {};
      $scope.forgotpassword = function() {
        $http.post('/forgot-password', {
          text: $scope.text
        })
          .success(function(response) {
            $scope.response = response;
          })
          .error(function(error) {
            $scope.response = error;
          });
      };
    }
  ])
  .controller('ResetPasswordCtrl', ['$scope', '$rootScope', '$http', '$location', '$stateParams',
    function($scope, $rootScope, $http, $location, $stateParams) {
      $scope.user = {};
      $scope.resetpassword = function() {
        $http.post('/reset/' + $stateParams.tokenId, {
          password: $scope.user.password,
          confirmPassword: $scope.user.confirmPassword
        })
          .success(function(response) {
            $rootScope.user = response.user;
            $rootScope.$emit('loggedin');
            if (response.redirect) {
              if (window.location.href === response.redirect) {
                //This is so an admin user will get full admin page
                window.location.reload();
              } else {
                window.location = response.redirect;
              }
            } else {
              $location.url('/');
            }
          })
          .error(function(error) {
            if (error.msg === 'Token invalid or expired')
              $scope.resetpassworderror = 'Could not update password as token is invalid or may have expired';
            else
              $scope.validationError = error;
          });
      };
    }
  ]);
