//#FIXME I tried to add a member last night and it add you as an alumni instead? I've created an addAlumni function and renamed that form correctly

//Final\static variables. These variables are used for cookies
var USER_NAME = 'USER_NAME';
var TOKEN = 'TOKEN';
var PERMS = 'PERMS';
var ALUMNI = 'alumni';
var MEMBER = 'member';
var LEADERSHIP = 'leadership';
var COUNCIL = 'council';
var PERMS_LIST =  [ALUMNI, MEMBER, LEADERSHIP, COUNCIL];

//initialize app
var App = angular.module('App', ['ui.router']);

App.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise("/")
    .when("/app/managemembers", "/app/managemembers/manage")
    .when("/app/managealumni", "/app/managealumni/manage");
    
      $stateProvider
        .state('home', {
                url: '/', 
				templateUrl : 'Static/home.html',
				controller  : 'homeController'
			})
        .state('login', {
                url : '/login',
				templateUrl : 'Static/login.html',
				controller  : 'loginController'
			})
        .state('register', {
                url : 'register',
				templateUrl : 'Static/register.html',
				controller  : 'registerController'
			})
        .state('registerinfo', {
                url : '/registerinfo',
				templateUrl : 'Static/registerinfo.html',
				controller  : 'registerinfoController'
			})
        .state('payment', {
                url : '/payment',
				templateUrl : 'Static/payment.html',
				controller  : 'paymentController'
			})
        .state('app', {
                url : '/app',
                templateUrl : 'Static/app.html',
                controller : 'appController'
        })
        .state('managemembers', {
                url : '/app/managemembers',
				templateUrl : 'Static/managemembers.html',
				controller  : 'managemembersController'
			})
            .state('managemembers.manage', {
                    url : '/manage',
                    templateUrl : 'Static/managingmembers.html',
                    controller: 'managemembersController'
                })
            .state('managemembers.add', {
                    url : '/add',
                    templateUrl : 'Static/addingmembers.html',
                    controller: 'managemembersController'
                })
            .state('managemembers.tag', {
                    url : '/tag',
                    templateUrl : 'Static/taggingmembers.html',
                    controller: 'membertagsController'
                })
        .state('managealumni', {
                url : '/app/managealumni',
				templateUrl : 'Static/managealumni.html',
				controller  : 'managealumniController'
			})
            .state('managealumni.add' , {
                    url : '/add',
                    templateUrl : 'Static/addingalumni.html',
                    controller: 'addAlumniController'
                })
            .state('managealumni.manage' , {
                    url : '/manage',
                    templateUrl : 'Static/managingalumni.html',
                    controller: 'managealumniController'
                })
        .state('newmember', {
                url : '/newmember',
                templateUrl : 'Static/newmember.html',
                controller : 'newmemberController'
            })
        .state('incorrectperson', {
                url : '/incorrectperson',
                templateUrl : 'Static/incorrectperson.html',
                controller : 'incorrectpersonController'
            })
        .state('newmemberinfo', {
                url : '/newmemberinfo',
                templateUrl : 'Static/newmemberinfo.html',
                controller : 'newmemberinfoController'
            })
        .state('accountinfo', {
                url : '/app/accountinfo',
                templateUrl : 'Static/accountinfo.html',
                controller : 'accountinfoController'
            })
        .state('uploadprofilepicture', {
                url : '/app/uploadprofilepicture',
                templateUrl : 'Static/uploadprofilepicture.html',
                controller : 'profilepictureController'  
            })
        .state('directory', {
                url : '/app/directory',
                templateUrl : 'Static/directory.html',
                controller : 'directoryController'  
            })
        .state('memberprofile', {
                url : '/app/directory/:id',
                templateUrl : 'Static/memberprofile.html',
                controller : 'memberprofileController'  
            })
        //#CHANGES there might be a better way to do this
        .state('postNewKeyPictureLink', {
                url : '/app/postNewKeyPictureLink',
                templateUrl : 'Static/memberprofile.html',
                controller : 'uploadImageController'
            })
        .state('forgotpassword', {
                url : '/forgotpassword',
                templateUrl : 'Static/forgot_password.html',
                controller : 'forgotPasswordController'
            })
        .state('changepasswordfromtoken', {
                url : '/changepasswordfromtoken',
                templateUrl : 'Static/change_password_from_token.html',
                controller : 'changePasswordFromTokenController'
            })
        .state('changepassword', {
                url : '/app/changepassword',
                templateUrl : 'Static/change_password.html',
                controller : 'changePasswordController'
            })
    });

