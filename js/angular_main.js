//#FIXME account info page, the state model is still not registering change (it can say Texas, but registers Tennessee)
//#FIXME Sometimes the nav bar doesnt load after being fored logged out and logging into another account.
//#TODO: fix check username tags in newmemberinfo and registerinfo pages
//#TODO get it to where you can see all messages after they're hidden
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
var App = angular.module('App', ['ui.router', 'ngAnimate', 'mgcrea.ngStrap', 'ui.rCalendar']);
App.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise("/")
    .when("/app/managemembers", "/app/managemembers/manage")
    .when("/app", "/app/home")
    .when("/app/managealumni", "/app/managealumni/manage")
    .when("/app/directory", "/app/directory/members");
    
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
                    templateUrl : 'Static/loading.html',
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
            .state('app.eventInfo', {
                    url : '/events/:tag',
                    templateUrl : 'Static/eventinfo.html',
                    controller : 'eventInfoController'
                })
            .state('app.editEvent',{
                    url : '/events/:tag/edit',
                    templateUrl : 'Static/editevent.html',
                    controller : 'editEventsController'
                })
            .state('app.eventCheckin',{
                    url : '/events/:tag/checkin',
                    templateUrl : 'Static/eventcheckin.html',
                    controller : 'eventCheckInController'
                })
            .state('app.eventCheckinReport',{
                //#TODO put this into each individual event :tag
                    url : '/events/:tag/report',
                    templateUrl : 'Static/eventcheckinreport.html',
                    controller : 'eventCheckInReportController'
                })
            .state('app.subscriptionInfo',{
                //#TODO put this into each individual event :tag
                    url : '/subscriptioninfo',
                    templateUrl : 'Static/subscriptioninfo.html',
                    controller : 'subscriptionInfoController'
                })
    });

