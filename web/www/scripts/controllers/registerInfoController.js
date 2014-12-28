    App.controller('registerinfoController', function($scope, RESTService, registerOrganizationService, $rootScope, $location) {
        routeChange();
        if (registerOrganizationService.get() === undefined){
            $location.url('register');
        }
        $scope.$watch('item.user_name', function() {
            $scope.unavailable = false;
            $scope.available = false;
        });
        //ng-submit on form submit button click
        
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
        $scope.registerinfoClick = function(item, isValid){
        if(isValid){
            var organization = registerOrganizationService.get();
                //it would be great if we could add validation here to see if the organization information was correctly added from the previous page
    //            if(organization.name === null || organization.school === null || organization.type === null){
    //                window.location.assign("/#/register");
    //            }
                //format data for the api
                data_tosend = {organization: organization, user: item}
                //send the organization and user date from registration pages
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/register_organization', data_tosend)
                .success(function(data){
                    if (!RESTService.hasErrors(data))
                    {
                        var responseData = JSON.parse(data.data);
                        Session.create(data_tosend.user.user_name.toLowerCase(),responseData.token, 'council');
                        $.cookie(TOKEN,  responseData.token, {expires: new Date(responseData.expires)});
                        $.cookie(USER_NAME, data_tosend.user.user_name,{expires: new Date(responseData.expires)});
                        $location.url("app/managemembers/add");
                    }
                    else{
                        if (data.error == 'USERNAME_TAKEN'){
                            $scope.unavailable = true;
                            $scope.available = false;
                        }
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });  
        }
            else{
            //for validation purposes
            $scope.submitted = true;
            }
        };
	});
    