App.controller('appController', function($scope, $interval, $rootScope, LoadScreen, localStorageService, AuthService, AUTH_EVENTS, Organization, Inbox, Session) {
    routeChange();
    // $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/check_login', packageForSending(''))
    //     .success(function(data){
    //         console.log('----------THIS LOGIN WORKS----------');
    //         if (!checkResponseErrors(data)) {LoadScreen.stop();}
    //         else {LoadScreen.start(); window.location.replace('/#/login');}
    //     });
    // $scope.$watch(AuthService.isAuthenticated(), function(){
    //     $scope.authenticated = AuthService.isAuthenticated();
    //     console.log($scope.authenticated);
    // })
    var notification_update_interval;
    if (AuthService.isAuthenticated() && !angular.isDefined(notification_update_interval)){
        notification_update_interval = $interval(Inbox.update(), 10000);
    }
    AuthService.cachedLogin();
    $scope.authenticated = AuthService.isAuthenticated();

    $scope.$on(AUTH_EVENTS.loginSuccess, function(){
        Organization.get();
        //Inbox.get();
        if (!angular.isDefined(notification_update_interval)){
            $interval(Inbox.update(), 10000);
        }
        $scope.authenticated = true;
    });
    $scope.$on(AUTH_EVENTS.logoutSuccess, function(){
        $scope.authenticated = false;
        if(angular.isDefined(notification_update_interval)){
            $interval.cancel(notification_update_interval);
        }
    });
    $scope.$on('$destroy',function(){
        if(angular.isDefined(notification_update_interval)){
            $interval.cancel(notification_update_interval);
        }
    });
    $scope.$on(AUTH_EVENTS.sessionTimeout, function(){
        $scope.authenticated = AuthService.isAuthenticated();
    });
    LoadScreen.stop();
        // if(!checkLogin()){
        //     LoadScreen.start();
        //     window.location.assign("/#/login");
        // }
        // Notifications.get();
        // if(!$rootScope.updatingNotifications){
        //     $rootScope.updatingNotifications = true;
        // $interval(function(){$rootScope.updateNotifications();}, 40000);
    //}
});