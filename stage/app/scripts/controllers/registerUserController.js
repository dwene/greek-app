    App.controller('registerUserController', function($scope, $http, $rootScope, registerOrganizationService, LoadScreen){
        routeChange();
        $rootScope.logout();
        $scope.data = {};
        LoadScreen.stop();
        $scope.findMe = function(email){
            $scope.users_load = 'pending';
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/find_unregistered_users', packageForSending({email:email}))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        $scope.users_load = 'done';
                        $scope.users = JSON.parse(data.data);
                        $scope.loadedUsers = true;
                    }
                    else{$scope.users_load = 'broken';}
                })
                .error(function(data){
                    $scope.users_load = 'broken';
                })
        }
        $scope.resendEmail = function(key){
            $scope.email_load = 'pending';
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/resend_registration_email', packageForSending({key:key}))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        $scope.sentEmail = true;
                        $scope.email_load = 'done';
                    }
                    else {
                        $scope.sentEmail = false;
                        $scope.email_load = 'broken';
                    }
                })
                .error(function(data){
                    $scope.email_load = 'broken';             
                });
        }
    });