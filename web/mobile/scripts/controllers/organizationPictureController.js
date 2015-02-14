App.controller('organizationPictureController', function($scope, RESTService, Load, $rootScope){
    routeChange();
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/get_upload_url', RESTService(''))
            .success(function(data){
                if (!RESTService.hasErrors(data))
                {
                    $("#profilePic").attr("action", JSON.parse(data.data));
                    $scope.url = JSON.parse(data.data);
                }
                else
                {
                    console.log("Error" , data.error)
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });
            $scope.user_name = $.cookie(USER_NAME);
            $scope.token = $.cookie(TOKEN);
            $scope.type = "organization";
    });