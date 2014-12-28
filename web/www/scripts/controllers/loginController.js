//login page
	App.controller('loginController', function($scope, RESTService, $rootScope, localStorageService, $location, $log, AuthService, Session, AUTH_EVENTS) {
        routeChange();
        $scope.showScreen = true;
        if (AuthService.isAuthenticated() || !AuthService.loginAttempted()){
            $location.path('app');
        }
        // $.removeCookie(USER_NAME);
        // $.removeCookie(TOKEN);
        // $.removeCookie('FORM_INFO_EMPTY');
        $scope.login = function(user_name, password){
            $scope.showScreen = false;
            AuthService.login({user_name: user_name, password: password}).then(function (user) {
                if (AuthService.isAuthenticated()){
                  $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                  if (Session.perms == 'alumni'){
                    $location.path('app/directory');
                  }
                  else{
                    $location.path('app/home');
                  }
                }
                else{
                    $scope.showScreen = true;
                    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                    $log.error('login failed');
                }
            }, function () {
              $scope.showScreen = true;
              $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
              $log.error('login failed');
            });
            // $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/login', packageForSending({user_name: user_name, password: password}))
            //     .success(function(data) {
            //         if(!checkResponseErrors(data))
            //         {
            //             LoadScreen.start();
            //             returned_data = JSON.parse(data.data);
            //             $.cookie(USER_NAME, user_name.toLowerCase(), {expires: new Date(returned_data.expires)});
            //             $.cookie(TOKEN, returned_data.token, {expires: new Date(returned_data.expires)});
            //             $rootScope.perms = returned_data.perms;
            //             if (localStorageService.get('user_name') != $.cookie(USER_NAME)){
            //                 localStorage.clear();
            //                 localStorageService.set('user_name', $.cookie(USER_NAME));
            //             }
            //             if (returned_data.perms == 'alumni'){
            //                 Auth.set($rootScope.perms);
            //                 window.location.assign('/#/app/directory');
            //             }
            //             else{
            //                 Auth.set(ALUMNI);
            //                 window.location.assign('/#/app/messaging');
            //             }
            //         }
            //         else{
            //             if (data.error == "BAD_LOGIN"){
            //                 $scope.badLogin = true;
            //                 LoadScreen.stop();
            //             }   
            //         }
            //     })
            //     .error(function(data) {
            //         $scope.login(user_name, password);
            //         console.log('Error: ' , data);
            //     });
        };
        $scope.forgotPassword = function(){
            $location.path('#/forgotpassword'); 
        }
    });