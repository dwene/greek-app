//login page
	App.controller('loginController', function($scope, $http, $rootScope, LoadScreen, localStorageService) {
        routeChange();
        $rootScope.logout();
        $.removeCookie(USER_NAME);
        $.removeCookie(TOKEN);
        $.removeCookie('FORM_INFO_EMPTY');
        $rootScope.directory = {};
        LoadScreen.stop();
        $('#body').show();
        $scope.login = function(user_name, password){
            LoadScreen.start();
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/login', packageForSending({user_name: user_name, password: password}))
                .success(function(data) {
                    if(!checkResponseErrors(data))
                    {
                        LoadScreen.start();
                        returned_data = JSON.parse(data.data);
                        $.cookie(USER_NAME, user_name.toLowerCase(), {expires: new Date(returned_data.expires)});
                        $.cookie(TOKEN, returned_data.token, {expires: new Date(returned_data.expires)});
                        $rootScope.perms = returned_data.perms;
                        if (localStorageService.get('user_name') != $.cookie(USER_NAME)){
                            localStorage.clear();
                            localStorageService.set('user_name', $.cookie(USER_NAME));
                        }
                        if (returned_data.perms == 'alumni'){
                            window.location.assign('#/app/directory');
                        }
                        else{
                            window.location.assign('#/app');
                        }
                        window.location.reload();
                    }
                    else{
                        if (data.error == "BAD_LOGIN"){
                            $scope.badLogin = true;
                            LoadScreen.stop();
                        }   
                    }
                })
                .error(function(data) {
                    $scope.login(user_name, password);
                    console.log('Error: ' , data);
                });
        };
        $scope.forgotPassword = function(){
        window.location.assign('/#/forgotpassword'); 
        }
    });