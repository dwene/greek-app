App.factory('Links', ['RESTService', '$rootScope', 'localStorageService', '$q', '$timeout',
    function(RESTService, $rootScope, localStorageService, $q, $timeout) {
        var item = {};
        item.links = localStorageService.get('links');
        item.cacheTimestamp = undefined;


        item.get = function() {
            if (checkCacheRefresh(item.cacheTimestamp)) {
                item.cacheTimestamp = moment();
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/link/get', '')
                    .success(function(data) {
                        if (!RESTService.hasErrors(data)) {
                            item.links = JSON.parse(data.data);
                            localStorageService.set('links', item.links);
                            $rootScope.$broadcast('links:updated');
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ', data);
                    });
            }
        }

        item.destroy = function() {
            item.cacheTimestamp = undefined;
            item.links = undefined;
            localStorageService.remove('links');
        }

        item.check = function() {
            if (item.links == null) {
                item.get();
                return false;
            }
            return true;
        }
        return item;
    }
]);