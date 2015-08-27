angular.module('App')
     .factory('Updates', function($rootScope, RESTService, Chatter, Notifications, $timeout){
        var item = {};
        item.timestamp = momentUTCTime().format("YYYY-MM-DDTHH:mm:ss");

        item.initialize = function(timestamp){
            item.timestamp = timestamp;
        }

        item.get = function() {
            console.log('getting updates', item.timestamp);
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/get_updates', {timestamp:item.timestamp})
                .success(function (data) {
                    if (!checkResponseErrors(data)) {
                        parsedData = JSON.parse(data.data);
                        item.timestamp = parsedData.timestamp;
                        var updates = parsedData.updates;
                        for (var i = 0; i < updates.length; i++){
                            var message = updates[i];
                            if (message.type === 'notification'){
                                Notifications.add(message.data);
                            }
                            else if(message.type === 'update'){
                                var data = message.data;
                                if (data.type === 'CHATTER'){
                                    if (data.data.type === 'LIKE'){
                                        Chatter.updateLikes(data);
                                    }
                                    else if (data.data.type === 'NEWCHATTER'){
                                        Chatter.updateNewChatter(data.data.chatter);
                                    }
                                }
                                else if(data.type === 'CHECKIN'){
                                    $rootScope.$broadcast('checkin:new', data.data);
                                }
                            }
                        }
                    } else {
                        console.log('Updates Get Error: ', data);
                    }
                })
                .error(function (data) {
                    console.log('Updates Get Error: ', data);
                });
        }
        return item;
     });