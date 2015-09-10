App.controller('eventInfoController', ['$scope', 'RESTService', '$stateParams', '$rootScope', '$q', '$mdBottomSheet', '$mdDialog', '$timeout', '$location', 'Events', 'Directory', 'Session',
    function($cope, RESTService, $stateParams, $rootScope, $q, $mdBottomSheet, $mdDialog, $timeout, $location, Events, Directory, Session) {
        var vm = this;
        vm.eventNotFound = false;
        vm.loading = true;
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/event/v1/getEventInfo', {key: $stateParams.tag})
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
        vm.goToCheckinReport = function() {
            $location.path("app/events/" + $stateParams.tag + "/report");
        };
        vm.goToCheckin = function(){
            $location.path("app/events/" + $stateParams.tag + "/checkin");
        }
        vm.back = function() {
            $location.path('app/events');
        };

        this.openMenu = function($mdOpenMenu, ev) {
          $mdOpenMenu(ev);
        };

        vm.saveEvent = function() {
            /*BEGIN:VCALENDAR
                VERSION:2.0
                BEGIN:VEVENT
                DTEND;TZID=America/Chicago:20140709T110000
                SUMMARY:Test Event
                DTSTART;TZID=America/Chicago:20140709T100000
                DESCRIPTION:This is the description!
                END:VEVENT
                END:VCALENDAR*/
            var event = vm.event;
            var out_string = 'BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\n';
            out_string += 'DTSTART:' + moment(event.time_start).format('YYYYMMDDTHHmmss') + 'Z\n';
            out_string += 'DTEND:' + moment(event.time_end).format('YYYYMMDDTHHmmss') + 'Z\n';
            out_string += 'SUMMARY:' + event.title.replace(/(\r\n|\n|\r)/gm, " ") + '\n';
            if (event.address) {
                out_string += 'LOCATION:' + event.address + '\n';
            }
            if (event.description){
                out_string += 'DESCRIPTION:' + event.description.replace(/(\r\n|\n|\r)/gm, " ") + '\n';
            }
            out_string += 'END:VEVENT\nEND:VCALENDAR';
            var a = document.createElement('a');
            a.href = 'data:text/calendar,' + encodeURIComponent(out_string);
            a.target = '_blank';
            a.download = event.title.replace(/(\r\n|\n|\r)/gm, " ") + '.ics';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };

        vm.mapEvent = function() {
            if (vm.event.address) {
                return vm.event.address.split(' ').join('+');
            }
            return " ";
        };
        function setEventInfo(event){
            vm.event = event;
            if (vm.event.address) {
                vm.address_html = vm.event.address.split(' ').join('+');
            }
            if (vm.event.location) {
                vm.address_html = vm.event.location.split(' ').join('+');
            }
            vm.time_start = momentInTimezone(vm.event.time_start).format('MM/DD/YYYY hh:mm A');
            vm.time_end = momentInTimezone(vm.event.time_end).format('MM/DD/YYYY hh:mm A');
            vm.loading = false;
            vm.eventNotFound = false;
        }
        vm.editEvent = function() {
            $location.path('app/events/' + $stateParams.tag + '/edit');
        };
        vm.formatDate = function(date) {
            return moment(date).format('h:mma dddd, MMMM Do');
        };
        vm.eventDate = function(start_date, end_date) {
            var dayofstart = moment(start_date).format('MMM Do');
            var dayofend = moment(end_date).format('MMM Do');
            if (dayofstart == dayofend) {
                return dayofstart;
            } else {
                return dayofstart + ' \u2014 ' + dayofend;
            }
        };
    }
]);
