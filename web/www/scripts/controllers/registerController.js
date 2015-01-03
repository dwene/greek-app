    App.controller('registerController', function($scope, $rootScope, $location, registerOrganizationService, LoadScreen, AUTH_EVENTS){
        routeChange();
        $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
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