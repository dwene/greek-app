App.controller('indexController', ['$scope', 'RESTService', '$timeout', '$mdSidenav', '$mdDialog', '$location', 'AUTH_EVENTS', 'Organization', 'Session', 'Notifications', 'Chatter',
  function($scope, RESTService, $timeout, $mdSidenav, $mdDialog, $location, AUTH_EVENTS, Organization, Session, Notifications, Chatter) {
    
    $scope.$on(AUTH_EVENTS.loginSuccess, function(){
        $scope.authed = true;
    })
    $scope.$on(AUTH_EVENTS.logoutSuccess, function(){
        $scope.authed = false;
    })
}]);
