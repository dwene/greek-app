    App.controller('accountinfoController', function($scope, $http, $rootScope, Organization, Load){
    routeChange();
    Load.then(function(){
        $scope.changePassword = function(old_pass, new_pass) {
            var to_send = {password:new_pass, old_password: old_pass};
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/change_password', packageForSending(to_send))
            .success(function(data) {
                if(!checkResponseErrors(data)){
                    $scope.passwordChanged = true;
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
        $scope.updatedInfo = false;
        $scope.item = $rootScope.me;
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/get_user_directory_info', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $rootScope.me = JSON.parse(data.data);
                    $scope.userName = $rootScope.me.user_name;
                    $scope.pledgeClass = $rootScope.me.pledge_class;
                    $scope.item = $rootScope.me;
                }
                else
                {
                    console.log('ERROR: ',data);
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });
        
        $scope.checkAlumni = function(){
            return $rootScope.checkAlumni();
        }
        
        
        $scope.updateAccount = function(isValid){
            if(isValid){
                $scope.working = 'pending';
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/update_user_directory_info', packageForSending($scope.item))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        $rootScope.me = $scope.item;
                        $scope.working = 'done';
                        $scope.updatedInfo = true;
                        $.removeCookie('FORM_INFO_EMPTY');
                    }
                    else
                    {
                        $scope.working = 'broken';
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
            }
        }
    $scope.updateEmailPrefs = function(option){
        var to_send = {email_prefs: option}
        $scope.emailPrefUpdating = "pending";
        $rootScope.me.email_prefs = option;
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/update_user_directory_info', packageForSending(to_send))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $scope.emailPrefUpdating = "done";
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
    
    $scope.getUser = function(){
        return $.cookie(USER_NAME);
    }
    $scope.getToken = function(){
        return $.cookie(TOKEN);
    }
    });
});