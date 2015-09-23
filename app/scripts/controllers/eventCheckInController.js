App.controller('eventCheckInController', ['$scope', 'RESTService', 'Events', '$stateParams', '$rootScope', '$timeout', '$location', '$interval',
    function($scope, RESTService, Events, $stateParams, $rootScope, $timeout, $location, $interval) {
        var vm = this;
        var event_key = $stateParams.tag;
        vm.back = function() {
            $location.path('app/events/'+event_key);
        };

        $scope.$on('checkin:new', function(event, data){
            liveUpdate(data);
        });
        var interval, i;
        function liveUpdate(attendanceData){
            for (i = 0; i < $scope.users.length; i++){
                if ($scope.users[i].key === attendanceData.user){
                    var user = $scope.users[i];

                    if (user.attendance_data) {
                        if (user.attendance_data.in_updating || user.attendance_data.out_updating) {
                            return;
                        }
                        else if (user.timestamp_moment) {
                            if (Math.abs(user.timestamp_moment.diff(moment(), 'seconds')) < 1) {
                                return;
                            }
                        }

                        $scope.$apply(function(){
                            $scope.users[i].attendance_data = attendanceData;
                        })
                    }
                    return;
                }
            }
        }

        function update() {
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/event/v1/get_check_in_info', $stateParams.tag)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        var eventData = JSON.parse(data.data);
                        var users = eventData.users;
                        var counter = 0;
                        if (users && $scope.users) {
                            for (var i = 0; i < $scope.users.length; i++) {
                                counter++;
                                var user = $scope.users[i];
                                if (user.attendance_data) {
                                    if (user.attendance_data.in_updating || user.attendance_data.out_updating) {
                                        continue;
                                    }
                                    else if (user.timestamp_moment) {
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
        };

        $scope.change = function() {
            $scope.maxLength = 10;
        };

        function getCheckInData() {
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/event/v1/get_check_in_info', $stateParams.tag)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        var eventData = JSON.parse(data.data);
                        $scope.users = eventData.users;
                        $scope.title = eventData.event.title;
                        $scope.loading = false;
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
            if (angular.isDefined(interval)) {
                $interval.cancel(interval);
            }
        });

        vm.checkIn = function(member, checkStatus, clear) { //#TODO: fix controller so we can check in more than once
            member.timestamp_moment = moment();
            if (checkStatus && member.attendance_data && member.attendance_data.time_in) {
                $scope.selectedUser = member;
                return;
            }
            var to_send = {
                event_key: $stateParams.tag,
                user_key: member.key
            };
            if (!member.attendance_data) {
                member.attendance_data = {};
            }
            if (clear) {
                to_send.clear = true;
                member.attendance_data.time_in = "";
            } else {
                member.attendance_data.time_in = momentUTCTime();
            }
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/event/v1/check_in', to_send)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        member.timestamp_moment = moment();
                    } else {
                        console.log('ERROR: ', data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        };

        vm.checkOut = function(member, checkStatus, clear) {
            member.timestamp_moment = moment();
            if (checkStatus && member.attendance_data && member.attendance_data.time_out && member.attendance_data.time_in) {
                $scope.selectedUser = member;
                return;
            }
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
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/event/v1/check_out', to_send)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        member.timestamp_moment = moment();
                    } else {
                        console.log('ERROR: ', data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        };

        $scope.formatDate = function(date) {
            return momentInTimezone(date).format('MMM Do h:ss a');
        };

        $scope.back = function() {
            $location.path('app/events/' + $stateParams.tag);
        };
    }
]);
