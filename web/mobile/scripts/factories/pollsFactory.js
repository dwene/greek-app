App.factory('Polls', function(RESTService, $rootScope, localStorageService, $q, $timeout){
    var item = {};
    item.polls = localStorageService.get('polls');
    item.cacheTimestamp = undefined;

    
    item.get = function () {
        if (checkCacheRefresh(item.cacheTimestamp)){
                item.cacheTimestamp = moment();
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/poll/get_polls', '')
                .success(function(data){
                    if (!RESTService.hasErrors(data)){
                        item.polls = JSON.parse(data.data);
                        localStorageService.set('polls', item.polls);
                        $rootScope.$broadcast('polls:updated');
                    }
                    else{
                        console.error('Polls get did not function correctly.');
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
        }
    }

    item.destroy = function(){
        item.cacheTimestamp = undefined;
        item.polls = undefined;
        localStorageService.remove('polls');
    }

    item.check = function(){
        if (item.polls == null){
            item.get();
            return false;
        }
        return true;
    }
    return item;
});