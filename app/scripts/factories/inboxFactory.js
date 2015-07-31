App.factory('Inbox', ['RESTService', '$rootScope', 'localStorageService', '$q', '$mdToast',
    function(RESTService, $rootScope, localStorageService, $q, $mdToast) {
        var inbox = {};
        inbox.hasLoaded = false;
        inbox.data = {};
        var load_data = localStorageService.get('inbox');
        if (load_data) {
            inbox.data.messages = load_data.messages;
            inbox.data.lengths = {
                unread: load_data.new_messages_length,
                read: load_data.messages_length,
                archived: load_data.archived_messages_length
            };
            inbox.data.archived = load_data.archived_messages;
        }
        inbox.selectMessage = function(notify) {
            inbox.selected_message = notify;
        }
        inbox.destroy = function() {
            localStorageService.remove('inbox');
            delete inbox.data;
            inbox.hasLoaded = false;
            inbox.data = {};
        }
        inbox.update = function(data) {
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/messages/update', '')
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        if (inbox.data.messages) {
                            var should_add = true;
                            var new_messages = JSON.parse(data.data);
                            console.log(new_messages);
                            var has_changed = false;
                            for (var i = 0; i < new_messages.length; i++) {
                                should_add = true;
                                for (var j = 0; j < inbox.data.messages.length; j++) {
                                    if (new_messages[i].key == inbox.data.messages[j].key) {
                                        should_add = false;
                                        break;
                                    }
                                }
                                if (should_add) {
                                    has_changed = true;
                                    inbox.data.messages.push(new_messages[i]);
                                    console.log('new message with data', new_messages[i]);
                                    $mdToast.show($mdToast.simple().content('New Message from ' + new_messages[i].sender_name));
                                }

                            }
                            if (has_changed) {
                                console.log('messages:updated');
                                $rootScope.$broadcast('messages:updated');
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
        inbox.get = function() {
            //console.log('calling messages get');
            if (inbox.hasLoaded) {
                return;
            }
            inbox.hasLoaded = true;
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/messages/get', '')
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        var load_data = JSON.parse(data.data);
                        localStorageService.set('inbox', load_data);
                        inbox.data.messages = load_data.messages;
                        inbox.data.lengths = {
                            unread: load_data.new_messages_length,
                            read: load_data.messages_length,
                            archived: load_data.archived_messages_length
                        };
                        inbox.data.archived = load_data.archived_messages;
                        $rootScope.$broadcast('inbox:updated');
                        console.log('Inbox has been updated');
                    } else {
                        console.log('Err', data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        }
        // inbox.get: function(){
        //     return messages;
        // },
        inbox.getLengths = function() {
            return inbox.lengths;
        }

        inbox.read = function(message) {
            if (message.new) {
                for (var i = 0; i < inbox.messages.length; i++) {
                    if (inbox.messages[i].key == message.key) {
                        if (inbox.messages[i].new) {
                            inbox.messages[i].new = false;
                            $rootScope.broadcast('inbox:updated');
                            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/messages/seen', {
                                'message': message.key
                            });
                        }
                        return;
                    }
                }
            }
        }

        inbox.readAll = function() {
            for (var i = 0; i < inbox.messages.length; i++) {
                if (inbox.messages[i].new) {
                    inbox.messages[i].new = false;
                }
            }
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/messages/readAll', '');
        }
        return inbox;
    }
]);