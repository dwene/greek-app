App.controller('changePasswordFromTokenController', ['$scope', '$http', '$rootScope', '$stateParams', '$location',
    function($scope, $http, $rootScope, $stateParams, $location) {
        routeChange();
        $.removeCookie(USER_NAME);
        $.cookie(TOKEN, $stateParams.token);
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/auth/v1/check_password_token', packageForSending(''))
            .success(function(data) {
                if (!checkResponseErrors(data)) {
                    $scope.user = JSON.parse(data.data);
                } else {
                    $location.path('login');
                }
            })
            .error(function(data) {
                $location.path('login');
            });
        $scope.passwordChanged = false;
        $scope.changeFailed = false;
        $scope.changePassword = function(password, isValid) {
            if (isValid) {
                $scope.changingPassword = 'pending';
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/auth/v1/change_password_from_token', packageForSending({
                    password: password
                }))
                    .success(function(data) {
                        if (!checkResponseErrors(data)) {
                            $scope.passwordChanged = true;
                            $scope.changeFailed = false;
                            $scope.user_name = data.data;
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
            } else {
                $scope.changingPassword = '';
            }
        };
    }
]);
