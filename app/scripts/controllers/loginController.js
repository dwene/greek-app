//login page
App.controller('loginController', ['$scope', 'RESTService', '$rootScope', 'localStorageService', '$location', '$log', 'AuthService', 'Session', 'AUTH_EVENTS',
    function($scope, RESTService, $rootScope, localStorageService, $location, $log, AuthService, Session, AUTH_EVENTS) {
        routeChange();
        $scope.showScreen = true;
        if (AuthService.isAuthenticated() || !AuthService.loginAttempted()) {
            $location.path('app');
        }
        // $.removeCookie(USER_NAME);
        // $.removeCookie(TOKEN);
        // $.removeCookie('FORM_INFO_EMPTY');
        $scope.login = function(user_name, password) {
            $scope.showScreen = false;
            AuthService.login({
                user_name: user_name.toLowerCase(),
                password: password
            }).then(function(user) {
                if (AuthService.isAuthenticated()) {
                    if (Session.perms == 'alumni') {
                        $location.path('app/directory');
                    } else {
                        $location.path('app/home');
                    }
                } else {
                    $scope.showScreen = true;
                    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                    $log.error('login failed');
                }
            }, function() {
                $scope.showScreen = true;
                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                $log.error('login failed');
            });
        };
        $scope.forgotPassword = function() {
            $location.url('forgotpassword');
        }
    }
]);