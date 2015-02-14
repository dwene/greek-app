App.controller('notificationController', function($scope, $http, $rootScope, $location, Session, Organization, AUTH_EVENTS, Notifications){
        routeChange();
        Notifications.get();
        $scope.notifications = Notifications.notifs;
        $scope.$on('notifications:updated', function(){
            $scope.notifications = Notifications.notifs;
            var new_count = 0;
            for (var i = 0; i < $scope.notifications.length; i++){
                if ($scope.notifications[i].new){
                    new_count++;
                }
            }
        });   
        
        $scope.readNotifications = function(){
        }
    });