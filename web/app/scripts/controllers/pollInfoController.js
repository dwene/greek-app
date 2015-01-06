    App.controller('pollInfoController', function($scope, RESTService, $rootScope, $stateParams, $mdBottomSheet, $location, Directory) {
        routeChange();
        Directory.get();
        //$scope.polls = Polls.get();
        $scope.directory = Directory.directory;
        // $scope.$on('polls:updated', function(){
        //     $scope.polls = Polls.get();
        // });
        $scope.$on('directory:updated', function(){
            $scope.directory = Directory.directory;
        });
        $scope.$watchCollection('[poll, directory]', function(){
            if ($scope.directory && $scope.poll){
                $scope.creator = $scope.getUserFromKey($scope.poll.creator);
                $scope.loading_finished = true;
            }
        });
        $scope.getUserFromKey = function(key){
            if ($scope.directory.members){
                for (var i = 0; i < $scope.directory.members.length; i++){
                    if ($scope.directory.members[i].key == key){
                        return $scope.directory.members[i];
                    }
                }
            }
            return undefined;
        }
        
        
        $scope.showSurveyOptions = function(event){
    
            $mdBottomSheet.show({
              templateUrl: 'views/templates/bottomGrid.html',
              controller: surveyOptionsCtrl,
              targetEvent: event
            });
        }

        function surveyOptionsCtrl($scope, $mdBottomSheet) {
            $scope.items = [
                { name: 'REPORT', icon: 'fa-bar-chart'},
                // { name: 'EDIT', icon: 'fa-edit' },
                { name: 'OPEN', icon: 'fa-play' },
                { name: 'CLOSE', icon: 'fa-pause'}
            ];
            $scope.itemClick = function(item){
                $mdBottomSheet.hide();
                switch(item.name){
                    case 'REPORT': $location.url('app/polls/'+$stateParams.key + '/results'); break;
                    case 'OPEN': $scope.closePoll(false); break;
                    case 'CLOSE': $scope.closePoll(true); break;
                }

            }
        };

        var to_send = {key: $stateParams.key};
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/poll/get_poll_info', to_send)
            .success(function(data){
                if (!RESTService.hasErrors(data)){
                    $scope.poll = JSON.parse(data.data);
                    $scope.creator = $scope.getUserFromKey($scope.poll.creator);
                }
                else{
                    $scope.notFound = true;
                    console.log('ERR');
                }
            })
            .error(function(data) {
                $scope.notFound = true;
                console.log('Error: ' , data);
                $scope.loading = false;
            });
        $scope.closePoll = function(close){
            var to_send = {key: $stateParams.key};
            if (close === true){
                to_send.close = true;
            }
            else if (close === false){
                to_send.open = true;
            }
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/poll/edit_poll', to_send)
                .success(function(data){
                    if (!RESTService.hasErrors(data)){
                        if (close){
                            $scope.poll.open = false
                        }
                        else if (close === false){
                            $scope.poll.open = true;
                        }
                    }
                    else{
                        console.log('ERR');
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
        }
        $scope.$watchCollection('poll.questions', function(){
            console.log('Im doing stuff');
            if ($scope.poll && $scope.poll.questions){   
                for (var i = 0; i < $scope.poll.questions.length; i++){
                    if (!$scope.poll.questions[i].new_response){
                        $scope.formUnfinished = true;
                        return;
                    }
                }
                $scope.formUnfinished = false;
            }
        })
        
//        #FIXME creator undefined :-P
        
        $scope.deletePoll = function(){
            var to_send = {key: $stateParams.key};
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/poll/delete', to_send)
                .success(function(data){
                    if (!RESTService.hasErrors(data)){
                        $location.path('app/polls');
                    }
                    else{
                        console.log('ERR');
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
        }
        
        $scope.submitResponse = function(){
            var to_send = $scope.poll;
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/poll/answer_questions', to_send)
                .success(function(data){
                    if (!RESTService.hasErrors(data)){
                       $location.path('app/polls/'+$stateParams.key + '/results');
                    }
                    else{
                        console.log('ERR');
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
        }
        
        $scope.goToResults = function(){
            $location.path('#/app/polls/'+$stateParams.key + '/results');
        }
	});