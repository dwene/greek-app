App.controller('pollResultsController', function($scope, $http, Load, $rootScope, $stateParams, LoadScreen, Directory) {
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
        $scope.directory = Directory.get();
        $scope.$on('directory:updated', function(){
            $scope.directory = Directory.get();
            if ($scope.poll){
                setIndividuals();
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

        function setIndividuals(){
            var key_list = [];
            var user_list = [];
            for (var i = 0; i < $scope.poll.questions.length; i++){
                var currentQuestion = $scope.poll.questions[i];
                for (var j = 0; j < currentQuestion.responses.length; j++){
                    $scope.poll.questions[i].responses[j].name = $scope.getUserFromKey(currentQuestion.responses[j].key).first_name + ' ' + $scope.getUserFromKey(currentQuestion.responses[j].key).last_name;
                    var idx = key_list.indexOf(currentQuestion.responses[j].key);
                    if (idx == -1){
                        key_list.push(currentQuestion.responses[j].key);
                        user_list.push({key:currentQuestion.responses[j].key, user: $scope.getUserFromKey(currentQuestion.responses[j].key), responses: new Array($scope.poll.questions.length)});
                        var idx = key_list.indexOf(currentQuestion.responses[j].key);
                    }
                    user_list[idx].responses[i] = {response:currentQuestion.responses[j].text, question: currentQuestion};
                }
            }
            $scope.individuals = user_list;
            $scope.loading_finished = true;
            console.log('$scope.poll', $scope.poll);
        }
        Load.then(function(){
            $('html').trigger('resize');
            $rootScope.requirePermissions(MEMBER);
            var to_send = {key: $stateParams.key};
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/poll/get_results', packageForSending(to_send), {cache:true})
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        $scope.poll = JSON.parse(data.data);
                        if (($scope.poll.viewers != 'everyone' && !$rootScope.checkPermissions($scope.poll.viewers))){
                            window.location.replace('#/app/polls/'+$stateParams.key);
                        }
                        if ($scope.directory){
                            setIndividuals();
                        }
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