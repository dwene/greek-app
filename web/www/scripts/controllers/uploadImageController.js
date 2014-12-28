    App.controller('uploadImageController', function($scope, RESTService, Load, $rootScope, $location){
    routeChange();
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/set_uploaded_prof_pic', {key: getParameterByName('key')})
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $location.path("app/accountinfo");
                }
                else
                {
                    console.log("error: ", data.error)
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });
        
        $scope.showIndividual = function(member){
            $location.path("app/directory/user/"+member.user_name);
        }
    });