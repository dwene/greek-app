App.factory('Events', ['RESTService', '$rootScope', 'localStorageService', '$q', '$timeout',
    function(RESTService, $rootScope, localStorageService, $q, $timeout) {
        var item = {};
        item.calendars = [];
        item.events = localStorageService.get('events');
        item.cacheTimestamp = undefined;

        item.getCalendars = function(){
            var deferred = $q.defer();
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/event/v1/calendars', '')
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        var calendars = JSON.parse(data.data);
                        for (var i = 0; i < calendars.length; i++){
                            if (calendars[i].name){
                                calendars[i].name = calendars[i].name[0].toUpperCase() + calendars[i].name.slice(1);
                            }
                        }
                        item.calendars = calendars;
                        deferred.resolve();
                    } else {
                        console.log('ERROR: ', data);
                        deferred.reject();
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                    deferred.reject();
                });
            return deferred.promise;
        }
        item.get = function() {
            if (checkCacheRefresh(item.cacheTimestamp)) {
                item.cacheTimestamp = moment();
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/event/v1/get_events', '')
                    .success(function(data) {
                        if (!RESTService.hasErrors(data)) {
                            if (item.events != JSON.parse(data.data)) {
                                item.events = JSON.parse(data.data);
                                localStorageService.set('events', item.events);
                                $rootScope.$broadcast('events:updated');
                            }
                        } else {
                            console.log('ERROR: ', data);
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ', data);
                    });
            }
        }
        item.deleteEvent = function(key) {
            if (item.events) {
                for (var i = 0; i < item.events.length; i++) {
                    if (item.events[i].key == key) {
                        console.log('I found the event');
                        item.events.splice(i, 1);
                    }
                }
            }
        }
        item.destroy = function() {
            item.cacheTimestamp = undefined;
            item.events = undefined;
            localStorageService.remove('events');
        }
        item.refresh = function() {
            item.cacheTimestamp = undefined;
            item.get();
        }
        item.check = function() {
            if (item.events == null) {
                item.get();
                return false;
            }
            return true;
        }
        return item;
    }
]);
