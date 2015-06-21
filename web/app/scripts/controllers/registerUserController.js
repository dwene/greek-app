App.controller('registerUserController', ['$scope', 'RESTService', '$rootScope', 'Session', 'registerOrganizationService',
    function($scope, RESTService, $rootScope, Session, registerOrganizationService) {
        routeChange();
        $scope.data = {};
        $scope.findMe = function(email) {
            $scope.users_load = 'pending';
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/auth/v1/find_unregistered_users', {
                email: email
            })
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        $scope.users_load = 'done';
                        $scope.users = JSON.parse(data.data);
                        $scope.loadedUsers = true;
                    } else {
                        $scope.users_load = 'broken';
                    }
                })
                .error(function(data) {
                    $scope.users_load = 'broken';
                })
        }

        $scope.resendEmail = function(key) {
            $scope.email_load = 'pending';
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/auth/v1/resend_registration_email', {
                key: key
            })
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        $scope.sentEmail = true;
                        $scope.email_load = 'done';
                    } else {
                        $scope.sentEmail = false;
                        $scope.email_load = 'broken';
                    }
                })
                .error(function(data) {
                    $scope.email_load = 'broken';
                });
        }
    }
]);