App.factory('Directory', ['RESTService', '$rootScope', 'localStorageService', '$q', 'Session',
    function(RESTService, $rootScope, localStorageService, $q, Session) {
        var item = {};
        item.directory = localStorageService.get('directory');
        item.cacheTimestamp = undefined;

        item.get = function() {
            if (checkCacheRefresh(item.cacheTimestamp)) {
                item.cacheTimestamp = moment();
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory_less', '')
                    .success(function(data) {
                        if (!checkResponseErrors(data)) {
                            item.directory = JSON.parse(data.data);
                            localStorageService.set('directory', item.directory);
                            $rootScope.$broadcast('directory:updated');
                        } else {
                            console.log('Directory Get Error: ', data);
                        }
                    })
                    .error(function(data) {
                        console.log('Directory Get Error: ', data);
                    });
            }
        }

        item.set = function(data) {
            item.directory = data;
        }

        item.destroy = function() {
            item.cacheTimestamp = undefined;
            item.directory = undefined;
            localStorageService.remove('directory');
        }
        item.check = function() {
            if (item.directory == null) {
                item.get();
                return false;
            }
            return true;
        }
        return item;
    }
]);