//Set up run commands for the app
    App.run(function ($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    });

//navigation header
    App.controller('navigationController', function($scope, $http){
        $scope.checkLogin = function(){
            return checkLogin();
        }
        
        $scope.checkPermissions = function(perms){
            return checkPermissions(perms);
        }
        
        $scope.logout = function(){
                $.removeCookie(USER_NAME);
                $.removeCookie(TOKEN);
                window.location.replace("/#/login");
         }
    });

//home page
    App.controller('homeController', function($scope, $http) {
        
	});

//login page
	App.controller('loginController', function($scope, $http) {

        $scope.login = function(user_name, password) {
        console.log(user_name + ' ' +password)
        $http.post('/_ah/api/netegreek/v1/auth/login', packageForSending({user_name: user_name, password: password}))
            .success(function(data) {
                if(!checkResponseErrors(data))
                {
                    returned_data = JSON.parse(data.data);
                    $.cookie(USER_NAME, user_name);
                    $.cookie(TOKEN,returned_data.token);
                    $.cookie(PERMS, returned_data.perms);
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

//getting a forgotten password email
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

//changing a forgotten password
    App.controller('changePasswordFromTokenController', function($scope, $http) {
        $.cookie(TOKEN, getParameterByName('token'));
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

//changing password
    App.controller('changePasswordController', function($scope, $http) {
        $scope.passwordChanged = false;
        $scope.changeFailed = false;
        $scope.changePassword = function(password) {
            console.log($scope.item);
            $http.post('/_ah/api/netegreek/v1/auth/change_password', packageForSending($scope.item))
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

//the registration page
    App.controller('registerController', function($scope, $http) {
        //this page passes parameters through a get method to register info
    });

//the register info page
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

//the payment page
    App.controller('paymentController', function($scope, $http) {
        //skip payment page right now
        $scope.submitPayment = function(){
            window.location.replace("/#/app/managemembers");
        };
        
    });

//the main app page
    App.controller('appController', function($scope, $http) {
        if(!checkLogin()){
        window.location.replace("/#/login");
        }
        
	});

//the add members page
    App.controller('managemembersController', function($scope, $http) {
        checkPermissions(COUNCIL);
 
        //MANAGE MEMBERS TAB
        
        //this goes inside the HTTP request
        //$scope.members = JSON.parse(data);
		//console.log($scope.members)
        
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
    
        //remove someone from list before adding everyone
         $scope.deleteAdd = function(add){
              var index=$scope.adds.indexOf(add)
              $scope.adds.splice(index,1);     
        }
         
        //ng-click for the form to add one member at a time        
        $scope.addMember = function(isValid){
            if(isValid){
            newmemberList = newmemberList.concat($('#addmemberForm').serializeObject());
            $('#result').text(JSON.stringify(newmemberList));
            //define variable for ng-repeat
            $scope.adds = newmemberList;}
            else{$scope.submitted = true;}
        };
        
        
        
        
        $scope.getMembers = function(){
            $http.post('/_ah/api/netegreek/v1/auth/get_users', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    
                    var members = JSON.parse(data.data).members;
                    for(var i = 0; i<members.length; i++){
                        if (members[i].user_name == $.cookie(USER_NAME)){
                            members.splice(i, 1);
                            break;
                        }
                    }
                    $scope.members = members;
                    console.log($scope.members);
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
                    var returned = JSON.parse(data.data)
                    if(returned.errors){
                        var errors_str = 'Errors with the following emails:\n';
                        for(var i = 0; i< returned.errors.length; i++){
                            errors_str += returned.errors[i].email + '\n';
                        }
                    alert(errors_str);
                    }
                    console.log(data);
                }
                else
                    console.log('ERROR: '+data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
            newmemberList = [];
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
        //document.getElementById('uploadMembers').addEventListener('change', readSingleFile, false);
        
       //this function takes the CSV, converts it to JSON and outputs it
        $scope.addMembers = function(){
            
            //check to see if file is being read
            if(filecontents == null){
             //do nothing
            alert('you have not selected a file');
            }
            else{
                //converts CSV file to array of usable objects
                var csvMemberList = CSV2ARRAY(filecontents);
                console.log(csvMemberList);
                checkEmail = function(email){
                    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    return re.test(email);
                }
                for (var i = 0; i< csvMemberList.length; i++){
                    if(!checkEmail(csvMemberList[i].email) && csvMemberList[i].first_name && csvMemberList[i].last_name && csvMemberList[i].class_year){
                        csvMemberList.splice(i, 1);
                        i--;
                        $scope.memberSkippedNotifier = true; //shows warning that not all members added correctly
                    }
                }  
                newmemberList = newmemberList.concat(csvMemberList);
                //outputs object to result
                $('#result').text(JSON.stringify(newmemberList));
                //define variable for ng-repeat
                $scope.adds = newmemberList;
            }
        };
    });

//new member page
    App.controller('newmemberController', function($scope, $http){
        $('.container').hide();
        $.cookie(TOKEN, getParameterByName('token'))
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

//incorrect person page
    App.controller('incorrectpersonController', function($scope, $http){
    
    });

    App.controller('managealumniController', function($scope, $http){
        function getUsers(){
            $http.post('/_ah/api/netegreek/v1/auth/get_users', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        var alumni = JSON.parse(data.data).alumni;
                        $scope.alumni = alumni;
                        console.log(alumni);
                    }
                    else
                    {
                        console.log("error: "+ data.error)
                    }
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }
        getUsers();
        $scope.removeAlumni = function(alumnus){
            var to_send = {'keys': [alumnus.key]}
            $http.post('/_ah/api/netegreek/v1/manage/revert_from_alumni', packageForSending(to_send))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        for (var i = 0; i < $scope.alumni.length; i++){
                            if ($scope.alumni[i]. key == alumnus.key){
                                $scope.alumni.splice(i, 1);
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
        }
    });

    App.controller('addAlumniController', function($scope, $http){
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
    
        //remove someone from list before adding everyone
         $scope.deleteAdd = function(add){
              var index=$scope.adds.indexOf(add)
              $scope.adds.splice(index,1);     
        }
         
        //ng-click for the form to add one member at a time        
        $scope.addAlumni = function(isValid){
            if(isValid){
            newmemberList = newmemberList.concat($('#addmemberForm').serializeObject());
            $('#result').text(JSON.stringify(newmemberList));
            //define variable for ng-repeat
            $scope.adds = newmemberList;
            }else{$scope.submitted = true;}
        };
        
        $scope.submitMembers = function(){
            
            var data_tosend = {users: newmemberList};
            $scope.adds = null;
            $http.post('/_ah/api/netegreek/v1/auth/add_alumni', packageForSending(data_tosend))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    var returned = JSON.parse(data.data)
                    if(returned.errors.length > 0){
                        var errors_str = 'Errors with the following emails:\n';
                        for(var i = 0; i< returned.errors.length; i++){
                            errors_str += returned.errors[i].email + '\n';
                        }
                    alert(errors_str);
                    }
                    console.log(data);
                    newmemberList = [];
                }
                else
                    console.log('ERROR: '+data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
            newmemberList = [];
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
        //document.getElementById('uploadMembers').addEventListener('change', readSingleFile, false);
        
       //this function takes the CSV, converts it to JSON and outputs it
        $scope.addMembers = function(){
            
            //check to see if file is being read
            if(filecontents == null){
             //do nothing
            alert('you have not selected a file');
            }
            else{
                //converts CSV file to array of usable objects
                var csvMemberList = CSV2ARRAY(filecontents);
                console.log(csvMemberList);
                checkEmail = function(email){
                    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    return re.test(email);
                }
                for (var i = 0; i< csvMemberList.length; i++){
                    if(!checkEmail(csvMemberList[i].email)){
                        csvMemberList.splice(i, 1);
                        i--;
                        $scope.memberSkippedNotifier = true; //shows warning that not all members added correctly
                    }
                }  
                newmemberList = newmemberList.concat(csvMemberList);
                //outputs object to result
                $('#result').text(JSON.stringify(newmemberList));
                //define variable for ng-repeat
                $scope.adds = newmemberList;
            }
        };
    });

//new member info page
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
                    $.cookie(TOKEN,data.data.token);
                    $.cookie(USER_NAME, $scope.item.user_name);
                    $.cookie(PERMS, data.data.perms);
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

//adding profile pictures
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

//the directory
    App.controller('directoryController', function($scope, $http){
        $http.post('/_ah/api/netegreek/v1/user/directory', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    var directory = JSON.parse(data.data).members;
                    for(var i = 0; i<directory.length; i++){
                        if(directory[i].user_name == ''){
                            directory.splice(i, 1);
                            i--;
                        }
                    }
                    $scope.directory = directory;
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
            window.location.replace("#/app/directory/"+member.user_name);
        }
        
        //click the buttons to search for that button text
        $('#searchTags button').click(function(){
            var searchValue = $(this).text();
            $('#directorySearch').val(searchValue).change();
        });
        
    });

//member profiles
    App.controller('memberprofileController', function($scope, $http, $stateParams){
         var user_name = $stateParams.id;
        if (user_name.toString().length < 2){
            window.location.replace('/#/app/directory');
        }
        $http.post('/_ah/api/netegreek/v1/user/directory', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $scope.members = JSON.parse(data.data).members;
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
                            $scope.email = $scope.member.email;
                            $scope.birthday = $scope.member.dob;
                            $scope.phone = $scope.member.phone;
                            $scope.currentAddress = $scope.member.address+" "+$scope.member.city+" "+$scope.member.state+" "+$scope.member.zip;
                            $scope.permanentAddress = $scope.member.perm_address+" "+$scope.member.perm_city+" "+$scope.member.perm_state+" "+$scope.member.perm_zip;
                            $scope.website = $scope.member.website;
                            $scope.facebook = $scope.member.facebook;
                            $scope.twitter = $scope.member.twitter;
                            $scope.instagram = $scope.member.instagram;
                            $scope.linkedin = $scope.member.linkedin;
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

//account info
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
                        $scope.updatedInfo = true;
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

//upload image
    App.controller('uploadImageController', function($scope, $http){
        $http.post('/_ah/api/netegreek/v1/user/set_uploaded_prof_pic', packageForSending({key: getParameterByName('key')}))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    //$scope.url = JSON.parse(data.data);
                    window.location.replace("/#/app/directory/user/"+$.cookie(USER_NAME));
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


//member tagging page
    App.controller('membertagsController', function($scope, $http) {
        function getUsers(){
            $scope.selectedTags = {};
            $scope.selectedUsers = {};
            $http.post('/_ah/api/netegreek/v1/auth/get_users', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    var members = JSON.parse(data.data).members;
                    $scope.members = members;
                    console.log($scope.members);
                }
                else
                    console.log('ERROR: '+data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        }
        getUsers();
        $scope.getOrganizationTags = function(){
            //initialize ng-model variables to contain selected things
            $('#tag').val('');
            $http.post('/_ah/api/netegreek/v1/manage/get_organization_tags', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        $scope.organizationTags = JSON.parse(data.data).tags;
                        console.log($scope.organizationTags);
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
        $scope.getOrganizationTags();
        $scope.addOrganizationTag = function(tag){
        //#TODO find checked tags and add them to the checked members
            console.log(tag);
            $http.post('/_ah/api/netegreek/v1/manage/add_organization_tag', packageForSending({'tag': tag}))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        console.log('success');
                        setTimeout($scope.getOrganizationTags, 200);
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
        
        $scope.removeOrganizationTags = function(){
        //#TODO find checked tags and removed them from the checked members
            $http.post('/_ah/api/netegreek/v1/manage/remove_organization_tags', packageForSending({'tag': tag}))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        $scope.organizationTags = JSON.parse(data.data).tags;
                        console.log($scope.organizationTags);
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
        
        //onclick checkmark tag
        
        //#TODO fix this to where it updates the ng-model
        $('.memberTags').on('click', '.addTags li', function(){
            
            var checkbox = $(this).prev(':checkbox')
                        
                if ( checkbox.prop('checked') )
                {
                    checkbox.prop('checked', false).trigger('input');
                    $(this).removeClass('checked');
                }
                else
                {
                    checkbox.prop('checked', true).trigger('input');
                    $(this).addClass('checked');
                }
            
        });
       
    
        
        function addTagsToUsers(tags, keys){
            var to_send = {'tags': tags, 'keys': keys};
            console.log(to_send);
            $http.post('/_ah/api/netegreek/v1/manage/add_users_tags', packageForSending(to_send))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        console.log('success');
                        setTimeout(getUsers, 200);
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
        
        $scope.addTagsToUsers = function(tags, users){
            console.log(tags);
            console.log(users);
            selected_tags = [];
            selected_keys = [];
            for (var subtag in tags){
                if (tags[subtag] == true){
                    selected_tags.push(subtag);
                }
            }
            for (var subuser in users){
                if (users[subuser] == true){
                    selected_keys.push(subuser)
                }
            }
            addTagsToUsers(selected_tags, selected_keys);
        }
        
        function removeTagsFromUsers(tags, keys){
            $http.post('/_ah/api/netegreek/v1/manage/remove_users_tags', packageForSending({'tags': tags, 'keys': keys}))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        console.log('success');
                        setTimeout(getUsers, 200);
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
        
        $scope.removeTagsFromUsers = function(tags, users){
            console.log(tags);
            console.log(users);
            selected_tags = [];
            selected_keys = [];
            for (var subtag in tags){
                if (tags[subtag] == true){
                    selected_tags.push(subtag);
                }
            }
            for (var subuser in users){
                if (users[subuser] == true){
                    selected_keys.push(subuser)
                }
            }
            removeTagsFromUsers(selected_tags, selected_keys);
        }
    });


//More Functions

//checks to see if user is logged in or not
function checkLogin(){
    if($.cookie(USER_NAME) != undefined)
        return true;
    else
        return false;
}

function checkPermissions(perms){
    if (PERMS_LIST.indexOf(perms) > PERMS_LIST.indexOf($.cookie(PERMS))){
        return false;
    }
    return true;
}

//use packageForSending(send_data) when $http.post in order to attach data to user
function packageForSending(send_data){
    var output = 
    {user_name:$.cookie(USER_NAME),
     token: $.cookie(TOKEN),
     data: JSON.stringify(send_data)};
    console.log(output);
    return output;
}

function checkResponseErrors(received_data){
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
function CSVReader(strData, strDelimiter) {
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
function CSV2ARRAY(csv) {
    var array = CSVReader(csv);
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
    
    return JSON.parse(str);
}

//Directives and other add ons
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

App.filter('multiSearch', function() { //#FUTURE Search box filter
        return function (objects, searchValues, delimiter) {
            if (!delimiter) {
                delimiter="";
            }
            if (searchValues) {
                var good = Array(0); //the list of objects that match ALL terms
                var terms = String(searchValues).toUpperCase().split(delimiter); 
                for (var w = 0; w < terms.length; w++) {
                    terms[w] = terms[w].replace(/^\s+|\s+$/g,"");
                }
                var truthArray = Array(terms.length); //the truth array matches 1 to 1 to the terms. If an element in the truthArray is 0, the corresponding term wasn’t found
                for (var j = 0; j < objects.length; j++) { //iterates through each object
                    for (var t = 0; t < objects.length; t++) {
                        truthArray[t] = 0; //initializes/resets the truthArray
                    }
                    for (var i = 0; i < terms.length; i++) {
                        if (objects[j].attribute1) {
                            if (String(objects[j].attribute1).toUpperCase().indexOf(terms[i]) != -1) {
                                truthArray[i] = 1;
                            }
                        }
                        if (truthArray[i] != 1 && objects[j].attribute2) {
                            if (String(objects[j].attribute2).toUpperCase().indexOf(terms[i]) != -1) {
                                truthArray[i] = 1;
                            }
                        }
                        if (truthArray[i] != 1 && objects[j].attribute3) {
                            if (String(objects[j].attribute3).toUpperCase().indexOf(terms[i]) != -1) {
                                truthArray[i] = 1;
                            }
                        }
                    }
                    if (truthArray.indexOf(0) == -1) { //if there are no 0s, all terms are present and the object is good
                        good.push(objects[j]); //add the object to the good list
                    }
                }
                return good; //return the list of matching objects
            }
            else { //if there are no terms, return all objects
                return objects;
            }
        }
    });
