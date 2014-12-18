
App.factory('Notifications', function($http, $rootScope, localStorageService, $q){
    // var load_data = localStorageService.get('notifications');
    var notifications = undefined;
    var notifications_length = undefined;
    var cacheTimestamp = undefined;
    return {
        get: function () {
            var load_data = localStorageService.get('notifications')
            if (load_data){
                notifications = load_data.notifications;
                $rootScope.notifications = load_data.notifications;
                $rootScope.notification_lengths = {unread:load_data.new_notifications_length, read:load_data.notifications_length, hidden:load_data.hidden_notifications_length};
                notifications_length = $rootScope.notifications_length;
                console.log('$rootscope notificatons', $rootScope.notifications);
                console.log('load data notifications', $rootScope.load_data);
                for (var i = 0; i < $rootScope.notifications.length; i++){
                        $rootScope.notifications[i].collapseOut = true; 
                }
                $rootScope.hidden_notifications = load_data.hidden_notifications;
                $rootScope.updateNotificationBadge();
            }
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/get', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data)){
                    var load_data = JSON.parse(data.data);
                    localStorageService.set('notifications', load_data);
                    $rootScope.notifications = load_data.notifications;
                    $rootScope.notification_lengths = {unread:load_data.new_notifications_length, read:load_data.notifications_length, hidden:load_data.hidden_notifications_length};
                    for (var i = 0; i < $rootScope.notifications.length; i++){
                            $rootScope.notifications[i].collapseOut = true;
                    }
                    $rootScope.hidden_notifications = load_data.hidden_notifications;
                    $rootScope.updateNotificationBadge();
                    $rootScope.$broadcast('notifications:updated');
                }
                else{
                    console.log('Err', data);
                }
                })
            .error(function(data) {
                    console.log('Error: ' , data);
                });
            return notifications;
        },
        check: function(){
            if (notifications == null){
                this.get();
                return false;
            }
            return true;
        }
    };
});