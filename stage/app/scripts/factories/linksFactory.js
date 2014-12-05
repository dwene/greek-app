App.factory('Links', function($http, $rootScope, localStorageService, $q, $timeout){
    var links = localStorageService.get('links');
    var cacheTimestamp = undefined;
    return {
        get: function () {
            if (checkCacheRefresh(cacheTimestamp)){
                    cacheTimestamp = moment();
                    $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/link/get', packageForSending(''))
                        .success(function(data){
                        if (!checkResponseErrors(data)){
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