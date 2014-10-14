'use strict';

/**
 * @ngdoc function
 * @name yoAppApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the yoAppApp
 */
angular.module('yoAppApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
