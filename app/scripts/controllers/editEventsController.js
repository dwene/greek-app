App.controller('editEventsController', ['$scope', 'RESTService', '$stateParams', '$rootScope', '$q', '$timeout', '$location', '$mdDialog', 'Directory', 'Events', 'GoogleMaps',
    function($scope, RESTService, $stateParams, $rootScope, $q, $timeout, $location, $mdDialog, Directory, Events, GoogleMaps) {
        $scope.loading = true;
        var vm = this;
        GoogleMaps.then(
          function(){
            $scope.mapsLoaded = true;
          }
        );
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/event/v1/getEvent', {key: $stateParams.tag})
            .success(function(data) {
                if(!RESTService.hasErrors(data)) {

                    vm.event = JSON.parse(data.data);
                    setEventInfo(vm.event);
                }
                else{
                    console.log('error', data);
                }
            })
            .error(function(data){
                console.log('error', data);
            });
        //prevent form from submitting on enter
        $('#newEvent').bind("keyup keypress", function(e) {
            var code = e.keyCode || e.which;
            if (code == 13) {
                e.preventDefault();
                return false;
            }
        });

        $scope.openDeleteEventModal = function() {
            $mdDialog.show({
                controller: ('DialogController', ['$scope', '$mdDialog', DialogController]),
                templateUrl: 'views/templates/deleteEventDialog.html'
            });
        }

        function DialogController($scope, $mdDialog) {
            $scope.delete = function() {
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/event/v1/delete', $stateParams.tag)
                    .success(function(data) {
                        $scope.loading = true;
                        if (!RESTService.hasErrors(data)) {
                            Events.deleteEvent($stateParams.tag);
                            $rootScope.$broadcast('events:updated');
                            $location.url('app/events');

                        }
                    });
                $mdDialog.hide();
            }
            $scope.cancelDialog = function() {
                $mdDialog.hide();
            }
        }
        $scope.deleteEvent = function() {
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/event/v1/delete', $stateParams.tag)
                .success(function(data) {
                    $scope.loading = true;
                    if (!RESTService.hasErrors(data)) {
                        Events.deleteEvent($stateParams.tag);
                        $rootScope.$broadcast('events:updated');
                        $location.url('app/events');

                    }
                });
        }
        var date_difference = 0;
        $scope.$watch('date_start', function() {
            if ($scope.date_start) {
                $scope.date_end = moment($scope.date_start).add(date_difference).format('MM/DD/YYYY');
                $timeout(function() {
                    $('.picker').trigger('change')
                });
            }
        });
        $scope.$watch('date_end', function() {
            if ($scope.date_start && $scope.date_end) {
                if (moment($scope.date_end, 'MM/DD/YYYY').diff($scope.date_start, 'MM/DD/YYYY') < 0) {
                    $scope.date_start = moment($scope.date_end).subtract(date_difference).format('MM/DD/YYYY');
                }
                date_difference = moment($scope.date_end, 'MM/DD/YYYY').diff($scope.date_start, 'MM/DD/YYYY');
                if ($scope.time_start) {
                    if (moment($scope.time_end, 'h:mm A').diff(moment($scope.time_start, 'h:mm A')) < 0) {
                        $scope.time_end = moment($scope.time_start, 'h:mm A').add('hours', 1).format('h:[00] A');
                    }
                }
            }
            $timeout(function() {
                $('.picker').trigger('change')
            });
        });
        $scope.$watch('time_start', function() {
            if ($scope.time_start) {
                if ($scope.date_start == $scope.date_end && moment($scope.time_end).diff($scope.time_start) <= 0) {
                    $scope.time_end = moment($scope.time_start, 'h:mm A').add('hours', 1).format('h:[00] A');
                }
            }
            $timeout(function() {
                $('.picker').trigger('change')
            });
        });
        $scope.$watch('time_end', function() {
            if ($scope.time_start) {
                if (moment($scope.time_end, 'h:mm A').diff(moment($scope.time_start, 'h:mm A')) < 0 && $scope.date_end == $scope.date_start) {
                    $scope.time_start = moment($scope.time_end, 'h:mm A').subtract('hours', 1).format('h:[00] A');
                }
            }
        });

        function setEventInfo(event) {
            $scope.event = event;
            vm.inputCalendar = {users: vm.event.invites, calendar: vm.event.calendar};
            $scope.time_start = momentInTimezone(vm.event.time_start).format('h:mm A');
            $scope.date_start = momentInTimezone(vm.event.time_start).format('MM/DD/YYYY');
            $scope.time_end = momentInTimezone(vm.event.time_end).format('h:mm A');
            $scope.date_end = momentInTimezone(vm.event.time_end).format('MM/DD/YYYY');
            $scope.loading = false;
            $timeout(function() {
                $('.picker').trigger('change')
            }, 200);
        }

        $scope.submitEdits = function(isValid) {
            if (isValid) {
                var to_send = JSON.parse(JSON.stringify($scope.event));
                to_send.time_start = momentUTCTime($scope.date_start + " " + $scope.time_start).format('MM/DD/YYYY hh:mm a');
                to_send.time_end = momentUTCTime($scope.date_end + " " + $scope.time_end).format('MM/DD/YYYY hh:mm a');
                if (moment(to_send.time_end).diff(moment(to_send.time_start)) < 0) {
                    return;
                }
                if ($scope.calendar){
                    to_send.calendar = $scope.calendar.key;
                }
                to_send.invites = [];
                if ($scope.individuals){
                    for (i = 0; i < $scope.individuals.length; i++){
                        to_send.invites.push($scope.individuals[i].key);
                    }
                }
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/event/v1/edit_event', to_send)
                    .success(function(data) {
                        if (!RESTService.hasErrors(data)) {
                            $location.url('app/events');
                        } else {
                            console.log('ERROR: ', data);
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ', data);
                    });
            }
        }
    }
]);