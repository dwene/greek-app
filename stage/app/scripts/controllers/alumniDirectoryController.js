    App.controller('alumniDirectoryController', function($scope, $rootScope, $http, Load, LoadScreen){
    routeChange();
    Load.then(function(){
        $scope.years = [];
        $scope.selected_year = 0;
        for (var i = 0; i < $rootScope.directory.alumni.length; i++){
            if ($rootScope.directory.alumni[i].grad_year && $scope.years.indexOf({value:$rootScope.directory.alumni[i].grad_year}) == -1){
                $scope.years.push({value:$rootScope.directory.alumni[i].grad_year});
                if ($rootScope.directory.alumni[i].grad_year > $scope.selected_year){
                    $scope.selected_year = $rootScope.directory.alumni[i].grad_year
                }
            }
        }
        $scope.getProfPic = function(link){
            if (link){
                return link + '=s50';
            }
            else{
                return $rootScope.defaultProfilePicture;
            }
        }
        $scope.showIndividual = function(member){
            window.location.assign("#/app/directory/"+member.user_name);
        }
        
        //click the buttons to search for that button text
        $('#searchTags button').click(function(){
            var searchValue = $(this).text();
            $('#directorySearch').val(searchValue).change();
        });
        
    });
    });