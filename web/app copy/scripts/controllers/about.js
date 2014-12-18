'use strict';

/**
 * @ngdoc function
 * @name yoAppApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the yoAppApp
 */
angular.module('yoAppApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
