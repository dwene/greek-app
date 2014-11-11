
App.factory('directory', function($http, $rootScope, localStorageService){
    var directory = localStorageService.get('directory');
    var cacheTimestamp = undefined;
    return {
        get: function () {
            if (directory == undefined){
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory', packageForSending(''), {cache: true})
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        directory = JSON.parse(data.data);
                        localStorageService.set('directory', directory);
                    }
                    else{
                        console.log('Directory Get Error: ' , data);
                    }
                })
                .error(function(data) {
                    console.log('Directory Get Error: ' , data);
                });
            }
            return data;
        },
        user: function(user_name){
            var user = undefined;
            for (var i = 0; i < directory.length; i++){
                if (directory[i].user_name == user_name){
                    $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory', packageForSending({user_name: user_name}), {cache: true}){
                        .success(function(data){

                        })
                        .error(function(data){

                        });
                    }

                    return user;
                }
            }
            return undefined;
        }
    };
});




/*
Everything gets a loading directive around it.
when getting data, we need a list that holds all data that is being queried


*/