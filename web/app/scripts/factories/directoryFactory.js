App.factory('Directory', ['RESTService', '$rootScope', 'localStorageService', '$q', 'Session',
    function(RESTService, $rootScope, localStorageService, $q, Session) {
        var item = {};
        item.directory = localStorageService.get('directory');
        item.cacheTimestamp = undefined;

        item.get = function() {
            if (checkCacheRefresh(item.cacheTimestamp)) {
                item.cacheTimestamp = moment();
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory', '')
                    .success(function(data) {
                        if (!checkResponseErrors(data)) {
                            item.directory = JSON.parse(data.data);
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

        item.set = function(data) {
            item.directory = data;
        }

        item.destroy = function() {
            item.cacheTimestamp = undefined;
            item.directory = undefined;
            localStorageService.remove('directory');
        }
        item.updateMyStatus = function(status) {
            if (item.directory) {
                console.log('I see the directory in update My status');
                for (var i = 0; i < item.directory.members.length; i++) {
                    if (item.directory.members[i].user_name == Session.user_name) {
                        item.directory.members[i].status = status;
                        console.log('I just set my status');
                        return;
                    }
                }
            }
        }
        item.updateMe = function(me) {
            if (item.directory) {
                for (var i = 0; i < item.directory.members.length; i++) {
                    if (item.directory.members[i].user_name == Session.user_name) {
                        item.directory.members[i] = me;
                        break;
                    }
                }
            } else {
                item.get();
            }
            Session.me = me;
            console.log('Im broadcasting', me.prof_pic);
            $rootScope.$broadcast('me:updated');
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