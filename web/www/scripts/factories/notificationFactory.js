App.factory('Notifications', function(RESTService, $rootScope, localStorageService, $q){
    var item = {};
    item.hasLoaded = false;
    item.notifs = {};
    var load_data = localStorageService.get('notifications');
    if (load_data){
        inbox.notifs = load_data;
    }
    item.destroy = function(){
        localStorageService.remove('notifications');
        delete item.notifs;
        inbox.hasLoaded = false;
        inbox.notifs = undefined;
    }
    item.update = function(data){
        //inbox.data = data;
        //$rootScope.$broadcast('inbox:updated');
    }
    item.get = function () {
        if (inbox.hasLoaded){
            return;
        }
        inbox.hasLoaded = true;
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v2/notifications/get', '')
        .success(function(data){
            if (!RESTService.hasErrors(data)){
                var load_data = JSON.parse(data.data);
                localStorageService.set('notifications', load_data);
                item.notifs = load_data;
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
    return item;
});