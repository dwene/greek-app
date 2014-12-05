
App.factory('Directory', function($http, $rootScope, localStorageService, $q){
    var directory = localStorageService.get('directory');
    var cacheTimestamp = undefined;
    return {
        get: function () {
            if (checkCacheRefresh(cacheTimestamp)){
                cacheTimestamp = moment();
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        directory = JSON.parse(data.data);
                        localStorageService.set('directory', directory);
                        $rootScope.$broadcast('directory:updated');
                        console.log('broadcasting');
                    }
                    else{
                        console.log('Directory Get Error: ' , data);
                    }
                })
                .error(function(data) {
                    console.log('Directory Get Error: ' , data);
                });
            }
            return directory;
        },
        set: function(_directory) {
            directory = _directory;
        },
        user: function(user_name){
            var user = undefined;
            for (var i = 0; i < directory.length; i++){
                if (directory[i].user_name == user_name){
                    $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory', packageForSending({user_name: user_name}), {cache: true})
                        .success(function(data){
                            directory = JSON.parse(data.data);
                            localStorageService.set('directory', directory);
                        })
                        .error(function(data){

                        });
                    }

                    return user;
                }
            return undefined;
        },
        check: function(){
            console.log('directory', directory);
            if (directory == null){
                this.get();
                console.log('I should return false', directory);
                return false; 
            }
            return true;
        }
    };
});
