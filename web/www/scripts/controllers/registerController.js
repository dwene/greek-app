    App.controller('registerController', function($scope, $rootScope, $location, registerOrganizationService, LoadScreen){
        routeChange();
        $scope.data = {};
        $scope.continue = function(isValid, data){
            $scope.error = false;
            if(isValid){
                registerOrganizationService.set(data);
                $location.path('registerorganizationinfo');
            }
            else{
                $scope.error = true;
            }
        }
        //this page passes parameters through a get method to register info
    });