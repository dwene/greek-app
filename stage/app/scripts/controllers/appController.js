App.controller('appController', function($scope, $http, $interval, $rootScope, Load, LoadScreen, localStorageService) {
        routeChange();
        Load.then(function(){
            if(!checkLogin()){
                window.location.assign("/#/login");
            }
            if(!$rootScope.updatingNotifications){
                $rootScope.updatingNotifications = true;
            $interval(function(){$rootScope.updateNotifications();}, 40000);}
           // LoadScreen.stop();
        })
	});