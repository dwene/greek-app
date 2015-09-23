App.controller('membersDirectoryController', ['$scope', '$rootScope', 'directoryFilterFilter', '$filter', '$location', 'localStorageService', 'Directory',
    function($scope, $rootScope, directoryFilterFilter, $filter, $location, localStorageService, Directory) {
        Directory.get();
        $scope.loaded = false;
        $scope.memberdirectorylength = 20;
        $scope.$on('directory:updated', function() {
            $scope.directory = Directory.directory;
            $scope.createDirectory();
        });
        $scope.createDirectory();
        $scope.$watch('search', function() {
            if ($scope.search) {
                $scope.memberdirectorylength = 20;
            }
        });
        $scope.increaseDirectoryLength = function() {
            if ($scope.members) {
                if ($scope.memberdirectorylength < $scope.members.length) {
                    $scope.memberdirectorylength += 20;
                }
            }
        }
        $scope.createDirectory = function() {
            $scope.directory = Directory.directory;
            if ($scope.directory) {
                $scope.council = $filter('orderBy')(directoryFilterFilter($scope.directory.members, 'council'), 'last_name');
                $scope.leadership = $filter('orderBy')(directoryFilterFilter($scope.directory.members, 'leadership'), 'last_name');
                $scope.members = $filter('orderBy')(directoryFilterFilter($scope.directory.members, 'member'), 'last_name');
                $scope.loaded = $scope.directory;
            }

        }
        $scope.showIndividual = function(member) {
            $location.path("app/directory/" + member.user_name);
        }
        $scope.getProfPic = function(link) {
            if (link) {
                return link + '=s50';
            } else {
                return $rootScope.defaultProfilePicture;
            }

        }
    }
]);