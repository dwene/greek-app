    App.controller('newPollController', function($scope, $http, Load, $rootScope) {
        routeChange();
        $scope.deletePollTip = {
            "title" : "Delete Question"
        }
        $scope.poll = {}
        $scope.poll.questions = [];
        $scope.addQuestion = function(){
            $scope.poll.questions.push({worded_question: '', type: '', choices: []});
        }
        $scope.removeQuestion = function(idx){
            $scope.poll.questions.splice(idx, 1);
        }
        $scope.addChoice = function(question, choice){
            
            if (choice && question.choices.indexOf(choice) == -1){
                question.choices.push(choice);
            }
            question.temp_choice = undefined;
        }
        $scope.removeChoice = function(question, idx){
            question.choices.splice(idx, 1);
        }
        $scope.createPoll = function(isValid){
            $scope.working = 'pending';
            var poll = $scope.poll;
            poll.tags = getCheckedTags($scope.tags);
            var to_send = JSON.parse(JSON.stringify(poll));
//            to_send.time_start = momentUTCTime(poll.date_start + " " + poll.time_start).format('MM/DD/YYYY hh:mm a');
//            to_send.time_end = momentUTCTime(poll.date_end + " " + poll.time_end).format('MM/DD/YYYY hh:mm a');
            if (isValid){
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/poll/create', packageForSending(to_send))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        $scope.working = 'done';
                        window.location.assign('#/app/polls/' + JSON.parse(data.data).key);
                    }
                    else{
                        $scope.working = 'broken';
                        console.log('ERR');
                    }
                })
                .error(function(data) {
                    $scope.working = 'broken';
                    console.log('Error: ' , data);
                });
            }
        }
        Load.then(function(){
            $rootScope.requirePermissions(LEADERSHIP);
            $scope.tags = $rootScope.tags;
        });
	});


    App.controller('pollController', function($scope, $http, Load, $rootScope, localStorageService) {
        routeChange();
        Load.then(function(){
            $scope.polls = $rootScope.polls;
            $rootScope.requirePermissions(MEMBER);
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/poll/get_polls', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        $scope.polls = JSON.parse(data.data);
                        $rootScope.polls = $scope.polls;
                        localStorageService.set('polls', $rootScope.polls);
                    }
                    else{
                        console.log('ERR');
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
        });
        
//        $scope.checkForMorePolls = function(polls, pageNum, max){
//            var len = polls.length;
//            $scope.working = true;
//            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/poll/more_polls', packageForSending(len))
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
        
        $scope.showPoll = function(poll){
                window.location.assign('#/app/polls/' + poll.key);
        }
        
	});