//Final/static variables
TEMP_PROF_PIC="http://storage.googleapis.com/greek-app.appspot.com/smiley-face-text.jpg";


//initialize app
var App = angular.module('App', ['ngRoute']);

    App.factory('formDataObject', function() {
            return function(data) {
                var fd = new FormData();
                angular.forEach(data, function(value, key) {
                    fd.append(key, value);
                });
                return fd;
            };
        });

//define routes and link to their controllers
	App.config( function ($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl : 'Static/home.html',
				controller  : 'homeController'
			})
			.when('/login', {

				templateUrl : 'Static/login.html',
				controller  : 'loginController'
			})
			.when('/register', {
				templateUrl : 'Static/register.html',
				controller  : 'registerController'
			})
            .when('/registerinfo', {
				templateUrl : 'Static/registerinfo.html',
				controller  : 'registerinfoController'
			})
            .when('/payment', {
				templateUrl : 'Static/payment.html',
				controller  : 'paymentController'
			})
			.when('/app', {
				templateUrl : 'Static/app.html',
				controller  : 'appController'
			})
            .when('/app/managemembers', {
				templateUrl : 'Static/managemembers.html',
				controller  : 'managemembersController'
			})
            .when('/newmember', {
                templateUrl : 'Static/newmember.html',
                controller : 'newmemberController'
            })
            .when('/incorrectperson', {
                templateUrl : 'Static/incorrectperson.html',
                controller : 'incorrectpersonController'
            })
            .when('/newmemberinfo', {
                templateUrl : 'Static/newmemberinfo.html',
                controller : 'newmemberinfoController'
            })
            .when('/app/accountinfo', {
                templateUrl : 'Static/accountinfo.html',
                controller : 'accountinfoController'
            })
            .when('/app/uploadprofilepicture', {
                templateUrl : 'Static/uploadprofilepicture.html',
                controller : 'profilepictureController'  
            })
            .when('/app/directory', {
                templateUrl : 'Static/directory.html',
                controller : 'directoryController'  
            })
            .when('/app/directory/user/:id', {
                templateUrl : 'Static/memberprofile.html',
                controller : 'memberprofileController'  
            })
            .when('/app/postNewKeyPictureLink', {
                templateUrl : 'Static/memberprofile.html',
                controller : 'uploadImageController'
            })
            .when('/forgotpassword', {
                templateUrl : 'Static/forgot_password.html',
                controller : 'forgotPasswordController'
            })
            .when('/changepasswordfromtoken', {
                templateUrl : 'Static/change_password.html',
                controller : 'changePasswordFromTokenController'
            })
            .when('/app/changepassword', {
                templateUrl : 'Static/change_password.html',
                controller : 'changePasswordController'
            })
            .otherwise({
                redirectTo: '/'
            });
	});

//controller for the navigation header
    App.controller('navigationController', function($scope, $http){
        $scope.checkLogin = function(){
            return checkLogin();
        }
        
        $scope.logout = function(){
                $.removeCookie('USER_NAME');
                $.removeCookie('TOKEN');
                window.location.replace("/#/login");
         }
    });


//controller for the home page
    App.controller('homeController', function($scope, $http) {
        
	});


