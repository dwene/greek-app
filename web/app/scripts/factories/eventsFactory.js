
App.factory('Events', function(RESTService, $rootScope, localStorageService, $q, $timeout){
    var item = {};
    item.events = localStorageService.get('events');
    item.cacheTimestamp = undefined;

    item.get = function (){
        if (checkCacheRefresh(item.cacheTimestamp)){
            item.cacheTimestamp = moment();
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/get_events', '')
            .success(function(data){
                if (!RESTService.hasErrors(data)){
                    if (item.events != JSON.parse(data.data)){
                        item.events = JSON.parse(data.data);
                        localStorageService.set('events', item.events);
                        $rootScope.$broadcast('events:updated');
                    }
                }
                else{
                    console.log('ERROR: ',data);
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });
        }
    }
    item.deleteEvent = function(key){
        if (item.events){
            for (var i = 0; i < item.events.length; i++){
                if (item.events[i].key == key){
                    item.events.splice(i, 1);
                }
            }
        }
    }
    item.destroy = function(){
        item.cacheTimestamp = undefined;
        item.events = undefined;
        localStorageService.remove('events');
    }
    // item.clear = function(){
    //     events = undefined;
    // }
    item.refresh = function(){
        item.cacheTimestamp = undefined;
        item.get();
    }
    item.check = function(){
        if (item.events == null){
            item.get();
            return false;
        }
        return true;
    }
    return item;
});

/*
Everything gets a loading directive around it.
when getting data, we need a list that holds all data that is being queried


*/