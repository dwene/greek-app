App.controller('appController', function($scope, $interval, $rootScope, LoadScreen, localStorageService, AuthService, AUTH_EVENTS, Organization, Inbox, Session, Notifications, Directory) {
    routeChange();
    var notification_update_interval;
    if (AuthService.isAuthenticated() && !angular.isDefined(notification_update_interval)){
        notification_update_interval = $interval(function(){updates()}, 10000);
    }
    AuthService.cachedLogin();
    $scope.authenticated = AuthService.isAuthenticated();
    
    $scope.checkPermissions = function(perms){
        if (!$scope.authenticated){
            return false;
        }
        else{
            if (PERMS_LIST.indexOf(perms) > PERMS_LIST.indexOf(Session.perms)){
                return false;
            }
                return true;
        }
    }
    function updates(){
        console.log('I am updating!');
        Inbox.update();
        Notifications.update();
    }
    $scope.$on(AUTH_EVENTS.loginSuccess, function(){
        Organization.get();
        Inbox.get();
        Notifications.get();
        if (!angular.isDefined(notification_update_interval)){
            notification_update_interval = $interval(function(){updates()}, 10000);
        }
        $scope.authenticated = true;
    });
    $scope.$on(AUTH_EVENTS.logoutSuccess, function(){
        $scope.authenticated = false;
        console.log('I am logging out and canceling interval :(');
        if(angular.isDefined(notification_update_interval)){
            $interval.cancel(notification_update_interval);
        }
    });
    $scope.$on('$destroy',function(){
        console.log('I am getting destroyed :(');
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