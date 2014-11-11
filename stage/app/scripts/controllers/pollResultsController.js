App.controller('pollResultsController', function($scope, $http, Load, $rootScope, $stateParams, LoadScreen) {
        routeChange();
        $scope.openAllQuestions = function(){
            $('.pollSummary.collapse').collapse('show');
        }
        $scope.closeAllQuestions = function(){
            $('.pollSummary.in').collapse('hide');
        }
        $scope.openAllIndividuals = function(){
            $('.individualResponses.collapse').collapse('show');
        }
        $scope.closeAllIndividuals = function(){
            $('.individualResponses.in').collapse('hide');
        }
        Load.then(function(){
            $('html').trigger('resize');
            $scope.loading = true;
            if ($rootScope.currentPollResult && $rootScope.currentPollResult.key == $stateParams.key){
                
            }
            $rootScope.requirePermissions(MEMBER);
            var to_send = {key: $stateParams.key};
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/poll/get_results', packageForSending(to_send))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        $scope.poll = JSON.parse(data.data);
                        if (($scope.poll.viewers != 'everyone' && !$rootScope.checkPermissions($scope.poll.viewers))){
                            window.location.replace('#/app/polls/'+$stateParams.key);
                        }
                        var key_list = [];
                        var user_list = [];
                        for (var i = 0; i < $scope.poll.questions.length; i++){
                            var currentQuestion = $scope.poll.questions[i];
                            for (var j = 0; j < currentQuestion.responses.length; j++){
                                var idx = key_list.indexOf(currentQuestion.responses[j].key);
                                if (idx == -1){
                                    key_list.push(currentQuestion.responses[j].key);
                                    user_list.push({key:currentQuestion.responses[j].key, user: $rootScope.getUserFromKey(currentQuestion.responses[j].key), responses: new Array($scope.poll.questions.length)});
                                    var idx = key_list.indexOf(currentQuestion.responses[j].key);
                                }
                                user_list[idx].responses[i] = {response:currentQuestion.responses[j].text, question: currentQuestion};
                            }
                        }
                        $scope.individuals = user_list;
                        console.log('User list', user_list);
                    }
                    else{
                        console.log('ERR');
                        $scope.notFound = true;
                    }
                    $scope.loading = false;
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                    $scope.loading = false;
                    $scope.notFound = true;
                });
        });
        
        
    });