//Set up run commands for the app
    App.run(function ($rootScope, $state, $stateParams, $http, $q) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.directory = {};
        $rootScope.users = {};
        $rootScope.notification_count = "0";
        $rootScope.tags = {};
        $rootScope.updatingNotifications = false;
        
        $rootScope.updateNotifications = function(){
            $('.fa-refresh').addClass('fa-spin');
            $http.post('/_ah/api/netegreek/v1/notifications/get', packageForSending(''))
            .success(function(data){
                for (var i = 0; i < $rootScope.notifications.length; i++){
                    $rootScope.notifications[i].collapseOut = false;
                }
                
                $rootScope.$apply();
                $rootScope.notifications = JSON.parse(data.data).notifications;
                console.log($rootScope.notifications);
                for (var i = 0; i < $rootScope.notifications.length; i++){
                        $rootScope.notifications[i].collapseOut = true;  
                }
                $rootScope.updateNotificationBadge();
                setTimeout(function(){
                    $('.fa-refresh').removeClass('fa-spin')},930);
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
        $rootScope.showNav = true;
    });

//navigation header
    App.controller('navigationController', function($scope, $http, $rootScope, LoadScreen){
        
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
        
        $('.navbar-brand').on('click', function(){
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
                LoadScreen.stop();
                $rootScope.users = {};
                window.location.assign("/#/login");
                $rootScope.refreshPage();
        }
    });
    App.controller('indexController', function($scope, $http, LoadScreen) {
	});
//home page
//    App.controller('homeController', function($scope, $http) {
//        
//	});
    
    App.controller('appController', function($scope, $http, $interval, $rootScope, Load, LoadScreen) {
        Load.then(function(){
            if(!checkLogin()){
                window.location.assign("/#/login");
            }
            if(!$rootScope.updatingNotifications){
                $rootScope.updatingNotifications = true;
            $interval(function(){$rootScope.updateNotifications();}, 40000);}
            LoadScreen.stop();
        })
	});

//login page
	App.controller('loginController', function($scope, $http, $rootScope, LoadScreen) {
        $.removeCookie(USER_NAME);
        $.removeCookie(TOKEN);
        $.removeCookie(PERMS);
        $.removeCookie('FORM_INFO_EMPTY')
        $rootScope.directory = {};
        LoadScreen.stop();
        $rootScope.users = {};
        $scope.login = function(user_name, password){
            LoadScreen.start();
            $http.post('/_ah/api/netegreek/v1/auth/login', packageForSending({user_name: user_name, password: password}))
                .success(function(data) {
                    if(!checkResponseErrors(data))
                    {
                        returned_data = JSON.parse(data.data);
                        $.cookie(USER_NAME, user_name);
                        $.cookie(TOKEN, returned_data.token);
                        $.cookie(PERMS, returned_data.perms);
                        window.location.assign("#/app");
                    }
                    else{
                        if (data.error == "BAD_LOGIN"){
                            $scope.badLogin = true;
                            LoadScreen.stop();
                        }   
                    }
                })
                .error(function(data) {
                    $scope.login(user_name, password);
                    console.log('Error: ' + data);
                });
        };
        $scope.forgotPassword = function(){
        window.location.assign('/#/forgotpassword'); 
        }
    });

//getting a forgotten password email
    App.controller('forgotPasswordController', function($scope, $http){
        $scope.sentEmail = false;
        $scope.reset = function(email, user_name) {
            if (email === undefined){
                email = '';
            }
            to_send = {email: email, user_name: user_name};
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
    App.controller('changePasswordController', function($scope, $http, Load) {
    Load.then(function(){    
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
    });

//the registration page
    App.controller('registerController', function($scope, $http, $rootScope, registerOrganizationService, LoadScreen){
        $.removeCookie(USER_NAME);
        $.removeCookie(TOKEN);
        $.removeCookie(PERMS);
        $.removeCookie('FORM_INFO_EMPTY');
        $rootScope.directory = {};
        $rootScope.users = {};
        $scope.data = {};
        LoadScreen.stop();
        $scope.continue = function(isValid, data){
            $scope.error = false;
            if(isValid){
                registerOrganizationService.set(data);
                window.location.assign('#/registerinfo');
            }
            else{
                $scope.error = true;
            }
        }
        //this page passes parameters through a get method to register info
    });

//the register info page
    App.controller('registerinfoController', function($scope, $http, registerOrganizationService, $rootScope) {
        if (registerOrganizationService.get() === undefined){
            window.location.assign('#/register');
        }
        $scope.$watch('user_name', function() {
                $scope.user_name = $scope.user_name.replace(/\s+/g,'');
        });
        //ng-submit on form submit button click
        
        $scope.checkUserName = function(user){
        $http.post('/_ah/api/netegreek/v1/user/check_username', packageForSending(user))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        $scope.available = true;
                        $scope.unavailable = false;
                    }
                    else{
                        console.log('ERROR: '+data);
                        $scope.available = false;
                        $scope.unavailable = true;}  
                });
        }
        $scope.registerinfoClick = function(item, isValid){
        
        if(isValid){
                
            var organization = registerOrganizationService.get();
                //it would be great if we could add validation here to see if the organization information was correctly added from the previous page
    //            if(organization.name === null || organization.school === null || organization.type === null){
    //                window.location.assign("/#/register");
    //            }
                //format data for the api
                data_tosend = {organization: organization, user: item}
                //send the organization and user date from registration pages
                $http.post('/_ah/api/netegreek/v1/auth/register_organization', packageForSending(data_tosend))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        var responseData = JSON.parse(data.data);
                        $.cookie(TOKEN,  responseData.token);
                        $.cookie(PERMS, responseData.perms);
                        $.cookie("USER_NAME", data_tosend.user.user_name);
                        window.location.assign("/#/app/managemembers/add");
                        $rootScope.refresh();
                    }
                    else{
                        if (data.error == 'USERNAME_TAKEN'){
                            $scope.unavailable = true;
                            $scope.available = false;
                        }
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
        };
	});

//the payment page
    App.controller('paymentController', function($scope, $http) {
        //skip payment page right now
        $scope.pay = {};
        $scope.submitPayment = function(){
            
            $http.post('/_ah/api/netegreek/v1/pay/subscribe', packageForSending($scope.pay))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    window.location.assign("#/app");
                }
                else
                    console.log('ERROR: '+JSON.stringify(data));
            })
            .error(function(data) {
                console.log('Error: ' + JSON.stringify(data));
            }); 
        };
    });

//the main app page
    App.controller('appHomeController', function($scope, $http, $rootScope, Load) {
        Load.then(function(){
        $scope.currentPage = 0;
        $scope.pageSize = 10;
        $scope.maxPageNumber = 5;
//        $scope.getUser = function(notify){
//            if(!notify.sender){
//                return null;
//            }
//            for(var i = 0; i < $rootScope.users.members; i++){
//                if ($rootScope.users.members[i].key == notify.sender){
//                    return $rootScope.users.members[i];
//                }
//            }
//        }
        $scope.updateStatus = function(status){
        var to_send = {'status': status};
        $http.post('/_ah/api/netegreek/v1/user/update_status', packageForSending(to_send));
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
            $scope.selectedNotificationUser = undefined;
            for(var i = 0; i < $rootScope.users.members.length; i++){
                console.log($rootScope.users.members[i].key);
                if ($rootScope.users.members[i].key == notify.sender){
                    $scope.selectedNotificationUser = $rootScope.users.members[i];
                    console.log('I found it!');
                }
            }
            $scope.selectedNotification.new = false;
            $rootScope.updateNotificationBadge();
            var key = $scope.selectedNotification.key;
            $http.post('/_ah/api/netegreek/v1/notifications/seen', packageForSending({'notification': key}));
        }
        
        $scope.hideNotification = function(notify){
            var key = notify.key;
            //$http.post('/_ah/api/netegreek/v1/notifications/hide', packageForSending({'notification': key}));
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
	});

//the add members page
    App.controller('managemembersController', function($scope, $http, $rootScope, Load, LoadScreen) {
        Load.then(function(){
        //#FIXME When I refresh on the manage members page it shows your account, when I click into it though it does not.
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
        //#TODO this should now be fixed to where it can delete multiple checked members in this modal
        
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
            $('#addmemberForm').find('input').val('');
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
            LoadScreen.stop();
        }
        
        function onPageLoad(){
            console.log('page is loading');
            if($rootScope.users.members){
                assignAngularViewModels($rootScope.users.members);
                $scope.getMembers();
            }
            else{
                LoadScreen.start();
                $scope.getMembers();
            }
        }
        onPageLoad();
        
        $scope.removeMember = function(user){
            $('#deleteMemberModal').modal('hide');
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
        
        //onclick checkmark tag
        $('#manageMembers').on('click', '.checkLabel', function(){
            
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

    App.controller('managealumniController', function($scope, $http, $rootScope, Load){
        Load.then(function(){
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
            LoadScreen.stop();
        }
        /*This function is the first function to run when the controller starts. This deals with caching data so we dont have to pull data evertytime we load the page*/
        function onPageLoad(){
            console.log('page is loading');
            if($rootScope.users.alumni){
                assignAngularViewModels($rootScope.users.alumni);
                getAlumni();
            }
            else{
                LoadScreen.start();
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
    });

    App.controller('addAlumniController', function($scope, $http, Load){
        Load.then(function(){
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
            $('#addalumniForm').find('input').val('');
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
    });

//new member info page
    App.controller('newmemberinfoController', function($scope, $http){
        $scope.user_is_taken = false;
        $scope.waiting_for_response = false;
        $scope.$watch('item.user_name', function() {
            $scope.item.user_name = $scope.item.user_name.replace(/\s+/g,'');
        });
        $scope.checkUserName = function(user){
        $http.post('/_ah/api/netegreek/v1/user/check_username', packageForSending(user))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        $scope.available = true;
                        $scope.unavailable = false;
                    }
                    else{
                        console.log('ERROR: '+data);
                        $scope.available = false;
                        $scope.unavailable = true;}  
                });
        }
        
        $scope.createAccount = function(isValid){
            
            if(isValid){
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
            else{
            $scope.submitted = true;
            }
        }
        
    });

//adding profile pictures
    App.controller('profilepictureController', function($scope, $http, Load){

    Load.then(function(){
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
    });

//the directory
    App.controller('membersDirectoryController', function($scope, $rootScope, $http, Load, LoadScreen){
    Load.then(function(){
        function splitMembers(){
            var council = [];
            var leadership = [];
            var members = [];
            if ($rootScope.directory.members){
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
                    $scope.directory.push({name: 'council', data: council});             
                }
                if (leadership.length > 0){
                    $scope.directory.push({name: 'leadership', data: leadership});               
                }
                if (members.length > 0){
                    $scope.directory.push({name: 'member', data: members});          
                }
            }
        }
        splitMembers();
        $http.post('/_ah/api/netegreek/v1/user/directory', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    var directory = JSON.parse(data.data)
                    console.log(directory);
                    $rootScope.directory = directory;
                    $scope.directory = $rootScope.directory.members;
                    LoadScreen.stop();
                    splitMembers();
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
            window.location.assign("#/app/directory/"+member.user_name);
        }
        
        //click the buttons to search for that button text
        $('#searchTags button').click(function(){
            var searchValue = $(this).text();
            $('#directorySearch').val(searchValue).change();
        });
        
    });
    });

    App.controller('alumniDirectoryController', function($scope, $rootScope, $http, Load, LoadScreen){
    Load.then(function(){    
        $scope.directory = $rootScope.directory.alumni;
        if (!$scope.directory){
            LoadScreen.start();
        }
//        $http.post('/_ah/api/netegreek/v1/user/directory', packageForSending(''))
//            .success(function(data){
//                if (!checkResponseErrors(data))
//                {
//                    var directory = JSON.parse(data.data)
//                    console.log(directory);
//                    $rootScope.directory = directory;
//                    $scope.directory = $rootScope.directory.alumni;
//                    LoadScreen.start();
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
    });

//member profiles
    App.controller('memberprofileController', function($scope, $rootScope, $stateParams, $http, Load, LoadScreen){
    $scope.saveVcard = function(){
        var user = $scope.member;
        var out_string = 'BEGIN:VCARD\nVERSION:4.0\nN:' + user.last_name + ';' + user.first_name + ';;;\n'; //name
        out_string += 'FN:' + user.first_name + ' ' + user.last_name + '\n';//FN
        out_string += 'TEL;TYPE=cell,voice;VALUE=uri:tel:+1-' + user.phone + '\n'; //Phone
        out_string += 'EMAIL:' + user.email + '\n';
        out_string += 'ADR;TYPE=home;LABEL=' + '\"' + user.address + '\\n'+ user.city + ',' + user.state + ' ' +user.zip + '\\nUnited States of America\"\n';
        out_string += ' :;;'+ user.address + ';' + user.city + ';' + user.state + ';' + user.zip + ';' + 'United States of America\n';
        console.log(user.prof_pic);
        if (user.prof_pic.indexOf('jpg') > -1){
            out_string += 'PHOTO;MEDIATYPE=image/jpeg:' + user.prof_pic + '\n';
        }
        else if (user.prof_pic.slice(user.prof_pic.length-5).indexOf('gif') > -1){
            out_string += 'PHOTO;MEDIATYPE=image/gif:' + user.prof_pic + '\n';
        }
        else if (user.prof_pic.slice(user.prof_pic.length-5).indexOf('png') > -1){
            out_string += 'PHOTO;MEDIATYPE=image/png:' + user.prof_pic + '\n';
        }
        out_string += 'END:VCARD';
        var blob = new Blob([out_string], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "contact.vcf");
    }
    Load.then(function(){
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
                    LoadScreen.stop();
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
                     //define profile information
                    $scope.status = $scope.member.status;
                    var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    if ($scope.member.grad_month && $scope.member.grad_year){
                        $scope.graduation = month[$scope.member.grad_month-1] + " " + $scope.member.grad_year;
                    }
                    $scope.major = $scope.member.major;
                    $scope.firstName = $scope.member.first_name;
                    $scope.lastName = $scope.member.last_name;
                    $scope.email = $scope.member.email;
                    $scope.birthday = $scope.member.dob
                    $scope.phone = $scope.member.phone;
                    $scope.currentAddress = $scope.member.address+" "+$scope.member.city+" "+$scope.member.state+" "+$scope.member.zip;
                    $scope.position = $scope.member.position;
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
    });

    

//account info
    App.controller('accountinfoController', function($scope, $http, $rootScope, Load){
    Load.then(function(){
        $scope.updatedInfo = false;
        $scope.item = $rootScope.me;
        $http.post('/_ah/api/netegreek/v1/user/get_user_directory_info', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $rootScope.me = JSON.parse(data.data);
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
                console.log($scope.item.dob);
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
    });

//upload image
    App.controller('uploadImageController', function($scope, $http, Load){
    Load.then(function(){
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
    });

//member tagging page
    App.controller('membertagsController', function($scope, $http, $rootScope, Load) {
        $scope.typeAheadModel = function(item){
            return JSON.stringify(['hi']);
        }
        $scope.selectTagFromTypeAhead = function(tag){
            console.log('howdy');
            for(var i = 0; i < $scope.tags.length; i ++){
                if ($scope.tags[i].name == tag)  {
                    $scope.tags[i].checked = true;

                    return;
                }
                $scope.selectedTagName = "";
            }
        }
        $scope.selectedTag = "";
        $scope.test_string = ["howdy", "hello", "applesauce"];
        Load.then(function(){
        
        function getUsers(){
            $scope.users = [];
            $http.post('/_ah/api/netegreek/v1/auth/get_users', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    var users = JSON.parse(data.data);
                    var out_users = [];
                    for (var i = 0; i < users.members.length; i ++){
                        var user = users.members[i];
                        user.name = users.members[i].first_name + " " + users.members[i].last_name;
                        user.checked = false;
                        out_users.push(user);
                    }
                    $scope.users = out_users;
                    
                    $rootScope.users = users;
                    console.log("HERE");
                    console.log($scope.users);
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
            $http.post('/_ah/api/netegreek/v1/message/get_tags', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        var org_tags = JSON.parse(data.data).org_tags;
                        var out_tags = [];
                        for (var i = 0; i < org_tags.length; i++){
                            org_tags[i].checked = false;
                            out_tags.push(org_tags[i]);
                        }
                        $rootScope.tags = JSON.parse(data.data);
                        $scope.org_tags = out_tags;
                        $rootScope.org_tag_data = $scope.org_tags;
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
            if ($rootScope.tags.org_tags.indexOf(tag) == -1){
                $rootScope.tags.org_tags.push(tag);
            }
            $("#addTag input").val("");
        }
        
        $scope.removeOrganizationTag = function(){
            $('#deleteTagModal').modal('hide')
            $http.post('/_ah/api/netegreek/v1/manage/remove_organization_tag', packageForSending({'tag': $scope.modaledTag.name}))
                .success(function(data){
                    if(checkResponseErrors(data)){openErrorModal(data.error)}
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
            var idx = $rootScope.tags.org_tags.indexOf($scope.modaledTag);
            $rootScope.tags.org_tags.splice(idx, 1);
            $scope.org_tags.splice($scope.org_tags.indexOf($scope.modaledTag), 1);
            var tag = $scope.modaledTag;
            $scope.modaledTag = null;
            for (var i = 0; i< $rootScope.users.members.length; i++){
                if ($rootScope.users.members[i].tags.indexOf(tag.name) > -1){
                    $rootScope.users.members[i].tags.splice($rootScope.users.members[i].tags.indexOf(tag.name), 1);
                }
            }
            for (var i = 0; i< $scope.users.length; i++){
                if ($scope.users[i].tags.indexOf(tag.name) > -1){
                    $scope.users[i].tags.splice($scope.users[i].tags.indexOf(tag.name), 1);
                }
            }
        }
        
        $scope.renameOrganizationTag = function(new_tag, isValid){
            if(isValid){
                $('#renameTagModal').modal('hide')
                $http.post('/_ah/api/netegreek/v1/manage/rename_organization_tag', packageForSending({'old_tag': $scope.modaledTag.name, 'new_tag': new_tag}))
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
                var idx = $rootScope.tags.org_tags.indexOf(tag);
                $rootScope.tags.org_tags[idx] = {name:new_tag, checked:false};
                $scope.org_tags[$scope.org_tags.indexOf(tag)] = {name:new_tag, checked:false};
                $scope.modaledTag = null;
                for (var i = 0; i< $rootScope.users.members.length; i++){
                    if ($rootScope.users.members[i].tags.indexOf(tag.name) > -1){
                        $rootScope.users.members[i].tags[$rootScope.users.members[i].tags.indexOf(tag.name)] = new_tag;
                    }
                }
            }
            else{
                $scope.submitted = true;
            }
        }
        
        $scope.$watch('item.tag', function() {
            $scope.item.tag = $scope.item.tag.replace(/\s+/g,'');
        });
        
        //onclick checkmark tag
//        $('.memberTags').on('click', '.checkLabel', function(){
//            
//            var checkbox = $(this).find(':checkbox');
//                        
//                if ( checkbox.prop('checked') )
//                {
//                    $(this).addClass('label-primary').removeClass('label-default');
//                    $(this).find('.checkStatus').addClass('fa-check-square-o').removeClass('fa-square-o');
//                }
//                else
//                {
//                    $(this).removeClass('label-primary').addClass('label-default');
//                    $(this).find('.checkStatus').removeClass('fa-check-square-o').addClass('fa-square-o');
//                }
//            
//        });
       
        $scope.openRenameTagModal = function(tag){
            $('#renameTagModal').modal();
            $scope.modaledTag = tag;
        }
        
        $scope.openDeleteTagModal = function(tag){
            $('#deleteTagModal').modal();
            $scope.modaledTag = tag;
        }
        
        function addTagsToUsers(tags, keys){
            var to_send = {'tags': tags, 'keys': keys};
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
            for(var j = 0; j < $scope.users.length; j++){
                var user = $scope.users[j];
                console.log(user);
                for(var i = 0; i < $scope.org_tags.length; i++){
                    if ($scope.org_tags[i].checked && user.tags.indexOf($scope.org_tags[i].name) < 0){
                        user.tags.push($scope.org_tags[i].name);
                        console.log('tag name '+ $scope.org_tags[i].name);
                    }
                }
            }
        }
        
        $scope.addTagsToUsers = function(){
            var tags = $scope.org_tags;
            var users = $scope.users;
            selected_tags = [];
            selected_keys = [];
            console.log($scope.org_tags);
            for (var i = 0; i < tags.length; i++){
                if (tags[i].checked){
                    selected_tags.push(tags[i].name);
                }
            }
            for (var i = 0; i < users.length; i++){
                if (users[i].checked){
                    selected_keys.push(users[i].key);
                }
            }
            console.log(selected_keys);
            console.log(selected_tags);
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

            removeTagsFromUsers(tags, users);
            clearCheckLabels();
        }
    });
    });

//member messaging page
    App.controller('messagingController', function($scope, $http, $q, $rootScope, Load) {
    Load.then(function(){    
        if (!checkPermissions('leadership')){
            window.location.assign("/#/app");
        }
        $scope.currentPage = 0;
        $scope.pageSize = 10;
        $scope.maxPageNumber = 5;
        function onFirstLoad(){
            $scope.loading = true;
            var tag_list = [];
            $scope.tags =$rootScope.tags;
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
                    $scope.tags = tag_data;
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
                tags = getCheckedTags($scope.tags);
                var out_tags = tags;
                var to_send = {title: $scope.title, content:$scope.content, tags: out_tags}
                $http.post('/_ah/api/netegreek/v1/message/send_message', packageForSending(to_send))
                    .success(function(data){
                        if (!checkResponseErrors(data))
                        {
                            clearCheckedTags($scope.tags);
                            setTimeout(function(){
                            $http.post('/_ah/api/netegreek/v1/message/recently_sent', packageForSending(''))
                            .success(function(data){
                                if (!checkResponseErrors(data))
                                {
                                    $scope.sentMessages = JSON.parse(data.data);
                                }
                                else
                                {
                                    console.log("error: "+ data.error)
                                }
                            })
                            },2000);
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
    });
    });


    App.controller('newEventController', function($scope, $http, $rootScope, Load) {
//        if ($rootScope.tags){
//            $scope.tags = arrangeTagData($rootScope.tags);
//        }
        Load.then(function(){
            $scope.event = {};
            $scope.event.tag = '';
            $scope.tags = $rootScope.tags;
            $scope.$watch('event.tag', function() {
                $scope.event.tag = $scope.event.tag.replace(/\s+/g,'');
            });
            $http.post('/_ah/api/netegreek/v1/message/get_tags', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        $scope.tags = JSON.parse(data.data);
                        $rootScope.tags = JSON.parse(data.data);
                    }
                    else{
                        console.log("error: "+ data.error)
                    }
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });

            $scope.addEvent = function(isValid, event){
                if(isValid){
                    
                    event.tags = getCheckedTags($scope.tags);
                    var to_send = JSON.parse(JSON.stringify(event));
                    to_send.time_start = momentUTCTime(event.date_start + " " + event.time_start).format('MM/DD/YYYY hh:mm a');
                    to_send.time_end = momentUTCTime(event.date_end + " " + event.time_end).format('MM/DD/YYYY hh:mm a');
                    console.log(to_send.time_end);
                    $http.post('/_ah/api/netegreek/v1/event/create', packageForSending(to_send))
                    .success(function(data){
                        if (!checkResponseErrors(data)){
                            setTimeout(function(){window.location.assign('#/app/events/'+event.tag);},500);
                        }
                        else
                            console.log('ERROR: '+data);
                        $scope.loading = false;
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                        $scope.loading = false;
                    });
                $scope.loading = true;
                $scope.unavailable = false;
                $scope.available = false;
                }
                else{
                    $scope.submitted = true;
                }
            }
            $scope.checkTagAvailability = function(tag){
                
                if (tag = ""){
                    $scope.isEmpty = true;
                }
                else{
                    $scope.isEmpty = false;
                    console.log('im here');
                    $http.post('/_ah/api/netegreek/v1/event/check_tag_availability', packageForSending(tag))
                    .success(function(data){
                        if (!checkResponseErrors(data)){
                            $scope.available = true;
                            $scope.unavailable = false;
                        }
                        else{
                            $scope.unavailable = true;
                            $scope.available = false;
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
                }
            }
        });

    });

    App.controller('eventsController', function($scope, $http, Load) {
        Load.then(function(){
                //send the organization and user date from registration pages
                $http.post('/_ah/api/netegreek/v1/event/get_events', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        $scope.events = JSON.parse(data.data);
                        $scope.eventSource = [];
                        for (var i = 0; i< $scope.events.length; i++){
                            $scope.eventSource.push({title: $scope.events[i].title, startTime: new Date($scope.events[i].time_start), endTime: new Date( $scope.events[i].time_end)});
                        }
                        console.log($scope.eventSource);
                    }
                    else
                        console.log('ERROR: '+data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
            
            $scope.showDate = function(start, end){
                var mStart = momentInTimezone(start);
                
                if (mStart.diff(moment()) > 0){
                   return mStart.calendar(); 
                }
                var mEnd = momentInTimezone(end);
                if (mStart.diff(moment()) < 0 && mEnd.diff(moment())>0){
                    return 'Happening Now';
                }
                if (mEnd.diff(moment()) < 0){
                    return 'Already Happened';
                }
            }
            $scope.showEvent = function(event){
                window.location.assign('#/app/events/' + event.tag);
            }
	   });
	});


    App.controller('eventInfoController', function($scope, $http, $stateParams, $rootScope, $q, Load, getEvents){
        $scope.going = false;
        $scope.not_going = false;
        $scope.loading = true;
        $scope.goToReport = function(){
            window.location.assign("#/app/events/" + $stateParams.tag + "/report");
        }
        Load.then(function(){
        $scope.tags = $rootScope.tags;
        var event_tag = $stateParams.tag;
        tryLoadEvent(0);
	   });
        function tryLoadEvent(count){
            LoadEvents();
            function LoadEvents(){
                $http.post('/_ah/api/netegreek/v1/event/get_events', packageForSending(''))
                    .success(function(data){
                        if (!checkResponseErrors(data)){
                            var events = JSON.parse(data.data);
                            $rootScope.events = events;
                            getEventAndSetInfo(events, count);
                        }
                        else{
                            console.log('ERROR: '+data);
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
            }
        }   
        function getEventAndSetInfo(events, count){
            function getUsersFromKey(key){
                for (var i = 0; i < $rootScope.directory.members.length; i++){
                    console.log($rootScope.directory.members[i].key);
                    if ($rootScope.directory.members[i].key == key){
                        return $rootScope.directory.members[i];
                    }
                }
                return null;
            }
            var event = undefined;
            for (var i = 0; i < events.length; i++){
                if (events[i].tag == $stateParams.tag){
                    event = events[i];
                    break;
                }
            }
            if (event === undefined){
                if (count < 3){
                    console.log(count);
                setTimeout(function(){tryLoadEvent(count+1)}, 500);
                return;
                }
                else{
                    $scope.eventNotFound = true;
                    $scope.loading = false;
                    return;
                }
            }
            event.going_list = []
            event.not_going_list = []
            for (var i = 0; i < event.going.length; i++){
                var user_push = getUsersFromKey(event.going[i])
                event.going_list.push(user_push);
                console.log(user_push.user_name);
                console.log($rootScope.me.user_name);
                if (user_push.user_name == $rootScope.me.user_name){
                    $scope.going = true;
                    $scope.not_going = false;
                }
            }
            for (var i = 0; i < event.not_going.length; i++){
                var user_push = getUsersFromKey(event.not_going[i])
                event.not_going_list.push(user_push);
                if (user_push.user_name == $rootScope.me.user_name){
                    $scope.not_going = true;
                    $scope.going = false;
                }
            }
            $scope.creator = getUsersFromKey(event.creator);
            $scope.event = event;
            $scope.time_start = momentInTimezone($scope.event.time_start).format('MM/DD/YYYY hh:mm A');
            $scope.time_end = momentInTimezone($scope.event.time_end).format('MM/DD/YYYY hh:mm A');  
            $scope.loading = false;
        }
        $scope.editEvent = function(){
            window.location.assign('#/app/events/'+$stateParams.tag+'/edit');
        }
        $scope.rsvp = function(rsvp){
            console.log($scope.event.key);
            var to_send = {key: $scope.event.key};
            console.log("what is going on");
            if (rsvp){
                to_send.rsvp = 'going';
            }
            else{
                to_send.rsvp = 'not_going';
            }
            to_send.key = $scope.event.key;
            $http.post('/_ah/api/netegreek/v1/event/rsvp', packageForSending(to_send))
                    .success(function(data){
                        if (!checkResponseErrors(data)){
                            if (rsvp){
                                $scope.going = true;
                                $scope.not_going = false;
                            }
                            else{
                                $scope.going = false;
                                $scope.not_going = true;
                            }
                        }
                        else{
                            console.log('ERROR: '+data);
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
        }
	});
    



    App.controller('editEventsController', function($scope, $http, $stateParams, $rootScope, $q, Load, getEvents){
        $scope.loading = true;
        Load.then(function(){
        $scope.tags = $rootScope.tags;
        var event_tag = $stateParams.tag;
        tryLoadEvent(0);
	   });
    
        $scope.openDeleteEventModal = function(){
            $('#deleteEventModal').modal();
        }
        $scope.deleteEvent = function(){
            $('#deleteEventModal').modal('hide');
            $http.post('/_ah/api/netegreek/v1/event/delete', packageForSending({tag: $stateParams.tag}))
            .success(function(data){
                if (!checkResponseErrors(data)){
                    window.location.replace('#/app/events');
                    for (var i = 0; i < $rootScope.events.length; i++){
                        if ($rootScope.events[i].tag == $stateParams.tag){
                            $rootScope.events.splice(i, 1);
                            break;
                        }
                    }
                }
            });
        }
        function tryLoadEvent(count){
            LoadEvents();
            function LoadEvents(){
                $http.post('/_ah/api/netegreek/v1/event/get_events', packageForSending(''))
                    .success(function(data){
                        if (!checkResponseErrors(data)){
                            var events = JSON.parse(data.data);
                            $rootScope.events = events;
                            getEventAndSetInfo(events, count);
                        }
                        else{
                            console.log('ERROR: '+data);
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
                }
        }   
        function getEventAndSetInfo(events, count){
            function getUsersFromKey(key){
                for (var i = 0; i < $rootScope.directory.members.length; i++){
                    console.log($rootScope.directory.members[i].key);
                    if ($rootScope.directory.members[i].key == key){
                        return $rootScope.directory.members[i];
                    }
                }
                return null;
            }
            var event = undefined;
            for (var i = 0; i < events.length; i++){
                if (events[i].tag == $stateParams.tag){
                    event = events[i];
                    break;
                }
            }
            if (event === undefined){
                if (count < 2){
                    console.log(count);
                setTimeout(function(){tryLoadEvent(count+1)}, 500);
                return;
                }
                else{
                    $scope.eventNotFound = true;
                    $scope.loading = false;
                    return;
                }
            }
            event.going_list = []
            event.not_going_list = []
            for (var i = 0; i < event.going.length; i++){
                event.going_list.push(getUsersFromKey(event.going[i]));
            }
            for (var i = 0; i < event.not_going.length; i++){
                event.not_going_list.push(getUsersFromKey(event.not_going[i]));
            }
            $scope.event = event;
            $scope.time_start = momentInTimezone($scope.event.time_start).format('hh:mm A');
            $scope.date_start = momentInTimezone($scope.event.time_start).format('MM/DD/YYYY');
            $scope.time_end = momentInTimezone($scope.event.time_end).format('hh:mm A');  
            $scope.date_end = momentInTimezone($scope.event.time_end).format('MM/DD/YYYY');  
            console.log($scope.event.time_end);

            for (var i = 0; i < $scope.tags.org_tags.length; i++){
                for (var j = 0; j < $scope.event.tags.org_tags.length; j++){
                    if ($scope.event.tags.org_tags[j] == $scope.tags.org_tags[i].name){
                        $scope.tags.org_tags[i].checked = true;
                    }
                }
            }
            for (var i = 0; i < $scope.tags.perms_tags.length; i++){
                for (var j = 0; j < $scope.event.tags.perms_tags.length; j++){
                    if ($scope.event.tags.perms_tags[j] == $scope.tags.perms_tags[i].name.toLowerCase()){
                        $scope.tags.perms_tags[i].checked = true;
                    }
                }
            }
            $scope.loading = false;
        }
    $scope.submitEdits = function(isValid){
        if (isValid){
        $scope.loading = true;
            var to_send = JSON.parse(JSON.stringify($scope.event));
            to_send.time_start = momentUTCTime($scope.date_start + " " + $scope.time_start).format('MM/DD/YYYY hh:mm a');
            to_send.time_end = momentUTCTime($scope.date_end + " " + $scope.time_end).format('MM/DD/YYYY hh:mm a');
            to_send.tags = getCheckedTags($scope.tags);
            console.log(to_send.tags);
        $http.post('/_ah/api/netegreek/v1/event/edit_event', packageForSending(to_send))
            .success(function(data){
                if (!checkResponseErrors(data)){
                    getEvents;
                    window.location.assign('#/app/events');
                }
                else{
                    console.log('ERROR: '+data);
                }
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        }
    }
	});

    App.controller('eventCheckInController', function($scope, $http, Load, $stateParams, $rootScope) {
        $scope.loading = true;
        Load.then(function(){
            getCheckInData();
        });
        function getCheckInData(){
            $http.post('/_ah/api/netegreek/v1/event/get_check_in_info', packageForSending($stateParams.tag))
            .success(function(data){
                if (!checkResponseErrors(data)){
                    $scope.users = JSON.parse(data.data);
                    $scope.loading = false;
                }
                else{
                    console.log('ERROR: '+data);
                    $scope.eventNotFound = true;
                    $scope.loading = false;
                }
            })
            .error(function(data) {
                console.log('Error: ' + data);
                $scope.loading = false;
                $scope.eventNotFound = true;
            });
        }
        $scope.checkIn = function(member, checkStatus){ //#TODO: fix controller so we can check in more than once
            if(checkStatus && member.attendance_data && member.attendance_data.time_in){
                $('#checkInModal').modal();
                $scope.selectedUser = member;
                return;
            }
            $('#checkInModal').modal('hide');
            var to_send = {event_tag: $stateParams.tag, user_key: member.key};
            $http.post('/_ah/api/netegreek/v1/event/check_in', packageForSending(to_send))
            .success(function(data){
                if (!checkResponseErrors(data)){
                    setTimeout(function(){getCheckInData();},500);
                }
                else{
                    console.log('ERROR: '+data);
                }
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        }
        $scope.checkOut = function(member, checkStatus){
            if(checkStatus && member.attendance_data && member.attendance_data.time_out && member.attendance_data.time_in){
                $('#checkOutModal').modal();
                $scope.selectedUser = member;
                return;
            }
            $('#checkOutModal').modal('hide');
            var to_send = {event_tag: $stateParams.tag, user_key: member.key};
            $http.post('/_ah/api/netegreek/v1/event/check_out', packageForSending(to_send))
            .success(function(data){
                if (!checkResponseErrors(data)){
                    setTimeout(function(){getCheckInData();},500);
                }
                else{
                    console.log('ERROR: '+data);
                }
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        }
        $scope.formatDate = function(date){
            return momentInTimezone(date).format('lll');
            
        }
    });

App.controller('eventCheckInReportController', function($scope, $http, Load, $stateParams, $rootScope, $filter) {
        $scope.loading = true;
        Load.then(function(){
            getCheckInData();
            function getCheckInData(){
            $http.post('/_ah/api/netegreek/v1/event/get_check_in_info', packageForSending($stateParams.tag))
            .success(function(data){
                if (!checkResponseErrors(data)){
                    $scope.users = JSON.parse(data.data);
                    $scope.loading = false;
                }
                else{
                    console.log('ERROR: '+data);
                    $scope.eventNotFound = true;
                    $scope.loading = false;
                }
            })
            .error(function(data) {
                console.log('Error: ' + data);
                $scope.loading = false;
                $scope.eventNotFound = true;
            });
        }
//            $scope.generateReport(){
//                $http.post('/_ah/api/netegreek/v1/event/get_check_in_info', packageForSending($stateParams.tag))
//                .success(function(data){
//                    if (!checkResponseErrors(data)){
//                        users = JSON.parse(data.data);
//                        $scope.loading = false;
//                        createReport();
//                    }
//                    else{
//                        console.log('ERROR: '+data);
//                        $scope.eventNotFound = true;
//                        $scope.loading = false;
//                    }
//                })
//                .error(function(data) {
//                    console.log('Error: ' + data);
//                    $scope.loading = false;
//                    $scope.eventNotFound = true;
//                });
//            }
            
            
            $scope.createReport = function(users){
                var doc = new jsPDF();
                if (!users){
                    users = $scope.users;
                }
                users = $filter('orderBy')(users, "['rsvp', 'last_name']");
                // We'll make our own renderer to skip this editor
                var specialElementHandlers = {
                    '#editor': function(element, renderer){
                        return true;
                    }
                };
                doc.setFontSize(30);
                doc.text(10, 20, 'Report for '+ $stateParams.tag);
                var current_line = 20;
                var shifted = 20;
                for (var i = 0; i < users.length; i++){
                    doc.setFontSize(15);
                    doc.text(10 + shifted, current_line+=8, users[i].first_name + ' ' + users[i].last_name);
                    doc.setFontSize(10);
                    if (users[i].attendatnce_data){
                        if (users[i].attendance_data.time_in){
                        doc.text(15 + shifted, current_line+=5, 'Time in:  ' + ' ' + $scope.formatDate(users[i].attendance_data.time_in));
                        }
                        if (users[i].attendance_data.time_out){
                        doc.text(15 + shifted, current_line+=5, 'Time out: ' + $scope.formatDate(users[i].attendance_data.time_out));
                        }
                        if (users[i].attendance_data.time_in && users[i].attendance_data.time_out){
                            doc.text(15 + shifted, current_line+=5, 'Duration: ' + $scope.timeDifference(users[i].attendance_data.time_in, users[i].attendance_data.time_out));
                        }
                    }
                        current_line += 0;
                    if (current_line > 250 && shifted > 20){
                        current_line = 20;
                        shifted = 20;
                        doc.addPage();
                    }
                    else if(current_line > 250){
                        current_line = 20;
                        shifted = 110;
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
            $scope.formatDate = function(date){
                return momentInTimezone(date).format('lll');
            }
            $scope.timeDifference = function(start, end){
                var mStart = moment(start);
                var mEnd = moment(end);
                var hours = mEnd.diff(mStart, 'hours');
                var intermediate = mEnd.subtract(hours, 'hours');
                var minutes = intermediate.diff(mStart, 'minutes');
                return hours + ':' + ("0" + minutes).slice(-2);
            }
        });
  });

    App.controller('subscriptionInfoController', function($scope, $http, Load, $rootScope) {
        $scope.loading = true;
        Load.then(function(){
            loadSubscriptionInfo();
            function loadSubscriptionInfo(){
                $http.post('/_ah/api/netegreek/v1/pay/subscription_info', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        $scope.subscription = JSON.parse(data.data);
                        $scope.subscription_raw = data.data;
                        $scope.loading = false;
                        $scope.pay = {};
                    }
                    else{
                        console.log('ERROR: '+data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
            }
            $scope.cancelSubscription = function(){
                $scope.loading = true;
                $http.post('/_ah/api/netegreek/v1/pay/cancel_subscription', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        setTimeout(function(){$rootScope.refreshPage();}, 150);
                    }
                    else{
                        console.log('ERROR: '+data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
            }
            
            $scope.subscribe = function(paymentData){
                var toSend = "";
                if (paymentData){
                    toSend = paymentData;
                }
                $scope.loading = true;
                $http.post('/_ah/api/netegreek/v1/pay/subscribe', packageForSending(toSend))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        setTimeout(function(){$rootScope.refreshPage();}, 150);
                    }
                    else{
                        console.log('ERROR: '+JSON.stringify(data));
                        $scope.loading = false;
                        $scope.error = JSON.stringify(data);}
                })
                .error(function(data) {
                    console.log('Error: ' + JSON.stringify(data));
                }); 
            };  
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
//function arrangeTagData(tag_data){
//    var org_tag_list = [];
//    var tags = {};
//    if (tag_data.org_tags){
//        for(var i = 0; i < tag_data.org_tags.length; i++){
//            org_tag_list.push({name: tag_data.org_tags[i].name, checked: false})
//        }
//    }
//    var perms_tag_list = [];
//    if (tag_data.perms_tags){
//        for (var i = 0; i < tag_data.perms_tags.length; i++){
//            perms_tag_list.push({name: tag_data.perms_tags[i].name, checked: false})
//        }
//    }
//    var event_tag_list = [];
//    if (tag_data.event_tags){
//        for (var i = 0; i < tag_data.event_tags.length; i++){
//            event_tag_list.push({name: tag_data.event_tags[i].name, checked: false})
//        }
//    }
//    tags.organizationTags = org_tag_list;
//    tags.permsTags = perms_tag_list;
//    tags.eventTags = event_tag_list;
//    return tags;
//}
//This should be called at the beginning of any controller that uses the checkbox tags
function clearCheckedTags(tags){
    for (var i = 0; i < tags.org_tags.length; i++)
        tags.org_tags[i].checked = false;
    for (var i = 0; i < tags.perms_tags.length; i++)
        tags.perms_tags[i].checked = false;
    for (var i = 0; i < tags.event_tags.length; i++)
        tags.event_tags[i].checked = false;
    return tags;
}

function getCheckedTags(tags){
    console.log(tags);
    var org_tags= [];
    var perms_tags = [];
    var event_tags = [];
    for (var i = 0; i < tags.org_tags.length; i++){
        if (tags.org_tags[i].checked)
            org_tags.push(tags.org_tags[i].name);
    }
    for (var i = 0; i < tags.event_tags.length; i++){
        if (tags.event_tags[i].checked)
            event_tags.push(tags.event_tags[i].name);
    }
    for (var i = 0; i < tags.perms_tags.length; i++){
        if (tags.perms_tags[i].checked){
            perms_tags.push(tags.perms_tags[i].name.toLowerCase());
        }
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

function momentInTimezone(date){
    return moment(date).add('hours',moment().tz(jstz.determine().name()).format('ZZ')/100);
}

function momentUTCTime(date){
    return moment(date).subtract('hours', moment().tz(jstz.determine().name()).format('ZZ')/100); 
}

//Directives and other add ons
App.directive('match', function(){
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

App.directive('timePicker', function($compile){
  return {
    scope: {
        ngModel : '='
    },
    restrict: 'E',
    replace: 'true',
    template: '<div class="date"></div>',
    link: function (scope, element, attrs) {
        
        var this_name = attrs.name;
        var this_id = attrs.id;
        
        element.append('<div class="input-group">'
                        +'<input type="text" class="form-control" id="'+this_name+'" name="'+this_name+'" ng-model="ngModel" required/>'
                        +'<span class="input-group-addon"><i class="fa fa-clock-o"></i></span></div>'
                        +'<script type="text/javascript">'
                        +'$("#'+this_id+'").datetimepicker({'
                        +'pickDate: false,'
                        +'icons: {'
                        +'time: "fa fa-clock-o",'
                        +'date: "fa fa-calendar",'
                        +'up: "fa fa-arrow-up",'
                        +'down: "fa fa-arrow-down"'
                        +'}});'
                        +'$("#'+this_id+' input").focusout(function(){'
                        +'$(this).trigger("change");'
                        +'});'
                        +'</script>'
                        );
        $compile(element.contents())(scope)
     }
  }
});

App.directive('datePicker', function($compile){
  return {
    scope: {
        ngModel : '='
    },
    restrict: 'E',
    replace: 'true',
    template: '<div class="date"></div>',
    link: function (scope, element, attrs) {
        
        var this_name = attrs.name;
        var this_id = attrs.id;
        
        element.append('<div class="input-group">'
                        +'<input type="text" class="form-control" id="'+this_name+'" name="'+this_name+'" ng-model="ngModel" required/>'
                        +'<span class="input-group-addon"><i class="fa fa-calendar"></i></span></div>'
                        +'<script type="text/javascript">'
                        +'$("#'+this_id+'").datetimepicker({'
                        +'pickTime: false,'
                        +'icons: {'
                        +'time: "fa fa-clock-o",'
                        +'date: "fa fa-calendar",'
                        +'up: "fa fa-arrow-up",'
                        +'down: "fa fa-arrow-down"'
                        +'}});'
                        +'$("#'+this_id+' input").focusout(function(){'
                        +'$(this).trigger("change");'
                        +'});'
                        +'</script>'
                        );
        $compile(element.contents())(scope)
     }
  }
});

//App.directive('calendar', function($compile){
//  return {
//    scope: {
//        ngModel : '='
//    },
//    restrict: 'E',
//    replace: 'true',
//    template: '<div class="date"></div>',
//    link: function (scope, element, attrs) {
//        
//        var this_name = attrs.name;
//        
//        element.append('<div class="input-group">'
//                        +'<input type="text" class="form-control" id="'+this_name+'" name="'+this_name+'" ng-model="ngModel" required/>'
//                        +'<span class="input-group-addon"><i class="fa fa-calendar"></i></span></div>'
//                        +'<script type="text/javascript">'
//                        +'$("#'+this_name+'").datetimepicker({'
//                        +'pickTime: false,'
//                        +'icons: {'
//                        +'time: "fa fa-clock-o",'
//                        +'date: "fa fa-calendar",'
//                        +'up: "fa fa-arrow-up",'
//                        +'down: "fa fa-arrow-down"'
//                        +'}});'
//                        +'$("#'+this_name+' input").focusout(function(){'
//                        +'$(this).trigger("change");'
//                        +'});'
//                        +'$(".bootstrap-datetimepicker-widget").addClass("calendarpage");'
//                        +'$("#'+this_name+'").data("DateTimePicker").hide = function () {};'
//                        +'$("#'+this_name+'").data("DateTimePicker").show();'
//                       
//
//                        +'</script>'
//                        );
//        $compile(element.contents())(scope)
//     }
//  }
//});

App.directive('selectingUsers', function($compile){
  return {
    restrict: 'E',
    replace: 'true',
    templateUrl: '/Static/templates/selectingmembers.html',
    scope:{
        ngModel: "=",
        userCount:"="
    },
    transclude: true,
    link: function (scope, element, attrs) {
        $compile(element.contents())(scope)
     }
  }
});

App.directive('neteTag', function($compile){
    return{
        restrict: 'E',
        replace: 'true',
        template: '',
        link: function(scope, element, attrs){
        
            if (attrs.options == 'all'){
                element.append(  '<label class="label label-default checkLabel" ng-class="{\'label-primary\': tag.checked, \'label-default\': !tag.checked}">'
                                +'<i class="fa fa-square-o checkStatus" ng-class="{\'fa-check-square-o\': tag.checked, \'fa-square-o\': !tag.checked}"></i>'
                                +'<input type="checkbox" ng-model="tag.checked"> <li>#{{ tag.name }}</li>'
                                +'</label>'
                                +'<div data-toggle="dropdown" class="badge dropdown-toggle"><i class="fa fa-sort-desc"></i></div>'
                                +'<ul class="dropdown-menu" role="menu">'
                                +'<li><a ng-click="openRenameTagModal(tag)">Rename Tag</a></li>'
                                +'<li><a ng-click="openDeleteTagModal(tag)">Delete Tag</a></li>'
                                +'</ul>'
                );
            }
            else if(attrs.options == 'check'){
                element.append(  '<label class="label checkLabel" ng-class="{\'label-primary\': tag.checked, \'label-default\': !tag.checked}">'
                                +'<i class="fa checkStatus" ng-class="{\'fa-check-square-o\': tag.checked, \'fa-square-o\': !tag.checked}"></i>'
                                +'<input type="checkbox" ng-model="tag.checked"> <li>#{{tag.name}}</li>'
                                +'</label>'
                );
            }
            else if(attrs.options == 'delete'){
                element.append(  '<span class="label label-default userLabel">'
                                +'<li>#{{ tag }}</li>'
                                +'</span>'
                                +'<div class="badge" ng-click="removeTagsFromUsers([tag], [user.key])"><i class="fa fa-times"></i></div>'  
                );
            }
            else{
                element.append(  '<label class="label label-primary">'
                                +'<li>#{{ tag.name }}</li>'
                                +'</label>'
                );
            }
            
            $compile(element.contents())(scope)
            
        }
    }
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
});

App.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        if (input){
        return input.slice(start);}
        return input;
    }
});

App.filter('tagDirectorySearch', function(){
    return function (objects, tags) {
        if (!tags){return null;}
            var tags_list = []
        if (tags.org_tags){
            for (var i = 0; i < tags.org_tags.length; i++){
                if (tags.org_tags[i].checked){
                    tags_list.push(tags.org_tags[i].name);
                }
            }
        }
        if (tags.perms_tags){
            for (var j = 0; j < tags.perms_tags.length; j++){
                if (tags.perms_tags[j].checked){
                    if (tags.perms_tags[j].name == "Everyone"){
                        tags_list.push("member");
                        tags_list.push("leadership");
                        tags_list.push("council");
                    }
                    else if (tags.perms_tags[j].name == "Members"){
                        tags_list.push("member");
                    }
                    else{
                    tags_list.push(tags.perms_tags[j].name)}
                }
            }
        }
        if (tags.event_tags){
            for (var i = 0; i < tags.event_tags.length; i++){
                if (tags.event_tags[i].checked){
                    tags_list.push(tags.event_tags[i].name);
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
                else if(object.perms.toLowerCase() == searchItem.toString().toLowerCase() && retList.indexOf(object) == -1){
                    retList.push(object);
                    break;
                }
                else if(object.event_tags.indexOf(searchItem.toString()) > -1 && retList.indexOf(object) == -1){
                    retList.push(object);
                    break;
                }
            }
        }
        return retList;
    }
});

App.filter('eventTagDirectorySearch', function(){ 
    return function (objects, tags) {
        if (!tags){return null;}
        var tags_list = tags.org_tags.concat(tags.perms_tags);
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
                if (searchItem.toString().toLowerCase() == 'everyone'){
                    return objects;
                }
                
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

App.factory('directoryService', function($rootScope, $http, LoadScreen) {
    if ($rootScope.directory === undefined){
        LoadScreen.start();
        $http.post('/_ah/api/netegreek/v1/user/directory', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    var directory = JSON.parse(data.data);
                    $rootScope.directory = directory;
                    LoadScreen.stop();
                    return $rootScope.directory;
                }
                else
                {
                    console.log("error: "+ data.error);
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
                    console.log("error: "+ data.error);
                }
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        return $rootScope.directory;
    }
});

App.factory('getEvents', function($http, $rootScope){
    $http.post('/_ah/api/netegreek/v1/event/get_events', packageForSending(''))
        .success(function(data){
            if (!checkResponseErrors(data)){
                var events = JSON.parse(data.data);
                $rootScope.events = events;
            }
            else{
                console.log('ERROR: '+data);
            }
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
});

App.factory('registerOrganizationService', function(){
    var data = undefined;

    return {
        get: function () {
            return data;
        },
        set: function (_data) {
            data = _data;
        }
    };
});

App.factory('LoadScreen', function($rootScope){
    return {
        start: function () {
            $rootScope.loading = true;
        },
        stop: function () {
            $rootScope.loading = false;
        },
        check: function(){
            $rootScope.loading;
        }
    };
});

App.factory( 'Load', function LoadRequests($http, $q, $rootScope, LoadScreen){
    var defer = $q.defer();
    console.log("Loading Data")
    function executePosts() {
          var deferred = $q.defer();
          var done = 0;
          function checkIfDone() {
            done++;
            if (done==5) deferred.resolve(); 
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
                console.log("DIRECTORY");
                console.log($rootScope.directory);
                checkIfDone();
            })
            .error(function(data) {
                console.log('Error: ' + data);
                checkIfDone();
            });
          $http.post('/_ah/api/netegreek/v1/notifications/get', packageForSending(''))
            .success(function(data){
                $rootScope.notifications = JSON.parse(data.data).notifications;
                for (var i = 0; i < $rootScope.notifications.length; i++){
                        $rootScope.notifications[i].collapseOut = true;  
                }
                $rootScope.hidden_notifications = JSON.parse(data.data).hidden_notifications;
                $rootScope.updateNotificationBadge();
                checkIfDone();
            })
            .error(function(data) {
                console.log('Error: ' + data);
                checkIfDone();
            });  
//            $http.post('/_ah/api/netegreek/v1/manage/get_organization_tags', packageForSending(''))
//                .success(function(data){
//                    if (!checkResponseErrors(data)){
//                        $rootScope.tags.organizationTags = JSON.parse(data.data).tags;
//                    }
//                });
            $http.post('/_ah/api/netegreek/v1/message/get_tags', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data)){
                    var tag_data = JSON.parse(data.data);
                    $rootScope.tags = tag_data;
                    console.log(tag_data);
                }
                else{
                    console.log("error: "+ data.error)
                }
                checkIfDone();
            })
            .error(function(data) {
                console.log('Error: ' + data);
                checkIfDone();
            });
            console.log('hi');
            $http.post('/_ah/api/netegreek/v1/pay/is_subscribed', packageForSending(''))
            .success(function(data){
                console.log('hi');
                if (!checkResponseErrors(data)){
                    var subscribed = JSON.parse(data.data);
                    $rootScope.subscribed = subscribed;
                    console.log(subscribed);
                }
                checkIfDone();
            })
            .error(function(data) {
                checkIfDone();
            });
            
          return deferred.promise;
        }
            LoadScreen.start();
            executePosts().then(function() {
                for (var i = 0; i< $rootScope.directory.members.length; i++){
                    if($rootScope.directory.members[i].user_name == $.cookie(USER_NAME)){
                        $rootScope.me = $rootScope.directory.members[i];
                        break;
                    }
                }
                LoadScreen.stop();
                defer.resolve(); 
        });

    return defer.promise;
});



