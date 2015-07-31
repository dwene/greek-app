App.factory('Organization', ['$rootScope', 'RESTService', 'localStorageService', '$q', '$timeout',
    function($rootScope, RESTService, localStorageService, $q, $timeout) {
        var item = {};
        var load_data = localStorageService.get('organization_data');
        if (load_data) {
            item.organization = load_data;
        }
        item.cacheTimestamp = undefined;
        item.get = function() {
            if (checkCacheRefresh(item.cacheTimestamp)) {
                item.cacheTimestamp = moment();
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/organization/info', '')
                    .success(function(data) {
                        if (!RESTService.hasErrors(data)) {
                            item.organization = JSON.parse(data.data);
                            localStorageService.set('organization_data', item.organization);
                            item.me = item.organization.me;
                            $rootScope.$broadcast('organization:updated');
                            console.log('I broadcasted');
                        } else {
                            console.log('Err', data);
                        }
                    });
            }
        };

        item.set = function(org) {
            item.organization = org;
            $rootScope.color = org.color;
        };
        item.destroy = function() {
            item.cacheTimestamp = undefined;
            item.organization = undefined;
            localStorageService.remove('organization_data');
        };
        item.check = function() {
            if (!item.organization) {
                item.get();
                return false;
            }
            return true;
        };
        return item;
    }
]);
