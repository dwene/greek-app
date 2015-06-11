App.controller('eventsController', ['$scope', 'RESTService', '$rootScope', '$location', 'localStorageService', 'Events', 'Directory',
    function($scope, RESTService, $rootScope, $location, localStorageService, Events, Directory) {
        Events.get();
        Directory.get();
        routeChange();
        $scope.dataLoaded = false;
        $scope.directory = Directory.directory;
        $scope.events = Events.events;
        $scope.$watchCollection('[directoryLoaded, eventsLoaded]', function() {
            if ($scope.directoryLoaded && $scope.eventsLoaded) {
                $scope.dataLoaded = true;
            }
        });
        if (Events.check()) {
            getEvents();
        }
        $scope.change = function() {
            if ($scope.selectedTab == 0) {
                $scope.present = true;
            } else {
                $scope.present = false;
            }
        }
        $scope.$on('events:updated', function() {
            $scope.events = Events.events;
            getEvents();
        })
        if (Directory.check()) {
            $scope.directoryLoaded = true;
        }

        $scope.$on('directory:updated', function() {
            $scope.directory = Directory.directory;
            $scope.directoryLoaded = true;
        });

        $scope.$watch('selectedTab', function() {
            console.log('I see tab change!');
            if ($scope.selectedTab == 0) {
                $scope.order = 'time_start';
            } else {
                $scope.order = '-time_start';
            }
        })
        //send the organization and user date from registration pages
        function getEvents() {
            $scope.eventSource = [];
            for (var i = 0; i < $scope.events.length; i++) {
                $scope.eventSource.push({
                    title: $scope.events[i].title,
                    startTime: new Date(momentInTimezone($scope.events[i].time_start)),
                    endTime: new Date(momentInTimezone($scope.events[i].time_end)),
                    key: $scope.events[i].key
                });
            }
            $scope.eventsLoaded = true;
        }

        $scope.getNameFromKey = function(key) {
            if ($scope.directory.members) {
                for (var i = 0; i < $scope.directory.members.length; i++) {
                    if ($scope.directory.members[i].key == key) {
                        return $scope.directory.members[i].first_name + ' ' + $scope.directory.members[i].last_name;
                    }
                }
            }
            return 'Unknown';
        }
        $scope.showDate = function(start, end) {
            var mStart = momentInTimezone(start);

            if (mStart.diff(moment()) > 0) {
                return mStart.calendar();
            }
            var mEnd = momentInTimezone(end);
            if (mStart.diff(moment()) < 0 && mEnd.diff(moment()) > 0) {
                return 'Happening Now';
            }
            if (mEnd.diff(moment()) < 0) {
                return 'Already Happened';
            }
        }
        $scope.showEvent = function(event) {
            $location.path('app/events/' + event.key);
        }
        $scope.$watch('search', function() {
            if ($scope.current) {
                $scope.current.currentPage = 0;
                if ($scope.search) {
                    $scope.present = undefined;
                } else {
                    $scope.present = true;
                }
            }
        })
    }
]);