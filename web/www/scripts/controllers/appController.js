App.controller('appController', function($scope, $http, $interval, $rootScope, LoadScreen, localStorageService, Notifications, Load) {
    routeChange();
    $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/check_login', packageForSending(''))
        .success(function(data){
            console.log('----------THIS LOGIN WORKS----------');
            if (!checkResponseErrors(data)) {LoadScreen.stop();}
            else {LoadScreen.start(); window.location.replace('/#/login');}
        });
    Load.then(function(){
        if(!checkLogin()){
            LoadScreen.start();
            window.location.assign("/#/login");
        }
        Notifications.get();
        if(!$rootScope.updatingNotifications){
            $rootScope.updatingNotifications = true;
        $interval(function(){$rootScope.updateNotifications();}, 40000);
    }
    });
});