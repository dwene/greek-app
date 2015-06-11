App.controller('alumniDirectoryController', ['$scope', '$rootScope', 'RESTService', 'Directory',
    function($scope, $rootScope, RESTService, Directory) {
        $scope.years = [];
        $scope.selected_year = 0;
        if (Directory.check()) {
            loadDirectory();
        }
        $scope.$on('directory:updated', function() {
            loadDirectory();
        });

        function loadDirectory() {
            $scope.directory = Directory.directory;
            for (var i = 0; i < $scope.directory.alumni.length; i++) {
                if ($scope.directory.alumni[i].grad_year && $scope.years.indexOf({
                    value: $scope.directory.alumni[i].grad_year
                }) == -1) {
                    $scope.years.push({
                        value: $scope.directory.alumni[i].grad_year
                    });
                    if ($scope.directory.alumni[i].grad_year > $scope.selected_year) {
                        $scope.selected_year = $scope.directory.alumni[i].grad_year
                    }
                }
            }
            $scope.directoryLoaded = true;
        }
        $scope.getProfPic = function(link) {
            if (link) {
                return link + '=s50';
            } else {
                return $rootScope.defaultProfilePicture;
            }
        }
        $scope.showIndividual = function(member) {
            window.location.assign("#/app/directory/" + member.user_name);
        }

        //click the buttons to search for that button text
        $('#searchTags button').click(function() {
            var searchValue = $(this).text();
            $('#directorySearch').val(searchValue).change();
        });
    }
]);