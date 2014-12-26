App.factory('Inbox', function(RESTService, $rootScope, localStorageService, $q){
    var inbox = {};
    var load_data = localStorageService.get('notifications');
    if (load_data){
        inbox.notifications = load_data.notifications;
        inbox.lengths = {unread:load_data.new_notifications_length, read:load_data.notifications_length, hidden:load_data.hidden_notifications_length};
        inbox.hidden_notifications = load_data.hidden_notifications;
    }
    inbox.selectMessage = function(notify){
        inbox.selected_message = notify;
    }
    inbox.update = function () {
        console.log('calling notifications get');
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/get', '')
        .success(function(data){
            if (!RESTService.hasErrors(data)){
                var load_data = JSON.parse(data.data);
                localStorageService.set('notifications', load_data);
                inbox.notifications = load_data.notifications;
                inbox.lengths = {unread:load_data.new_notifications_length, read:load_data.notifications_length, hidden:load_data.hidden_notifications_length};
                // for (var i = 0; i < $rootScope.notifications.length; i++){
                //         $rootScope.notifications[i].collapseOut = true;
                // }
                inbox.hidden_notifications = load_data.hidden_notifications;
                // $rootScope.updateNotificationBadge();
                console.log('Inbox item', inbox);
                $rootScope.$broadcast('notifications:updated');
            }
            else{
                console.log('Err', data);
            }
            })
        .error(function(data) {
                console.log('Error: ' , data);
            });
    }
    // inbox.get: function(){
    //     return notifications;
    // },
    inbox.getLengths = function(){
        return inbox.lengths;
    }

    inbox.read = function(notification){
        if (notification.new){
            for (var i = 0; i < inbox.notifications.length; i++){
                if (inbox.notifications[i].key == notification.key){
                    if (inbox.notifications[i].new){
                        inbox.notifications[i].new = false;
                        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/seen', {'notification': notification.key});
                    }
                    return;
                }
            }
        }
    }

    inbox.readAll = function(){
        for(var i = 0; i < inbox.notifications.length; i++){
            if (inbox.notifications[i].new){
                inbox.notifications[i].new = false;
            }
        }
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/readAll', '');
    },
    inbox.archive = function(notification){
        for (var i = 0; i < inbox.notifications.length; i++){
            if (inbox.notifications[i].key == notification.key){
                if (inbox.notifications[i].new){
                    inbox.notifications[i].new = false;
                    inbox.lengths.unread--;
                }
                else{
                    inbox.lengths.read--;
                }
                inbox.hidden_notifications.append(inbox.notifications[i]);
                inbox.notifications.splice(i, 1);
                inbox.lengths.hidden++;
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/hide', {'notification': notification.key})
                return;
            }
        }
    }

    inbox.unarchive = function(notification){
        for (var i = 0; i < inbox.hidden_notifications.length; i++){
            if (inbox.hidden_notifications[i].key == notification.key){
                inbox.notifications.append(inbox.hidden_notifications[i]);
                inbox.hidden_notifications.splice(i, 1);
                inbox.lengths.hidden--;
                inbox.lengths.read++;
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/unhide', {'notification': notification.key});
                return;
            }
        }
    }
     return inbox;
});