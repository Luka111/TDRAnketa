'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Translations = new Module('translations');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Translations.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Translations.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Translations.menus.add({
    'roles': ['top-admin'],
    'title': 'Translations',
    'link': 'all translations',
    'menu': 'main'
  });
  Translations.menus.add({
    'roles': ['top-admin'],
    'title': 'Create Translation',
    'link': 'create translation',
    'menu': 'main/Translations'
  });
  //Translations.aggregateAsset('js','/packages/system/public/services/menus.js',{group:'footer',absolute:true, weight:-9999});
  /*
  Translations.aggregateAsset('js', 'test.js', {
    group: 'footer',
    weight: -1
  });
  */


  /*
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Translations.settings({'someSetting':'some value'},function (err, settings) {
      //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Translations.settings({'anotherSettings':'some value'});

    // Get settings. Retrieves latest saved settings
    Translations.settings(function (err, settings) {
      //you now have the settings object
    });
    */
  //Translations.aggregateAsset('css', 'translations.css');

  return Translations;
});
