App.factory('Polls', function(RESTService, $rootScope, localStorageService, $q, $timeout){
    var polls = localStorageService.get('polls');
    var cacheTimestamp = undefined;
    return {
        get: function () {
            if (checkCacheRefresh(cacheTimestamp)){
                    cacheTimestamp = moment();
                    RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/poll/get_polls', '')
                    .success(function(data){
                        if (!RESTService.hasErrors(data)){
                            polls = JSON.parse(data.data);
                            localStorageService.set('polls', polls);
                            $rootScope.$broadcast('polls:updated');
                        }
                        else{
                            console.error('Polls get did not function correctly.');
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ' , data);
                    });
            }
            return polls;
        },
        check: function(){
            if (polls == null){
                this.get();
                return false;
            }
            return true;
        }
    };
});