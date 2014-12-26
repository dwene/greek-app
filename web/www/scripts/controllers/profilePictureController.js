    App.controller('profilepictureController', function($scope, RESTService, $http, Load, $rootScope){
    routeChange();
    Load.then(function(){
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/get_upload_url', '')
            .success(function(data){
                if (!RESTService.hasErrors(data))
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
            $scope.type = "prof_pic";
        //initialize profile image variable
        var newprofileImage;
        
        //reads the file as it's added into the file input
        
        $scope.uploadFile = function(files) {
            newprofileImage = new FormData();
            //Take the first selected file
            newprofileImage.append("file", files[0]);
        }
        
        
        $scope.uploadPicture = function(){
            
            console.log(newprofileImage);
            $http.post($scope.url, newprofileImage, {
                headers: {'Content-Type': undefined},
                transformRequest: angular.identity,
                })
            .success(function(data){
                console.log("success");
                console.log(data);
            })
            .error(function(data) {
                console.log("failure");
                console.log(data);
            });
        }
    });
    });