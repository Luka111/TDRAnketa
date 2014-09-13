'use strict';
/* global jQuery:false */

angular.module('mean.system').controller('HeaderController', ['$scope', '$rootScope', 'Global', 'Menus','gettextCatalog',
  function($scope, $rootScope, Global, Menus,gettextCatalog) {

    $scope.global = Global;
    $scope.menus = {};

    //Testing gettextCatalog
    gettextCatalog.currentLanguage = 'de';
    gettextCatalog.debug = true;

    // Default hard coded menu items for main menu
    var defaultMainMenu = [];

    // Query menus added by modules. Only returns menus that user is allowed to see.
    function queryMenu(name, defaultMenu) {

      Menus.query({
        name: name,
        defaultMenu: defaultMenu
      }, function(menu) {
        $scope.menus[name] = menu;
      });
    }

    $scope.toggle = function($event, menuItem){
      $event.preventDefault();
      $event.stopPropagation();
      if (!menuItem.isOpen){
        menuItem.isOpen = true;
      }else{
        menuItem.isOpen = false;
      }
    };


    // Mobile Safari in standalone mode
    if(('standalone' in window.navigator) && window.navigator.standalone){

      // If you want to prevent remote links in standalone web apps opening Mobile Safari, change 'remotes' to true
      var noddy, remotes = false;

      document.addEventListener('click', function(event) {

          noddy = event.target;

          // Bubble up until we hit link or top HTML element. Warning: BODY element is not compulsory so better to stop on HTML
          while(noddy.nodeName !== 'A' && noddy.nodeName !== 'HTML') {
          noddy = noddy.parentNode;
          }

          if('href' in noddy && noddy.href.indexOf('http') !== -1 && (noddy.href.indexOf(document.location.host) !== -1 || remotes))
          {
          event.preventDefault();
          document.location.href = noddy.href;
          }

          },false);
    }
  
    function queryMenuNoParams() {

      Menus.query(function(menu) {
        $scope.menuItems = menu;
        $scope.allMenus = [];
        for (var i=0; i<$scope.menuItems.length; i++){
          var menuItem = $scope.menuItems[i];
          var pathArray = menuItem.menu.split('/');
          if (pathArray.length === 0) break;
          var menuName = pathArray[0];
          if (!$scope.allMenus[menuName]){
            $scope.allMenus[menuName] = [];
          }
          var currMenu = $scope.allMenus[menuName];
          for (var j=1; j<pathArray.length; j++){
            var currPath = pathArray[j];
            var menuItemExist = false;
            for (var m=0; m<currMenu.length; m++){
              //CASE SENSITIVE
              if (currMenu[m].title === currPath){
                menuItemExist = true;
                currMenu = currMenu[m].menus;
                break;
              }
            }
            if (!menuItemExist){
              currMenu.push({ title: currPath, link: '', menus: [] });
              currMenu = currMenu[currMenu.length-1].menus;
            }
          }
          var menuItemExistLast = false;
          for (var k=0; k<currMenu.length; k++){
            //CASE SENSITIVE
            if (currMenu[k].title === menuItem.title){
              if (!currMenu[k].link){
                currMenu[k].link = menuItem.link;
              }
              menuItemExistLast = true;
              break;
            }
          }
          if (!menuItemExistLast){
            currMenu.push({ title: menuItem.title, link: menuItem.link, menus: [] });
          }
        }
      });
    }
    
    function addRoleClassToBody(){
      if(!$rootScope.user){
        return;
      }
      if (!!$rootScope.user.roles && !!$rootScope.user.roles[1]){
        console.log($rootScope.user.roles[1],jQuery('body'));
        jQuery('body').addClass($rootScope.user.roles[1]);
      }
    }

    $scope.isCollapsed = false;

    function executeOnLoggedIn(){
      console.log('SACU DA QUERY MENU');
      queryMenu('main', defaultMainMenu);
      addRoleClassToBody();
      queryMenuNoParams();
      if (!!$rootScope.user){
        console.log($rootScope.user.roles[1],jQuery('body'));
        jQuery('body').addClass($rootScope.user.roles[1]);
        $scope.global = {
          authenticated: $rootScope.user.roles[1] !== '',
          user: $rootScope.user,
          isTopAdmin : $rootScope.user.roles.indexOf('top-admin') !== -1,
          isClientAdmin : $rootScope.user.roles.indexOf('client-admin') !== -1,
          isManager : $rootScope.user.roles.indexOf('manager') !== -1,
          isSupervisor : $rootScope.user.roles.indexOf('supervisor') !== -1,
          isOperater : $rootScope.user.roles.indexOf('operater') !== -1
        };
      }
    }

    executeOnLoggedIn();

    $rootScope.$on('loggedin', executeOnLoggedIn);

  }
]);
