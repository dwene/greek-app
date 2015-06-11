App.factory('Tags', ['RESTService', '$rootScope', 'localStorageService', '$q', '$timeout',
    function(RESTService, $rootScope, localStorageService, $q, $timeout) {
        var item = {};
        item.tags = localStorageService.get('tags');
        item.cacheTimestamp = undefined;

        item.get = function() {
            if (checkCacheRefresh(item.cacheTimestamp)) {
                item.cacheTimestamp = moment();
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/message/get_tags', '')
                    .success(function(data) {
                        if (!RESTService.hasErrors(data)) {
                            item.tags = JSON.parse(data.data);
                            localStorageService.set('tags', item.tags);
                            $rootScope.$broadcast('tags:updated');
                        } else {
                            console.log('ERR');
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ', data);
                    });
            }
        }

        item.destroy = function() {
            item.cacheTimestamp = undefined;
            item.tags = undefined;
            localStorageService.remove('tags');
        }

        item.set = function(data) {
            item.tags = data;
            localStorageService.set('tags', data);
        }
        // set: function (_tags) {
        //     tags = _tags;
        // },
        item.check = function() {
            if (item.tags == null) {
                this.get();
                return false;
            }
            return true;
        }
        return item;
    }
]);