App.controller('organizationPictureController', function($scope, $http, Load, $rootScope){
    routeChange();
    Load.then(function(){
        $rootScope.requirePermissions(COUNCIL);
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/get_upload_url', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $("#profilePic").attr("action", data.data);
                    $scope.url = data.data;
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
    });