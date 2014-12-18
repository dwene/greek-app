    App.controller('helpMessageController', function($scope, $http, $rootScope) {
        $scope.howdy="howdy";
        $scope.sendHelpMessage = function(isValid, content){
            console.log('I am getting submitted');
            if(isValid){
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/report_error', packageForSending(content))
                .success(function(){console.log('success');})
                .error(function(){console.log('error');})
            }
            else{
            //do nothing
            }
        }
	});