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
                console.log('page is loading');
                if (Directory.check()) {
                    $scope.getMembers();
                } else {
                    $scope.getMembers();
                }
            }
            onPageLoad();

            $scope.submitMembers = function() {
                $scope.updating = "pending";
                var data_tosend = {
                    users: $scope.adds
                };
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/auth/v1/add_users', data_tosend)
                    .success(function(data) {
                        if (!RESTService.hasErrors(data)) {
                            var users = JSON.parse(data.data);
                            console.log('Here are the new users!', users);
                            $scope.directory.members = $scope.directory.members.concat(users);
                            $scope.adds = [];
                            Directory.set($scope.directory);

                        } else {
                            $scope.updating = "broken";
                            console.log('ERROR: ', data);
                        }
                    })
                    .error(function(data) {
                        $scope.updating = "broken";
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

            //reads the file as it's added into the file input

            //this function takes the CSV, converts it to JSON and outputs it
            $scope.addMembers = function() {

                //check to see if file is being read
                if (filecontents == null) {
                    //do nothing
                    alert('you have not selected a file');
                } else {
                    //converts CSV file to array of usable objects
                    var csvMemberList = CSV2ARRAY(filecontents);
                    console.log(csvMemberList);
                    checkEmail = function(email) {
                        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        return re.test(email);
                    }
                    var new_item_list = [];
                    for (var i = 0; i < csvMemberList.length; i++) {
                        var item = csvMemberList[i];
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