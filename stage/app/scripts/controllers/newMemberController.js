    App.controller('newmemberController', function($scope, $http, $stateParams, $rootScope, LoadScreen){
        routeChange();
        $('.container').hide();
        logoutCookies();
        $.cookie(TOKEN, $stateParams.key);
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/new_user', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $scope.user = JSON.parse(data.data);
                    $('.container').fadeIn();
                    LoadScreen.stop();
                    $('#body').show();
                }
                else
                    console.log('ERROR: ',data);
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });
        
        $scope.correctPerson = function(){
            window.location.assign("#/newuserinfo");
        }
        $scope.incorrectPerson = function(){
            window.location.assign("#/incorrectperson");
        }
    });