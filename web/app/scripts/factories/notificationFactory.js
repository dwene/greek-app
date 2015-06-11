App.factory('Notifications', ['RESTService', '$rootScope', 'localStorageService', '$q',
    function(RESTService, $rootScope, localStorageService, $q) {
        var item = {};
        item.hasLoaded = false;
        item.notifs = [];
        var load_data = localStorageService.get('notifications');
        if (load_data) {
            item.notifs = load_data;
        }
        item.destroy = function() {
            localStorageService.remove('notifications');
            delete item.notifs;
            item.hasLoaded = false;
            item.notifs = undefined;
        }
        item.readAll = function() {
            if (item.notifs) {
                var should_call_server = false;
                for (var i = 0; i < item.notifs.length; i++) {
                    if (item.notifs[i].new) {
                        item.notifs[i].new = false;
                        should_call_server = true;
                    }
                }
                if (should_call_server) {
                    RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/read', '');
                }
                $rootScope.$broadcast('notifications:updated');
            }
        }
        item.update = function(data) {
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/update', '')
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        if (item.notifs) {
                            var should_add = true;
                            var new_notifications = JSON.parse(data.data);
                            var has_changed = false;
                            for (var i = 0; i < new_notifications.length; i++) {
                                should_add = true;
                                for (var j = 0; j < item.notifs.length; j++) {
                                    if (new_notifications[i].key == item.notifs[j].key) {
                                        should_add = false;
                                        break;
                                    }
                                }
                                if (should_add) {
                                    has_changed = true;
                                    console.log(new_notifications[i]);
                                    item.notifs.push(new_notifications[i]);
                                }

                            }
                            if (has_changed) {
                                console.log('Notifications:updated');
                                $rootScope.$broadcast('notifications:updated');
                            }
                        }
                    } else {
                        console.log('Err', data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        }
        item.get = function() {
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/get', '')
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        var load_data = JSON.parse(data.data);
                        localStorageService.set('notifications', load_data);
                        item.notifs = load_data;
                        $rootScope.$broadcast('notifications:updated');
                    } else {
                        console.log('Err', data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        }
        return item;
    }
]);