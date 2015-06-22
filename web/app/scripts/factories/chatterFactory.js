App.factory('Chatter', ['RESTService', '$rootScope', 'localStorageService', '$q', '$mdToast',
    function(RESTService, $rootScope, localStorageService, $q, $mdToast) {
        var chatter = {};
        chatter.hasLoaded = false;
        chatter.data = {};
        var load_data = localStorageService.get('chatter');
        if (load_data) {
            chatter.data.chatter = load_data.chatter;
            chatter.data.important = load_data.important_chatter;
        }
        
        chatter.get = function() {
            //console.log('calling messages get');
            if (chatter.hasLoaded) {
                return;
            }
            chatter.hasLoaded = true;
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/get', '')
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        var load_data = JSON.parse(data.data);
                        localStorageService.set('chatter', load_data);
                        chatter.data.chatter = load_data.chatter;
                        chatter.data.important = load_data.important_chatter;
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
        
        chatter.create = function(content){
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/post', {content:content})
            .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        
                    }else {
                        console.log('Err', data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        }
        
        chatter.like = function(key){
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/like', {key:key})
            .success(function(data){
                if (!RESTService.hasErrors(data)) {
                        
                    } else {
                        console.log('Err', data);
                    }
            })
            .error(function(data){
                console.log('Error: ', data);
            });
        }
        
        chatter.comment = function(key, content){
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/comment', {key:key, content:content})
            .success(function(data){
                if (!RESTService.hasErrors(data)) {
                        
                    } else {
                        console.log('Err', data);
                    }
            })
            .error(function(data){
                console.log('Error: ', data);
            });
        }
        
        chatter.makeImportant = function(key){
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/flag', {key:key})
            .success(function(data){
                if (!RESTService.hasErrors(data)) {
                        
                    } else {
                        console.log('Err', data);
                    }
            })
            .error(function(data){
                console.log('Error: ', data);
            });
        }
        
        chatter.delete = function(key, content){
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/delete', {key:key})
            .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        
                    } else {
                        console.log('Err', data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        }
        
        chatter.edit = function(key, content){
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/edit', {key:key, content:content})
            .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        
                    } else {
                        console.log('Err', data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        }
        return chatter;
    }
]);