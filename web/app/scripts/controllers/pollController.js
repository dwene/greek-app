App.controller('pollController', ['$scope', '$rootScope', '$location', 'localStorageService', 'Polls',
    function($scope, $rootScope, $location, localStorageService, Polls) {
        Polls.get();
        $scope.polls = Polls.polls;
        if ($scope.polls != null) {
            $scope.polls_loaded = true;
        }
        $scope.$on('polls:updated', function() {
            $scope.polls = Polls.polls;
            $scope.polls_loaded = true;
        });


        //        $scope.checkForMorePolls = function(polls, pageNum, max){
        //            var len = polls.length;
        //            $scope.working = true;
        //            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/poll/v1/more_polls', packageForSending(len))
        //            .success(function(data){
        //                if (!checkResponseErrors(data))
        //                {
        //                    var new_polls = JSON.parse(data.data);
        //                    $rootScope.polls = new_polls;
        //                    if (new_polls.length > (pageNum*(max+1)) && (pageNum != 0 || new_polls.length > max)){
        //                        pageNum++;
        //                    }
        //                    else{
        //                        $scope.noMoreHiddens = true;
        //                    }
        //                }
        //                else{
        //                    console.log('ERROR: ',data);
        //                }
        //                $scope.working = false;
        //            })
        //            .error(function(data) {
        //                console.log('Error: ' , data);
        //                $scope.working = false;
        //            }); 
        //        }

        $scope.showPoll = function(poll) {
            $location.path('app/polls/' + poll.key);
        }

    }
]);