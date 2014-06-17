//#TODO Check if this is now fixed: when trying to register, the token expires on the register infopage and tries to get me to log in before I've made an account
//#FIXME account info page, the state model is still not registering change (it can say Texas, but registers Tennessee)
//#FIXME Sometimes the nav bar doesnt load after being fored logged out and logging into another account.
//#TODO get it to where you can see all messages after they're hidden
//Final\static variables. These variables are used for cookies
//#TODO form validation on messaging with checkboxes
//#TODO: implement datepicker for accountinfo page http://angular-ui.github.io/bootstrap/#/datepicker
var USER_NAME = 'USER_NAME';
var TOKEN = 'TOKEN';
var PERMS = 'PERMS';
var ALUMNI = 'alumni';
var MEMBER = 'member';
var LEADERSHIP = 'leadership';
var COUNCIL = 'council';
var PERMS_LIST =  [ALUMNI, MEMBER, LEADERSHIP, COUNCIL];

//initialize app
var App = angular.module('App', ['ui.router', 'ngAnimate']);
App.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise("/")
    .when("/app/managemembers", "/app/managemembers/manage")
    .when("/app", "/app/home")
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
                url : '/register',
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
        .state('newmemberinfo', {
                url : '/newuserinfo',
                templateUrl : 'Static/newmemberinfo.html',
                controller : 'newmemberinfoController'
            })
        .state('newmember', {
                    url : '/newuser/:key',
                    templateUrl : 'Static/newmember.html',
                    controller : 'newmemberController'
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
        .state('app', {
                url : '/app',
                templateUrl : 'Static/app.html',
                controller : 'appController'
            
        })
            .state('app.home', {
                url : '/home',
                templateUrl : 'Static/apphome.html',
                controller : 'appHomeController'
            })
            .state('app.managemembers', {
                    url : '/managemembers',
                    templateUrl : 'Static/managemembers.html',
                    controller  : 'managemembersController'
                })
                .state('app.managemembers.manage', {
                        url : '/manage',
                        templateUrl : 'Static/managingmembers.html',
                        controller: 'managemembersController'
                    })
                .state('app.managemembers.add', {
                        url : '/add',
                        templateUrl : 'Static/addingmembers.html',
                        controller: 'managemembersController'
                    })
                .state('app.managemembers.tag', {
                        url : '/tag',
                        templateUrl : 'Static/taggingmembers.html',
                        controller: 'membertagsController'
                    })
            .state('app.managealumni', {
                    url : '/managealumni',
                    templateUrl : 'Static/managealumni.html',
                })
                .state('app.managealumni.add' , {
                        url : '/add',
                        templateUrl : 'Static/addingalumni.html',
                        controller: 'addAlumniController'
                    })
                .state('app.managealumni.manage' , {
                        url : '/manage',
                        templateUrl : 'Static/managingalumni.html',
                        controller: 'managealumniController'
                    })
            .state('app.incorrectperson', {
                    url : '/incorrectperson',
                    templateUrl : 'Static/incorrectperson.html',
                    controller : 'incorrectpersonController'
                })
            .state('app.accountinfo', {
                    url : '/accountinfo',
                    templateUrl : 'Static/accountinfo.html',
                    controller : 'accountinfoController'
                })
            .state('app.uploadprofilepicture', {
                    url : '/uploadprofilepicture',
                    templateUrl : 'Static/uploadprofilepicture.html',
                    controller : 'profilepictureController'  
                })
            .state('app.directory', {
                    url : '/directory',
                    templateUrl : 'Static/directory.html',
                })
                .state('app.directory.members', {
                    url : '/members',
                    templateUrl : 'Static/memberdirectory.html',
                    controller : 'membersDirectoryController'  
                })
                .state('app.directory.alumni', {
                    url : '/alumni',
                    templateUrl : 'Static/alumnidirectory.html',
                    controller : 'alumniDirectoryController'  
                })
            .state('app.memberprofile', {
                    url : '/directory/:id',
                    templateUrl : 'Static/memberprofile.html',
                    controller : 'memberprofileController'  
                })
            //#CHANGES there might be a better way to do this
            .state('app.postNewKeyPictureLink', {
                    url : '/postNewKeyPictureLink',
                    templateUrl : '',
                    controller : 'uploadImageController'
                })
            .state('app.changepassword', {
                    url : '/changepassword',
                    templateUrl : 'Static/change_password.html',
                    controller : 'changePasswordController'
                })
            .state('app.messaging', {
                    url : '/messaging',
                    templateUrl : 'Static/messaging.html',
                    controller : 'messagingController'
                })
            .state('app.newevent', {
                    url : '/newevent',
                    templateUrl : 'Static/newevent.html',
                    controller : 'newEventController'
                })
            .state('app.events', {
                    url : '/events',
                    templateUrl : 'Static/events.html',
                    controller : 'eventsController'
                })
//            .state('app.events', {
//                    url : '/events/:tag',
//                    templateUrl : 'Static/eventinfo.html',
//                    controller : 'eventInfoController'
//                })
    });

