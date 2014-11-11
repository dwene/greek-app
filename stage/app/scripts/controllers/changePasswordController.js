App.controller('changePasswordController', function($scope, $http, Load, $rootScope) {
    routeChange();
    Load.then(function(){    
        $scope.passwordChanged = false;
        $scope.changeFailed = false;
        $scope.changePassword = function(password) {
            var to_send = {password:$scope.item.password, old_password: $scope.item.old_password};
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/change_password', packageForSending(to_send))
            .success(function(data) {
                if(!checkResponseErrors(data)){
                    $scope.passwordChanged = true;
                    $scope.changeFailed = false;
                    $rootScope.logout();
                    window.location.assign('#/app/login');
                }
                else{
                    console.log('Error: ' , data);
                    $scope.changeFailed = true;
                    $scope.passwordChanged = false;
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
                $scope.changeFailed = true;
                $scope.passwordChanged = false;
            });              
        }
    });
    });