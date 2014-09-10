'use strict';

//Global service for global variables
angular.module('mean.system').factory('Global', ['$rootScope',

  function($rootScope) {
    var _this = this;
    _this._data = {
      user: $rootScope.user,
      authenticated: false,
      isAdmin: false,
      languageShortcodes: ['sr','hr','bs','sq','mk'],
      countries: {sr:'Serbia', hr:'Croatia', bs:'Bosnia and Herzegovina', sq:'Albania', mk:'Macedonia'},
      userRoles: ['top-admin','manager','operater']
    };
    if ($rootScope.user && $rootScope.user.roles) {
      _this._data.authenticated = $rootScope.user.roles.length;
      _this._data.isAdmin = $rootScope.user.roles.indexOf('admin') !== -1;
      //ROLE HIERARCHY
      _this._data.isTopAdmin = $rootScope.user.roles.indexOf('top-admin') !== -1;
      _this._data.isClientAdmin = $rootScope.user.roles.indexOf('client-admin') !== -1;
      _this._data.isManager = $rootScope.user.roles.indexOf('manager') !== -1;
      _this._data.isSupervisor = $rootScope.user.roles.indexOf('supervisor') !== -1;
      _this._data.isOperater = $rootScope.user.roles.indexOf('operater') !== -1;
    }
    return _this._data;
  }
]);
