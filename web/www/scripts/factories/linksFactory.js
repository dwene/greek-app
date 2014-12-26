App.factory('Links', function(RESTService, $rootScope, localStorageService, $q, $timeout){
    var links = localStorageService.get('links');
    var cacheTimestamp = undefined;
    return {
        get: function () {
            if (checkCacheRefresh(cacheTimestamp)){
                    cacheTimestamp = moment();
                    RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/link/get', '')
                        .success(function(data){
                        if (!RESTService.hasErrors(data)){
                            links = JSON.parse(data.data);
                            localStorageService.set('links', links);
                            $rootScope.$broadcast('links:updated');
                        }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
            }
            return links;
        },
        check: function(){
            if (links == null){
                this.get();
                return false;
            }
            return true;
        }
    };
});