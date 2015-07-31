
App.controller('pollInfoController', ['$scope', 'RESTService', '$rootScope', '$stateParams', '$mdDialog', '$location', 'Directory',
    function($scope, RESTService, $rootScope, $stateParams, $mdDialog, $location, Directory) {
        Directory.get();
        $scope.directory = Directory.directory;
        $scope.$on('directory:updated', function() {
            $scope.directory = Directory.directory;
        });
        $scope.$watchCollection('[poll, directory]', function() {
            if ($scope.directory && $scope.poll) {
                $scope.creator = $scope.getUserFromKey($scope.poll.creator);
                $scope.loading_finished = true;
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

        $scope.showSurveyOptions = function(event) {
            $mdDialog.show({
                templateUrl: 'views/templates/bottomDialog.html',
                controller: ('surveyOptionsCtrl', ['$scope', '$mdDialog', surveyOptionsCtrl]),
                targetEvent: event
            });
        }

        function surveyOptionsCtrl($scope, $mdDialog) {
            $scope.items = [{
                    name: 'REPORT',
                    icon: 'fa-bar-chart'
                },
                // { name: 'EDIT', icon: 'fa-edit' },
                {
                    name: 'OPEN',
                    icon: 'fa-play'
                }, {
                    name: 'CLOSE',
                    icon: 'fa-pause'
                }
            ];
            $scope.itemClick = function(item) {
                $mdDialog.hide();
                switch (item.name) {
                    case 'REPORT':
                        $location.url('app/polls/' + $stateParams.key + '/results');
                        break;
                    case 'OPEN':
                        closePoll(false);
                        break;
                    case 'CLOSE':
                        closePoll(true);
                        break;
                }
            }
            $scope.closeDialog = function() {
                $mdDialog.hide();
            }
        };

        var to_send = {
            key: $stateParams.key
        };
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/poll/v1/get_poll_info', to_send)
            .success(function(data) {
                if (!RESTService.hasErrors(data)) {
                    $scope.poll = JSON.parse(data.data);
                    $scope.creator = $scope.getUserFromKey($scope.poll.creator);
                } else {
                    $scope.notFound = true;
                    console.log('ERR');
                }
            })
            .error(function(data) {
                $scope.notFound = true;
                console.log('Error: ', data);
                $scope.loading = false;
            });

        function closePoll(close) {
            var to_send = {
                key: $stateParams.key
            };
            if (close === true) {
                to_send.close = true;
            } else if (close === false) {
                to_send.open = true;
            }
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/poll/v1/edit_poll', to_send)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        if (close) {
                            $scope.poll.open = false
                        } else if (close === false) {
                            $scope.poll.open = true;
                        }
                    } else {
                        console.log('ERR');
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        }
        $scope.$watchCollection('poll.questions', function() {
            console.log('Im doing stuff');
            if ($scope.poll && $scope.poll.questions) {
                for (var i = 0; i < $scope.poll.questions.length; i++) {
                    if (!$scope.poll.questions[i].new_response) {
                        $scope.formUnfinished = true;
                        return;
                    }
                }
                $scope.formUnfinished = false;
            }
        })

        //        #FIXME creator undefined :-P

        $scope.deletePoll = function() {
            var to_send = {
                key: $stateParams.key
            };
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/poll/v1/delete', to_send)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        $location.path('app/polls');
                    } else {
                        console.log('ERR');
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        }

        $scope.submitResponse = function() {
            var to_send = $scope.poll;
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/poll/v1/answer_questions', to_send)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        $location.path('app/polls/' + $stateParams.key + '/results');
                    } else {
                        console.log('ERR');
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        }

        $scope.goToResults = function() {
            $location.path('#/app/polls/' + $stateParams.key + '/results');
        }
    }
]);