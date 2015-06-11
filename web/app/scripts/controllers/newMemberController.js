App.controller('newmemberController', ['$scope', 'RESTService', '$stateParams', '$rootScope',
    function($scope, RESTService, $stateParams, $rootScope) {
        $('.container').hide();
        logoutCookies();
        $.cookie(TOKEN, $stateParams.key);
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/new_user', '')
            .success(function(data) {
                if (!RESTService.hasErrors(data)) {
                    $scope.user = JSON.parse(data.data);
                    $('.container').fadeIn();
                    LoadScreen.stop();
                    $('#body').show();
                } else
                    console.log('ERROR: ', data);
            })
            .error(function(data) {
                console.log('Error: ', data);
            });

        $scope.correctPerson = function() {
            window.location.assign("#/newuserinfo");
        }
        $scope.incorrectPerson = function() {
            window.location.assign("#/incorrectperson");
        }
    }
]);