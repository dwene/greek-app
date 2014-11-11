    App.controller('membersDirectoryController', function($scope, $rootScope, $http, Load, LoadScreen, directoryFilterFilter, $filter, localStorageService){
    routeChange();
        $scope.memberdirectorylength = 20;
    Load.then(function(){
        
        $scope.increaseDirectoryLength = function(){
            if ($scope.members){
                if ($scope.memberdirectorylength < $scope.members.length){
//                    console.log('Increasing number of shown elements');
                    $scope.memberdirectorylength += 20;
                }
            }
        }
        
        $scope.council = $filter('orderBy')( directoryFilterFilter($rootScope.directory.members, 'council'), 'last_name');
        $scope.leadership = $filter('orderBy')( directoryFilterFilter($rootScope.directory.members, 'leadership'), 'last_name');
        $scope.members = $filter('orderBy')( directoryFilterFilter($rootScope.directory.members, 'member'), 'last_name');
        $scope.$watch('search', function(){
            if ($scope.search){
                $scope.memberdirectorylength = 20;
            }
        })
//        function splitMembers(){
//            var council = [];
//            var leadership = [];
//            var members = [];
//            if ($rootScope.directory.members){
//                for (var i = 0; i< $rootScope.directory.members.length; i++){
//                    if ($rootScope.directory.members[i].perms == MEMBER){
//                        members.push($rootScope.directory.members[i]);
//                        continue;
//                    }
//                    if ($rootScope.directory.members[i].perms == LEADERSHIP){
//                        leadership.push($rootScope.directory.members[i]);
//                        continue;
//                    }
//                    if ($rootScope.directory.members[i].perms == COUNCIL){
//                        console.log('hi')
//                        council.push($rootScope.directory.members[i]);
//                        continue;
//                    }
//                }
//                $scope.directory = [];
//                if (council.length > 0){
//                    $scope.directory.push({name: 'council', data: council});             
//                }
//                if (leadership.length > 0){
//                    $scope.directory.push({name: 'leadership', data: leadership});               
//                }
//                if (members.length > 0){
//                    $scope.directory.push({name: 'member', data: members});          
//                }
//            }
//        }
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    var directory = JSON.parse(data.data)
                    console.log(directory);
                    $rootScope.directory = directory;
                    localStorageService.set('directory', $rootScope.directory);
                    $scope.directory = $rootScope.directory.members;
                    $scope.council = $filter('orderBy')( directoryFilterFilter($rootScope.directory.members, 'council'), 'last_name');
                    $scope.leadership = $filter('orderBy')( directoryFilterFilter($rootScope.directory.members, 'leadership'), 'last_name');
                    $scope.members = $filter('orderBy')( directoryFilterFilter($rootScope.directory.members, 'member'), 'last_name');
                    LoadScreen.stop();
                }
                else
                {
                    console.log("error: ", data.error)
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });
        $scope.showIndividual = function(member){
            window.location.assign("#/app/directory/"+member.user_name);
        }
        $scope.getProfPic = function(link){
            if (link){
                return link + '=s50';
            }
            else{
                return $rootScope.defaultProfilePicture;
            }
            
        }
        
        //click the buttons to search for that button text
        $('#searchTags button').click(function(){
            var searchValue = $(this).text();
            $('#directorySearch').val(searchValue).change();
        });
        
    });
    });