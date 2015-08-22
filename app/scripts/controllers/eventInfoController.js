App.controller('eventInfoController', ['$scope', 'RESTService', '$stateParams', '$rootScope', '$q', '$mdBottomSheet', '$mdDialog', '$timeout', '$location', 'Events', 'Directory', 'Session',
    function($scope, RESTService, $stateParams, $rootScope, $q, $mdBottomSheet, $mdDialog, $timeout, $location, Events, Directory, Session) {
        var vm = this;
        $scope.eventNotFound = false;
        $scope.loading = true;
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
        $scope.goToReport = function() {
            $location.url("app/events/" + $stateParams.tag + "/report");
        }
        $scope.back = function() {
            $location.path('app/events');
        }

        $scope.showEventoptions = function(event) {
            $mdDialog.show({
                templateUrl: 'views/templates/bottomDialog.html',
                controller: ('eventOptionsCtrl' ['$scope', '$mdBottomSheet', '$mdDialog', eventOptionsCtrl]),
                targetEvent: event
            });
        }

        function eventOptionsCtrl($scope, $mdBottomSheet, $mdDialog) {
            $scope.items = [{
                name: 'CHECKINS',
                icon: 'fa-sign-in'
            }, {
                name: 'REPORT',
                icon: 'fa-bar-chart'
            }, {
                name: 'EDIT',
                icon: 'fa-edit'
            }, {
                name: 'SAVE',
                icon: 'fa-floppy-o'
            }];
            $scope.itemClick = function(item) {
                switch (item.name) {
                    case 'CHECKINS':
                        $location.url("app/events/" + $stateParams.tag + "/checkin");
                        break;
                    case 'REPORT':
                        $location.url("app/events/" + $stateParams.tag + "/report");
                        break;
                    case 'EDIT':
                        $location.url('app/events/' + $stateParams.tag + '/edit');
                        break;
                    case 'SAVE':
                        saveEvent();
                        break;
                }
                $mdDialog.hide();
            }
            $scope.closeDialog = function() {
                $mdDialog.hide();
            }
        };



        function saveEvent() {
            /*BEGIN:VCALENDAR
                VERSION:2.0
                BEGIN:VEVENT
                DTEND;TZID=America/Chicago:20140709T110000
                SUMMARY:Test Event
                DTSTART;TZID=America/Chicago:20140709T100000
                DESCRIPTION:This is the description!
                END:VEVENT
                END:VCALENDAR*/
            var event = $scope.event;
            var out_string = 'BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\n';
            out_string += 'DTSTART:' + moment(event.time_start).format('YYYYMMDDTHHmmss') + 'Z\n';
            out_string += 'DTEND:' + moment(event.time_end).format('YYYYMMDDTHHmmss') + 'Z\n';
            out_string += 'SUMMARY:' + event.title.replace(/(\r\n|\n|\r)/gm, " ") + '\n';
            if (event.address) {
                out_string += 'LOCATION:' + event.address + '\n';
            }
            out_string += 'DESCRIPTION:' + event.description.replace(/(\r\n|\n|\r)/gm, " ") + '\n';
            out_string += 'END:VEVENT\nEND:VCALENDAR';
            var a = document.createElement('a');
            a.href = 'data:text/calendar,' + encodeURIComponent(out_string);
            a.target = '_blank';
            a.download = event.title.replace(/(\r\n|\n|\r)/gm, " ") + '.ics';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        $scope.mapEvent = function() {
            if ($scope.event.address) {
                return $scope.event.address.split(' ').join('+');
            }
            return " ";
        }
        function setEventInfo(event){
            $scope.event = event;
            if ($scope.event.address) {
                $scope.address_html = $scope.event.address.split(' ').join('+');
            }
            if ($scope.event.location) {
                $scope.address_html = $scope.event.location.split(' ').join('+');
            }
            $scope.time_start = momentInTimezone($scope.event.time_start).format('MM/DD/YYYY hh:mm A');
            $scope.time_end = momentInTimezone($scope.event.time_end).format('MM/DD/YYYY hh:mm A');
            $scope.loading = false;
            $scope.eventNotFound = false;
        }
        $scope.editEvent = function() {
            $location.path('#/app/events/' + $stateParams.tag + '/edit');
        }
        $scope.formatDate = function(date) {
            return moment(date).format('h:mma dddd, MMMM Do');
        }
        $scope.eventDate = function(start_date, end_date) {
            var dayofstart = moment(start_date).format('MMM Do');
            var dayofend = moment(end_date).format('MMM Do');
            if (dayofstart == dayofend) {
                return dayofstart;
            } else {
                return dayofstart + ' \u2014 ' + dayofend
            }
        }
    }
]);