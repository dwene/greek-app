App.controller('pollResultsController', ['$scope', 'RESTService', '$rootScope', '$stateParams', 'Directory',
    function($scope, RESTService, $rootScope, $stateParams, Directory) {
        Directory.get();
        $scope.openAllQuestions = function() {
            $('.pollSummary.collapse').collapse('show');
        }
        $scope.closeAllQuestions = function() {
            $('.pollSummary.in').collapse('hide');
        }
        $scope.openAllIndividuals = function() {
            $('.individualResponses.collapse').collapse('show');
        }
        $scope.closeAllIndividuals = function() {
            $('.individualResponses.in').collapse('hide');
        }
        $scope.directory = Directory.directory;
        $scope.$on('directory:updated', function() {
            if ($scope.poll) {
                setIndividuals();
            }
        });
        $scope.getUserFromKey = function(key) {
            if ($scope.directory.members) {
                for (var i = 0; i < $scope.directory.members.length; i++) {
                    if ($scope.directory.members[i].key == key) {
                        return $scope.directory.members[i];
                    }
                }
            }
            return undefined;
        }

        function setIndividuals() {
            var key_list = [];
            var user_list = [];
            for (var i = 0; i < $scope.poll.questions.length; i++) {
                var currentQuestion = $scope.poll.questions[i];
                for (var j = 0; j < currentQuestion.responses.length; j++) {
                    $scope.poll.questions[i].responses[j].name = $scope.getUserFromKey(currentQuestion.responses[j].key).first_name + ' ' + $scope.getUserFromKey(currentQuestion.responses[j].key).last_name;
                    var idx = key_list.indexOf(currentQuestion.responses[j].key);
                    if (idx == -1) {
                        key_list.push(currentQuestion.responses[j].key);
                        user_list.push({
                            key: currentQuestion.responses[j].key,
                            user: $scope.getUserFromKey(currentQuestion.responses[j].key),
                            responses: new Array($scope.poll.questions.length)
                        });
                        var idx = key_list.indexOf(currentQuestion.responses[j].key);
                    }
                    user_list[idx].responses[i] = {
                        response: currentQuestion.responses[j].text,
                        question: currentQuestion
                    };
                }
            }
            $scope.individuals = user_list;
            $scope.loading_finished = true;
        }
        $('html').trigger('resize');
        var to_send = {
            key: $stateParams.key
        };
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/poll/v1/get_results', (to_send), {
            cache: true
        })
            .success(function(data) {
                if (!RESTService.hasErrors(data)) {
                    $scope.poll = JSON.parse(data.data);
                    if (($scope.poll.viewers != 'everyone' && Session.perms != COUNCIL)) {
                        $location.path('app/polls/' + $stateParams.key);
                    }
                    if ($scope.directory) {
                        setIndividuals();
                    }
                } else {
                    console.log('ERR');
                    $scope.notFound = true;
                }
                $scope.loading = false;
            })
            .error(function(data) {
                console.log('Error: ', data);
                $scope.loading = false;
                $scope.notFound = true;
            });
    }
]);