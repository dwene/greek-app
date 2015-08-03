App.factory('Links', ['RESTService', '$rootScope', 'localStorageService', '$q', '$timeout',
    function(RESTService, $rootScope, localStorageService, $q, $timeout) {
        var item = {};
        item.groups = localStorageService.get('links');
        item.cacheTimestamp = undefined;


        item.get = function() {
            if (checkCacheRefresh(item.cacheTimestamp)) {
                item.cacheTimestamp = moment();
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/link/v1/get', '')
                    .success(function(data) {
                        if (!RESTService.hasErrors(data)) {
                            item.groups = JSON.parse(data.data);
                            localStorageService.set('links', item.groups);
                            $rootScope.$broadcast('links:updated');
                            console.log(item.groups);
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ', data);
                    });
            }
        }

        item.set = function(groups){
            item.groups = groups;
            $rootScope.$broadcast('links:updated');
        }

        item.destroy = function() {
            item.cacheTimestamp = undefined;
            item.groups = undefined;
            localStorageService.remove('links');
        }

        item.check = function() {
            if (item.groups == null) {
                item.get();
                return false;
            }
            return true;
        }
        return item;
    }
]);