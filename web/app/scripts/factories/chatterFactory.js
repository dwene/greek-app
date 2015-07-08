App.factory('Chatter', ['RESTService', '$rootScope', 'localStorageService', '$q', '$mdToast',
    function(RESTService, $rootScope, localStorageService, $q, $mdToast) {

        var chatter = {};
        chatter.hasLoaded = false;
        chatter.data = {};
        var meta = {feedLoaded: false, importantLoaded: false};
        var i;

        var load_data = localStorageService.get('chatter');
        if (load_data) {
            chatter.data.feed = load_data.chatter;
            chatter.data.important = load_data.important_chatter;
        }

        function updateChatters(chatters){
            var has_changed = false;
            for (var i = 0; i < chatter.data.feed.length; i++){
                if (chatter.data.feed[i].key == chat.key){
                    chatter.data.feed[i] = chat;
                    has_changed = true;
                    break;
                }
            }
            for (var i = 0; i < chatter.data.important.length; i++){
                if (chatter.data.important[i].key == chat.key){
                    chatter.data.important[i] = chat;
                    has_changed = true;
                    break;
                }
            }
            if (has_changed) {
                $rootScope.$broadcast('chatter:updated');
            }
        }

        function updateChatter(chat){
            var has_changed = false;
            for (i = 0; i < chatter.data.feed.length; i++){
                if (chatter.data.feed[i].key == chat.key){
                    chatter.data.feed[i] = chat;
                    has_changed = true;
                    break;
                }
            }
            for (i = 0; i < chatter.data.important.length; i++){
                if (chatter.data.important[i].key == chat.key){
                    chatter.data.important[i] = chat;
                    has_changed = true;
                    break;
                }
            }
            if (has_changed) {
                $rootScope.$broadcast('chatter:updated');
            }
        }

        chatter.get = function() {
            if (meta.feedLoaded) {
                return;
            }
            meta.feedLoaded = true;
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/get', {"important": false})
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        var load_data = JSON.parse(data.data);
                        chatter.data.feed = load_data;
                        $rootScope.$broadcast('chatter:updated');
                        meta.feedLoaded = true;
                        console.log('Chatter has been updated', load_data);
                    } else {
                        console.log('Err', data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        };

        chatter.getImportant = function() {
            if (meta.importantLoaded) {
                return;
            }
            meta.importantLoaded = true;
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/get', {"important": true})
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        var load_data = JSON.parse(data.data);
                        chatter.data.important = load_data;
                        $rootScope.$broadcast('chatter:updated');
                        console.log('Chatter has been updated', load_data);
                    } else {
                        console.log('Err', data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        };

        chatter.getComments = function(chatter){
             RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/comments/get', {key: chatter.key})
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        var load_data = JSON.parse(data.data);
                        chatter.comments = load_data;
                        updateChatter(chatter);
                    } else {
                        console.log('Err', data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        };

        chatter.create = function(content, important){
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/post', {content:content, important:important})
            .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        var newChat = JSON.parse(data.data);
                        if (important){
                            chatter.data.important.push(newChat);
                        }
                        chatter.data.feed.unshift(newChat);
                    } else {
                        console.log('Err', data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        };

        chatter.like = function(chat){
            if (chat.like){
                chat.like = false;
                chat.likes --;
            }
            else{
                chat.like = true;
                chat.likes ++;
            }
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/like', {key:chat.key})
            .success(function(data){
                if (!RESTService.hasErrors(data)) {
                    var loaded = JSON.load(data.data);
                    chat.following = loaded.following;
                        for (i = 0; i < chatter.data.feed.length; i++){
                           if (chat.key == chatter.data.feed[i].key){
                                chatter.data.feed[i] = chat;
                            }
                        }
                        for (i = 0; i < chatter.data.important.length; i++){
                            if (chat.key == chatter.data.important[i].key){
                                chatter.data.important[i] = chat;
                            }
                        }

                } else {
                    console.log('Err', data);
                }
            })
            .error(function(data){
                console.log('Error: ', data);
            });
        };

        chatter.comment = function(chat, content){
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/comment/post', {key:chat.key, content:content})
            .success(function(data){
                if (!RESTService.hasErrors(data)) {
                        var loaded = JSON.load(data.data);
                        chat.comments.push(loaded.comment);
                        chat.following = loaded.following;
                    } else {
                        console.log('Err', data);
                    }
            })
            .error(function(data){
                console.log('Error: ', data);
            });
        };

        chatter.saveComment = function(comment, content){
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/comment/edit', {key:comment.key, content:content})
            .success(function(data){
                if (!RESTService.hasErrors(data)) {
                        load_data = JSON.parse(data.data);
                        comment.edited = load_data.edited;
                    } else {
                        console.log('Err', data);
                    }
            })
            .error(function(data){
                console.log('Error: ', data);
            });
        };

        chatter.likeComment = function(comment){
            if (comment.like){
                comment.like = false;
                comment.likes--;
            }
            else{
                comment.likes++;
                comment.like = true;
            }
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/comment/like', {key:comment.key})
            .success(function(data){
                if (!RESTService.hasErrors(data)) {
                   } else {
                       console.log('Err', data);
                   }
           })
           .error(function(data){
               console.log('Error: ', data);
           });
        };

        chatter.deleteComment = function(comment){
           RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/comment/delete', {key:comment.key})
           .success(function(data){
               if (!RESTService.hasErrors(data)) {

                   } else {
                       console.log('Err', data);
                   }
           })
           .error(function(data){
               console.log('Error: ', data);
           });
        };

        chatter.makeImportant = function(chat, notify){
            chat.important = !chat.important;
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/important', {key:chat.key, notify:notify})
            .success(function(data){
                if (!RESTService.hasErrors(data)) {
                    if (chat.important){
                        chatter.data.important.push(chat);
                    }else{
                        for (i = 0; i < chatter.data.important.length; i++){
                            if (chatter.data.important[i].key == chat.key){
                                chatter.data.important.splice(i, 1);
                                break;
                            }
                        }
                    }
                    $rootScope.$broadcast('chatter:updated');
                } else {
                    console.log('Err', data);
                }
            })
            .error(function(data){
                console.log('Error: ', data);
            });
        };

        chatter.delete = function(chat){
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/delete', {key:chat.key})
            .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        for (i = 0; i < chatter.data.feed.length; i++){
                            if (chat.key == chatter.data.feed[i].key){
                                chatter.data.feed.splice(i, 1);
                            }
                        }
                        for (i = 0; i < chatter.data.important.length; i++){
                            if (chat.key == chatter.data.important[i].key){
                                chatter.data.important.splice(i, 1);
                            }
                        }
                    } else {
                        console.log('Err', data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        };

        chatter.edit = function(chat, content){
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/edit', {key:chat.key, content:content})
            .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        var load_data = JSON.parse(data.data);
                        chat.edited = load_data.edited;
                        for (i = 0; i < chatter.data.feed.length; i++){
                            if (chat.key == chatter.data.feed[i].key){
                                chatter.data.feed[i] = content;
                            }
                        }
                        for (i = 0; i < chatter.data.important.length; i++){
                            if (chat.key == chatter.data.important[i].key){
                                chatter.data.important[i].content = content;
                            }
                        }
                    } else {
                        console.log('Err', data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        };

        chatter.mute = function(chat){
            if (chat.following){
                chat.following = false;
            }
            else{
                chat.following = true;
            }
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/mute', {key:chat.key})
            .success(function(data){
                if (!RESTService.hasErrors(data)) {
                        for (i = 0; i < chatter.data.feed.length; i++){
                           if (chat.key == chatter.data.feed[i].key){
                                chatter.data.feed[i] = chat;
                            }
                        }
                        for (i = 0; i < chatter.data.important.length; i++){
                            if (chat.key == chatter.data.important[i].key){
                                chatter.data.important[i] = chat;
                            }
                        }
                } else {
                    console.log('Err', data);
                }
            })
            .error(function(data){
                console.log('Error: ', data);
            });
        };
        return chatter;
    }
]);
