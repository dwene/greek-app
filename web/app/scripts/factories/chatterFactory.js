App.factory('Chatter', ['RESTService', '$rootScope', 'localStorageService', '$q', '$mdToast',
    function(RESTService, $rootScope, localStorageService, $q, $mdToast) {
        
        var chatter = {};
        chatter.hasLoaded = false;
        chatter.data = {};
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
            for (var i = 0; i < chatter.data.feed.length; i++){
                if (chatter.data.feed[i].key == chat.key){
                    chatter.data.feed[i] = chat;
                    has_changed = true;
                    break;
                }
            }
            for (var j = 0; j < chatter.data.important.length; j++){
                if (chatter.data.important[i].key == chat.key){
                    chatter.data.important[i] = chat;
                    has_changed = true;
                    break;
                }
            }
            if (has_changed) {
                $rootScope.$broadcast('chatter:updated');
            }
        };

        chatter.get = function() {
            if (chatter.hasLoaded) {
                return;
            }
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/get', {"important": false})
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        var load_data = JSON.parse(data.data);
                        chatter.data.feed = load_data;
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

        chatter.get_important = function() {
            if (chatter.hasLoaded) {
                return;
            }
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

        chatter.create = function(content){
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/post', {content:content})
            .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        chatter.data.feed.push(JSON.parse(data.data))
                    }else {
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
                        chat.comments.push(JSON.parse(data.data))
                    } else {
                        console.log('Err', data);
                    }
            })
            .error(function(data){
                console.log('Error: ', data);
            });
        };
        
        chatter.saveComment = function(chat, content){
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/comment/edit', {key:chat.key, content:content})
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

        chatter.makeImportant = function(chatter){
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/flag', {key:chatter.key})
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
        
        chatter.delete = function(chat, content){
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/delete', {key:chat.key})
            .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        
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

                    } else {
                        console.log('Err', data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        };

        return chatter;
    }
]);
