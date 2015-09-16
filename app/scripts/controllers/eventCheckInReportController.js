App.controller('eventCheckInReportController', ['$scope', 'RESTService', '$stateParams', '$location', '$rootScope', '$filter', 'Directory', 'Events',
    function($scope, RESTService, $stateParams, $location, $rootScope, $filter, Directory, Events) {
        var vm = this;
        var event_key = $stateParams.tag;
        vm.back = function() {
            $location.path('app/events/'+event_key);
        };
        $scope.maxLength = 0;
        $scope.maxNoShowsLength = 0;
        $scope.loading = true;
        $scope.shows = [];
        Directory.get();
        Events.get();
        $scope.increaseMaxLength = function() {
            if ($scope.users && $scope.shows) {
                if ($scope.maxLength < $scope.users.length) {
                    $scope.maxLength += 20;
                    $scope.maxNoShowsLength = ($scope.maxLength - $scope.shows.length) > 0 ? ($scope.maxLength - $scope.shows.length) : 0;
                }
            }
        }
        $scope.$watch('search', function() {
            if ($scope.search) {
                $scope.maxNoShowsLength = 10;
                $scope.maxLength = 10;
            } else {
                $scope.maxLength = 20;
                $scope.maxNoShowsLength = ($scope.maxLength - $scope.shows.length) > 0 ? ($scope.maxLength - $scope.shows.length) : 0;
            }
        });

        $scope.getProfPic = function(link) {
            if (link) {
                return link + '=s50';
            } else {
                return $rootScope.defaultProfilePicture;
            }
        }
        // Load.then(function(){
        $scope.directory = Directory.directory;
        $scope.events = Events.events;
        $scope.$on('events:updated', function() {
            $scope.events = Events.events;
            getCheckInData();
        });
        $scope.$on('directory:updated', function() {
            $scope.directory = Directory.directory;
            getCheckInData();
        });
        getCheckInData();

        function getCheckInData() {
            if ($scope.directory == null || $scope.events == null) {
                return;
            }
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/event/v1/get_check_in_info', $stateParams.tag)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        var parsed = JSON.parse(data.data);

                        $scope.users = parsed.users;
                        $scope.event = parsed.event;
                        for (var i = 0; i < $scope.events.length; i++) {
                            if ($scope.events[i].key == $stateParams.tag) {
                                $scope.event = $scope.events[i];
                            }
                        }
                        $scope.noShows = [];
                        $scope.shows = [];
                        if ($scope.event) {
                            for (var i = 0; i < $scope.users.length; i++) {
                                var shouldAdd = false;
                                if (!$scope.users[i].attendance_data) {
                                    shouldAdd = true;
                                } else if (!($scope.users[i].attendance_data.time_in || $scope.users[i].attendance_data.time_out)) {
                                    shouldAdd = true;
                                }
                                if (shouldAdd) {
                                    $scope.noShows.push($scope.users[i]);
                                } else if (!shouldAdd) {
                                    $scope.shows.push($scope.users[i]);
                                }
                            }
                        }
                        $scope.loading = false;
                        $scope.maxLength = 20;
                        $scope.maxNoShowsLength = ($scope.maxLength - $scope.shows.length) > 0 ? ($scope.maxLength - $scope.shows.length) : 0;
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
        //            $scope.generateReport(){
        //                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/event/v1/get_check_in_info', packageForSending($stateParams.tag))
        //                .success(function(data){
        //                    if (!checkResponseErrors(data)){
        //                        users = JSON.parse(data.data);
        //                        $scope.loading = false;
        //                        createReport();
        //                    }
        //                    else{
        //                        console.log('ERROR: ',data);
        //                        $scope.eventNotFound = true;
        //                        $scope.loading = false;
        //                    }
        //                })
        //                .error(function(data) {
        //                    console.log('Error: ' , data);
        //                    $scope.loading = false;
        //                    $scope.eventNotFound = true;
        //                });
        //            }


        $scope.createReport = function(users) {
            var doc = new jsPDF();
            if (!users) {
                users = $scope.users;
            }
            users = $filter('orderBy')(users, "last_name");
            // We'll make our own renderer to skip this editor
            var specialElementHandlers = {
                '#editor': function(element, renderer) {
                    return true;
                }
            };
            var pageNumber = 1;
            doc.setFontSize(10);

            function newPage() {
                doc.addImage(NeteGreekLogo, 'PNG', 187, 5, 15, 14);
                doc.text(20, 14, 'Report for #' + $stateParams.tag);
                doc.text(188, 288, 'Page ' + pageNumber);
            }
            newPage();
            var originalCurrentLine = true;
            var current_line = 42;
            doc.setFontSize(23);
            var centeredText = function(text, y) {
                var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
                var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
                doc.text(textOffset, y, text);
            }
            centeredText('Report for #' + $stateParams.tag, 30);
            //                doc.text(56, 30, 'Report for #'+ $stateParams.tag);
            doc.setFontSize(18);
            doc.text(30, 40, 'Attendees');
            var shifted = 20;

            for (var i = 0; i < users.length; i++) {
                if (users[i].attendance_data) {
                    if (users[i].attendance_data.time_in || users[i].attendance_data.time_out) {
                        doc.setFontSize(13);
                        doc.text(10 + shifted, current_line += 8, users[i].first_name + ' ' + users[i].last_name);
                        doc.setFontSize(10);
                        if (users[i].attendance_data.time_in) {
                            doc.text(15 + shifted, current_line += 5, 'Time in:  ' + ' ' + $scope.formatDate(users[i].attendance_data.time_in));
                        }
                        if (users[i].attendance_data.time_out) {
                            doc.text(15 + shifted, current_line += 5, 'Time out: ' + $scope.formatDate(users[i].attendance_data.time_out));
                        }
                        if (users[i].attendance_data.time_in && users[i].attendance_data.time_out) {
                            doc.text(15 + shifted, current_line += 5, 'Duration: ' + $scope.timeDifference(users[i].attendance_data.time_in, users[i].attendance_data.time_out));
                        }
                    }
                }
                current_line += 0;
                if (current_line > 250 && shifted > 20) {
                    current_line = 20;
                    shifted = 20;
                    pageNumber++;
                    doc.addPage();
                    newPage();
                } else if (current_line > 250) {
                    if (originalCurrentLine) {
                        current_line = 30;
                        originalCurrentLine = false;
                    } else {
                        current_line = 20;
                    }
                    shifted = 110;
                }
            }
            if ($scope.noShows.length) {
                if (current_line > 200) {
                    if (shifted > 20) {
                        current_line = 20;
                        shifted = 20;
                        pageNumber++;
                        doc.addPage();
                        newPage();
                    } else {
                        if (originalCurrentLine) {
                            current_line = 26;
                            originalCurrentLine = false;
                        } else {
                            current_line = 20;
                        }
                        shifted = 110;
                    }
                }
                doc.setFontSize(18);
                current_line += 5;
                doc.text(10 + shifted, current_line += 12, 'No Shows');
                var noShowsOrganized = $filter('orderBy')($scope.noShows, 'user.last_name');

                for (var i = 0; i < noShowsOrganized.length; i++) {
                    doc.setFontSize(12);
                    doc.text(10 + shifted, current_line += 8, noShowsOrganized[i].user.first_name + ' ' + noShowsOrganized[i].user.last_name + ' - ' + noShowsOrganized[i].rsvp);
                    if (current_line > 250 && shifted > 20) {
                        current_line = 20;
                        shifted = 20;
                        pageNumber++;
                        doc.addPage();
                        newPage();

                    } else if (current_line > 250) {
                        if (originalCurrentLine) {
                            current_line = 40;
                            originalCurrentLine = false;
                        } else {
                            current_line = 20;
                        }
                        shifted = 110;
                    }
                }
            }

            //                doc.text(20, 20, 'Do you like that?');
            // All units are in the set measurement for the document
            // This can be changed to "pt" (points), "mm" (Default), "cm", "in"
            //                doc.fromHTML($('#report').get(0), 15, 15, {
            //                    'width': 170, 
            //                    'elementHandlers': specialElementHandlers
            //                });
            doc.output('dataurlnewwindow');
        }
        $scope.formatDate = function(date) {
            return momentInTimezone(date).format('lll');
        }

        $scope.downloadCSV = function() {
            var users = $filter('orderBy')($scope.users, 'last_name');
            var out = [
                ['"Last%20Name"', '"First%20Name"', '"Date%20In"', '"Time%20In"', '"Date%20Out"', '"Time%20Out"']
            ];
            //datetime format yyyy-mm-dd hh:mm:ss
            for (var i = 0; i < users.length; i++) {
                var time_in = '';
                var time_out = '';
                var date_in = '';
                var date_out = '';
                if (users[i].attendance_data) {
                    if (users[i].attendance_data.time_in) {
                        var val = moment(momentInTimezone(users[i].attendance_data.time_in));
                        time_in = val.format('hh:mm a');
                        date_in = val.format('MM/DD/YYYY');
                    }
                    if (users[i].attendance_data.time_out) {
                        var val2 = moment(momentInTimezone(users[i].attendance_data.time_out));
                        time_out = val2.format('hh:mm a');
                        date_out = val2.format('MM/DD/YYYY');
                    }
                }
                var checkList = ['last_name', 'first_name', 'date_in', 'date_out', 'time_in', 'time_out'];

                for (var j = 0; j < checkList.length; j++){
                    if (!users[i][checkList[j]]){
                        users[i][checkList[j]] = "";
                    }
                }
                out.push([users[i].last_name.replaceAll(' ', '%20'), users[i].first_name.replaceAll(' ', '%20'), date_in.replaceAll(' ', '%20'), time_in.replaceAll(' ', '%20'), date_out.replaceAll(' ', '%20'), time_out.replaceAll(' ', '%20')]);
            }

            var csvRows = [];

            for (var i = 0, l = out.length; i < l; ++i) {
                csvRows.push(out[i].join(','));
            }

            var csvString = csvRows.join("%0A");
            var a = document.createElement('a');
            a.href = 'data:attachment/csv,' + csvString;
            a.target = '_blank';
            a.download = $stateParams.tag + '.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        $scope.timeDifference = function(start, end) {
            var mStart = moment(start);
            var mEnd = moment(end);
            var hours = mEnd.diff(mStart, 'hours');
            var intermediate = mEnd.subtract(hours, 'hours');
            var minutes = intermediate.diff(mStart, 'minutes');
            return hours + ':' + ("0" + minutes).slice(-2);
        }
    }
]);