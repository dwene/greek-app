App.factory('Organization', function($http, $rootScope, localStorageService, $q, $timeout){
    var organization = localStorageService.get('organization_data');
    $rootScope.subscribed = true;
    if (organization){
        $rootScope.organization = organization;
        $rootScope.setColor(organization.color);
        $rootScope.me = $rootScope.organization.me;
        $rootScope.link_groups = $rootScope.organization.link_groups;
        $rootScope.perms = $rootScope.me.perms;
    }  
    var cacheTimestamp = undefined;
    return {
        get: function () {
            if (checkCacheRefresh(cacheTimestamp)){
                cacheTimestamp = moment();
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/organization/info', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        organization = JSON.parse(data.data);
                        $rootScope.organization = organization;
                        $rootScope.setColor(organization.color);
                        $rootScope.me = $rootScope.organization.me;
                        $rootScope.link_groups = $rootScope.organization.link_groups;
                        $rootScope.perms = $rootScope.me.perms;
                        localStorageService.set('organization_data', $rootScope.organization);
                        $rootScope.$broadcast('organization:updated');
                    }
                    else{
                        console.log('Err', data);
                    }
                });
                }
            return organization;
        },
        check: function(){
            if (organization == null){
                this.get();
                return false;
            }
            return true;
        }
    };
});
