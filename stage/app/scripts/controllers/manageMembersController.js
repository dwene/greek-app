    App.controller('manageMembersController', function($scope, $http, Load, LoadScreen, $rootScope, localStorageService, Directory){
    routeChange();
    Load.then(function(){
        $rootScope.requirePermissions(COUNCIL);
        $scope.memberslength = 20;
        $scope.$watch('search', function(){
            if ($scope.search){
                $scope.memberslength = 20;
            }
        });
        //MANAGE MEMBERS TAB
        $scope.openDeleteMemberModal = function(user){
            $('#deleteMemberModal').modal();
            $scope.userToDelete = user;
        };
        //#TODO this should now be fixed to where it can delete multiple checked members in this modal
        
        $scope.openConvertMembersModal = function(){
            $('#convertMemberModal').modal();
        };
        
        $scope.openChangeEmailModal = function(user){
            $('#changeEmailModal').modal();
            $scope.userToChange = user;
        };
        
        $scope.loadMoreMembers = function(){
            if ($scope.directory){
                if ($scope.memberslength < $scope.directory.members.length){
                    $scope.memberslength += 20;
                }
            }
        };
        
        $scope.resendWelcomeEmail = function(member){
            member.updating = 'pending';
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/resend_welcome_email', packageForSending({key: member.key}))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        member.updating = 'done';
                    }
                    else{
                        member.updating = 'broken';
                    }
                })
                .error(function(data) {
                    member.updating = 'broken';
                });
        };
        $scope.resendAllWelcomeEmails = function(){
            $scope.resendWorking = 'pending';
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/resend_all_welcome_emails', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data)){
                    $scope.resendWorking = 'done';
                }
                else{
                    $scope.resendWorking = 'broken';
                    console.log('ERROR', data.error);
                }
            })
            .error(function(data){
                $scope.resendWorking = 'broken';
                console.log('ERROR', data.error);
            });
        };
        
        $scope.updatePerms = function(member, option){
            var key = member.key;
            member.updating = 'pending';
            var to_send = {key: key, perms: option};
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/manage_perms', packageForSending(to_send))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        member.updating = 'done';
                        member.perms = option;
                        Directory.set($scope.directory);
                    }
                    else{
                        member.updating = 'broken';
                    }
                })
                .error(function(data) {
                    member.updating = 'broken';
                });
        };
        
        $scope.changeUserEmail = function(member, email){
            var to_send = {key: member.key, email: email};
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/update_users_emails', packageForSending(to_send))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        member.email = email;
                        Directory.set($scope.directory);
                        $scope.newEmail = undefined;
                        console.log(member);
                    }
                    else
                    {
                        console.log('ERROR: ',data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
        };

        $scope.convertMembersToAlumni = function(){
            keys = [];
            $('#convertMemberModal').modal('hide');
            for (var i = 0; i < $scope.directory.members.length; i++){
                if ($scope.directory.members[i].checked){
                    $scope.directory.members[i].checked = false; 
                    keys.push($scope.directory.members[i].key);
                    $scope.directory.alumni.push($scope.directory.members[i]);
                    $scope.directory.members.splice(i, 1);
                    i--;
                }
            }
            var to_send = {'keys': keys};
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/convert_to_alumni', packageForSending(to_send))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        console.log('success');
                    }
                    else
                    {
                        console.log('ERROR: ',data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
            Directory.set($scope.directory);
        };
        $scope.getMembers = function(){
            $scope.directory = Directory.get();
            $scope.directoryLoaded = true;
        };
        if (Directory.check()){
            $scope.getMembers();
        }
        $scope.$on('directory:updated', function(){
            $scope.getMembers();
        });
        
        // function onPageLoad(){
        //     console.log('page is loading');
        //     if($rootScope.directory.members){
        //         assignAngularViewModels($rootScope.directory.members);
        //         $scope.getMembers();
        //     }
        //     else{
        //         $scope.getMembers();
        //     }
        // }
        // onPageLoad();
        
        $scope.removeMember = function(user){
            $('#deleteMemberModal').modal('hide');
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/remove_user', packageForSending(user))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                }
                else{console.log('ERROR: ',data);}
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });    
            for (var i = 0; i < $scope.directory.members.length; i++){
                if ($scope.directory.members[i].key == user.key){
                    $scope.directory.members.splice(i, 1);
                    Directory.set($scope.directory);
                    break;
                }
            }
        };
        });
    });