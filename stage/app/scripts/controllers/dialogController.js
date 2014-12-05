App.controller('dialogController', function($scope, $http, LoadScreen, $rootScope, $timeout, $mdSidenav, $mdDialog) {
        $scope.sendHelpMessage = function(isValid, content){
            console.log('I am getting submitted');
            if(isValid){
                $scope.sendingHelp='pending';
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/report_error', packageForSending(content))
                .success(function(){console.log('success');
                $scope.helpMessage.$setPristine();
                $scope.message={};
                $scope.sendingHelp='done';
                $mdDialog.hide();
                })
                .error(function(){console.log('error');
                $scope.sendingHelp='broken';})
            }
            else{
            //do nothing
            }
        }
});