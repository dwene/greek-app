App.factory('Directory', ['RESTService', '$rootScope', 'localStorageService', '$q', 'Session',
    function(RESTService, $rootScope, localStorageService, $q, Session) {
        var item = {};
        item.cacheTimestamp = undefined;

        item.get = function() {
            if (checkCacheRefresh(item.cacheTimestamp)) {
                item.cacheTimestamp = moment();
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory_less', '')
                    .success(function(data) {
                        if (!checkResponseErrors(data)) {
                            item.directory = JSON.parse(data.data);
                            for (var i = 0; i < item.directory.members.length; i++){
                                item.directory.members[i].name = item.directory.members[i].first_name + " " + item.directory.members[i].last_name;
                                if (item.directory.members[i].prof_pic){
                                    item.directory.members[i].image = item.directory.members[i].prof_pic;
                                }
                                else{
                                    item.directory.members[i].image = 'images/defaultprofile.png';
                                }
                            }

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

        item.updateMe = function(me) {
            for (var i = 0; i < item.directory.members.length; i++){
                if (item.directory.members[i].key === Session.me.key){
                    item.directory.members[i] = me;
                }
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