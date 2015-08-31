    App.controller('addMembersController', ['$scope', 'RESTService', '$rootScope', 'localStorageService', 'Directory',
        function($scope, RESTService, $rootScope, localStorageService, Directory) {

            $scope.adds = [];
            var formObject = document.getElementById('uploadMembers');
            if (formObject) {
                formObject.addEventListener('change', readSingleFile, false);
            }
            var filecontents;

            //this method will get the data from the form and add it to the newmemberList object
            $.fn.serializeObject = function() {
                var o = {};
                var a = this.serializeArray();

                $.each(a, function() {
                    if (o[this.name] !== undefined) {
                        if (!o[this.name].push) {
                            o[this.name] = [o[this.name]];
                        }
                        o[this.name].push(this.value || '');
                    } else {
                        o[this.name] = this.value || '';
                    }
                });
                return o;
            };

            //remove someone from list before adding everyone
            $scope.deleteAdd = function(add) {
                var index = $scope.adds.indexOf(add);
                $scope.adds.splice(index, 1);
            }

            //ng-click for the form to add one member at a time        
            $scope.addMember = function(isValid) {
                if (isValid) {
                    $scope.adds = $scope.adds.concat($scope.input);
                    //$('#result').text(JSON.stringify(newmemberList));
                    //define variable for ng-repeat
                    $scope.input = {};
                    $scope.addmemberForm.$setPristine();
                } else {
                    $scope.submitted = true;
                }
            };


            $scope.getMembers = function() {
                $scope.directory = Directory.directory;
            }

            if (Directory.check()) {
                $scope.getMembers();
            } else {
                $scope.$on('directory:updated', function() {
                    $scope.getMembers();
                });
            }

            function onPageLoad() {
                if (Directory.check()) {
                    $scope.getMembers();
                } else {
                    $scope.getMembers();
                }
            }
            onPageLoad();

            $scope.submitMembers = function() {
                var data_tosend = {
                    users: $scope.adds
                };
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/auth/v1/add_users', data_tosend)
                    .success(function(data) {
                        if (!RESTService.hasErrors(data)) {
                            var users = JSON.parse(data.data);
                            $scope.directory.members = $scope.directory.members.concat(users);
                            $scope.adds = [];
                            Directory.set($scope.directory);

                        } else {
                            console.log('ERROR: ', data);
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ', data);
                    });

            }

            //this function sets up a filereader to read the CSV
            function readSingleFile(evt) {
                //Retrieve the first (and only!) File from the FileList object
                var f = evt.target.files[0];

                if (f) {
                    var r = new FileReader();
                    r.onload = function(e) {
                        filecontents = e.target.result;
                    }
                    r.readAsText(f);

                } else {
                    alert("Failed to load file");
                }
            }


            // Source: http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
            // function CSVReader(strData, strDelimiter) {
            //     // Check to see if the delimiter is defined. If not,
            //     // then default to comma.
            //     debugger;
            //     strDelimiter = (strDelimiter || ",");
            //     // Create a regular expression to parse the CSV values.
            //     var objPattern = new RegExp((
            //         // Delimiters.
            //         "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
            //         // Quoted fields.
            //         "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
            //         // Standard fields.
            //         "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
            //     // Create an array to hold our data. Give the array
            //     // a default empty first row.
            //     var arrData = [
            //         []
            //     ];
            //     // Create an array to hold our individual pattern
            //     // matching groups.
            //     var arrMatches = null;
            //     // Keep looping over the regular expression matches
            //     // until we can no longer find a match.
            //     while (arrMatches == objPattern.exec(strData)) {
            //         // Get the delimiter that was found.
            //         var strMatchedDelimiter = arrMatches[1];
            //         // Check to see if the given delimiter has a length
            //         // (is not the start of string) and if it matches
            //         // field delimiter. If id does not, then we know
            //         // that this delimiter is a row delimiter.
            //         if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
            //             // Since we have reached a new row of data,
            //             // add an empty row to our data array.
            //             arrData.push([]);
            //         }
            //         // Now that we have our delimiter out of the way,
            //         // let's check to see which kind of value we
            //         // captured (quoted or unquoted).
            //         if (arrMatches[2]) {
            //             // We found a quoted value. When we capture
            //             // this value, unescape any double quotes.
            //             var strMatchedValue = arrMatches[2].replace(
            //                 new RegExp("\"\"", "g"), "\"");
            //         } else {
            //             // We found a non-quoted value.
            //             var strMatchedValue = arrMatches[3];
            //         }
            //         // Now that we have our value string, let's add
            //         // it to the data array.
            //         arrData[arrData.length - 1].push(strMatchedValue);
            //     }
            //     // Return the parsed data.
            //     return (arrData);
            // }
            // function CSV2ARRAY(csv) {
            //     debugger;
            //     var array = CSVReader(csv);
            //     var objArray = [];
            //     for (i = 1; i < array.length; i++) {
            //         objArray[i - 1] = {};
            //         for (var k = 0; k < array[0].length && k < array[i].length; k++) {
            //             var key = array[0][k];
            //             objArray[i - 1][key] = array[i][k];
            //         }
            //     }

            //     var json = JSON.stringify(objArray);
            //     //    console.log(json);
            //     var str = json.replace(/},/g, "},\r\n");

            //     return JSON.parse(str);
            // }

            //reads the file as it's added into the file input

            //this function takes the CSV, converts it to JSON and outputs it
            $scope.addMembers = function() {

                //check to see if file is being read
                if (filecontents == null) {
                    //do nothing
                    alert('you have not selected a file');
                } else {
                    //converts CSV file to array of usable objects
                    var listCSV = Papa.parse(filecontents).data;
                    console.log(listCSV);
                    var columnNames = listCSV[0];
                    var newMembersList = [];
                    for (var i = 1; i < listCSV.length; i++){
                        var newMember = {};
                        for (var j = 0; j < columnNames.length; j++){
                            newMember[columnNames[j]] = listCSV[i][j];
                        }
                        newMembersList.push(newMember);
                    }
                    console.log(newMembersList);
                    checkEmail = function(email) {
                        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        return re.test(email);
                    }
                    var new_item_list = [];
                    for (var i = 0; i < newMembersList.length; i++) {
                        var item = newMembersList[i];
                        var new_item = {};
                        if (item['First']) {
                            new_item.first_name = item['First'];
                        }
                        if (item['Last']) {
                            new_item.last_name = item['Last'];
                        }
                        if (item['Pledge Year']) {
                            new_item.pledge_class_year = item['Pledge Year'];
                        }
                        if (item['Pledge Semester']) {
                            new_item.pledge_class_semester = item['Pledge Semester'];
                        }
                        if (item['Email']) {
                            new_item.email = item['Email'];
                        }
                        if (!new_item.email || !new_item.first_name || !new_item.last_name || !new_item.pledge_class_year || !new_item.pledge_class_semester) {
                            continue;
                        }
                        if (!checkEmail(new_item.email)) {
                            $scope.memberSkippedNotifier = true; //shows warning that not all members added correctly
                            continue;
                        }
                        new_item_list.push(new_item);
                    }
                    $scope.adds = $scope.adds.concat(new_item_list);
                    $('#uploadMembers').wrap('<form>').parent('form').trigger('reset');
                    $('#uploadMembers').unwrap();
                    $('#uploadMembers').trigger('change');
                    filecontents = null;

                }
            };
        }
    ])