//Set up run commands for the app
    App.run(function ($rootScope, $state, $stateParams, $http, $q) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.directory = {};
        $rootScope.users = {};
        $rootScope.notification_count = "0";
        $rootScope.tags = {};
        
        
        function executePosts() {
            
          var deferred = $q.defer();
          var done = 0;
          function checkIfDone() {
            done++;
            if (done==3) deferred.resolve(); 
          }
          $http.post('/_ah/api/netegreek/v1/auth/get_users', packageForSending(''))
            .success(function(data){
                //console.log(data.data);
                if (!checkResponseErrors(data)){
                $rootScope.users = JSON.parse(data.data);}
                checkIfDone();
            })
            .error(function(data) {
                console.log('Error: ' + data);
                checkIfDone();
            });
          $http.post('/_ah/api/netegreek/v1/user/directory', packageForSending(''))
            .success(function(data){
                //console.log(data.data);
                var directory = JSON.parse(data.data);
                $rootScope.directory = directory;
                checkIfDone();
            })
            .error(function(data) {
                console.log('Error: ' + data);
                checkIfDone();
            });
          $http.post('/_ah/api/netegreek/v1/notifications/get', packageForSending(''))
            .success(function(data){
                $rootScope.notifications = JSON.parse(data.data).notifications;
                $rootScope.hidden_notifications = JSON.parse(data.data).hidden_notifications;
                $rootScope.updateNotificationBadge();
                checkIfDone();
            })
            .error(function(data) {
                console.log('Error: ' + data);
                checkIfDone();
            });  
            $http.post('/_ah/api/netegreek/v1/manage/get_organization_tags', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        $rootScope.tags.organizationTags = JSON.parse(data.data).tags;
                    }
                });
          return deferred.promise;
        }
        
        $rootScope.loadData = function(){
            
            $rootScope.loading = true;
            executePosts().then(function() {
                for (var i = 0; i< $rootScope.directory.members.length; i++){
                    if($rootScope.directory.members[i].user_name == $.cookie(USER_NAME)){
                        $rootScope.me = $rootScope.directory.members[i];
                        console.log($rootScope.me);
                        break;
                    }
                }
                $rootScope.loading = false;
            });
        }
        
        if ($.cookie(USER_NAME)){
            $rootScope.loadData();
        }
        $rootScope.updateNotifications = function(){
            $http.post('/_ah/api/netegreek/v1/notifications/get', packageForSending(''))
            .success(function(data){
                $rootScope.notifications =JSON.parse(data.data).notifications;
                $rootScope.updateNotificationBadge();
               
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        }
        
        $rootScope.refreshPage = function(){
            window.location.reload();
        }
        
        $rootScope.checkPermissions = function(perms){
            return checkPermissions(perms);
        }
        $rootScope.checkLogin = function(){
            return checkLogin();
        }
        
        $rootScope.updateNotificationBadge = function(){
            var count = 0;
            for (var i = 0; i< $rootScope.notifications.length; i++){
                if ($rootScope.notifications[i].new){
                    count ++;
                }
            }
            $rootScope.notification_count = count;
        }
        
    });

//navigation header
    App.controller('navigationController', function($scope, $http, $rootScope){
        
        //closes the navigation if open and an li is clicked
        var navMain = $("#mainNavigation");
        navMain.on('click', 'li:not(.dropdown)', function(){
            if( navMain.hasClass('in') ){
                     navMain.collapse('hide');
            }
            else{
            //do nothing
            }
        });
        
        
        $scope.logout = function(){
                $.removeCookie(USER_NAME);
                $.removeCookie(TOKEN);
                $.removeCookie(PERMS);
                $.removeCookie('FORM_INFO_EMPTY')
                $rootScope.directory = {};
                $rootScope.loading = false;
                $rootScope.users = {};
                window.location.assign("/#/login");
         }
    });

//home page
    App.controller('homeController', function($scope, $http) {
        
	});
    
    App.controller('appController', function($scope, $http, $interval, $rootScope) {
        if(!checkLogin()){
            window.location.assign("/#/login");
        }
        $interval(function(){$rootScope.updateNotifications(); console.log('I did stuff2');}, 20000);
        
	});

//login page
	App.controller('loginController', function($scope, $http, $rootScope) {
        $.removeCookie(USER_NAME);
        $.removeCookie(TOKEN);
        $.removeCookie(PERMS);
        $.removeCookie('FORM_INFO_EMPTY')
        $rootScope.directory = {};
        $rootScope.loading = false;
        $rootScope.users = {};
        $scope.login = function(user_name, password) {
        $rootScope.loading = true;
        console.log(user_name + ' ' +password)
        $http.post('/_ah/api/netegreek/v1/auth/login', packageForSending({user_name: user_name, password: password}))
            .success(function(data) {
                $rootScope.loading = false;
                if(!checkResponseErrors(data))
                {
                    returned_data = JSON.parse(data.data);
                    $.cookie(USER_NAME, user_name);
                    $.cookie(TOKEN, returned_data.token);
                    $.cookie(PERMS, returned_data.perms);
                    $rootScope.loadData();
                    window.location.assign("#/app");
                }
                else{
                    if (data.error == "BAD_LOGIN"){
                        $scope.badLogin = true;
                    }   
                }

            })
            .error(function(data) {
                $rootScope.loading = false;
                console.log('Error: ' + data);
            });
        };

        $scope.forgotPassword = function(){
        window.location.assign('/#/forgotpassword'); 
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
    App.controller('registerController', function($scope, $http, $rootScope) {
        $.removeCookie(USER_NAME);
        $.removeCookie(TOKEN);
        $.removeCookie(PERMS);
        $.removeCookie('FORM_INFO_EMPTY')
        $rootScope.directory = {};
        $rootScope.loading = false;
        $rootScope.users = {};
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
    //                window.location.assign("/#/register");
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
                        var responseData = JSON.parse(data.data);
                        $.cookie(TOKEN,  responseData.token);
                        $.cookie(PERMS, responseData.perms);
                        $.cookie("USER_NAME", data_tosend.user.user_name);
                        $scope.loadData();
                        window.location.assign("/#/payment");
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
            window.location.assign("/#/app/managemembers");
        };
        
    });

//the main app page
    App.controller('appHomeController', function($scope, $http, $rootScope) {
        $scope.updateStatus = function(status){
        var to_send = {'status': status};
        $http.post('/_ah/api/netegreek/v1/user/update_status', packageForSending(to_send))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                }
                else
                    console.log('ERROR: '+data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            }); 
            $('#status').val("");
            if ($rootScope.me){
                $rootScope.me.status = status;
            }
        }
        
        $scope.clearStatus = function(){
            
            var status = "";
            var to_send = {'status': status};
            $http.post('/_ah/api/netegreek/v1/user/update_status', packageForSending(to_send))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                }
                else
                    console.log('ERROR: '+data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            }); 
            $('#status').val("");
            if ($rootScope.me){
                $rootScope.me.status = status;
            }            
        }
        
        $scope.openNotificationModal = function(notify){
            $('#notificationModal').modal();
            $scope.selectedNotification = notify;
            $scope.selectedNotification.new = false;
            $rootScope.updateNotificationBadge();
            var key = $scope.selectedNotification.key;
            $http.post('/_ah/api/netegreek/v1/notifications/seen', packageForSending({'notification': key}));
        }
        
        $scope.hideNotification = function(notify){
            var key = notify.key;
            $http.post('/_ah/api/netegreek/v1/notifications/hide', packageForSending({'notification': key}));
            $rootScope.hidden_notifications.push(notify);
            $rootScope.notifications.splice($scope.notifications.indexOf(notify), 1);
        }
        
        $scope.closeNotificationModal = function(notify){
            $('#notificationModal').modal('hide');
        }
        
       $('#showHiddenButton').click(function () {
          $(this).text(function(i, text){
              return text === "Show Hidden" ? "Hide Hidden" : "Show Hidden";
          })
       });
        
	});

