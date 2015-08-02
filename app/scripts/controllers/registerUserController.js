App.controller('registerUserController', ['$scope', 'RESTService', '$rootScope', 'Session', 'registerOrganizationService',
    function($scope, RESTService, $rootScope, Session, registerOrganizationService) {
        routeChange();
        $scope.data = {};
        $scope.findMe = function(email) {
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/auth/v1/find_unregistered_users', {
                email: email
            })
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        $scope.users = JSON.parse(data.data);
                        $scope.loadedUsers = true;
                    } else {
                    }
                })
                .error(function(data) {
                })
        }

        $scope.resendEmail = function(key) {
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/auth/v1/resend_registration_email', {
                key: key
            })
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        $scope.sentEmail = true;
                    } else {
                        $scope.sentEmail = false;
                    }
                })
                .error(function(data) {
                });
        }
    }
]);