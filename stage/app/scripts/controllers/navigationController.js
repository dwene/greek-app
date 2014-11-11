App.controller('navigationController', function($scope, $http, $rootScope, LoadScreen){
        routeChange();
        
        //closes the navigation if open and an li is clicked        
        $('.navbar-brand, #mobileMenu, #mainMenu, #mobileSettings').on('click', function(){
            if( $("#mobileSettings").hasClass('in') ){
                     $("#mobileSettings").collapse('hide');
            }
            else{
            //do nothing
            }
        });
        
    
        $scope.logout = function(){
            $rootScope.logout();
            window.location.assign("/#/login");
        }
    });