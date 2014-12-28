App.factory('Directory', function(RESTService, $rootScope, localStorageService, $q){
    var item = {};
    item.directory = localStorageService.get('directory');
    item.cacheTimestamp = undefined;

    item.get = function () {
        if (checkCacheRefresh(item.cacheTimestamp)){
            item.cacheTimestamp = moment();
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory', '')
            .success(function(data){
                if (!checkResponseErrors(data)){
                    item.directory = JSON.parse(data.data);
                    localStorageService.set('directory', item.directory);
                    $rootScope.$broadcast('directory:updated');
                }
                else{
                    console.log('Directory Get Error: ' , data);
                }
            })
            .error(function(data) {
                console.log('Directory Get Error: ' , data);
            });
        }
    }
    item.destroy = function(){
        item.cacheTimestamp = undefined;
        item.directory = undefined;
        localStorageService.remove('directory');
    }
        // data.set = function(_directory) {
        //     directory = _directory;
        // }
    // item.user = function(user_name){
    //     var user = undefined;
    //     for (var i = 0; i < directory.length; i++){
    //         if (directory[i].user_name == user_name){
    //             RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory', {user_name: user_name}, {cache: true})
    //                 .success(function(data){
    //                     item.directory = JSON.parse(data.data);
    //                     localStorageService.set('directory', itemdirectory);
    //                 })
    //                 .error(function(data){

    //                 });
    //             }

    //             return user;
    //         }
    //     return undefined;
    // }
    item.check = function(){
        if (item.directory == null){
            item.get();
            console.log('I should return false', directory);
            return false; 
        }
        return true;
    }
    return item;
});
