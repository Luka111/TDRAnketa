'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Languages = new Module('languages');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Languages.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Languages.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Languages.menus.add({
    'roles': ['top-admin'],
    'title': 'Languages',
    'link': 'all languages',
    'menu': 'main'
  });
  //Languages.aggregateAsset('js','/packages/system/public/services/menus.js',{group:'footer',absolute:true, weight:-9999});
  /*
  Languages.aggregateAsset('js', 'test.js', {
    group: 'footer',
    weight: -1
  });
  */


  /*
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Languages.settings({'someSetting':'some value'},function (err, settings) {
      //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Languages.settings({'anotherSettings':'some value'});

    // Get settings. Retrieves latest saved settings
    Languages.settings(function (err, settings) {
      //you now have the settings object
    });
    */
  //Languages.aggregateAsset('css', 'languages.css');

  return Languages;
});
