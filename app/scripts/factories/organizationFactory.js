App.factory('Organization', ['$rootScope', 'RESTService', 'localStorageService', '$q', '$timeout',
    function($rootScope, RESTService, localStorageService, $q, $timeout) {
        var item = {};
        var load_data = localStorageService.get('organization_data');
        if (load_data) {
            item.organization = load_data;
        }

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
