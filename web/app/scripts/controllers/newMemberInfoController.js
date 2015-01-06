    App.controller('newmemberinfoController', function($scope, RESTService, $rootScope, $stateParams, $location){
        routeChange();
        $scope.loading = true;
        $scope.user_is_taken = false;
        $scope.waiting_for_response = false;
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/new_user', '')
            .success(function(data){
                if (!RESTService.hasErrors(data))
                {
                    $scope.loading = false;
                }
                else{
                    console.log('ERROR: ',data);
                    $location.path('login');
                }
            })
            .error(function(data) {
                $location.path('login');
                console.log('Error: ' , data);
            });
        $scope.$watch('item.user_name', function() {
            if ($scope.user_name){
                $scope.item.user_name = $scope.item.user_name.replace(/\s+/g,'');
            }
            $scope.unavailable = false;
            $scope.available = false;
        });
        $scope.checkUserName = function(user){
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/check_username', user)
                .success(function(data){
                    if (!RESTService.hasErrors(data))
                    {
                        $scope.available = true;
                        $scope.unavailable = false;
                    }
                    else{
                        console.log('ERROR: ',data);
                        $scope.available = false;
                        $scope.unavailable = true;}  
                });
        }
        
        $scope.createAccount = function(isValid){
            
            if(isValid){
                $scope.working = 'pending';
                $scope.waiting_for_response = true;
                var to_send = {user_name: $scope.item.user_name, password: $scope.item.password}
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/register_credentials', to_send)
                .success(function(data){
                    if (!RESTService.hasErrors(data))
                    {
                        $scope.working = 'done';
                        var returned_data = JSON.parse(data.data);
                        $.cookie(TOKEN,returned_data.token, {expires: new Date(returned_data.expires)});
                        $.cookie(USER_NAME, $scope.item.user_name, {expires: new Date(returned_data.expires)});
                        $.cookie(PERMS, returned_data.perms);
                        $.cookie('FORM_INFO_EMPTY', 'true');
                        $location.path("app/accountinfo");
                    }
                    else
                    {
                        $scope.working = 'broken';
                        if(data.error == "INVALID_USERNAME")
                        {
                            $scope.unavailable = true;
                            $scope.available = false;
                        }
                        console.log('ERROR: ', data);
                    } 
                })
                .error(function(data) {
                    $scope.working = 'broken';
                    console.log('Error: ' , data);
                });
                    //now logged in
                $scope.waiting_for_response = false;
            }
            else{
                $scope.submitted = true;
            }
        }
    });