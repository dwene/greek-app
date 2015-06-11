App.controller('appController', ['$scope', '$interval', '$rootScope', '$timeout', 'localStorageService', 'AuthService', 'AUTH_EVENTS', 'Organization', 'Inbox', 'Session', 'Notifications', 'Directory',
    function($scope, $interval, $rootScope, $timeout, localStorageService, AuthService, AUTH_EVENTS, Organization, Inbox, Session, Notifications, Directory) {
        var notification_update_interval;
        if (AuthService.isAuthenticated() && !angular.isDefined(notification_update_interval)) {
            notification_update_interval = $interval(function() {
                updates()
            }, 10000);
        }
        AuthService.cachedLogin();
        $scope.authenticated = AuthService.isAuthenticated();
        $scope.checkPermissions = function(perms) {
            if (!$scope.authenticated) {
                return false;
            } else {
                if (PERMS_LIST.indexOf(perms) > PERMS_LIST.indexOf(Session.perms)) {
                    return false;
                }
                return true;
            }
        }

        function updates() {
            Inbox.update();
            Notifications.update();
        }
        $rootScope.$on(AUTH_EVENTS.loginSuccess, function() {
            console.log('I got my login successfully! :)');
            Organization.get();
            Inbox.get();
            Notifications.get();
            if (!angular.isDefined(notification_update_interval)) {
                notification_update_interval = $interval(function() {
                    updates()
                }, 10000);
            }
            $scope.authenticated = true;
        });
        $scope.$on('organization:updated', function() {
            console.log('Organization just updated');
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
            console.log('I am logging out and canceling interval :(');
            if (angular.isDefined(notification_update_interval)) {
                $interval.cancel(notification_update_interval);
            }
        });
        $scope.$on('$destroy', function() {
            console.log('I am getting destroyed :(');
            if (angular.isDefined(notification_update_interval)) {
                $interval.cancel(notification_update_interval);
            }
        });
        $scope.$on(AUTH_EVENTS.sessionTimeout, function() {
            $scope.authenticated = AuthService.isAuthenticated();
        });
    }
]);