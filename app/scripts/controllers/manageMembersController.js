App.controller('manageMembersController', ['Session', '$scope', '$mdDialog', '$rootScope', 'RESTService', 'localStorageService', 'Directory',
    function(Session, $scope, $mdDialog, $rootScope, RESTService, localStorageService, Directory) {

        Directory.get();
        $scope.startsWith = 0;
        var selectedUser;
        var i;
        $scope.change = function() {
            $scope.startsWith = 0;
        };
        $scope.session = Session;
        $scope.directory = Directory.directory;
        $scope.memberslength = 20;
        $scope.getMembers = function() {
            var directory = Directory.directory;
            $scope.end = Math.floor(directory.members.length / 10);
            for (i = 0; i < directory.members.length; i++) {
                directory.members[i].name = directory.members[i].first_name + " " + directory.members[i].last_name;
            }
            $scope.directory = directory;
            $scope.directoryLoaded = true;
        };
        if (Directory.check()) {
            $scope.getMembers();
        }
        $scope.$on('directory:updated', function() {
            $scope.getMembers();
        });
        //MANAGE MEMBERS TAB
        $scope.openDeleteMemberModal = function(user, ev) {
            selectedUser = user;
            $mdDialog.show({
                controller: dialogController,
                templateUrl: 'views/templates/members/deleteMemberDialog.html',
                targetEvent: ev
            });

        };
        //#TODO this should now be fixed to where it can delete multiple checked members in this modal

        // $scope.openConvertMemberModal = function(ev){
        //     selectedUser = user;
        //     $mdDialog.show({
        //         controller: dialogController,
        //         templateUrl: 'views/templates/members/convertMemberDialog.html',
        //         targetEvent: ev
        //     });
        // };

        $scope.openChangeEmailModal = function(user, ev) {
            selectedUser = user;
            $mdDialog.show({
                controller: dialogController,
                templateUrl: 'views/templates/members/changeEmailDialog.html',
                targetEvent: ev
            });
        };

        $scope.openConvertMembersModal = function(user, ev) {
            selectedUser = $scope.directory.members;
            $mdDialog.show({
                controller: dialogController,
                templateUrl: 'views/templates/members/convertMembersDialog.html',
                targetEvent: ev
            });
        };

        function dialogController($scope, $mdDialog) {
            $scope.selectedUser = selectedUser;
            $scope.removeMember = function(user) {
                removeMember(user);
                $mdDialog.hide();
            };
            $scope.convertMember = function(user) {
                convertMemberToAlumni(user);
                $mdDialog.hide();
            };
            $scope.closeDialog = function() {
                $mdDialog.hide();
            };
            $scope.resendWelcomeEmail = function(user) {
                resendWelcomeEmail(user);
                $mdDialog.hide();
            };
            $scope.convertMembers = function() {
                convertMembersToAlumni();
                $mdDialog.hide();
            };
            $scope.changeEmail = function(user, new_email) {
                changeUserEmail(user, new_email);
                $mdDialog.hide();
            };
        }

        $scope.loadMoreMembers = function() {
            if ($scope.directory) {
                if ($scope.memberslength < $scope.directory.members.length) {
                    $scope.memberslength += 20;
                }
            }
        };

        function resendWelcomeEmail(member) {
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/resend_welcome_email', {
                key: member.key
            })
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                    } else {
                    }
                })
                .error(function(data) {
                });
        }

        $scope.resendAllWelcomeEmails = function() {
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/resend_all_welcome_emails', '')
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                    } else {
                        console.log('ERROR', data.error);
                    }
                })
                .error(function(data) {
                    console.log('ERROR', data.error);
                });
        };

        $scope.updatePerms = function(member, option) {
            var key = member.key;
            var to_send = {
                key: key,
                perms: option
            };
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/manage_perms', to_send)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        member.perms = option;
                        Directory.set($scope.directory);
                    } else {
                    }
                })
                .error(function(data) {
                });
        };

        function changeUserEmail(member, email) {
            var to_send = {
                key: member.key,
                email: email
            };
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/users_emails', to_send)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        member.email = email;
                        Directory.set($scope.directory);
                        $scope.newEmail = undefined;
                        $('#changeEmailModal').modal('hide');
                        console.log(member);
                    } else {
                        console.log('ERROR: ', data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        }

        function convertMembersToAlumni() {
            keys = [];
            $('#convertMemberModal').modal('hide');
            for (i = 0; i < $scope.directory.members.length; i++) {
                if ($scope.directory.members[i].checked) {
                    $scope.directory.members[i].checked = false;
                    keys.push($scope.directory.members[i].key);
                    $scope.directory.alumni.push($scope.directory.members[i]);
                    $scope.directory.members.splice(i, 1);
                    i--;
                }
            }
            var to_send = {
                'keys': keys
            };
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/convert_to_alumni', to_send)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                    } else {
                        console.log('ERROR: ', data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
            Directory.set($scope.directory);
        }

        function removeMember(user) {
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/auth/v1/remove_user', user)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {} else {
                        console.log('ERROR: ', data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
            for (i = 0; i < $scope.directory.members.length; i++) {
                if ($scope.directory.members[i].key == user.key) {
                    $scope.directory.members.splice(i, 1);
                    Directory.set($scope.directory);
                    break;
                }
            }
        }
    }
]);
