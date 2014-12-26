    App.controller('managealumniController', function($scope, RESTService, $rootScope, Load, LoadScreen, localStorageService, Directory){
        routeChange();
        Load.then(function(){
            $rootScope.requirePermissions(LEADERSHIP);
            $scope.directory = Directory.get();
            if ($scope.directory){
                $scope.finished_loading = true;
            }
            $scope.$on('directory:updated', function(){
                $scope.directory = Directory.get();
                $scope.finished_loading = true;
            });
        }); 
        $scope.openDeleteAlumniModal = function(user){
            $('#deleteAlumniModal').modal();
            $scope.selectedUser = user;
        }
        
        $scope.openConvertAlumniModal = function(user){
            $('#convertAlumniModal').modal();
            $scope.selectedUser = user;
        }
        
        $scope.resendWelcomeEmail = function(member){
            member.updating = 'pending';
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/resend_welcome_email', {key: member.key})
                .success(function(data){
                    if (!RESTService.hasErrors(data)){
                        member.updating = 'done';
                    }
                    else{
                        member.updating = 'broken';
                    }
                })
                .error(function(data) {
                    member.updating = 'broken';
                });
        }
        
        // function getAlumni(){
        //     $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory', packageForSending(''))
        //         .success(function(data){
        //             if (!checkResponseErrors(data))
        //             {
        //                 $rootScope.directory = JSON.parse(data.data);
        //                 localStorageService.set('directory', $rootScope.directory);
        //                 assignAngularViewModels($rootScope.directory.alumni);
        //             }
        //             else
        //             {
        //                 console.log("error: ", data.error)
        //             }
        //         })
        //         .error(function(data) {
        //             console.log('Error: ' , data);
        //         });
        // }
        
        /*This function takes the data and assigns it to the DOM with angular models*/
        // function assignAngularViewModels(alumni){
        //     $scope.alumni = alumni;
        //     LoadScreen.stop();
        // }
        /*This function is the first function to run when the controller starts. This deals with caching data so we dont have to pull data evertytime we load the page*/
        // function onPageLoad(){
        //     console.log('page is loading');
        //     if($rootScope.directory.alumni){
        //         assignAngularViewModels($rootScope.directory.alumni);
        //         getAlumni();
        //     }
        //     else{
        //         LoadScreen.start();
        //         getAlumni();
        //     }
        // }
        //onPageLoad();
        
        $scope.convertAlumniToMember = function(alumnus){
            $scope.selectedUser = {}
            $('#convertAlumniModal').modal('hide');
            var to_send = {'keys': [alumnus.key]}
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/revert_from_alumni', to_send)
                .success(function(data){
                    if (!RESTService.hasErrors(data))
                    {
                    }
                    else
                    {
                        console.log("error: ", data.error)
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
                for (var i = 0; i < $scope.directory.alumni.length; i++){
                    if ($scope.directory.alumni[i]. key == alumnus.key){
                        $scope.directory.alumni.splice(i, 1);
                        break;
                    }
                }
        }
        $scope.removeAlumni = function(alumnus){
            $scope.selectedUser = {}
            $('#deleteAlumniModal').modal('hide');
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/remove_user', alumnus);   
            if ($scope.directory.alumni.indexOf(alumnus) > -1){
                $scope.directory.alumni.splice($scope.directory.alumni.indexOf(alumnus), 1);
            }
        }
    });