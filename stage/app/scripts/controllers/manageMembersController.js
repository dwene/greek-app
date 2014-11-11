    App.controller('manageMembersController', function($scope, $http, Load, LoadScreen, $rootScope, localStorageService){
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
        }
        //#TODO this should now be fixed to where it can delete multiple checked members in this modal
        
        $scope.openConvertMembersModal = function(){
            $('#convertMemberModal').modal();
        }
        $scope.loadMoreMembers = function(){
            if ($scope.memberslength < $scope.members.length){
                $scope.memberslength += 20;
            }
        }
        
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
        }
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
                console.log('ERROR', data.error)
            })
        }
        
        $scope.updatePerms = function(member, option){
            var key = member.key;
            member.updating = 'pending';
            var to_send = {key: key, perms: option};
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/manage_perms', packageForSending(to_send))
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
        }
        
        $scope.changeUserEmail = function(member, email){
            var to_send = {key: member.key, email: email};
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/update_users_emails', packageForSending(to_send))
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
        }

        $scope.convertMembersToAlumni = function(){
            keys = [];
            console.log('converting to alumni', members);
            $('#convertMemberModal').modal('hide');
            for (var i = 0; i < $scope.members.length; i++){
                if ($scope.members[i].checked){
                    $scope.members[i].checked = false; 
                    keys.push($scope.members[i].key);
                    $scope.members.splice(i, 1);
                    i--;
                }
            }
            var to_send = {'keys': keys};
            console.log(to_send);
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
        };
        $scope.getMembers = function(){
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $rootScope.directory = JSON.parse(data.data);
                    localStorageService.set('directory', $rootScope.directory);
                    assignAngularViewModels($rootScope.directory.members);
                }
                else
                    console.log('ERROR: ',data);
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });
        
        }
        
        function assignAngularViewModels(members){
            $scope.members = members;
            LoadScreen.stop();
        }
        
        function onPageLoad(){
            console.log('page is loading');
            if($rootScope.directory.members){
                assignAngularViewModels($rootScope.directory.members);
                $scope.getMembers();
            }
            else{
                LoadScreen.start();
                $scope.getMembers();
            }
        }
        onPageLoad();
        
        $scope.removeMember = function(user){
            $('#deleteMemberModal').modal('hide');
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/remove_user', packageForSending(user))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                }
                else
                    console.log('ERROR: ',data);
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });    
            for (var i = 0; i < $scope.members.length; i++){
                if ($scope.members[i].key == user.key){
                    $scope.members.splice(i, 1);
                    break;
                }
            }
        }
        });
    });