//the add members page
    App.controller('managemembersController', function($scope, $http, $rootScope) {
        checkPermissions(COUNCIL);
        $scope.selectedMembers = {};

        //MANAGE MEMBERS TAB
        
        //this goes inside the HTTP request
        //$scope.members = JSON.parse(data);
		//console.log($scope.members)
        
        //ADD MEMBERS TAB
        $scope.openDeleteMemberModal = function(user){
            $('#deleteMemberModal').modal();
            $scope.userToDelete = user;
        }
        
        $scope.openConvertMembersModal = function(){
            $('#convertMemberModal').modal();
        }
        
        $scope.updatePerms = function(key, option){
            var to_send = {key: key, perms: option};
            $http.post('/_ah/api/netegreek/v1/manage/manage_perms', packageForSending(to_send))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        console.log('success');
                    }
                    else{
                        console.log('ERROR: '+data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }
        
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
        
        $scope.convertMembersToAlumni = function(members){
            keys = []
            $('#convertMemberModal').modal('hide');
            for (var key in members){
                if (members[key] == true){
                    keys.push(key);
                }
            }
            var to_send = {'keys': keys};
            console.log(to_send);
            $http.post('/_ah/api/netegreek/v1/manage/convert_to_alumni', packageForSending(to_send))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        console.log('success');
                    }
                    else
                    {
                        console.log('ERROR: '+data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
            $scope.selectedMembers = {};
            for (var kIdx = 0; kIdx < keys.length; kIdx++){
                for (var mIdx = 0; mIdx < $scope.members.length; mIdx ++){
                    if($scope.members[mIdx].key == keys[kIdx]){
                        $scope.members.splice(mIdx, 1);
                        break;
                    }
                }
            }
        };
        
        $scope.getMembers = function(){
            $http.post('/_ah/api/netegreek/v1/auth/get_users', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $rootScope.users = JSON.parse(data.data);
                    console.log($rootScope.users);
                    assignAngularViewModels($rootScope.users.members);
                }
                else
                    console.log('ERROR: '+data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        
        }
        
        function assignAngularViewModels(members){
//            for(var i = 0; i< members.length; i++){
//                if (members[i].user_name == $.cookie(USER_NAME)){
//                    members.splice(i, 1);
//                    break;
//                }
//            }
            $scope.members = members;
            $rootScope.loading = false;
        }
        
        function onPageLoad(){
            console.log('page is loading');
            if($rootScope.users.members){
                assignAngularViewModels($rootScope.users.members);
                $scope.getMembers();
            }
            else{
                $rootScope.loading = true;
                $scope.getMembers();
            }
        }
        onPageLoad();
        
        $scope.removeMember = function(user){
            $('#deleteTagModal').modal('hide')
            $http.post('/_ah/api/netegreek/v1/auth/remove_user', packageForSending(user))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                }
                else
                    console.log('ERROR: '+data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });    
            for (var i = 0; i < $scope.members.length; i++){
                if ($scope.members[i].key == user.key){
                    $scope.members.splice(i, 1);
                    break;
                }
            }
        }
        
        $scope.submitMembers = function(){
            
            var data_tosend = {users: newmemberList};
            $http.post('/_ah/api/netegreek/v1/auth/add_users', packageForSending(data_tosend))
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
                    $scope.members.concat(data_tosend.users);
                }
                else
                    console.log('ERROR: '+data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
            $scope.adds = [];
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
    App.controller('newmemberController', function($scope, $http, $stateParams){
        $('.container').hide();
        $.cookie(TOKEN, $stateParams.key)
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
            window.location.assign("#/newuserinfo");
        }
        $scope.incorrectPerson = function(){
            window.location.assign("#/incorrectperson");
        }
    });

//incorrect person page
    App.controller('incorrectpersonController', function($scope, $http){
    
    });

    App.controller('managealumniController', function($scope, $http, $rootScope){
         var formObject = document.getElementById('uploadMembers');
        if(formObject){
            formObject.addEventListener('change', readSingleFile, false);}
        $scope.openDeleteAlumniModal = function(user){
            $('#deleteAlumniModal').modal();
            $scope.selectedUser = user;
        }
        
        $scope.openConvertAlumniModal = function(user){
            $('#convertAlumniModal').modal();
            $scope.selectedUser = user;
        }
        
        function getAlumni(){
            $http.post('/_ah/api/netegreek/v1/auth/get_users', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        $rootScope.users = JSON.parse(data.data);
                        assignAngularViewModels($rootScope.users.alumni);
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
        
        /*This function takes the data and assigns it to the DOM with angular models*/
        function assignAngularViewModels(alumni){
            $scope.alumni = alumni;
            $rootScope.loading = false;
        }
        /*This function is the first function to run when the controller starts. This deals with caching data so we dont have to pull data evertytime we load the page*/
        function onPageLoad(){
            console.log('page is loading');
            if($rootScope.users.alumni){
                assignAngularViewModels($rootScope.users.alumni);
                getAlumni();
            }
            else{
                $rootScope.loading = true;
                getAlumni();
            }
        }
        onPageLoad();
        
        $scope.convertAlumniToMember = function(alumnus){
            $scope.selectedUser = {}
            $('#convertAlumniModal').modal('hide');
            var to_send = {'keys': [alumnus.key]}
            $http.post('/_ah/api/netegreek/v1/manage/revert_from_alumni', packageForSending(to_send))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                    }
                    else
                    {
                        console.log("error: "+ data.error)
                    }
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
                for (var i = 0; i < $scope.alumni.length; i++){
                    if ($scope.alumni[i]. key == alumnus.key){
                        $scope.alumni.splice(i, 1);
                        break;
                    }
                }
        }
        $scope.removeAlumni = function(alumnus){
            $scope.selectedUser = {}
            $('#deleteAlumniModal').modal('hide');
            $http.post('/_ah/api/netegreek/v1/auth/remove_user', packageForSending(alumnus))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                }
                else
                    console.log('ERROR: '+data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });    
            if ($scope.alumni.indexOf(alumnus) > -1){
                    $scope.alumni.splice($scope.alumni.indexOf(alumnus), 1);
            }
            
//            for (var i = 0; i < $scope.alumni.length; i++){
//                if ($scope.alumni[i].key == alumnus.key){
//                    $scope.alumni.splice(i, 1);
//                    break;
//                }
//            }
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
        $scope.addAlumnus = function(isValid){
            if(isValid){
            newmemberList = newmemberList.concat($('#addalumniForm').serializeObject());
            $('#result').text(JSON.stringify(newmemberList));
            //define variable for ng-repeat
            $scope.adds = newmemberList;
            }else{$scope.submitted = true;}
        };
        
        $scope.submitAlumni = function(){
            
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
                }
                else
                    console.log('ERROR: '+data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
            newmemberList = [];
            $scope.adds = [];
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
        document.getElementById('uploadAlumni').addEventListener('change', readSingleFile, false);
        
       //this function takes the CSV, converts it to JSON and outputs it
        $scope.addAlumni = function(){
            
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
                    var returned_data = JSON.parse(data.data);
                    $.cookie(TOKEN,returned_data.token);
                    $.cookie(USER_NAME, $scope.item.user_name);
                    $.cookie(PERMS, returned_data.perms);
                    $.cookie('FORM_INFO_EMPTY', 'true');
                    console.log($.cookie(TOKEN));
                    window.location.assign("/#/app/accountinfo");
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
    App.controller('membersDirectoryController', function($scope, $rootScope, $http){
        function splitMembers(){
            var council = [];
            var leadership = [];
            var members = [];
            console.log()
            if ($rootScope.directory.members){
                console.log('HOWDY')
                for (var i = 0; i< $rootScope.directory.members.length; i++){
                    if ($rootScope.directory.members[i].perms == MEMBER){
                        members.push($rootScope.directory.members[i]);
                        continue;
                    }
                    if ($rootScope.directory.members[i].perms == LEADERSHIP){
                        leadership.push($rootScope.directory.members[i]);
                        continue;
                    }
                    if ($rootScope.directory.members[i].perms == COUNCIL){
                        console.log('hi')
                        council.push($rootScope.directory.members[i]);
                        continue;
                    }
                }
                $scope.directory = [];
                if (council.length > 0){
                    $scope.directory.push({name: 'Council', data: council});             
                }
                if (leadership.length > 0){
                    $scope.directory.push({name: 'Leadership', data: leadership});               
                }
                if (members.length > 0){
                    $scope.directory.push({name: 'Members', data: members});          
                }
                console.log($scope.directory);
            }
        }
        splitMembers();
//        $http.post('/_ah/api/netegreek/v1/user/directory', packageForSending(''))
//            .success(function(data){
//                if (!checkResponseErrors(data))
//                {
//                    var directory = JSON.parse(data.data)
//                    console.log(directory);
//                    $rootScope.directory = directory;
//                    $scope.directory = $rootScope.directory.members;
//                    $rootScope.loading = false;
//                    splitMembers();
//                }
//                else
//                {
//                    console.log("error: "+ data.error)
//                }
//            })
//            .error(function(data) {
//                console.log('Error: ' + data);
//            });
        $scope.showIndividual = function(member){
            window.location.assign("#/app/directory/"+member.user_name);
        }
        
        //click the buttons to search for that button text
        $('#searchTags button').click(function(){
            var searchValue = $(this).text();
            $('#directorySearch').val(searchValue).change();
        });
        
    });

    App.controller('alumniDirectoryController', function($scope, $rootScope, $http){
        $scope.directory = $rootScope.directory.alumni;
        if (!$scope.directory){
            $rootScope.loading = true;
        }
//        $http.post('/_ah/api/netegreek/v1/user/directory', packageForSending(''))
//            .success(function(data){
//                if (!checkResponseErrors(data))
//                {
//                    var directory = JSON.parse(data.data)
//                    console.log(directory);
//                    $rootScope.directory = directory;
//                    $scope.directory = $rootScope.directory.alumni;
//                    $rootScope.loading = false;
//                    return $rootScope.directory;
//                }
//                else
//                {
//                    console.log("error: "+ data.error)
//                }
//            })
//            .error(function(data) {
//                console.log('Error: ' + data);
//            });
        $scope.showIndividual = function(member){
            window.location.assign("#/app/directory/"+member.user_name);
        }
        
        //click the buttons to search for that button text
        $('#searchTags button').click(function(){
            var searchValue = $(this).text();
            $('#directorySearch').val(searchValue).change();
        });
        
    });

//member profiles
    App.controller('memberprofileController', function($scope, $rootScope, $stateParams, $http){
        var user_name = $stateParams.id;
        if (user_name.toString().length < 2){
            window.location.assign('/#/app/directory');
        }
        
        $scope.members = $rootScope.directory.members;
        if ($scope.members){
            loadMemberData();
        }
        $http.post('/_ah/api/netegreek/v1/user/directory', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    var directory = JSON.parse(data.data)
                    $rootScope.directory = directory;
                    $rootScope.loading = false;
                    $scope.members = directory.members;
                    loadMemberData();
                }
                else
                {
                    console.log("error: "+ data.error)
                }
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });        
    
        function loadMemberData(){
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
                    if ($scope.currentAddress.indexOf('null') > -1){
                        $scope.currentAddress = null;
                    }
                    if ($scope.permanentAddress.indexOf('null') > -1){
                        $scope.permanentAddress = null;
                    }
                    $scope.website = $scope.member.website;
                    $scope.facebook = $scope.member.facebook;
                    $scope.twitter = $scope.member.twitter;
                    $scope.instagram = $scope.member.instagram;
                    $scope.linkedin = $scope.member.linkedin;

                    break;
                }
            }
        }
    });

    

//account info
    App.controller('accountinfoController', function($scope, $http, $rootScope){
        $scope.updatedInfo = false;
        $scope.item = $rootScope.me;
        $http.post('/_ah/api/netegreek/v1/user/get_user_directory_info', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $rootScope.me = JSON.parse(data.data);
                    //define items
                    $scope.userName = $rootScope.me.user_name;
                    $scope.pledgeClass = $rootScope.me.pledge_class;
                    $scope.item = $rootScope.me;
                }
                else
                {
                    console.log('ERROR: '+data);
                }
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        
        $scope.checkAlumni = function(){
            return checkAlumni();
        }

        $scope.updateAccount = function(isValid){
            if(isValid){
                $http.post('/_ah/api/netegreek/v1/user/update_user_directory_info', packageForSending($scope.item))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        $scope.updatedInfo = true;
                        $.removeCookie('FORM_INFO_EMPTY')
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
                    window.location.assign("/#/app/accountinfo");
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
            window.location.assign("/#/app/directory/user/"+member.user_name);
        }
        
    });


//member tagging page
    App.controller('membertagsController', function($scope, $http, $rootScope) {
        function getUsers(){
            $scope.selectedTags = {};
            $scope.selectedUsers = {};
            
            $http.post('/_ah/api/netegreek/v1/auth/get_users', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    var users = JSON.parse(data.data)
                    $rootScope.users = users;
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
                    if (!checkResponseErrors(data)){
                        $rootScope.tags.organizationTags = JSON.parse(data.data).tags;
                    }
                    else{
                        console.log('ERROR: '+data);
                    }
                    
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }
        $scope.getOrganizationTags();
        $scope.addOrganizationTag = function(tag){
            console.log(tag);
            $http.post('/_ah/api/netegreek/v1/manage/add_organization_tag', packageForSending({'tag': tag}))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        console.log('success');
                    }
                    else
                    {
                        console.log('ERROR: '+data);
                    }
                    
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
            if ($rootScope.tags.organizationTags.indexOf(tag) == -1){
                $rootScope.tags.organizationTags.push(tag);
            }
        
        }
        
        $scope.removeOrganizationTag = function(){
            $('#deleteTagModal').modal('hide')
            $http.post('/_ah/api/netegreek/v1/manage/remove_organization_tag', packageForSending({'tag': $scope.modaledTag}))
                .success(function(data){
                    if(checkResponseErrors(data)){openErrorModal(data.error)}
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
            var idx = $rootScope.tags.organizationTags.indexOf($scope.modaledTag)
            $rootScope.tags.organizationTags.splice(idx, 1);
            var tag = $scope.modaledTag;
            $scope.modaledTag = null;
            for (var i = 0; i< $rootScope.users.members.length; i++){
                if ($rootScope.users.members[i].tags.indexOf(tag) > -1){
                    $rootScope.users.members[i].tags.splice($rootScope.users.members[i].tags.indexOf(tag), 1);
                }
            }
        }
        
        $scope.renameOrganizationTag = function(new_tag, isValid){
            if(isValid){
                $('#renameTagModal').modal('hide')
                $http.post('/_ah/api/netegreek/v1/manage/rename_organization_tag', packageForSending({'old_tag': $scope.modaledTag, 'new_tag': new_tag}))
                    .success(function(data){
                        if (!checkResponseErrors(data))
                        {
                        }
                        else
                        {
                            console.log('ERROR: '+data);
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
                var tag = $scope.modaledTag;
                $scope.rename = null;
                var idx = $rootScope.tags.organizationTags.indexOf(tag);
                $rootScope.tags.organizationTags[idx] = new_tag;
                $scope.modaledTag = null;
                for (var i = 0; i< $rootScope.users.members.length; i++){
                    if ($rootScope.users.members[i].tags.indexOf(tag) > -1){
                        $rootScope.users.members[i].tags[$rootScope.users.members[i].tags.indexOf(tag)] = new_tag;
                    }
                }
            }
            else{
                $scope.submitted = true;
            }
        }
        //onclick checkmark tag
            $('.memberTags').on('click', '.checkLabel', function(){
            
            var checkbox = $(this).find(':checkbox');
                        
                if ( checkbox.prop('checked') )
                {
                    $(this).addClass('label-primary').removeClass('label-default');
                    $(this).find('.checkStatus').addClass('fa-check-square-o').removeClass('fa-square-o');
                }
                else
                {
                    $(this).removeClass('label-primary').addClass('label-default');
                    $(this).find('.checkStatus').removeClass('fa-check-square-o').addClass('fa-square-o');
                }
            
        });
       
        $scope.openRenameTagModal = function(tag){
            $('#renameTagModal').modal();
            $scope.modaledTag = tag;
        }
        
        $scope.openDeleteTagModal = function(tag){
            $('#deleteTagModal').modal();
            $scope.modaledTag = tag;
        }
        
        function addTagsToUsers(tags, keys){
            $scope.selectedTags = {};
            $scope.selectedUsers = {};
            var to_send = {'tags': tags, 'keys': keys};
            console.log(to_send);
            $http.post('/_ah/api/netegreek/v1/manage/add_users_tags', packageForSending(to_send))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        console.log('success');
                    }
                    else
                    {
                        console.log('ERROR: '+data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
            for(var j = 0; j < keys.length; j++){
                var key = keys[j];
                console.log('key: ' + key);
                for(var i = 0; i < $rootScope.users.members.length; i++){
                    console.log($rootScope.users.members[i].first_name)
                    console.log($rootScope.users.members[i].key);
                    if ($rootScope.users.members[i].key == key){
                        for(var k = 0; k < tags.length; k++){
                            var tag = tags[k];
                            if ($rootScope.users.members[i].tags.indexOf(tag) == -1){
                                $rootScope.users.members[i].tags.push(tag);
                            }
                        }
                    }
                }
            }
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
            clearCheckLabels();
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
            removeTagsFromUsers(tags, users);

            clearCheckLabels();
        }
    });

//member messaging page
    App.controller('messagingController', function($scope, $http, $q, $rootScope) {
        if (!checkPermissions('leadership')){
            window.location.assign("/#/app");
        }
        function onFirstLoad(){
            $scope.loading = true;
            var tag_list = [];
            if ($rootScope.tags){
                $scope.tags = arrangeTagData($rootScope.tags);
            }
            var deferred = $q.defer();
            var done = 0;
            function checkIfDone() {
                done++;
                if (done==2) deferred.resolve(); 
            }//#TODO change the tags to have 2 fields, one for name, one for checked/unchecked. This would work better with the ng-model
            $http.post('/_ah/api/netegreek/v1/message/get_tags', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data)){
                    var tag_data = JSON.parse(data.data);
                    $scope.tags = arrangeTagData(tag_data);
                    console.log($scope.tags);
                    $rootScope.tags = tag_data;
                }
                else{
                    console.log("error: "+ data.error)
                }
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
            $http.post('/_ah/api/netegreek/v1/message/recently_sent', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $scope.sentMessages = JSON.parse(data.data);
                    console.log($scope.sentMessages);
                }
                else
                {
                    console.log("error: "+ data.error)
                }
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
            return deferred.promise;
        }
        onFirstLoad().then(function(){$scope.loading=false;})
        $scope.selectedTags = {};
        
        
        $scope.sendMessage = function(isValid, tags){
            if (isValid){
                var selected_org_tags = [];
                var selected_perms_tags = [];
                for (var i = 0; i < tags.organizationTags.length; i++){
                    if (tags.organizationTags[i].checked){
                        selected_org_tags.push(tags.organizationTags[i].name);
                    }
                }
                for (var i = 0; i < tags.permsTags.length; i++){
                    if (tags.permsTags[i].checked){
                        if (tags.permsTags[i].name == "Everyone"){
                            selected_perms_tags.push('council');
                            selected_perms_tags.push('member');
                            selected_perms_tags.push('leadership');
                            break;
                        }
                        selected_perms_tags.push(tags.permsTags[i].name);
                    }
                }
                var out_tags = {org_tags: selected_org_tags, perms_tags: selected_perms_tags};
                var to_send = {title: $scope.title, content:$scope.content, tags: out_tags}
                $http.post('/_ah/api/netegreek/v1/message/send_message', packageForSending(to_send))
                    .success(function(data){
                        if (!checkResponseErrors(data))
                        {
                            $http.post('/_ah/api/netegreek/v1/message/recently_sent', packageForSending(''))
                            .success(function(data){
                                if (!checkResponseErrors(data))
                                {
                                    $scope.sentMessages = JSON.parse(data.data);
                                    console.log($scope.sentMessages);
                                }
                                else
                                {
                                    console.log("error: "+ data.error)
                                }
                            })
                            console.log('message sent');
                        }
                        else
                        {
                            console.log("error: "+ data.error)
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
                $scope.title = '';
                $scope.content = '';
                $scope.messagingForm.$setPristine();
                
            }
            else{ $scope.submitted = true; }
        }
        
        $scope.deleteMessage = function(message){
            $('#messageModal').modal('hide');
            var to_send = {message: message.key}
            $http.post('/_ah/api/netegreek/v1/message/delete', packageForSending(to_send))
                    .success(function(data){
                        if (!checkResponseErrors(data))
                        {
                            console.log('message removed');
                        }
                        else
                        {
                            console.log("error: "+ data.error)
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
            $scope.sentMessages.splice($scope.sentMessages.indexOf(message), 1);
        }
        
        $scope.openMessageModal = function(message){
            $('#messageModal').modal();
            $scope.selectedMessage = message;
        }
        
        
        //onclick checkmark tag
        $('#messagingTags').on('click', '.checkLabel', function(){
            
            var checkbox = $(this).find(':checkbox');
                        
                if ( checkbox.prop('checked') )
                {
                    $(this).addClass('label-primary').removeClass('label-default');
                    $(this).find('.checkStatus').addClass('fa-check-square-o').removeClass('fa-square-o');
                }
                else
                {
                    $(this).removeClass('label-primary').addClass('label-default');
                    $(this).find('.checkStatus').removeClass('fa-check-square-o').addClass('fa-square-o');
                }
            
        });
        

        
    });


    App.controller('newEventController', function($scope, $http, $rootScope) {
//        if ($rootScope.tags){
//            $scope.tags = arrangeTagData($rootScope.tags);
//        }
        $scope.event = {};
        $scope.event.tag = '';
        $scope.$watch('event.tag', function() {
            $scope.event.tag = $scope.event.tag.replace(/\s+/g,'');
        });
        $http.post('/_ah/api/netegreek/v1/message/get_tags', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data)){
                    var tag_data = JSON.parse(data.data);
                    $scope.tags = arrangeTagData(tag_data);
                    $rootScope.tags = tag_data;
                }
                else{
                    console.log("error: "+ data.error)
                }
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        
        $scope.addEvent = function(isValid, event){
            console.log(event);
        if(isValid){
                event.tags = getCheckedTags($scope.tags);
                $http.post('/_ah/api/netegreek/v1/event/create', packageForSending(event))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        console.log("event added")
                    }
                    else
                        console.log('ERROR: '+data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
            $scope.event = {}
            }
            else{
                $scope.submitted = true;
            }
            
        }
        $scope.checkTagAvailability = function(tag){
            $http.post('/_ah/api/netegreek/v1/event/check_tag_availability', packageForSending(tag))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        $scope.available = true;
                        $scope.not_available = false;
                    }
                    else{
                        $scope.not_available = true;
                        $scope.available = false;
                    }
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }

                $('.eventTags').on('click', '.checkLabel', function(){
            
            var checkbox = $(this).find(':checkbox');
                        
                if ( checkbox.prop('checked') )
                {
                    $(this).addClass('label-primary').removeClass('label-default');
                    $(this).find('.checkStatus').addClass('fa-check-square-o').removeClass('fa-square-o');
                }
                else
                {
                    $(this).removeClass('label-primary').addClass('label-default');
                    $(this).find('.checkStatus').removeClass('fa-check-square-o').addClass('fa-square-o');
                }
            
        });
        
	});

    App.controller('eventController', function($scope, $http) {              
                //send the organization and user date from registration pages
                $http.post('/_ah/api/netegreek/v1/event/get_events', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        $scope.events = JSON.parse(data.data);
                    }
                    else
                        console.log('ERROR: '+data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
            $scope.showEvent = function(event){
                window.location.assign('#/app/events/' + event.tag_name);
            }
        
	});


    App.controller('eventInfoController', function($scope, $http, $stateParams) {      
        var event_tag = $stateParams.tag;
        $http.post('/_ah/api/netegreek/v1/event/get_events', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        var events = JSON.parse(data.data);
                        for (var i = 0; i < events.length; i++){
                            if (events[i].tag_name == event_tag){
                                $scope.event = events[i];
                                break;
                            }
                        }
                        for (var j = 0; j < $scope.event.going.length; j++){
                            
                        }
                    }
                    else
                        console.log('ERROR: '+data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
	});



//More Functions

//checks to see if user is logged in or not
function checkLogin(){
    if($.cookie(USER_NAME) != undefined){
        return true;
    }
    else
        return false;
}

//clears all checked labels
    function clearCheckLabels(){
    $('.checkLabel.label-primary').find('.checkStatus').removeClass('fa-check-square-o').addClass('fa-square-o');
    $('.checkLabel.label-primary').removeClass('label-primary').addClass('label-default');
    }

function checkPermissions(perms){
    if (PERMS_LIST.indexOf(perms) > PERMS_LIST.indexOf($.cookie(PERMS))){
        return false;
    }
    return true;
}

function checkAlumni(){
    if ($.cookie(PERMS) == ALUMNI){
        return true;
    }
    return false;
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
        window.location.assign("/#/login");
        console.log('ERROR: '+response.error);
        return true;
    }
    else if(response.error == '')
    {
        return false;
    }
    else
    {
        console.log('ERROR: '+response.error);
        return true;    
    }
}
//This function is used to arrange the tag data so that we can use checkboxes with it
function arrangeTagData(tag_data){
    var org_tag_list = [];
    var tags = {};
    if (tag_data.org_tags){
        for(var i = 0; i < tag_data.org_tags.length; i++){
            org_tag_list.push({name: tag_data.org_tags[i].name, checked: false})
        }
    }
    perms_tag_list = [];
    if (tag_data.perms_tags){
        for (var i = 0; i < tag_data.perms_tags.length; i++){
            perms_tag_list.push({name: tag_data.perms_tags[i].name, checked: false})
        }
    }
    tags.organizationTags = org_tag_list;
    tags.permsTags = perms_tag_list;
    tags.eventTags = [];
    return tags;
}
//This should be called at the beginning of any controller that uses the checkbox tags
function clearCheckedTags(tags){
    for (var i = 0; i < tags.organizationTags.length; i++)
        tags.organizationTags[i].checked = false;
    for (var i = 0; i < tags.permsTags.length; i++)
        tags.permsTags[i].checked = false;
    for (var i = 0; i < tags.eventTags.length; i++)
        tags.eventTags[i].checked = false;
    return tags;
}

function getCheckedTags(tags){
    var org_tags= [];
    var perms_tags = [];
    var event_tags = [];
    for (var i = 0; i < tags.organizationTags.length; i++){
        if (tags.organizationTags[i].checked)
            org_tags.push(tags.organizationTags[i].name);
    }
    for (var i = 0; i < tags.eventTags.length; i++){
        if (tags.eventTags[i].checked)
            event_tags.push(tags.eventTags[i].name);
    }
    for (var i = 0; i < tags.permsTags.length; i++){
        if (tags.permsTags[i].checked)
            perms_tags.push(tags.permsTags[i].name);
    }
    return {org_tags: org_tags, event_tags: event_tags, perms_tags: perms_tags};
}

function openErrorModal(error){
    $('#errorModal').modal();
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

App.filter('multipleSearch', function(){ 
    return function (objects, search) {
        var searchValues = search;
        if (!search){
            return objects;
        }
        retList = [];
        var searchArray = search.split(" ");
        for (var oPos = 0; oPos < objects.length; oPos++){
            var object = objects[oPos];
            for(var sPos = 0; sPos< searchArray.length; sPos++){
                var check = false;
                var searchItem = searchArray[sPos];
                for(var item in object){
                    if(object[item] && object[item].toString().toLowerCase().indexOf(searchItem.toLowerCase()) > -1){
                        check = true;
                        break;
                    }
                }
                if(!check){
                    break;
                }
                if(sPos == searchArray.length-1 && check){
                    console.log('adding to retlist');
                    retList.push(object);
                }
            }
        }
        return retList;
    }
});App.filter('tagDirectorySearch', function(){ 
    return function (objects, tags) {
        if (!tags){return null;}
            var tags_list = []
        if (tags.organizationTags){
            for (var i = 0; i < tags.organizationTags.length; i++){
                if (tags.organizationTags[i].checked){
                    tags_list.push(tags.organizationTags[i].name);
                }
            }
        }
        if (tags.permsTags){
            for (var j = 0; j < tags.permsTags.length; j++){
                if (tags.permsTags[j].checked){
                    if (tags.permsTags[j].name == "Everyone"){
                        tags_list.push("member");
                        tags_list.push("leadership");
                        tags_list.push("council");
                    }
                    if (tags.permsTags[j].name == "Members"){
                        tags_list.push("member");
                    }
                    else{
                    tags_list.push(tags.permsTags[j].name)}
                }
            }
        }
            out_string = '';
            for (var j = 0; j < tags_list.length; j++){
                out_string += tags_list[j] + ' ';
            }
        var search = out_string;
        if (!search){
            return null;
        }
        retList = [];
        
        var searchArray = search.split(" ");
        for (var oPos = 0; oPos < objects.length; oPos++){
            var object = objects[oPos];
            for(var sPos = 0; sPos< searchArray.length; sPos++){
                var check = false;
                var searchItem = searchArray[sPos];
                if(object.tags.indexOf(searchItem.toString()) > -1 && retList.indexOf(object) == -1){
                    retList.push(object);
                    break;
                }
                if(object.perms.toLowerCase() == searchItem.toString().toLowerCase() && retList.indexOf(object) == -1){
                    retList.push(object);
                    break;
                }
            }
        }
        return retList;
    }
});


App.filter('directorySearch', function(){ 
    return function (in_objects, search) {
        var searchValues = search;
        if (!search){
            return in_objects;
        }
        var out_objects = [];
        console.log(in_objects.length);
        for(var j = 0; j < in_objects.length; j++){
            var objects = in_objects[j].data;
            retList = [];
            var searchArray = search.split(" ");
            for (var oPos = 0; oPos < objects.length; oPos++){
                var object = objects[oPos];
                for(var sPos = 0; sPos< searchArray.length; sPos++){
                    var check = false;
                    var searchItem = searchArray[sPos];
                    for(var item in object){
                        if(object[item] && object[item].toString().toLowerCase().indexOf(searchItem.toLowerCase()) > -1){
                            check = true;
                            break;
                        }
                    }
                    if(!check){
                        break;
                    }
                    if(sPos == searchArray.length-1 && check){
                        retList.push(object);
                    }
                }
            }
            if (retList.length > 0){
                in_objects[j].data = retList;
            }
        }
        console.log('finished directorySearch');
        return in_objects;
    }
});


App.factory('directoryService', function($rootScope, $http) {
    if ($rootScope.directory === undefined){
        $rootScope.loading = true;
        $http.post('/_ah/api/netegreek/v1/user/directory', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    var directory = JSON.parse(data.data)
                    $rootScope.directory = directory;
                    $rootScope.loading = false;
                    return $rootScope.directory;
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
    else{
        $http.post('/_ah/api/netegreek/v1/user/directory', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $rootScope.directory = JSON.parse(data.data);
                }
                else
                {
                    console.log("error: "+ data.error)
                }
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        return $rootScope.directory;
    }
});


