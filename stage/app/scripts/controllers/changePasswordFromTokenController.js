    App.controller('changePasswordFromTokenController', function($scope, $http, $rootScope, LoadScreen, $stateParams) {
        routeChange();
        $.removeCookie(USER_NAME);
        $.cookie(TOKEN, $stateParams.token);
        console.log('My token', $.cookie(TOKEN));
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/check_password_token', packageForSending(''))
        .success(function(data){
            if (!checkResponseErrors(data)){
                LoadScreen.stop();
                $scope.user = JSON.parse(data.data);
            }
            else{
                window.location.replace('#/login');
            }
        })
        .error(function(data){window.location.replace('#/login')});
        $scope.passwordChanged = false;
        $scope.changeFailed = false;
        $scope.changePassword = function(password, isValid) {
            if(isValid){
            $scope.changingPassword = 'pending';
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/change_password_from_token', packageForSending({password: password}))
            .success(function(data) {
                if(!checkResponseErrors(data)){
                    $scope.passwordChanged = true;
                    $scope.changeFailed = false;
                    $scope.user_name = data.data;
                    $scope.changingPassword = 'done';
                }
                else{
                    console.log('Error: ' , data);
                    $scope.changeFailed = true;
                    $scope.passwordChanged = false;
                    $scope.changingPassword = 'broken';
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
                $scope.changeFailed = true;
                $scope.passwordChanged = false;
                $scope.changingPassword = 'broken';
            });   
            }
            else{
                $scope.changingPassword = '';
            }
        }
    });