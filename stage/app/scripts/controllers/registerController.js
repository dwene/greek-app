    App.controller('registerController', function($scope, $http, $rootScope, registerOrganizationService, LoadScreen){
        routeChange();
        $rootScope.logout();
        $scope.data = {};
        LoadScreen.stop();
        $scope.continue = function(isValid, data){
            $scope.error = false;
            if(isValid){
                registerOrganizationService.set(data);
                window.location.assign('#/registerorganizationinfo');
            }
            else{
                $scope.error = true;
            }
        }
        //this page passes parameters through a get method to register info
    });