App.controller('accountinfoController', function($scope, RESTService, $rootScope, $timeout, Load, Organization, AUTH_EVENTS, Session, Directory, $location){
    routeChange();
    Organization.get();
    $scope.updatedInfo = false;
    $scope.item = Session.me;
    $scope.checkAlumni = Session.perms == 'alumni';
    if ($scope.item.dob){
        $scope.item.dob = moment($scope.item.dob).format('MM/DD/YYYY');
    }

    $scope.changePassword = function(old_pass, new_pass) {
        var to_send = {password:new_pass, old_password: old_pass};
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/change_password', to_send)
        .success(function(data) {
            if(!checkResponseErrors(data)){
                $scope.passwordChanged = true;
                $rootScope.passwordChanged = true;
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
                $scope.changeFailed = false;
            }
            else{
                console.log('Error: ' , data);
                $scope.changeFailed = true;
                $scope.passwordChanged = false;
            }
        })
        .error(function(data) {
            console.log('Error: ' , data);
            $scope.changeFailed = true;
            $scope.passwordChanged = false;
        });              
    }
    
    $scope.goToMe = function(){
            $location.path('app/directory/'+Session.user_name);
    }
    
    // RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/get_user_directory_info', '')
    //     .success(function(data){
    //         if (!RESTService.hasErrors(data))
    //         {
    //             $rootScope.me = JSON.parse(data.data);
    //             $scope.userName = $rootScope.me.user_name;
    //             $scope.pledgeClass = $rootScope.me.pledge_class;
    //             $scope.item = $rootScope.me;
    //         }
    //         else
    //         {
    //             console.log('ERROR: ',data);
    //         }
    //     })
    //     .error(function(data) {
    //         console.log('Error: ' , data);
    //     });
    
    $scope.checkAlumni = function(){
        return Session.perms != 'alumni';
    }
        
        
    $scope.updateAccount = function(isValid){
        console.log(isValid);
        if(isValid){
            console.log($scope.item);
            $scope.working = 'pending';
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/update_user_directory_info', $scope.item)
            .success(function(data){
                if (!RESTService.hasErrors(data))
                {
                    $scope.working = 'done';
                    $scope.updatedInfo = true;
                    Directory.updateMe($scope.item);
                }
                else
                {
                    console.log('ERROR: ',data);
                }
                
            })
            .error(function(data) {
                $scope.working = 'broken';
                console.log('Error: ' , data);
            });
        }
        else{
        //for validation purposes
        $scope.submitted = true;
        $scope.updatedInfo = false;
        }
    }
    $scope.updateEmailPrefs = function(option){
        var to_send = {email_prefs: option}
        $scope.emailPrefUpdating = "pending";
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/update_user_directory_info', to_send)
            .success(function(data){
                if (!RESTService.hasErrors(data))
                {
                    $scope.emailPrefUpdating = "done";
                    Session.me.email_prefs = option;
                }
                else
                {
                    console.log('ERROR: ',data);
                    $scope.emailPrefUpdating = "broken";
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
                console.log('I should be broken');
                $scope.emailPrefUpdating = "broken";
            });
    }
    
    // $scope.getUser = function(){
    //     return Organization.me.user_name;
    // }
    // $scope.getToken = function(){
    //     return $.cookie(TOKEN);
    // }
});