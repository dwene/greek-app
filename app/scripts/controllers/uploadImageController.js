App.controller('uploadImageController', ['$scope', 'RESTService', '$rootScope', '$location',
    function($scope, RESTService, $rootScope, $location) {

        //easy way to get parameters from URL (use for non-sensitive info)
        function getParameterByName(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }

        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/set_uploaded_prof_pic', {
            key: getParameterByName('key')
        })
            .success(function(data) {
                if (!checkResponseErrors(data)) {
                    $location.path("app/accountinfo");
                } else {
                    console.log("error: ", data.error)
                }
            })
            .error(function(data) {
                console.log('Error: ', data);
            });

        $scope.showIndividual = function(member) {
            $location.path("app/directory/user/" + member.user_name);
        }
    }
]);