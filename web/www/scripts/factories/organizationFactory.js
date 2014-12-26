App.factory('Organization', function(RESTService, localStorageService, $q, $timeout){
    var organization = {};
    var load_data = localStorageService.get('organization_data');
    if (load_data){
        organization.organization = load_data;
    }
    var cacheTimestamp;
    organization.get = function () {
        if (checkCacheRefresh(cacheTimestamp)){
            cacheTimestamp = moment();
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/organization/info', '')
            .success(function(data){
                if (!RESTService.hasErrors(data)){
                    organization = JSON.parse(data.data);
                    localStorageService.set('organization_data', organization);
                    organization.organization = organization;
                    organization.me = organization.organization.me;
                }
                else{
                    console.log('Err', data);
                }
            });
        }
    }
    organization.check = function(){
        if (organization == null){
            this.get();
            return false;
        }
        return true;
    }
    return organization;
});
