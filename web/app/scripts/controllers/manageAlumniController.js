App.controller('managealumniController', ['$scope', 'RESTService', '$rootScope', '$mdDialog', 'localStorageService', 'Directory',
    function($scope, RESTService, $rootScope, $mdDialog, localStorageService, Directory) {
        routeChange();
        Directory.get();
        var selectedUser = undefined;
        $scope.directory = Directory.directory;
        if ($scope.directory) {
            $scope.finished_loading = true;
        }
        $scope.$on('directory:updated', function() {
            $scope.directory = Directory.directory;
            $scope.finished_loading = true;
        });

        $scope.openDeleteAlumniModal = function(user, ev) {
            $mdDialog.show({
                controller: ('dialogController' ['$scope', '$mdDialog', dialogController]),
                templateUrl: 'views/templates/alumni/deleteAlumniDialog.html',
                targetEvent: ev
            });
            selectedUser = user;
        }

        function dialogController($scope, $mdDialog) {
            $scope.selectedUser = selectedUser;
            $scope.removeAlumni = function(user) {
                removeAlumni(user);
                $mdDialog.hide();
            }
            $scope.convertAlumni = function(user) {
                convertAlumniToMember(user);
                $mdDialog.hide();
            }
            $scope.closeDialog = function() {
                $mdDialog.hide();
            }
            $scope.resendWelcomeEmail = function(user) {
                resendWelcomeEmail(user);
                $mdDialog.hide();
            }
        }

        $scope.openConvertAlumniModal = function(user, ev) {
            $mdDialog.show({
                controller: ('dialogController' ['$scope', '$mdDialog', dialogController]),
                templateUrl: 'views/templates/alumni/convertAlumniDialog.html',
                targetEvent: ev
            });
            selectedUser = user;
        }

        function resendWelcomeEmail(member) {
            member.updating = 'pending';
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/resend_welcome_email', {
                key: member.key
            })
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        member.updating = 'done';
                    } else {
                        member.updating = 'broken';
                    }
                })
                .error(function(data) {
                    member.updating = 'broken';
                });
        }

        function convertAlumniToMember(alumnus) {
            $scope.selectedUser = {}
            $('#convertAlumniModal').modal('hide');
            var to_send = {
                'keys': [alumnus.key]
            }
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/revert_from_alumni', to_send)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {} else {
                        console.log("error: ", data.error)
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
            for (var i = 0; i < $scope.directory.alumni.length; i++) {
                if ($scope.directory.alumni[i].key == alumnus.key) {
                    $scope.directory.members.push($scope.directory.alumni[i]);
                    $scope.directory.alumni.splice(i, 1);
                    break;
                }
            }
        }

        function removeAlumni(alumnus) {
            $scope.selectedUser = {}
            $('#deleteAlumniModal').modal('hide');
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/auth/v1/remove_user', alumnus);
            if ($scope.directory.alumni.indexOf(alumnus) > -1) {
                $scope.directory.alumni.splice($scope.directory.alumni.indexOf(alumnus), 1);
            }
        }
    }
]);