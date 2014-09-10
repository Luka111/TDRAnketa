'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Questionnaires = new Module('Questionnaires');

var express = require('express');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Questionnaires.register(function(app, auth, database) {

    //We enable routing. By default the Package Object is passed to the routes
    Questionnaires.routes(app, auth, database);

    //We are adding a link to the main menu for all authenticated users
    Questionnaires.menus.add({
        title: 'Questionnaires',
        link: 'all questionnaires',
        roles: ['manager'],
        menu: 'main'
    });

    Questionnaires.menus.add({
        title: 'Add New Questionnaire',
        link: 'create questionnaire',
        roles: ['manager'],
        menu: 'main/Questionnaires'
    });

    app.use('/questionnaires', express.static(__dirname + '/public'));

    /*
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Questionnaires.settings({
	'someSetting': 'some value'
    }, function(err, settings) {
	//you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Questionnaires.settings({
	'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Questionnaires.settings(function(err, settings) {
	//you now have the settings object
    });
    */

    return Questionnaires;
});
