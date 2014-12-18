    App.controller('registerinfoController', function($scope, $http, registerOrganizationService, $rootScope) {
        routeChange();
        if (registerOrganizationService.get() === undefined){
            window.location.assign('#/register');
        }
        $scope.$watch('item.user_name', function() {
            $scope.unavailable = false;
            $scope.available = false;
        });
        //ng-submit on form submit button click
        
        $scope.checkUserName = function(user){
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/check_username', packageForSending(user))
                .success(function(data){
                    if (!checkResponseErrors(data))
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
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/register_organization', packageForSending(data_tosend))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        var responseData = JSON.parse(data.data);
                        $.cookie(TOKEN,  responseData.token, {expires: new Date(responseData.expires)});
                        $rootScope.perms =  responseData.perms;
                        $.cookie("USER_NAME", data_tosend.user.user_name);
                        window.location.assign("/#/app/managemembers/add");
                        $rootScope.refresh();
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