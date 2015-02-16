    App.controller('profilepictureController', function($scope, $location, RESTService, $http, Load, $rootScope, Session, Directory){
    routeChange();
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/get_upload_url', '')
            .success(function(data){
                if (!RESTService.hasErrors(data))
                {
                    $("#profilePic").attr("action", data.data);
                    $scope.url = data.data;
                }
                else
                {
                    console.log("Error" , data.error);
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });
            $scope.user_name = Session.user_name;
            $scope.token = Session.token;
            $scope.type = "prof_pic";
        //initialize profile image variable
        var newprofileImage;
        
        //reads the file as it's added into the file input
        
        // $scope.uploadFile = function(files) {
        //     newprofileImage = new FormData();
        //     newprofileImage.append("file", files[0]);
        //     console.log(newprofileImage);
        // }
        
        $scope.uploadImage = function(src, crop_data){
            // console.log(src);
            // var header = src.slice(0, src.indexOf(';'));
            // console.log('header',header);
            // var mime = header.slice(src.indexOf(':')+1);
            // console.log('mime',mime);
            console.log(crop_data);
            var img = src.slice(src.indexOf(',')+1);
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/change_profile_image', {img:img, crop:crop_data})
            .success(function(data){
                console.log("success");
                var me = Session.me;
                me.prof_pic = JSON.parse(data.data);
                Directory.updateMe(me);
                Session.updateMe(me);
                $location.url('app/accountinfo');
            })
            .error(function(data) {
                console.log("failure");
                
            });
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