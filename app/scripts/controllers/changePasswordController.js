App.controller('changePasswordController', ['$scope', '$http', '$rootScope', '$location',
    function($scope, $http, $rootScope, $location) {
        $scope.passwordChanged = false;
        $scope.changeFailed = false;
        $scope.changePassword = function(password) {
            var to_send = {
                password: $scope.item.password,
                old_password: $scope.item.old_password
            };
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/auth/v1/change_password', to_send)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        $scope.passwordChanged = true;
                        $scope.changeFailed = false;
                        $location.assign('app/login');
                    } else {
                        console.log('Error: ', data);
                        $scope.changeFailed = true;
                        $scope.passwordChanged = false;
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                    $scope.changeFailed = true;
                    $scope.passwordChanged = false;
                });
        }
    }
]);