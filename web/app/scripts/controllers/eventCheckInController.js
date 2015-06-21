App.controller('eventCheckInController', ['$scope', 'RESTService', 'Events', '$stateParams', '$rootScope', '$timeout', '$location', '$interval',
    function($scope, RESTService, Events, $stateParams, $rootScope, $timeout, $location, $interval) {
        Events.get();
        $scope.events = Events.events;
        if (Events.events) {
            getEventAndSetInfo($scope.events);
        }
        $scope.$on('events:updated', function() {
            $scope.events = Events.events;
            getEventAndSetInfo($scope.events);
        });


        function getEventAndSetInfo(events) {
            var event = undefined;
            for (var i = 0; i < events.length; i++) {
                if (events[i].key == $stateParams.tag) {
                    event = events[i];
                    break;
                }
            }
            if (event === undefined) {
                if (!refreshed) {
                    Events.refresh();
                    refreshed = true;
                    console.log('refreshing events');
                    return;
                } else {
                    $scope.eventNotFound = true;
                    $scope.loading = false;
                    return;
                }
            } else {
                $scope.event = event;
            }
        }

        function update() {
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/event/v1/get_check_in_info', $stateParams.tag)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        console.log('I am updating the user check in stuff!');
                        var users = JSON.parse(data.data);
                        var counter = 0;
                        if (users && $scope.users) {
                            for (var i = 0; i < $scope.users.length; i++) {
                                counter++;
                                var user = $scope.users[i];
                                if (user.attendance_data) {
                                    if (user.attendance_data.in_updating || user.attendance_data.out_updating) {
                                        continue;
                                    }
                                    if (user.timestamp_moment) {
                                        if (Math.abs(user.timestamp_moment.diff(moment(), 'seconds')) < 5) {
                                            continue;
                                        }
                                    }
                                    $scope.users[i] = users[i];
                                }
                            }
                        }
                    }
                });
        }
        $scope.loading = true;
        getCheckInData();
        $scope.maxLength = 10;
        $scope.maxLengthIncrease = function() {
            if ($scope.users) {
                if ($scope.maxLength < $scope.users.length) {
                    $scope.maxLength += 20;
                }
            }
        }
        $scope.change = function() {
            $scope.maxLength = 10;
        }
        // });
        var interval_variable;

        function getCheckInData() {
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/event/v1/get_check_in_info', $stateParams.tag)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        $scope.users = JSON.parse(data.data);
                        $scope.loading = false;
                        if (!angular.isDefined(interval_variable)) {
                            interval_variable = $interval(function() {
                                update()
                            }, 10000);
                        }
                        $interval()
                        console.log('Im ending get check in data');
                    } else {
                        console.log('ERROR: ', data);
                        $scope.eventNotFound = true;
                        $scope.loading = false;
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                    $scope.loading = false;
                    $scope.eventNotFound = true;
                });
        }

        $scope.$on('$destroy', function() {
            if (angular.isDefined(interval_variable)) {
                $interval.cancel(interval_variable);
            }
        });

        $scope.eventTag = $stateParams.tag;
        $scope.checkIn = function(member, checkStatus, clear) { //#TODO: fix controller so we can check in more than once
            member.timestamp_moment = moment();
            if (checkStatus && member.attendance_data && member.attendance_data.time_in) {
                $('#checkInModal').modal();
                $scope.selectedUser = member;
                return;
            }
            $('#checkInModal').modal('hide');
            var to_send = {
                event_key: $stateParams.tag,
                user_key: member.key
            };
            if (!member.attendance_data) {
                member.attendance_data = {}
            }
            if (clear) {
                to_send.clear = true;
                member.attendance_data.time_in = "";
            } else {
                member.attendance_data.time_in = momentUTCTime();
            }
            member.in_updating = 'pending';
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/event/v1/check_in', to_send)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        member.in_updating = "done";
                        member.timestamp_moment = moment();
                    } else {
                        member.in_updating = "broken";
                        console.log('ERROR: ', data);
                    }
                })
                .error(function(data) {
                    member.in_updating = "broken";
                    console.log('Error: ', data);
                });
        }
        $scope.checkOut = function(member, checkStatus, clear) {
            member.timestamp_moment = moment();
            if (checkStatus && member.attendance_data && member.attendance_data.time_out && member.attendance_data.time_in) {
                $('#checkOutModal').modal();
                $scope.selectedUser = member;
                return;
            }
            $('#checkOutModal').modal('hide');
            var to_send = {
                event_key: $stateParams.tag,
                user_key: member.key
            };
            if (!member.attendance_data) {
                member.attendance_data = {};
            }
            if (clear) {
                to_send.clear = true;
                member.attendance_data.time_out = "";
            } else {
                member.attendance_data.time_out = momentUTCTime();
            }
            member.out_updating = 'pending';
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/event/v1/check_out', to_send)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        member.out_updating = 'done';
                        member.timestamp_moment = moment();
                    } else {
                        console.log('ERROR: ', data);
                        member.out_updating = 'broken';
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                    member.out_updating = 'broken';
                });
        }
        $scope.formatDate = function(date) {
            return momentInTimezone(date).format('lll');
        }
        $scope.back = function() {
            $location.path('app/events/' + $scope.event.key);
        }
    }
]);