//controller for the login page
	App.controller('loginController', function($scope, $http) {

        $scope.login = function(user_name, password) {
        console.log(user_name + ' ' +password)
        $http.post('/_ah/api/netegreek/v1/auth/login', packageForSending({user_name: user_name, password: password}))
            .success(function(data) {
                if(!checkResponseErrors(data))
                {
                    $.cookie('USER_NAME', user_name);
                    $.cookie('TOKEN', data.data);
                    window.location.replace("/#/app");
                }
                else{
                
                    if (data.error == "BAD_LOGIN"){
                        $scope.badLogin = true;
                    }
                    
                }
                //debug credentials user:jakeruesink pass:jakeiscool

            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        };

        $scope.forgotPassword = function(){
        window.location.replace('/#/forgotpassword'); 
        }
        
    });
    
    App.controller('forgotPasswordController', function($scope, $http) {
        $scope.sentEmail = false;
        $scope.reset = function(email, user_name) {
            if (email === undefined){
                email = '';
            }
            to_send = {email: email, user_name: user_name}
            console.log(to_send);
            $http.post('/_ah/api/netegreek/v1/auth/forgot_password', packageForSending(to_send))
            .success(function(data) {
                if(!checkResponseErrors(data)){
                    $scope.sentEmail = true;
                }
                else{
                    $scope.emailFailed = true;
                }
            })
            .error(function(data) {
                console.log('Error: ' + data);
                $scope.emailFailed = true;
            });

        
        }
    });

    App.controller('changePasswordFromTokenController', function($scope, $http) {
        $.cookie('TOKEN', getParameterByName('token'));
        $scope.passwordChanged = false;
        $scope.changeFailed = false;
        
        $scope.changePassword = function(password) {
            $http.post('/_ah/api/netegreek/v1/auth/change_password_from_token', packageForSending({password: password}))
            .success(function(data) {
                if(!checkResponseErrors(data)){
                    console.log(data)
                    $scope.passwordChanged = true;
                    $scope.changeFailed = false;
                    $scope.user_name = data.data;
                }
                else{
                    console.log('Error: ' + data);
                    $scope.changeFailed = true;
                    $scope.passwordChanged = false;
                }
            })
            .error(function(data) {
                console.log('Error: ' + data);
                $scope.changeFailed = true;
                $scope.passwordChanged = false;
            });            
            
        }
        
    });

App.controller('changePasswordController', function($scope, $http) {
        $scope.passwordChanged = false;
        $scope.changeFailed = false;
        
        $scope.changePassword = function(password) {
            $http.post('/_ah/api/netegreek/v1/auth/change_password', packageForSending({password: password}))
            .success(function(data) {
                if(!checkResponseErrors(data)){
                    $scope.passwordChanged = true;
                    $scope.changeFailed = false;
                    $scope.user_name = data.data;
                }
                else{
                    console.log('Error: ' + data);
                    $scope.changeFailed = true;
                    $scope.passwordChanged = false;
                }
            })
            .error(function(data) {
                console.log('Error: ' + data);
                $scope.changeFailed = true;
                $scope.passwordChanged = false;
            });            
            
        }
        
    });


//controller for the registration page
    App.controller('registerController', function($scope, $http) {
        //this page passes parameters through a get method to register info
    });

//controller for the register info page
    App.controller('registerinfoController', function($scope, $http) {
    
        //ng-submit on form submit button click
        $scope.registerinfoClick = function(item, isValid){
            
        if(isValid){
            
            //define organization based on parameters passed from registration page
                var organization = {name: getParameterByName('org_name'), school: getParameterByName('org_school'), type:getParameterByName('org_type')}
                //it would be great if we could add validation here to see if the organization information was correctly added from the previous page
    //            if(organization.name === null || organization.school === null || organization.type === null){
    //                window.location.replace("/#/register");
    //            }
                //format data for the api
                console.log(item);
                data_tosend = {organization: organization, user: item}
                
                console.log(packageForSending(data_tosend));
                
                //send the organization and user date from registration pages
                $http.post('/_ah/api/netegreek/v1/auth/register_organization', packageForSending(data_tosend))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        console.log(data);
                        window.location.replace("/#/payment");
                        $.cookie("TOKEN",  data.data);
                        $.cookie("USER_NAME", data_tosend.user.user_name);
                    }
                    else
                        console.log('ERROR: '+data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
                
        }
            else{
            //for validation purposes
            $scope.submitted = true;
            }
        
        };
    
	});

//controller for the payment page
    App.controller('paymentController', function($scope, $http) {
        //skip payment page right now
        $scope.submitPayment = function(){
            window.location.replace("/#/app/managemembers");
        };
        
    });

//controller for the main app page
    App.controller('appController', function($scope, $http) {
        
//        if(!checkLogin()){
//        window.location.replace("/#/login");
//        }
        
	});

//controller for the add members page
    App.controller('managemembersController', function($scope, $http) {
        
        //TABS
        $('#managemembersTabs a').click(function (e) {
          e.preventDefault()
          $(this).tab('show')
          $scope.getMembers();
        });
        
        //MANAGE MEMBERS TAB
        
        //this goes inside the HTTP request
        //$scope.members = JSON.parse(data);
		//console.log($scope.members)
        
        $scope.deleteAdd = function(add){
              var index=$scope.adds.indexOf(add)
              $scope.adds.splice(index,1);     
        }
        
        //ADD MEMBERS TAB
        
        //initialize a member array
        var newmemberList = [];
        //initialize a filecontents variable
        var filecontents;
        
        //this method will get the data from the form and add it to the newmemberList object
        $.fn.serializeObject = function()
        {
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
    
        //ng-click for the form to add one member at a time
        
        
        
        $scope.addMember = function(){
            newmemberList = newmemberList.concat($('#addmemberForm').serializeObject());
            $('#result').text(JSON.stringify(newmemberList));
            //define variable for ng-repeat
            $scope.adds = newmemberList;
        };
        
        
        
        
        $scope.getMembers = function(){
            $http.post('/_ah/api/netegreek/v1/auth/get_users', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    console.log(data);
                    $scope.members = JSON.parse(data.data)
                }
                else
                    console.log('ERROR: '+data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        
        }
        $scope.getMembers();
        
        
        $scope.removeMember = function(user){
            $http.post('/_ah/api/netegreek/v1/auth/remove_user', packageForSending(user))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    var index=$scope.members.indexOf(user);
                    $scope.members.splice(index,1); 
                }
                else
                    console.log('ERROR: '+data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        
        }
        
        
        $scope.submitMembers = function(){
            
            var data_tosend = {users: newmemberList};
            $http.post('/_ah/api/netegreek/v1/auth/add_users', packageForSending(data_tosend))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    console.log(data);
                    newmemberList = [];
                    $("#result").text('');
                    $('#areAdded').text("members have been added");
                }
                else
                    console.log('ERROR: '+data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
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
        document.getElementById('uploadMembers').addEventListener('change', readSingleFile, false);
        
       //this function takes the CSV, converts it to JSON and outputs it
        $scope.addMembers = function(){
            
            //check to see if file is being read
            if(filecontents == null){
             //do nothing
            alert('you have not selected a file');
            }
            else{
                //converts CSV file to JSON
            
                
                var list1 = JSON.parse(CSV2JSON(filecontents));
                    console.log(list1);
                    console.log(newmemberList);
                    
                newmemberList = newmemberList.concat(list1);
                //outputs object to result
                $('#result').text(JSON.stringify(newmemberList));
                //define variable for ng-repeat
                $scope.adds = newmemberList;
            }
            
        };
    
    });

//controller for new member page
    App.controller('newmemberController', function($scope, $http){
        $('.container').hide();
        $.cookie('TOKEN', getParameterByName('token'))
        console.log(getParameterByName('token'));
        $http.post('/_ah/api/netegreek/v1/auth/new_user', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    console.log(data.data);
                    $scope.user = JSON.parse(data.data);
                    $('.container').fadeIn();
                }
                else
                    console.log('ERROR: '+data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        
        $scope.correctPerson = function(){
            window.location.replace("/#/newmemberinfo");
        }
        $scope.incorrectPerson = function(){
            window.location.replace("/#/incorrectperson");
        }
    });

//controller for incorrect person page
    App.controller('incorrectpersonController', function($scope, $http){
    
    });

//controller for new member info page
    App.controller('newmemberinfoController', function($scope, $http){
        $scope.user_is_taken = false;
        $scope.waiting_for_response = false;
        $scope.createAccount = function(){
            $scope.waiting_for_response = true;
            var to_send = {user_name: $scope.item.user_name, password: $scope.item.password}
            $http.post('/_ah/api/netegreek/v1/auth/register_credentials', packageForSending(to_send))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    console.log(data.data);
                    $.cookie('TOKEN',data.data);
                    $.cookie('USER_NAME', $scope.item.user_name);
                    window.location.replace("/#/app/accountinfo");
                }
                else
                {
                    if(data.error == "INVALID_USERNAME")
                    {
                        $scope.user_is_taken = true;
                    }
                    console.log('ERROR: '+data);
                }
                
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
            //now logged in
        $scope.waiting_for_response = false;
        }
        
    });


    App.controller('profilepictureController', function($scope, $http){
        $http.post('/_ah/api/netegreek/v1/user/get_upload_url', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $("#profilePic").attr("action", data.data);
                    $scope.url = data.data;
                }
                else
                {
                    console.log("Error" + data.error)
                }
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        

        
        //initialize profile image variable
        var newprofileImage;
        
        //this function sets up a filereader to read the CSV
//            function readImage(evt) {
//                //Retrieve the first (and only!) File from the FileList object
//                var f = evt.target.files[0]; 
//    
//                if (f) {
//                  var r = new FileReader();
//                  r.onload = function(e) { 
//                      newprofileImage = e.target.result;
//                  }
//                    
//                } else { 
//                  alert("Failed to load file");
//                }
//            }
        
        //reads the file as it's added into the file input
        
        $scope.uploadFile = function(files) {
            newprofileImage = new FormData();
            //Take the first selected file
            newprofileImage.append("file", files[0]);
        }
        
        
        $scope.uploadPicture = function(){
            
            console.log(newprofileImage);
            $http.post($scope.url, newprofileImage, {
                headers: {'Content-Type': undefined},
                transformRequest: angular.identity,
                })
            .success(function(data){
                console.log("success");
                console.log(data);
            })
            .error(function(data) {
                console.log("failure");
                console.log(data);
            });
        }
    });
//        
//        $scope.create = function(message){
//            console.log(message);
//            var deferred = $q.defer();
//            $http({
//               method: 'POST',
//               url: $scope.url,
//               data: message, // your original form data,
//               transformRequest: formDataObject,  // this sends your data to the formDataObject provider that we are defining below.
//               headers: {'Content-Type': undefined}
//            }).
//             success(function(data, status, headers, config){
//               deferred.resolve(data);
//                console.log(data);
//             }).
//             error(function(data, status, headers, config){
//               deferred.reject(status);
//                console.log(data);
//             });
//            return deferred.promise;
//            };    
//        
//        
        
            
//            $http.post($scope.url, newprofileImage)
//            .success(function(data){
//                if (!checkResponseErrors(data))
//                {
//                    console.log("WORKED: "+data)
//                }
//                else
//                {
//                   console.log("DIDNT WORK: " + data) 
//                }
//                
//            })
//            .error(function(data) {
//                console.log('Error: ' + data);
//            });
//            
//            
//            
            
            
//            console.log($scope.image)
//            $http.post($scope.url, $scope.image)
//            .success(function(data){
//                if (!checkResponseErrors(data))
//                {
//                    console.log("WORKED: "+data)
//                }
//                else
//                {
//                   console.log("DIDNT WORK: " + data) 
//                }
//                
//            })
//            .error(function(data) {
//                console.log('Error: ' + data);
//            });
//        }
      






    App.controller('directoryController', function($scope, $http){
        $http.post('/_ah/api/netegreek/v1/user/directory', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $scope.directory = JSON.parse(data.data)
                }
                else
                {
                    console.log("error: "+ data.error)
                }
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        
        $scope.showIndividual = function(member){
            window.location.replace("#/app/directory/user/"+member.user_name);
        }
        
    });


    App.controller('memberprofileController', function($scope, $http, $routeParams){
         var user_name = $routeParams.id;
        $http.post('/_ah/api/netegreek/v1/user/directory', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $scope.members = JSON.parse(data.data)
                    console.log($scope.members);
                    for(var i = 0; i<$scope.members.length; i++)
                    {
                        if($scope.members[i].user_name == user_name)
                        {
                            $scope.member = $scope.members[i];
                            $scope.prof_pic = $scope.members[i].prof_pic;
                            console.log($scope.members[i]);
                             //define profile information
                            $scope.firstName = $scope.member.first_name;
                            $scope.lastName = $scope.member.last_name;
                            $scope.birthday = $scope.member.dob;
                            $scope.phone = $scope.member.phone;
                            $scope.currentAddress = $scope.member.current_address+" "+$scope.member.current_city+" "+$scope.member.current_state+" "+$scope.member.current_zip;
                            $scope.permanentAddress = $scope.member.permanent_address+" "+$scope.member.permanent_city+" "+$scope.member.permanent_state+" "+$scope.member.permanent_zip;
                            $scope.website = $scope.member.website;
                            $scope.facebook = $scope.member.facebook;
                            $scope.twitter = $scope.member.twitter;
                            $scope.instagram = $scope.member.instagram;
                            $scope.linkedin = $scope.member.linkedin;
                            
                            console.log($scope.firstName);
                            break;
                        }
                    }
                    
                    
                    
                }
                else
                {
                    console.log("error: "+ data.error)
                }
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
           
    });


    App.controller('accountinfoController', function($scope, $http) {
        $('.container').hide();
        $scope.updatedInfo = false;
        
        $http.post('/_ah/api/netegreek/v1/user/get_user_directory_info', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $scope.item = JSON.parse(data.data);
                    console.log($scope.item);
                    $('.container').fadeIn();
                    //define items
                    $scope.userName = $scope.item.user_name;
                    $scope.pledgeClass = $scope.item.pledge_class;
                    
                }
                else
                {
                    console.log('ERROR: '+data);
                }
                
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        
        
        $scope.updateAccount = function(isValid){
            if(isValid){
                $http.post('/_ah/api/netegreek/v1/user/update_user_directory_info', packageForSending($scope.item))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        console.log(data.data);
                        $scope.updatedInfo=true;
                    }
                    else
                    {
                        console.log('ERROR: '+data);
                    }
                    
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
            }
            else{
            //for validation purposes
            $scope.submitted = true;
            }
        }
    });


    App.controller('uploadImageController', function($scope, $http){
        $http.post('/_ah/api/netegreek/v1/user/set_uploaded_prof_pic', packageForSending({key: getParameterByName('key')}))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    //$scope.url = JSON.parse(data.data);
                    window.location.replace("/#/app/directory/user/"+$.cookie('USER_NAME'));
                }
                else
                {
                    console.log("error: "+ data.error)
                }
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        
        $scope.showIndividual = function(member){
            window.location.replace("/#/app/directory/user/"+member.user_name);
        }
        
    });









//More Functions

//checks to see if user is logged in or not
function checkLogin(){
    if($.cookie('USER_NAME') != undefined)
        return true;
    else
        return false;
}

//use packageForSending(send_data) when $http.post in order to attach data to user
function packageForSending(send_data){
    var output = 
    {user_name:$.cookie("USER_NAME"),
     token: $.cookie("TOKEN"),
     data: JSON.stringify(send_data)};
    return output;
}

function checkResponseErrors(received_data){
    console.log(received_data)
    response = received_data;
    if (response.error == 'TOKEN_EXPIRED' || response.error == 'BAD_TOKEN')
    {
        window.location.replace("/#/login");
        return true;
    }
    else if(response.error == 'INVALID_FORMAT')
    {
        return true;
    }
    else if(response.error == '')
    {
        return false;
    }
    else
    {
        return true;    
    }
}

//easy way to get parameters from URL (use for non-sensitive info)
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

    // Source: http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
function CSVToArray(strData, strDelimiter) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");
    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp((
    // Delimiters.
    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
    // Quoted fields.
    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
    // Standard fields.
    "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];
    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;
    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)) {
        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];
        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);
        }
        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {
            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[2].replace(
            new RegExp("\"\"", "g"), "\"");
        } else {
            // We found a non-quoted value.
            var strMatchedValue = arrMatches[3];
        }
        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
    }
    // Return the parsed data.
    return (arrData);
}
function CSV2JSON(csv) {
    var array = CSVToArray(csv);
    var objArray = [];
    for (var i = 1; i < array.length; i++) {
        objArray[i - 1] = {};
        for (var k = 0; k < array[0].length && k < array[i].length; k++) {
            var key = array[0][k];
            objArray[i - 1][key] = array[i][k]
        }
    }

    var json = JSON.stringify(objArray);
    console.log(json);
    var str = json.replace(/},/g, "},\r\n");

    return str;
}

//Directives
App.directive('match', function () {
        return {
            require: 'ngModel',
            restrict: 'A',
            scope: {
                match: '='
            },
            link: function(scope, elem, attrs, ctrl) {
                scope.$watch(function() {
                    return (ctrl.$pristine && angular.isUndefined(ctrl.$modelValue)) || scope.match === ctrl.$modelValue;
                }, function(currentValue) {
                    ctrl.$setValidity('match', currentValue);
                });
            }
        };
});