App.factory('Inbox', function(RESTService, $rootScope, localStorageService, $q){
    var inbox = {};
    inbox.hasLoaded = false;
    inbox.data = {};
    var load_data = localStorageService.get('inbox');
    if (load_data){
        inbox.data.messages = load_data.notifications;
        inbox.data.lengths = {unread:load_data.new_notifications_length, read:load_data.notifications_length, archived:load_data.hidden_notifications_length};
        inbox.data.archived = load_data.hidden_notifications;
    }
    console.log('what the inbox factory says inbox.data is', inbox.data);
    inbox.selectMessage = function(notify){
        inbox.selected_message = notify;
    }
    inbox.destroy = function(){
        localStorageService.remove('inbox');
        delete inbox.data;
        inbox.hasLoaded = false;
        inbox.data = {};
    }
    inbox.update = function(data){
        //inbox.data = data;
        //$rootScope.$broadcast('inbox:updated');
    }
    inbox.get = function () {
        //console.log('calling messages get');
        if (inbox.hasLoaded){
            return;
        }
        inbox.hasLoaded = true;
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/get', '')
        .success(function(data){
            if (!RESTService.hasErrors(data)){
                var load_data = JSON.parse(data.data);
                localStorageService.set('inbox', load_data);
                inbox.data.messages = load_data.notifications;
                inbox.data.lengths = {unread:load_data.new_notifications_length, read:load_data.notifications_length, archived:load_data.hidden_notifications_length};
                inbox.data.archived = load_data.hidden_notifications;
                $rootScope.$broadcast('inbox:updated');
                console.log('Inbox has been updated');
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
    //     return messages;
    // },
    inbox.getLengths = function(){
        return inbox.lengths;
    }

    inbox.read = function(notification){
        if (notification.new){
            for (var i = 0; i < inbox.messages.length; i++){
                if (inbox.messages[i].key == notification.key){
                    if (inbox.messages[i].new){
                        inbox.messages[i].new = false;
                        $rootScope.broadcast('inbox:updated');
                        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/seen', {'notification': notification.key});
                    }
                    return;
                }
            }
        }
    }

    inbox.readAll = function(){
        for(var i = 0; i < inbox.messages.length; i++){
            if (inbox.messages[i].new){
                inbox.messages[i].new = false;
            }
        }
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/readAll', '');
    }
    // inbox.archive = function(notification){
    //     for (var i = 0; i < inbox.messages.length; i++){
    //         if (inbox.messages[i].key == notification.key){
    //             if (inbox.messages[i].new){
    //                 inbox.messages[i].new = false;
    //                 inbox.lengths.unread--;
    //             }
    //             else{
    //                 inbox.lengths.read--;
    //             }
    //             inbox.archived.append(inbox.messages[i]);
    //             inbox.messages.splice(i, 1);
    //             inbox.lengths.hidden++;
    //             $scope.$broadcast('inbox:updated');
    //             RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/hide', {'notification': notification.key})
    //             return;
    //         }
    //     }
    // }

    // inbox.unarchive = function(notification){
    //     for (var i = 0; i < inbox.archived.length; i++){
    //         if (inbox.archived[i].key == notification.key){
    //             inbox.messages.append(inbox.archived[i]);
    //             inbox.archived.splice(i, 1);
    //             inbox.lengths.hidden--;
    //             inbox.lengths.read++;
    //             $rootScope.$broadcast('inbox:updated');
    //             RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/unhide', {'notification': notification.key});
    //             return;
    //         }
    //     }
    // }

    // inbox.loadMoreArchived = function(){
    //     if (inbox.archived){
    //         if (inbox.lengths.archived == inbox.archived.length){
    //             return;
    //         }
    //         else{
    //             RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/more_hidden', inbox.archived.length)
    //             .success(function(data){
    //                 if (!RESTService.hasErrors(data))
    //                 {
    //                     var new_messages = JSON.parse(data.data);
    //                     var all_messages = inbox.archived.concat(inbox.messages);
    //                     for (var i = 0; i < new_messages.length; i++){
    //                         var add = true;
    //                         for (var j = 0; j < all_messages.length; j++){
    //                             if (all_messages[j].key == new_messages[i].key){
    //                                 add = false;
    //                                 break;
    //                             }
    //                         }
    //                         if (add){inbox.archived.push(new_messages[i]);}
    //                     }
    //                 }
    //                 else{
    //                     console.log('ERROR: ',data);
    //                 }
    //             })
    //             .error(function(data) {
    //                 console.log('Error: ' , data);
    //             }); 
    //             $rootScope.broadcast('inbox:updated');
    //         }
    //     }
    // }

    // inbox.loadMoreMessages = function(loaded_inbox){
    //     if (inbox.messages){
    //         if (inbox.lengths.messages == inbox.messages.length){
    //             return;
    //         }
    //         else{
    //             RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/more_notifications', inbox.messages.length)
    //             .success(function(data){
    //                 if (!RESTService.hasErrors(data))
    //                 {
    //                     var new_messages = JSON.parse(data.data);
    //                     var all_messages = inbox.archived.concat(inbox.messages);
    //                     for (var i = 0; i < new_messages.length; i++){
    //                         var add = true;
    //                         for (var j = 0; j < all_messages.length; j++){
    //                             if (all_messages[j].key == new_messages[i].key){
    //                                 add = false;
    //                                 break;
    //                             }
    //                         }
    //                         if (add){inbox.messages.push(new_messages[i]);}
    //                     }
    //                 }
    //                 else{
    //                     console.log('ERROR: ',data);
    //                 }
    //             })
    //             .error(function(data) {
    //                 console.log('Error: ' , data);
    //             }); 
    //             $rootScope.broadcast('inbox:updated');
    //         }
    //     }
    // }
    return inbox;
});