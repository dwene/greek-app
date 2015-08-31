App.controller('appController', ['$scope', '$interval', '$rootScope', '$timeout', '$location', 'localStorageService', 'AuthService', 'AUTH_EVENTS', 'Organization', 'Session', 'Notifications', 'Directory', 'Updates',
    function($scope, $interval, $rootScope, $timeout, $location, localStorageService, AuthService, AUTH_EVENTS, Organization, Session, Notifications, Directory, Updates) {
        var vm = this;
        var notification_update_interval;
        AuthService.cachedLogin();
        $scope.authenticated = AuthService.isAuthenticated();
        $rootScope.$on(AUTH_EVENTS.loginSuccess, function() {
            Notifications.get();
            $scope.authenticated = true;
            if (!angular.isDefined(notification_update_interval)) {
                Updates.get();
                notification_update_interval = $interval(function(){
                    Updates.get();
                }, 15000)
            }
        });
        $scope.$on('organization:updated', function() {
            if ($rootScope.color != Organization.organization.color) {
                $scope.authenticated = false;
                $rootScope.color = Organization.organization.color;
                $timeout(function() {
                    $scope.authenticated = AuthService.isAuthenticated();
                });
            }
        })
        $rootScope.$on(AUTH_EVENTS.logoutSuccess, function() {
            $scope.authenticated = false;
            console.log('logging out');
            if (angular.isDefined(notification_update_interval)) {
                $interval.cancel(notification_update_interval);
            }
        });
        $scope.$on('$destroy', function() {
            if (angular.isDefined(notification_update_interval)) {
                $interval.cancel(notification_update_interval);
            }
        });
        $scope.$on(AUTH_EVENTS.sessionTimeout, function() {
            $scope.authenticated = AuthService.isAuthenticated();
        });
    }
]);