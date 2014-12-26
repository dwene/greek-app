App.factory('Organization', function(RESTService, localStorageService, $q, $timeout, OrganizationService){
    var organization = localStorageService.get('organization_data');
    if (organization){
        OrganizationService.create(organization);
    }
    var cacheTimestamp;
    return {
        get: function () {
            console.log('I am starting to get the organization stuff');
            if (checkCacheRefresh(cacheTimestamp)){
                cacheTimestamp = moment();
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/organization/info', '')
                .success(function(data){
                    if (!RESTService.hasErrors(data)){
                        organization = JSON.parse(data.data);
                        localStorageService.set('organization_data', organization);
                        OrganizationService.create(organization);
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
