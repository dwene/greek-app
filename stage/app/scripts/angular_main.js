//#FIXME account info page, the state model is still not registering change (it can say Texas, but registers Tennessee)
//#CHANGES 503 on update account info - SHOULD BE DONE!
//#CHANGES upload profile pic page SHOULD BE DONE!
//#CHANGES get label checked tags and checked people on manage people tags page - I THINK THIS IS DONE
//#CHANGES on calendar page change event time from 2400 to 12:00 PM format - DONE!!!
//#TODO fix check username tags in newmemberinfo and registerinfo pages
//#TODO get it to where you can see all messages after they're hidden
//#FIXME added some loading icons in new directive called update-satus to pages managingmembers,  eventcheckin, addingmembers. Test it by changing someones perms in managingmembers.  They could use some graphic help.

/*
STYLING CHANGES:
Upcoming Events in apphome
Managemembers/managealumni
tagging members
memberdirectory/alumnidirectory
memberprofile
eventinfo
eventcheckin
eventreport
pollinfo

Need non-typeahead for mobile tag selection
netegreek home button with spinner half in background rectangle
I think status max should be shorter, else it doesnt really fit.
*/

//Final/static variables. These variables are used for cookies
var ENDPOINTS_DOMAIN = 'https://greek-app.appspot.com';
//var ENDPOINTS_DOMAIN = '';
var USER_NAME = 'USER_NAME';
var TOKEN = 'TOKEN';
var PERMS = 'PERMS';
var ALUMNI = 'alumni';
var MEMBER = 'member';
var LEADERSHIP = 'leadership';
var COUNCIL = 'council';
var PERMS_LIST =  [ALUMNI, MEMBER, LEADERSHIP, COUNCIL];

String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}

//initialize app
var App = angular.module('App', ['ui.router', 'ngAnimate', 'mgcrea.ngStrap' ,'ui.rCalendar', 'imageupload', 'ngAutocomplete', 'aj.crop', 'googlechart', 'angulartics', 'angulartics.google.analytics', 'infinite-scroll', 'LocalStorageModule'],  function ($compileProvider) {
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|sms):/);
});

App.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/")
    .when("/", "/app/home")
    .when("/app/managemembers", "/app/managemembers/manage")
    .when("/app", "/app/home")
    .when("/app/managealumni", "/app/managealumni/manage")
    .when("/app/directory", "/app/directory/members")
    .when("/changepasswordfromtoken", "/changepasswordfromtoken/1");
    
      $stateProvider 
        .state('home', {
                url: '/', 
				templateUrl : 'views/home.html',
				controller  : 'homeController'
			})
        .state('login', {
                url : '/login',
				templateUrl : 'views/login.html',
				controller  : 'loginController'
			})
        .state('register', {
                url : '/register',
				templateUrl : 'views/register.html',
                controller : 'registerController'
			})
        .state('registerorg', {
                url : '/registerorganization',
				templateUrl : 'views/registerorganization.html',
				controller  : 'registerController'
			})
        .state('registeruser', {
                url : '/registeruser',
				templateUrl : 'views/registeruser.html',
				controller  : 'registerUserController'
			})
        .state('registerorg2', {
                url : '/registerorganizationinfo',
				templateUrl : 'views/registerinfo.html',
				controller  : 'registerinfoController'
			})
        .state('payment', {
                url : '/payment',
				templateUrl : 'views/payment.html',
				controller  : 'paymentController'
			})
        .state('newmember', {
                    url : '/newuser/:key',
                    templateUrl : 'views/newmemberinfo.html',
                    controller : 'newmemberinfoController'
                })
        .state('forgotpassword', {
                    url : '/forgotpassword',
                    templateUrl : 'views/forgot_password.html',
                    controller : 'forgotPasswordController'
                })
        .state('changepasswordfromtoken', {
                    url : '/changepasswordfromtoken/:token',
                    templateUrl : 'views/change_password_from_token.html',
                    controller : 'changePasswordFromTokenController'
                })
        .state('app', {
                url : '/app',
                templateUrl : 'views/app.html',
                controller : 'appController'
        })
            .state('app.home', {
                url : '/home',
                templateUrl : 'views/apphome.html',
                controller : 'appHomeController'
            })
            .state('app.managemembers', {
                    url : '/managemembers',
                    templateUrl : 'views/managemembers.html',
                })
                .state('app.managemembers.manage', {
                        url : '/manage',
                        templateUrl : 'views/managingmembers.html',
                        controller: 'manageMembersController'
                    })
                .state('app.managemembers.add', {
                        url : '/add',
                        templateUrl : 'views/addingmembers.html',
                        controller: 'addMembersController'
                    })
                .state('app.managemembers.tag', {
                        url : '/tag',
                        templateUrl : 'views/taggingmembers.html',
                        controller: 'membertagsController'
                    })
            .state('app.managealumni', {
                    url : '/managealumni',
                    templateUrl : 'views/managealumni.html',
                })
                .state('app.managealumni.add' , {
                        url : '/add',
                        templateUrl : 'views/addingalumni.html',
                        controller: 'addAlumniController'
                    })
                .state('app.managealumni.manage' , {
                        url : '/manage',
                        templateUrl : 'views/managingalumni.html',
                        controller: 'managealumniController'
                    })
            .state('app.incorrectperson', {
                    url : '/incorrectperson',
                    templateUrl : 'views/incorrectperson.html',
                    controller : 'incorrectpersonController'
                })
            .state('app.accountinfo', {
                    url : '/accountinfo',
                    templateUrl : 'views/accountinfo.html',
                    controller : 'accountinfoController'
                })
            .state('app.uploadprofilepicture', {
                    url : '/uploadprofilepicture',
                    templateUrl : 'views/uploadprofilepicture.html',
                    controller : 'profilepictureController'  
                })
            .state('app.directory', {
                    url : '/directory',
                    templateUrl : 'views/directory.html',
                })
                .state('app.directory.members', {
                    url : '/members',
                    templateUrl : 'views/memberdirectory.html',
                    controller : 'membersDirectoryController'  
                })
                .state('app.directory.alumni', {
                    url : '/alumni',
                    templateUrl : 'views/alumnidirectory.html',
                    controller : 'alumniDirectoryController'  
                })
            .state('app.memberprofile', {
                    url : '/directory/:id',
                    templateUrl : 'views/memberprofile.html',
                    controller : 'memberprofileController'  
                })
            //#CHANGES there might be a better way to do this
            .state('app.postNewKeyPictureLink', {
                    url : '/postNewKeyPictureLink',
                    templateUrl : 'views/loading.html',
                    controller : 'uploadImageController'
                })
            .state('app.changepassword', {
                    url : '/changepassword',
                    templateUrl : 'views/change_password.html',
                    controller : 'changePasswordController'
                })
            .state('app.messaging', {
                    url : '/messaging',
                    templateUrl : 'views/messaging.html',
                    controller : 'messagingController'
                })
            .state('app.newevent', {
                    url : '/newevent',
                    templateUrl : 'views/newevent.html',
                    controller : 'newEventController'
                })
            .state('app.events', {
                    url : '/events',
                    templateUrl : 'views/events.html',
                    controller : 'eventsController'
                })
            .state('app.eventInfo', {
                    url : '/events/:tag',
                    templateUrl : 'views/eventinfo.html',
                    controller : 'eventInfoController'
                })
            .state('app.editEvent',{
                    url : '/events/:tag/edit',
                    templateUrl : 'views/editevent.html',
                    controller : 'editEventsController'
                })
            .state('app.eventCheckin',{
                    url : '/events/:tag/checkin',
                    templateUrl : 'views/eventcheckin.html',
                    controller : 'eventCheckInController'
                })
            .state('app.eventCheckinReport',{
                //#TODO put this into each individual event :tag
                    url : '/events/:tag/report',
                    templateUrl : 'views/eventcheckinreport.html',
                    controller : 'eventCheckInReportController'
                })
            .state('app.admin',{
                //#TODO put this into each individual event :tag
                    url : '/admin',
                    templateUrl : 'views/admin.html',
                    controller : 'adminController'
                })            
            .state('app.organizationPictureUpload',{
                //#TODO put this into each individual event :tag
                    url : '/uploadorganizationimage',
                    templateUrl : 'views/uploadOrganizationImage.html',
                    controller : 'organizationPictureController'
                })
            .state('app.newPoll',{
            //#TODO put this into each individual event :tag
                url : '/newpoll',
                templateUrl : 'views/newpoll.html',
                controller : 'newPollController'
                })
            .state('app.polls',{
            //#TODO put this into each individual event :tag
                url : '/polls',
                templateUrl : 'views/polls.html',
                controller : 'pollController'
                })
            .state('app.pollinfo',{
            //#TODO put this into each individual event :tag
                url : '/polls/:key',
                templateUrl : 'views/pollinfo.html',
                controller : 'pollInfoController'
                })
            .state('app.pollresults',{
        //#TODO put this into each individual event :tag
                    url : '/polls/:key/results',
                    templateUrl : 'views/pollresults.html',
                    controller : 'pollResultsController'
                })
    });

//Set up run commands for the app
    App.run(function ($rootScope, $state, $stateParams, $http, $q, $timeout, LoadScreen) {
        console.log('Im starting the run parse');
        FastClick.attach(document.body);
        $rootScope.randomPhrase = function(){
            return 'Wow, you are looking great today!'
        };
        $rootScope.$state = $state;
        $rootScope.color = 'color1';
        $rootScope.perms = 'alumni';
        $('body').addClass('dark');
        $('body').removeClass('light');
        $rootScope.$stateParams = $stateParams;
        $rootScope.directory = {};
        $rootScope.users = $rootScope.directory;
        $rootScope.notification_count = "0";
        $rootScope.tags = {};
        $rootScope.updatingNotifications = false;
        $rootScope.allTags = [];
        $rootScope.defaultProfilePicture = '../images/defaultprofile.png';
        $rootScope.hasLoaded = false;
        $rootScope.setColor = function (color){
            $rootScope.color = color;
            var colorsfordark = [ 'color1', 'color2', 'color3', 'color4', 'color5', 'color6', 'color7', 'color8', 'color9', 'color10', 'color11', 'color12', 'color13', 'color14', 'color15', 'color16' ];
            if ( colorsfordark.indexOf(color) > -1 ){
                $('body').addClass('dark');
                $('body').removeClass('light');
            }
            else{
                $('body').addClass('light');
                $('body').removeClass('dark');
            }
            
        }
        $rootScope.routeChange = function(){
            $('.modal-backdrop').remove();
            $('.bootstrap-datetimepicker-widget').hide()
            window.scrollTo(0, 0);
        }
        $rootScope.updateNotifications = function(){
            $('.fa-refresh').addClass('fa-spin');
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/get', packageForSending(''))
            .success(function(data){
            if ($rootScope.notification_lengths.unread + $rootScope.notification_lengths.read + $rootScope.notification_lengths.hidden != (JSON.parse(data.data).new_notifications_length + JSON.parse(data.data).hidden_notifications_length + JSON.parse(data.data).notifications_length)){    
                
                $timeout(function(){
                    for (var i = 0; i < $rootScope.notifications.length; i++){
                        $rootScope.notifications[i].collapseOut = false;
                    }
                })
                $timeout(function(){
                    $rootScope.notifications = JSON.parse(data.data).notifications;
                    $rootScope.notification_lengths = {unread:JSON.parse(data.data).new_notifications_length, read:JSON.parse(data.data).notifications_length, hidden: JSON.parse(data.data).hidden_notifications_length};
//                    $rootScope.notifications_length = JSON.parse(data.data).notifications_length;
//                    $rootScope.new_notifications_length = JSON.parse(data.data).new_notifications_length;
//                    $rootScope.hidden_notifications_length = JSON.parse(data.data).hidden_notifications_length;
                    for (var i = 0; i < $rootScope.notifications.length; i++){
                        $rootScope.notifications[i].collapseOut = true; 
//                        $rootScope.notifications[i].content = $rootScope.notifications[i].content.replace(RegExp("(\\w{" + 5 + "})(\\w)", "g"),  
//                            function(all,text,char){
//                                return text + "&shy;" + char;
//                            });

                    }
                })
                $timeout(function(){
                    $rootScope.updateNotificationBadge();
                })
            }
                $timeout(function(){
                    $('.fa-refresh').removeClass('fa-spin')
                });
            })
                
            .error(function(data) {
                console.log('Error: ' , data);
            });
        }
        
        $rootScope.refreshPage = function(){
            window.location.reload();
        }
        
        $rootScope.checkPermissions = function(perms){
            if (PERMS_LIST.indexOf(perms) > PERMS_LIST.indexOf($rootScope.perms)){
                return false;
            }
                return true;
        }
        
        $rootScope.requirePermissions = function(perms){
            if ($rootScope.perms){
                if (!$rootScope.checkPermissions(perms)){
                    if ($rootScope.checkAlumni()){
                        window.location.assign('#/app/directory/members');
                    }
                    else{
                        window.location.assign("/#/app/home");
                    }
                } 
            }
            else{
                window.location.assign('/#/login');
            }
        }
        
        $rootScope.checkAlumni = function(){
            if ($rootScope.perms == ALUMNI){
                return true;
            }
            return false;
        }
        
        $rootScope.checkLogin = function(){
            return checkLogin();
        }
        
        $rootScope.logout = function(){
            //localStorage.clear();
            
            $.removeCookie(USER_NAME);
            $.removeCookie(TOKEN);
            $.removeCookie(PERMS);
//            $rootScope.refreshPage();
            $.removeCookie('FORM_INFO_EMPTY');
            $rootScope.directory = {};
            $rootScope.me = undefined;
            $rootScope.polls = undefined;
            $rootScope.perms = undefined;
            $rootScope.events = undefined;
            $rootScope.notifications = undefined;
            $rootScope.hidden_notifications = undefined;
            $rootScope.updateNotificationBadge();
            
        }
        
        $rootScope.updateNotificationBadge = function(){
            var count = 0;
            if ($rootScope.notifications){
                for (var i = 0; i< $rootScope.notifications.length; i++){
                    if ($rootScope.notifications[i].new){
                        count ++;
                    }
                }
                $rootScope.notification_count = count;
            }
        }
        
        $rootScope.getNameFromKey = function(key){
            if ($rootScope.directory.members){
                for (var i = 0; i < $rootScope.directory.members.length; i++){
                    if ($rootScope.directory.members[i].key == key){
                        return $rootScope.directory.members[i].first_name + ' ' + $rootScope.directory.members[i].last_name;
                    }
                }
            }
            return 'Unknown';
        }
        $rootScope.getUserFromKey = function(key){
            if ($rootScope.directory.members){
                for (var i = 0; i < $rootScope.directory.members.length; i++){
                    if ($rootScope.directory.members[i].key == key){
                        return $rootScope.directory.members[i];
                    }
                }
            }
            return undefined;
        }
//        $rootScope.Load = function(){
//            LoadScreen.start();
//            $('#mobileMenu').hide();
//            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/info/load', packageForSending(''))
//                .success(function(data){
//                    if(!checkResponseErrors(data)){
//                        $timeout(function(){
//                            var load_data = JSON.parse(data.data);
//                            $rootScope.perms = load_data.perms;
//        //              directory
//                            $rootScope.directory = load_data.directory;
//                            for (var i = 0; i< $rootScope.directory.members.length; i++){
//                                if($rootScope.directory.members[i].user_name == $.cookie(USER_NAME)){
//                                    $rootScope.me = $rootScope.directory.members[i];
//                                   break;
//                                }
//                            }
//        //              notifications
//                            $rootScope.notifications = load_data.notifications.notifications;
//                            $rootScope.notification_lengths = {unread:load_data.notifications.new_notifications_length, read:load_data.notifications.notifications_length, hidden:load_data.notifications.hidden_notifications_length};
//                            for (var i = 0; i < $rootScope.notifications.length; i++){
//                                    $rootScope.notifications[i].collapseOut = true; 
//                            }
//                            $rootScope.hidden_notifications = load_data.notifications.hidden_notifications;
//                            $rootScope.updateNotificationBadge();
//        //              events    
//                            $rootScope.events = load_data.events;
//        //              tags
//                            $rootScope.tags = load_data.tags;
//        //              organization
//                        $rootScope.subscribed = true;
//                        $rootScope.setColor(load_data.organization_data.color);
//                        $rootScope.organization = load_data.organization_data;
//                        $rootScope.polls = load_data.polls;
//                        $rootScope.tags = load_data.tags;
//                    });
//                    
//                    $timeout(function(){
//                        if ($rootScope.checkAlumni()){
//                            window.location.assign('#/app');
//                        }
//                        else{
//                            $('#mobileMenu').removeClass('hideMenu');
//                        }
//                        $('#mobileMenu').show();
//                        if ($rootScope.perms == 'alumni'){
//                            $timeout(function(){LoadScreen.stop();}, 400)
//                        }
//                        else{
//                            LoadScreen.stop();
//                        }
//                        }, 100);
//                    }
//                    
//                })
//                .error(function(data) {
//                    console.log('Error: ' , data);
//                    LoadScreen.stop();
//                });
//        }
//       
        
        $rootScope.showNav = true;
//        $rootScope.$on('$routeChangeSuccess', function () {
//            $('.modal-backdrop').remove();
//        })
        
    });

//navigation header
    App.controller('navigationController', function($scope, $http, $rootScope, LoadScreen){
        routeChange();
        
        //closes the navigation if open and an li is clicked        
        $('.navbar-brand, #mobileMenu, #mainMenu, #mobileSettings').on('click', function(){
            if( $("#mobileSettings").hasClass('in') ){
                     $("#mobileSettings").collapse('hide');
            }
            else{
            //do nothing
            }
        });
        
    
        $scope.logout = function(){
            $rootScope.logout();
            window.location.assign("/#/login");
        }
    });
    App.controller('indexController', function($scope, $http, LoadScreen, $rootScope) {
        $scope.homeButton = function(){
            if ($rootScope.checkAlumni()){
                window.location.assign('#/app/directory/members');
            }
            else{
                window.location.assign('#/app/home');
            }
        }
        $scope.sendHelpMessage = function(isValid, content){
            console.log('I am getting submitted');
            if(isValid){
                $scope.sendingHelp='pending';
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/report_error', packageForSending(content))
                .success(function(){console.log('success');
//                $('#helpModal').modal('hide');
                $scope.helpMessage.$setPristine();
                $scope.message={};
                $scope.sendingHelp='done';
                })
                .error(function(){console.log('error');
                $scope.sendingHelp='broken';})
            }
            else{
            //do nothing
            }
        }
	});

    App.controller('helpMessageController', function($scope, $http, $rootScope) {
        $scope.howdy="howdy";
        $scope.sendHelpMessage = function(isValid, content){
            console.log('I am getting submitted');
            if(isValid){
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/report_error', packageForSending(content))
                .success(function(){console.log('success');})
                .error(function(){console.log('error');})
            }
            else{
            //do nothing
            }
        }
	});
    
    App.controller('appController', function($scope, $http, $interval, $rootScope, Load, LoadScreen, localStorageService) {
        routeChange();
        Load.then(function(){
            if(!checkLogin()){
                window.location.assign("/#/login");
            }
            if(!$rootScope.updatingNotifications){
                $rootScope.updatingNotifications = true;
            $interval(function(){$rootScope.updateNotifications();}, 40000);}
           // LoadScreen.stop();
        })
	});

//login page
	App.controller('loginController', function($scope, $http, $rootScope, LoadScreen, localStorageService) {
        routeChange();
        $rootScope.logout();
        $.removeCookie(USER_NAME);
        $.removeCookie(TOKEN);
        $.removeCookie('FORM_INFO_EMPTY');
        $rootScope.directory = {};
        LoadScreen.stop();
        $('#body').show();
        $scope.login = function(user_name, password){
            LoadScreen.start();
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/login', packageForSending({user_name: user_name, password: password}))
                .success(function(data) {
                    if(!checkResponseErrors(data))
                    {
                        LoadScreen.start();
                        returned_data = JSON.parse(data.data);
                        $.cookie(USER_NAME, user_name.toLowerCase(), {expires: new Date(returned_data.expires)});
                        $.cookie(TOKEN, returned_data.token, {expires: new Date(returned_data.expires)});
                        $rootScope.perms = returned_data.perms;
                        if (localStorageService.get('user_name') != $.cookie(USER_NAME)){
                            localStorage.clear();
                            localStorageService.set('user_name', $.cookie(USER_NAME));
                        }
                        if (returned_data.perms == 'alumni'){
                            window.location.assign('#/app/directory');
                        }
                        else{
                            window.location.assign('#/app');
                        }
                        window.location.reload();
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
                    console.log('Error: ' , data);
                });
        };
        $scope.forgotPassword = function(){
        window.location.assign('/#/forgotpassword'); 
        }
    });

//getting a forgotten password email
    App.controller('forgotPasswordController', function($scope, $http, $rootScope, LoadScreen){
        routeChange();
        $rootScope.logout();
        LoadScreen.stop();
        console.log('I just stopped the loading in forgot password controller');
        $scope.sentEmail = false;
        $scope.reset = function(input) {
            $scope.gettingnewPassword = 'pending';
            function validEmail(v) {
                var r = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
                return (v.match(r) == null) ? false : true;
            }
            if (validEmail(input)){
                to_send = {email: input, user_name:''};
            }
            else{
                to_send = {email: '', user_name: input.toLowerCase()};
            }
            console.log(to_send);
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/forgot_password', packageForSending(to_send))
            .success(function(data) {
                if(!checkResponseErrors(data)){
                    if (data.data == 'OK'){
                        $scope.sentEmail = true;
                        $scope.gettingnewPassword = 'done';
                    }
                    else{
                        $scope.returned_choices = JSON.parse(data.data);
                        $scope.showList = true;
                    }
                    $scope.gettingnewPassword = 'done';
                }
                else{
                    $scope.emailFailed = true;
                    $scope.gettingnewPassword = 'broken';
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
                $scope.emailFailed = true;
            });
        }
    });

//changing a forgotten password
    App.controller('changePasswordFromTokenController', function($scope, $http, $rootScope, LoadScreen, $stateParams) {
        routeChange();
        $.removeCookie(USER_NAME);
        $.cookie(TOKEN, $stateParams.token);
        console.log('My token', $.cookie(TOKEN));
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/check_password_token', packageForSending(''))
        .success(function(data){
            if (!checkResponseErrors(data)){
                LoadScreen.stop();
                $scope.user = JSON.parse(data.data);
            }
            else{
                window.location.replace('#/login');
            }
        })
        .error(function(data){window.location.replace('#/login')});
        $scope.passwordChanged = false;
        $scope.changeFailed = false;
        $scope.changePassword = function(password, isValid) {
            if(isValid){
            $scope.changingPassword = 'pending';
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/change_password_from_token', packageForSending({password: password}))
            .success(function(data) {
                if(!checkResponseErrors(data)){
                    $scope.passwordChanged = true;
                    $scope.changeFailed = false;
                    $scope.user_name = data.data;
                    $scope.changingPassword = 'done';
                }
                else{
                    console.log('Error: ' , data);
                    $scope.changeFailed = true;
                    $scope.passwordChanged = false;
                    $scope.changingPassword = 'broken';
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
                $scope.changeFailed = true;
                $scope.passwordChanged = false;
                $scope.changingPassword = 'broken';
            });   
            }
            else{
                $scope.changingPassword = '';
            }
        }
    });

//changing password
    App.controller('changePasswordController', function($scope, $http, Load, $rootScope) {
    routeChange();
    Load.then(function(){    
        $scope.passwordChanged = false;
        $scope.changeFailed = false;
        $scope.changePassword = function(password) {
            var to_send = {password:$scope.item.password, old_password: $scope.item.old_password};
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/change_password', packageForSending(to_send))
            .success(function(data) {
                if(!checkResponseErrors(data)){
                    $scope.passwordChanged = true;
                    $scope.changeFailed = false;
                    $rootScope.logout();
                    window.location.assign('#/app/login');
                }
                else{
                    console.log('Error: ' , data);
                    $scope.changeFailed = true;
                    $scope.passwordChanged = false;
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
                $scope.changeFailed = true;
                $scope.passwordChanged = false;
            });              
        }
    });
    });

//the registration page
    App.controller('registerController', function($scope, $http, $rootScope, registerOrganizationService, LoadScreen){
        routeChange();
        $rootScope.logout();
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

    App.controller('registerUserController', function($scope, $http, $rootScope, registerOrganizationService, LoadScreen){
        routeChange();
        $rootScope.logout();
        $scope.data = {};
        LoadScreen.stop();
        $scope.findMe = function(email){
            $scope.users_load = 'pending';
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/find_unregistered_users', packageForSending({email:email}))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        $scope.users_load = 'done';
                        $scope.users = JSON.parse(data.data);
                        $scope.loadedUsers = true;
                    }
                    else{$scope.users_load = 'broken';}
                })
                .error(function(data){
                    $scope.users_load = 'broken';
                })
        }
        $scope.resendEmail = function(key){
            $scope.email_load = 'pending';
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/resend_registration_email', packageForSending({key:key}))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        $scope.sentEmail = true;
                        $scope.email_load = 'done';
                    }
                    else {
                        $scope.sentEmail = false;
                        $scope.email_load = 'broken';
                    }
                })
                .error(function(data){
                    $scope.email_load = 'broken';             
                });
        }
    });


//the register info page
    App.controller('registerinfoController', function($scope, $http, registerOrganizationService, $rootScope) {
        routeChange();
        if (registerOrganizationService.get() === undefined){
            window.location.assign('#/register');
        }
        $scope.$watch('item.user_name', function() {
            $scope.unavailable = false;
            $scope.available = false;
        });
        //ng-submit on form submit button click
        
        $scope.checkUserName = function(user){
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/check_username', packageForSending(user))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        $scope.available = true;
                        $scope.unavailable = false;
                    }
                    else{
                        console.log('ERROR: ',data);
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
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/register_organization', packageForSending(data_tosend))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        var responseData = JSON.parse(data.data);
                        $.cookie(TOKEN,  responseData.token, {expires: new Date(responseData.expires)});
                        $rootScope.perms =  responseData.perms;
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
                    console.log('Error: ' , data);
                });  
        }
            else{
            //for validation purposes
            $scope.submitted = true;
            }
        };
	});

//the payment page
    App.controller('paymentController', function($scope, $http, $rootScope) {
        routeChange();
        //skip payment page right now
        $scope.pay = {};
        $scope.submitPayment = function(){
            
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/pay/subscribe', packageForSending($scope.pay))
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
    App.controller('appHomeController', function($scope, $http, $rootScope, Load, $timeout) {
        routeChange();
        $scope.noMoreHiddens = false;
        $('.modal-backdrop').remove();
        Load.then(function(){
            $rootScope.requirePermissions(MEMBER);
//        $scope.hidden = {};
//        $scope.current = {};
//        $scope.hidden.currentPage = 0;
//        $scope.hidden.pageSize = 10;
//        $scope.hidden.maxPageNumber = 5;
//        $scope.current.currentPage = 0;
//        $scope.current.pageSize = 10;
//        $scope.current.maxPageNumber = 5;
        //TOOLTIPS
            
        $scope.testLoadAll = function(){
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/info/load', packageForSending(''))
            .success(function(data){
                console.log('LoadAll Results', data.data)
            })
            .error(function(data) {
                console.log('LoadAll Results ' , data);
            }); 
        }
            
        $scope.archiveTip = {
            "title" : "Archive Notification"
        }    
        $scope.unarchiveTip = {
            "title" : "Unarchive Notification"
        }
        $scope.clearStatusTip = {
            "title" : "Clear Status"
        }
        $scope.checkForMoreHiddenNotifications = function(pageNum, max){
            var len = $rootScope.hidden_notifications.length;
            $scope.hidden_working = true;
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/more_hidden', packageForSending(len))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    var new_hiddens = JSON.parse(data.data);
                    var next = false;
                    for (var i = 0; i < new_hiddens.length; i++){
                        next = false;
                        for (var j = 0; j < $rootScope.hidden_notifications.length; j++){
                            if ($rootScope.hidden_notifications[j].key == new_hiddens[i].key){
                                next = true;
                                break;
                            }
                        }
                        if (next){ continue;}
                        for (var j = 0; j < $rootScope.notifications.length; j++){
                            if ($rootScope.notifications[j].key == new_hiddens[i].key){
                                next = true;
                                break;
                            }
                        }
                        if (next){ continue;}
                        $rootScope.hidden_notifications.push(new_hiddens[i]);
                    }
//                    $rootScope.hidden_notifications = new_hiddens;
                    if ($rootScope.hidden_notifications.length > ((pageNum+1)*max)){
                        $scope.hidden.currentPage++;
                    }
                    else{
                        $scope.noMoreHiddens = true;
                    }
                }
                else{
                    console.log('ERROR: ',data);
                }
                $scope.hidden_working = false;
            })
            .error(function(data) {
                console.log('Error: ' , data);
                $scope.hidden_working = false;
            }); 
        }
        
        $scope.checkForMoreNotifications = function(pageNum, max){
            var len = $rootScope.notifications.length;
            $scope.current_working = true;
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/more_notifications', packageForSending(len))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    var new_hiddens = JSON.parse(data.data);
                    var next = false;
                    for (var i = 0; i < new_hiddens.length; i++){
                        next = false;
                        for (var j = 0; j < $rootScope.hidden_notifications.length; j++){
                            if ($rootScope.hidden_notifications[j].key == new_hiddens[i].key){
                                next = true;
                                break;
                            }
                        }
                        if (next){ continue;}
                        for (var j = 0; j < $rootScope.notifications.length; j++){
                            if ($rootScope.notifications[j].key == new_hiddens[i].key){
                                next = true;
                                break;
                            }
                        }
                        if (next){ continue;}
                        $rootScope.notifications.push(new_hiddens[i]);
                    }
//                    $rootScope.hidden_notifications = new_hiddens;
                    if ($rootScope.notifications.length > ((pageNum+1)*(max))){
                        $scope.current.currentPage++;
                    }
                    else{
                        $scope.noMoreNotifications = true;
                    }
                }
                else{
                    console.log('ERROR: ',data);
                }
                $scope.current_working = false;
                $scope.working = false;
            })
            .error(function(data) {
                console.log('Error: ' , data);
                $scope.current_working = false;
                $scope.working = false;
            }); 
        }  
        
//        $scope.notificationPreview = function(notify){
//            return notify.replace(/\r?\n|\r/g," "); 
//            }
        
//        $rootScope.$watch('notifications', function(){
//            console.log('im checking');
//            console.log($scope.current.currentPage * $scope.current.maxPageNumber);
//        })
        $scope.updateStatus = function(status){
        var to_send = {'status': status};
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/update_status', packageForSending(to_send));
            $('#status').val("");
            if ($rootScope.me){
                $rootScope.me.status = status;
            }
            $scope.status = '';
        }
        $scope.clearStatus = function(){
            var status = "";
            $scope.status = "";
            var to_send = {status: status};
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/update_status', packageForSending(to_send))
            .success(function(data){
                if (checkResponseErrors(data))
                    console.log('ERROR: ',data);
            })
            .error(function(data) {
                console.log('Error: ' , data);
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
            for(var i = 0; i < $rootScope.directory.members.length; i++){
                if ($rootScope.directory.members[i].key == notify.sender){
                    $scope.selectedNotificationUser = $rootScope.directory.members[i];
                }
            }
            if ($scope.selectedNotification.new){
                $scope.notification_lengths.unread --;
                $scope.notification_lengths.read ++;
                $scope.selectedNotification.new = false;
            }
            $rootScope.updateNotificationBadge();
            var key = $scope.selectedNotification.key;
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/seen', packageForSending({'notification': key}));
        }
        
        $scope.hideNotification = function(notify, domElement){
            $timeout(function(){
                notify.garbage = true;
            })
            $timeout(function(){
                var key = notify.key;
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/hide', packageForSending({'notification': key}))
                .error(function(data) {
                    $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/hide', packageForSending({'notification': key}));
                }); 
                $rootScope.hidden_notifications.unshift(notify);
                if (notify.new){
                    $rootScope.notification_lengths.unread--;//#FIXME notifications_lengths.unread is not updating as soon as it is read
                    notify.new = false;
                    $rootScope.updateNotificationBadge();
                }
                else{
                    $rootScope.notification_lengths.read--;
                }
                $rootScope.notification_lengths.hidden++;
                $rootScope.notifications.splice($scope.notifications.indexOf(notify), 1);
                if ($rootScope.notifications && $scope.current && ($scope.current.currentPage * $scope.current.maxPageNumber) == $rootScope.notifications.length && $scope.current.currentPage > 0){
                $scope.current.currentPage = $scope.current.currentPage - 1;
                if (!$scope.noMoreNotifications && !$scope.current_working && $rootScope.notifications.length < $rootScope.notification_lengths.unread + $rootScope.notification_lengths.read && $rootScope.notifications.length < 5){
                $scope.checkForMoreNotifications($scope.current.currentPage, $scope.current.maxPageNumber)
            }
            }
                if (!$scope.noMoreNotifications && !$scope.current_working && $rootScope.notifications.length < $rootScope.notification_lengths.unread + $rootScope.notification_lengths.read && $rootScope.notifications.length <= 5){
                    $scope.checkForMoreNotifications($scope.current.currentPage, $scope.current.maxPageNumber);
            }
            })
        }
        
        $scope.unhideNotification = function(notify, domElement){
            $timeout(function(){
                notify.garbage = true;
            })
            $timeout(function(){
                $rootScope.notification_lengths.hidden--;
                $rootScope.notification_lengths.read++;
                var key = notify.key;
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/unhide', packageForSending({'notification': key}))
                .error(function(data) {
                    $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/unhide', packageForSending({'notification': key}));
                });
                $rootScope.notifications.unshift(notify);
                $rootScope.hidden_notifications.splice($scope.hidden_notifications.indexOf(notify), 1);
                if ($rootScope.hidden_notifications && $scope.hidden && ($scope.hidden.currentPage * $scope.hidden.maxPageNumber) == $rootScope.hidden_notifications.length && $scope.hidden.currentPage > 0){
                $scope.hidden.currentPage = $scope.hidden.currentPage - 1;
                if (!$scope.noMoreHiddens && !$scope.hidden_working && $rootScope.hidden_notifications.length < $rootScope.notification_lengths.hidden && $rootScope.hidden_notifications.length < 5){
                    $scope.checkForMoreHiddenNotifications($scope.hidden.currentPage, $scope.hidden.maxPageNumber)
                }
            }
                if (!$scope.noMoreHiddens && !$scope.hidden_working && $rootScope.hidden_notifications.length < $rootScope.notification_lengths.hidden && $rootScope.hidden_notifications.length <= 5){
                    $scope.checkForMoreHiddenNotifications($scope.hidden.currentPage, $scope.hidden.maxPageNumber);
                }
            })
        }
        
        $scope.showDate = function(start, end){
            var mStart = momentInTimezone(start);

            if (mStart.diff(moment().add('days', 6)) > 0){
               return mStart.fromNow(); 
            }
            else if (mStart.diff(moment()) > 0){
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
        
        $scope.formatTimestamp = function(timestamp){
            return momentInTimezone(timestamp).calendar();
        }
        $scope.closeNotificationModal = function(notify){
            $('#notificationModal').modal('hide');
        }
       }); 
	});

//the add members page
    App.controller('addMembersController', function($scope, $http, $rootScope, Load, LoadScreen, localStorageService) {
        routeChange();
        $scope.adds = [];
        Load.then(function(){
         var formObject = document.getElementById('uploadMembers');
        if(formObject){
            formObject.addEventListener('change', readSingleFile, false);}
        $rootScope.requirePermissions(COUNCIL);
        //initialize a member array
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
              var index = $scope.adds.indexOf(add);
              $scope.adds.splice(index,1);     
        }
         
        //ng-click for the form to add one member at a time        
        $scope.addMember = function(isValid){
            if(isValid){
            $scope.adds = $scope.adds.concat($scope.input);
            //$('#result').text(JSON.stringify(newmemberList));
            //define variable for ng-repeat
            $scope.input = {};}
            else{$scope.submitted = true;}
            
        };
        
        $scope.getMembers = function(){
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $rootScope.directory = JSON.parse(data.data);
                    localStorageService.set('directory', $rootScope.directory);
                    console.log($rootScope.directory);
                    assignAngularViewModels($rootScope.directory.members);
                }
                else
                    console.log('ERROR: ',data);
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });
        
        }
        function assignAngularViewModels(members){
            $scope.members = members;
            LoadScreen.stop();
        }
        
        function onPageLoad(){
            console.log('page is loading');
            if($rootScope.directory.members){
                assignAngularViewModels($rootScope.directory.members);
                $scope.getMembers();
            }
            else{
                LoadScreen.start();
                $scope.getMembers();
            }
        }
        onPageLoad();
        
        $scope.submitMembers = function(){
            $scope.updating = "pending";
            var data_tosend = {users: $scope.adds};
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/add_users', packageForSending(data_tosend))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $scope.updating = "done";
                    $scope.adds = [];
                }
                else{
                    $scope.updating = "broken";
                    console.log('ERROR: ',data);
                    }
            })
            .error(function(data) {
                $scope.updating = "broken";
                console.log('Error: ' , data);
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
                var new_item_list = [];
                for (var i = 0; i< csvMemberList.length; i++){
                    var item = csvMemberList[i];
                    var new_item = {};
                    if (item['First']){
                        new_item.first_name = item['First'];
                    }
                    if (item['Last']){
                        new_item.last_name = item['Last'];
                    }
                    if (item['Pledge Year']){
                        new_item.pledge_class_year = item['Pledge Year'];
                    }
                    if (item['Pledge Semester']){
                        new_item.pledge_class_semester = item['Pledge Semester'];
                    }
                    if (item['Email']){
                        new_item.email = item['Email'];
                    }
                    if (!new_item.email || !new_item.first_name || !new_item.last_name || !new_item.pledge_class_year || !new_item.pledge_class_semester){
                        continue;
                    }
                    if(!checkEmail(new_item.email)){
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
        });
    });


//new member page
    App.controller('manageMembersController', function($scope, $http, Load, LoadScreen, $rootScope, localStorageService){
    routeChange();
    Load.then(function(){
        $rootScope.requirePermissions(COUNCIL);
        $scope.memberslength = 20;
        $scope.$watch('search', function(){
            if ($scope.search){
                $scope.memberslength = 20;
            }
        });
        //MANAGE MEMBERS TAB
        $scope.openDeleteMemberModal = function(user){
            $('#deleteMemberModal').modal();
            $scope.userToDelete = user;
        }
        //#TODO this should now be fixed to where it can delete multiple checked members in this modal
        
        $scope.openConvertMembersModal = function(){
            $('#convertMemberModal').modal();
        }
        $scope.loadMoreMembers = function(){
            if ($scope.memberslength < $scope.members.length){
                $scope.memberslength += 20;
            }
        }
        
        $scope.resendWelcomeEmail = function(member){
            member.updating = 'pending';
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/resend_welcome_email', packageForSending({key: member.key}))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        member.updating = 'done';
                    }
                    else{
                        member.updating = 'broken';
                    }
                })
                .error(function(data) {
                    member.updating = 'broken';
                });
        }
        $scope.resendAllWelcomeEmails = function(){
            $scope.resendWorking = 'pending';
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/resend_all_welcome_emails', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data)){
                    $scope.resendWorking = 'done';
                }
                else{
                    $scope.resendWorking = 'broken';
                    console.log('ERROR', data.error);
                }
            })
            .error(function(data){
                $scope.resendWorking = 'broken';
                console.log('ERROR', data.error)
            })
        }
        
        $scope.updatePerms = function(member, option){
            var key = member.key;
            member.updating = 'pending';
            var to_send = {key: key, perms: option};
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/manage_perms', packageForSending(to_send))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        member.updating = 'done';
                    }
                    else{
                        member.updating = 'broken';
                    }
                })
                .error(function(data) {
                    member.updating = 'broken';
                });
        }
        
        $scope.changeUserEmail = function(member, email){
            var to_send = {key: member.key, email: email};
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/update_users_emails', packageForSending(to_send))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        console.log('success');
                    }
                    else
                    {
                        console.log('ERROR: ',data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
        }

        $scope.convertMembersToAlumni = function(){
            keys = [];
            console.log('converting to alumni', members);
            $('#convertMemberModal').modal('hide');
            for (var i = 0; i < $scope.members.length; i++){
                if ($scope.members[i].checked){
                    $scope.members[i].checked = false; 
                    keys.push($scope.members[i].key);
                    $scope.members.splice(i, 1);
                    i--;
                }
            }
            var to_send = {'keys': keys};
            console.log(to_send);
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/convert_to_alumni', packageForSending(to_send))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        console.log('success');
                    }
                    else
                    {
                        console.log('ERROR: ',data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
        };
        $scope.getMembers = function(){
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $rootScope.directory = JSON.parse(data.data);
                    localStorageService.set('directory', $rootScope.directory);
                    assignAngularViewModels($rootScope.directory.members);
                }
                else
                    console.log('ERROR: ',data);
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });
        
        }
        
        function assignAngularViewModels(members){
            $scope.members = members;
            LoadScreen.stop();
        }
        
        function onPageLoad(){
            console.log('page is loading');
            if($rootScope.directory.members){
                assignAngularViewModels($rootScope.directory.members);
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
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/remove_user', packageForSending(user))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                }
                else
                    console.log('ERROR: ',data);
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });    
            for (var i = 0; i < $scope.members.length; i++){
                if ($scope.members[i].key == user.key){
                    $scope.members.splice(i, 1);
                    break;
                }
            }
        }
        
         
    ;})
    
    });
    App.controller('newmemberController', function($scope, $http, $stateParams, $rootScope, LoadScreen){
        routeChange();
        $('.container').hide();
        logoutCookies();
        $.cookie(TOKEN, $stateParams.key);
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/new_user', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $scope.user = JSON.parse(data.data);
                    $('.container').fadeIn();
                    LoadScreen.stop();
                    $('#body').show();
                }
                else
                    console.log('ERROR: ',data);
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });
        
        $scope.correctPerson = function(){
            window.location.assign("#/newuserinfo");
        }
        $scope.incorrectPerson = function(){
            window.location.assign("#/incorrectperson");
        }
    });

//incorrect person page
    App.controller('incorrectpersonController', function($scope, $http, LoadScreen){
    
    });

    App.controller('addAlumniController', function($scope, $http, $rootScope, Load, LoadScreen, localStorageService) {
        routeChange();
        Load.then(function(){
//        //initialize a member array
        var formObject = document.getElementById('uploadMembers');
        if(formObject){
            formObject.addEventListener('change', readSingleFile, false);}
        $scope.adds = [];
            
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
              var index = $scope.adds.indexOf(add);
              $scope.adds.splice(index,1);     
        }
         
        //ng-click for the form to add one member at a time        
        $scope.addAlumnus = function(isValid){
            if(isValid){
                $scope.adds = $scope.adds.concat($scope.input);
            }
            else{
                $scope.submitted = true;
            }
            $scope.input = {};
        }
        
        $scope.getAlumni = function(){
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $rootScope.directory = JSON.parse(data.data);
                    localStorageService.set('directory', $rootScope.directory);
                    assignAngularViewModels($rootScope.directory.alumni);
                }
                else
                    console.log('ERROR: ',data);
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });
        
        }
        function assignAngularViewModels(alumni){
            $scope.alumni = alumni;
            LoadScreen.stop();
        }
        
        function onPageLoad(){
            console.log('page is loading');
            if($rootScope.directory.alumni){
                assignAngularViewModels($rootScope.directory.alumni);
                $scope.getAlumni();
            }
            else{
                LoadScreen.start();
                $scope.getAlumni();
            }
        }
        onPageLoad();
        
        $scope.submitAlumni = function(){
            $scope.updating = "pending";
            var data_tosend = {users: $scope.adds};
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/add_alumni', packageForSending(data_tosend))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $scope.updating = "done";
                    $scope.adds = [];
                }
                else{
                    $scope.updating = "broken";
                    console.log('ERROR: ',data);
                    }
            })
            .error(function(data) {
                $scope.updating = "broken";
                console.log('Error: ' , data);
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
        
//        //reads the file as it's added into the file input
//
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
                
                
                var new_item_list = [];
                for (var i = 0; i< csvMemberList.length; i++){
                    var item = csvMemberList[i];
                    var new_item = {};
                    if (item['First']){
                        new_item.first_name = item['First'];
                    }
                    if (item['Last']){
                        new_item.last_name = item['Last'];
                    }
                    if (item['Pledge Year']){
                        new_item.pledge_class_year = item['Pledge Year'];
                    }
                    if (item['Pledge Semester']){
                        new_item.pledge_class_semester = item['Pledge Semester'];
                    }
                    if (item['Email']){
                        new_item.email = item['Email'];
                    }
                    if (!new_item.email || !new_item.pledge_class_year || !new_item.pledge_class_semester){
                        continue;
                    }
                    if(!checkEmail(new_item.email)){
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
        });
    });





    App.controller('managealumniController', function($scope, $http, $rootScope, Load, LoadScreen, localStorageService){
        routeChange();
        Load.then(function(){

        $scope.openDeleteAlumniModal = function(user){
            $('#deleteAlumniModal').modal();
            $scope.selectedUser = user;
        }
        
        $scope.openConvertAlumniModal = function(user){
            $('#convertAlumniModal').modal();
            $scope.selectedUser = user;
        }
        
        $scope.resendWelcomeEmail = function(member){
            member.updating = 'pending';
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/resend_welcome_email', packageForSending({key: member.key}))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        member.updating = 'done';
                    }
                    else{
                        member.updating = 'broken';
                    }
                })
                .error(function(data) {
                    member.updating = 'broken';
                });
        }
        
        function getAlumni(){
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        $rootScope.directory = JSON.parse(data.data);
                        localStorageService.set('directory', $rootScope.directory);
                        assignAngularViewModels($rootScope.directory.alumni);
                    }
                    else
                    {
                        console.log("error: ", data.error)
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
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
            if($rootScope.directory.alumni){
                assignAngularViewModels($rootScope.directory.alumni);
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
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/revert_from_alumni', packageForSending(to_send))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                    }
                    else
                    {
                        console.log("error: ", data.error)
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
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
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/remove_user', packageForSending(alumnus));   
            if ($scope.alumni.indexOf(alumnus) > -1){
                $scope.alumni.splice($scope.alumni.indexOf(alumnus), 1);
            }
        }
       }); 
    });

    App.controller('newmemberController', function($scope, $http, $stateParams, $rootScope, LoadScreen){
        routeChange();
        $('.container').hide();
        logoutCookies();
        $.cookie(TOKEN, $stateParams.key);
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/new_user', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $scope.user = JSON.parse(data.data);
                    $('.container').fadeIn();
                    LoadScreen.stop();
                    $('#body').show();
                }
                else
                    console.log('ERROR: ',data);
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });
        
        $scope.correctPerson = function(){
            window.location.assign("#/newuserinfo");
        }
        $scope.incorrectPerson = function(){
            window.location.assign("#/incorrectperson");
        }
    });

//new member info page
    App.controller('newmemberinfoController', function($scope, $http, $rootScope, $stateParams, LoadScreen){
        routeChange();
        $scope.loading = true;
        $scope.user_is_taken = false;
        $scope.waiting_for_response = false;
        logoutCookies();
        $.cookie(TOKEN, $stateParams.key);
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/new_user', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $('.container').fadeIn();
                    LoadScreen.stop();
                    $('#body').show();
                    $scope.loading = false;
                }
                else{
                    console.log('ERROR: ',data);
                    window.location.assign('#/login');
                }
            })
            .error(function(data) {
                window.location.assign('#/login');
                console.log('Error: ' , data);
            });
        $scope.$watch('item.user_name', function() {
            if ($scope.user_name){
                $scope.item.user_name = $scope.item.user_name.replace(/\s+/g,'');
            }
            $scope.unavailable = false;
            $scope.available = false;
        });
        $scope.checkUserName = function(user){
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/check_username', packageForSending(user))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        $scope.available = true;
                        $scope.unavailable = false;
                    }
                    else{
                        console.log('ERROR: ',data);
                        $scope.available = false;
                        $scope.unavailable = true;}  
                });
        }
        
        $scope.createAccount = function(isValid){
            
            if(isValid){
            $scope.working = 'pending';
            $scope.waiting_for_response = true;
            var to_send = {user_name: $scope.item.user_name, password: $scope.item.password}
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/register_credentials', packageForSending(to_send))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $scope.working = 'done';
                    var returned_data = JSON.parse(data.data);
                    $.cookie(TOKEN,returned_data.token, {expires: new Date(returned_data.expires)});
                    $.cookie(USER_NAME, $scope.item.user_name, {expires: new Date(returned_data.expires)});
                    $.cookie(PERMS, returned_data.perms);
                    $.cookie('FORM_INFO_EMPTY', 'true');
                    console.log($.cookie(TOKEN));
                    window.location.assign("/#/app/accountinfo");
                }
                else
                {
                    $scope.working = 'broken';
                    if(data.error == "INVALID_USERNAME")
                    {
                        $scope.unavailable = true;
                        $scope.available = false;
                    }
                    console.log('ERROR: ', data);
                } 
            })
            .error(function(data) {
                $scope.working = 'broken';
                console.log('Error: ' , data);
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
    App.controller('profilepictureController', function($scope, $http, Load, $rootScope){
    routeChange();
    Load.then(function(){
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/get_upload_url', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $("#profilePic").attr("action", data.data);
                    $scope.url = data.data;
                }
                else
                {
                    console.log("Error" , data.error)
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });
            $scope.user_name = $.cookie(USER_NAME);
            $scope.token = $.cookie(TOKEN);
            $scope.type = "prof_pic";
        //initialize profile image variable
        var newprofileImage;
        
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

    App.controller('organizationPictureController', function($scope, $http, Load, $rootScope){
    routeChange();
    Load.then(function(){
        $rootScope.requirePermissions(COUNCIL);
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/get_upload_url', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $("#profilePic").attr("action", data.data);
                    $scope.url = data.data;
                }
                else
                {
                    console.log("Error" , data.error)
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });
            $scope.user_name = $.cookie(USER_NAME);
            $scope.token = $.cookie(TOKEN);
            $scope.type = "organization";
    });
    });

//the directory
    App.controller('membersDirectoryController', function($scope, $rootScope, $http, Load, LoadScreen, directoryFilterFilter, $filter, localStorageService){
    routeChange();
        $scope.memberdirectorylength = 20;
    Load.then(function(){
        
        $scope.increaseDirectoryLength = function(){
            if ($scope.members){
                if ($scope.memberdirectorylength < $scope.members.length){
//                    console.log('Increasing number of shown elements');
                    $scope.memberdirectorylength += 20;
                }
            }
        }
        
        $scope.council = $filter('orderBy')( directoryFilterFilter($rootScope.directory.members, 'council'), 'last_name');
        $scope.leadership = $filter('orderBy')( directoryFilterFilter($rootScope.directory.members, 'leadership'), 'last_name');
        $scope.members = $filter('orderBy')( directoryFilterFilter($rootScope.directory.members, 'member'), 'last_name');
        $scope.$watch('search', function(){
            if ($scope.search){
                $scope.memberdirectorylength = 20;
            }
        })
//        function splitMembers(){
//            var council = [];
//            var leadership = [];
//            var members = [];
//            if ($rootScope.directory.members){
//                for (var i = 0; i< $rootScope.directory.members.length; i++){
//                    if ($rootScope.directory.members[i].perms == MEMBER){
//                        members.push($rootScope.directory.members[i]);
//                        continue;
//                    }
//                    if ($rootScope.directory.members[i].perms == LEADERSHIP){
//                        leadership.push($rootScope.directory.members[i]);
//                        continue;
//                    }
//                    if ($rootScope.directory.members[i].perms == COUNCIL){
//                        console.log('hi')
//                        council.push($rootScope.directory.members[i]);
//                        continue;
//                    }
//                }
//                $scope.directory = [];
//                if (council.length > 0){
//                    $scope.directory.push({name: 'council', data: council});             
//                }
//                if (leadership.length > 0){
//                    $scope.directory.push({name: 'leadership', data: leadership});               
//                }
//                if (members.length > 0){
//                    $scope.directory.push({name: 'member', data: members});          
//                }
//            }
//        }
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    var directory = JSON.parse(data.data)
                    console.log(directory);
                    $rootScope.directory = directory;
                    localStorageService.set('directory', $rootScope.directory);
                    $scope.directory = $rootScope.directory.members;
                    $scope.council = $filter('orderBy')( directoryFilterFilter($rootScope.directory.members, 'council'), 'last_name');
                    $scope.leadership = $filter('orderBy')( directoryFilterFilter($rootScope.directory.members, 'leadership'), 'last_name');
                    $scope.members = $filter('orderBy')( directoryFilterFilter($rootScope.directory.members, 'member'), 'last_name');
                    LoadScreen.stop();
                }
                else
                {
                    console.log("error: ", data.error)
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });
        $scope.showIndividual = function(member){
            window.location.assign("#/app/directory/"+member.user_name);
        }
        $scope.getProfPic = function(link){
            if (link){
                return link + '=s50';
            }
            else{
                return $rootScope.defaultProfilePicture;
            }
            
        }
        
        //click the buttons to search for that button text
        $('#searchTags button').click(function(){
            var searchValue = $(this).text();
            $('#directorySearch').val(searchValue).change();
        });
        
    });
    });

    App.controller('alumniDirectoryController', function($scope, $rootScope, $http, Load, LoadScreen){
    routeChange();
    Load.then(function(){
        $scope.years = [];
        $scope.selected_year = 0;
        for (var i = 0; i < $rootScope.directory.alumni.length; i++){
            if ($rootScope.directory.alumni[i].grad_year && $scope.years.indexOf({value:$rootScope.directory.alumni[i].grad_year}) == -1){
                $scope.years.push({value:$rootScope.directory.alumni[i].grad_year});
                if ($rootScope.directory.alumni[i].grad_year > $scope.selected_year){
                    $scope.selected_year = $rootScope.directory.alumni[i].grad_year
                }
            }
        }
        $scope.getProfPic = function(link){
            if (link){
                return link + '=s50';
            }
            else{
                return $rootScope.defaultProfilePicture;
            }
        }
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
    App.controller('memberprofileController', function($scope, $rootScope, $stateParams, $http, Load, LoadScreen, localStorageService){
    routeChange();
    $scope.saveVcard = function(){
        var user = $scope.member;
        var out_string = 'BEGIN:VCARD\nVERSION:2.1\nN:' + user.last_name + ';' + user.first_name + ';;;\n'; //name
        out_string += 'FN:' + user.first_name + ' ' + user.last_name + '\n';//FN
        if (user.phone){
        out_string += 'TEL;CELL:' + user.phone + '\n';} //Phone
        if (user.email){
        out_string += 'EMAIL;PREF;INTERNET:' + user.email + '\n';}//Email
        if (user.prof_pic){
        out_string += 'PHOTO;PNG:'+user.prof_pic + '\n';}//picture
//        out_string += 'ADR;TYPE=home;LABEL=' + '\"' + user.address + '\\n'+ user.city + ',' + user.state + ' ' +user.zip + '\\nUnited States of America\"\n';
        if (user.address){
        out_string += 'ADR;HOME:;;'+user.address+';'+user.city+';'+user.state+';'+user.zip+';United States of America\n';}//address
//        out_string += ' :;;'+ user.address + ';' + user.city + ';' + user.state + ';' + user.zip + ';' + 'United States of America\n';
//        if (user.prof_pic.indexOf('jpg') > -1){
//            out_string += 'PHOTO;MEDIATYPE=image/jpeg:' + user.prof_pic + '\n';
//        }
//        else if (user.prof_pic.slice(user.prof_pic.length-5).indexOf('gif') > -1){
//            out_string += 'PHOTO;MEDIATYPE=image/gif:' + user.prof_pic + '\n';
//        }
//        else if (user.prof_pic.slice(user.prof_pic.length-5).indexOf('png') > -1){
//            out_string += 'PHOTO;MEDIATYPE=image/png:' + user.prof_pic + '\n';
//        }
        out_string += 'END:VCARD';
        var blob = new Blob([out_string], {type: "text/vcard;charset=utf-8"});
//        var csvString = csvRows.join("%0A");
//                var a         = document.createElement('a');
//                a.href        = 'data:text/vcard,' + out_string;
//                a.target      = '_blank';
//                a.download    = 'contact.vcf';
//                console.log(a.href);
//                document.body.appendChild(a);
//                a.click();
//                document.body.removeChild(a);
        saveAs(blob, ($scope.member.first_name + '_' + $scope.member.last_name) || "contact" + ".vcf");
    }
    Load.then(function(){
        if ($stateParams.id.toString().length < 2){
            window.location.assign('/#/app/directory');
        }
        
        $scope.members = $rootScope.directory.members;
        if ($scope.members){
            loadMemberData();
        }
        
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    var directory = JSON.parse(data.data)
                    $rootScope.directory = directory;
                    localStorageService.set('directory', $rootScope.directory);
                    LoadScreen.stop();
                    $scope.members = directory.members;
                    loadMemberData();
                }
                else
                {
                    console.log("error: ", data.error)
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });        
    
        function loadMemberData(){
            $scope.member = undefined;
            for(var i = 0; i<$scope.members.length; i++)
            {
                if($scope.members[i].user_name == $stateParams.id)
                {
                    $scope.member = $scope.members[i];
                    $scope.prof_pic = $scope.members[i].prof_pic;
                     //define profile information
                    $scope.status = $scope.member.status;
                    var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    if ($scope.member.grad_month && $scope.member.grad_year){
                        $scope.graduation = month[$scope.member.grad_month-1] + " " + $scope.member.grad_year;
                    }
                    $scope.pledgeClass = $scope.member.pledge_class_semester + ' ' + $scope.member.pledge_class_year;
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

                    return;
                }
            }
            console.log('I made it to alumni');
            for(var i = 0; i<$rootScope.directory.alumni.length; i++)
            {
                if($rootScope.directory.alumni[i].user_name == $stateParams.id)
                {
                    $scope.member = $scope.directory.alumni[i];
                    $scope.prof_pic = $scope.member.prof_pic;
                     //define profile information
                    $scope.status = $scope.member.status;
                    var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    if ($scope.member.grad_month && $scope.member.grad_year){
                        $scope.graduation = month[$scope.member.grad_month-1] + " " + $scope.member.grad_year;
                    }
                    $scope.pledgeClass = $scope.member.pledge_class_semester + ' ' + $scope.member.pledge_class_year;
                    $scope.occupation = $scope.member.occupation;
                    $scope.position = $scope.member.position;
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
    routeChange();
    Load.then(function(){
        $scope.changePassword = function(old_pass, new_pass) {
            var to_send = {password:new_pass, old_password: old_pass};
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/change_password', packageForSending(to_send))
            .success(function(data) {
                if(!checkResponseErrors(data)){
                    $scope.passwordChanged = true;
                    $scope.changeFailed = false;
                }
                else{
                    console.log('Error: ' , data);
                    $scope.changeFailed = true;
                    $scope.passwordChanged = false;
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
                $scope.changeFailed = true;
                $scope.passwordChanged = false;
            });              
        }
        $scope.updatedInfo = false;
        $scope.item = $rootScope.me;
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/get_user_directory_info', packageForSending(''))
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
                    console.log('ERROR: ',data);
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });
        
        $scope.checkAlumni = function(){
            return $rootScope.checkAlumni();
        }
        
        
        $scope.updateAccount = function(isValid){
            if(isValid){
                $scope.working = 'pending';
                console.log($scope.item.dob);
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/update_user_directory_info', packageForSending($scope.item))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        $scope.working = 'done';
                        $scope.updatedInfo = true;
                        $.removeCookie('FORM_INFO_EMPTY');
                    }
                    else
                    {
                        $scope.working = 'broken';
                        console.log('ERROR: ',data);
                    }
                    
                })
                .error(function(data) {
                    $scope.working = 'broken';
                    console.log('Error: ' , data);
                });
            }
            else{
            //for validation purposes
            $scope.submitted = true;
            }
        }
    });
    $scope.updateEmailPrefs = function(option){
        var to_send = {email_prefs: option}
        $scope.emailPrefUpdating = "pending";
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/update_user_directory_info', packageForSending(to_send))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $scope.emailPrefUpdating = "done";
                }
                else
                {
                    console.log('ERROR: ',data);
                    $scope.emailPrefUpdating = "broken";
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
                console.log('I should be broken');
                $scope.emailPrefUpdating = "broken";
            });
    }
    
    $scope.getUser = function(){
        return $.cookie(USER_NAME);
    }
    $scope.getToken = function(){
        return $.cookie(TOKEN);
    }
    });

//upload image
    App.controller('uploadImageController', function($scope, $http, Load, $rootScope){
    routeChange();
    Load.then(function(){
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/set_uploaded_prof_pic', packageForSending({key: getParameterByName('key')}))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    //$scope.url = JSON.parse(data.data);
                    window.location.assign("/#/app/accountinfo");
                }
                else
                {
                    console.log("error: ", data.error)
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });
        
        $scope.showIndividual = function(member){
            window.location.assign("/#/app/directory/user/"+member.user_name);
        }
        
    });
    });

//member tagging page
    App.controller('membertagsController', function($scope, $http, $rootScope, Load, localStorageService) {
        routeChange();
        
//        var elementToScroll = $('#tagMembersCard')
//        var elementPosition = elementToScroll.offset();
//
//        $(window).scroll(function(){
//                if($(window).scrollTop() > elementPosition.top){
//                      elementToScroll.css('position','fixed').css('top',''+elementPosition+'');
//                } else {
//                    elementToScroll.css('position','relative');
//                }    
//        });
        
        $scope.selectTagFromTypeAhead = function(tag){
            console.log('looking for tag', tag);
            console.log('all tags', $scope.tags);
            var tags = $scope.org_tags;
            for(var i = 0; i < tags.length; i++){
                    if (tags[i].name == tag.name)  {
                        console.log('I found the tag!');
                        tags[i].checked = true;
                        $scope.selectedTagName = "";
                        break;
                    }
                } 
            
            
//            for(var i = 0; i < $scope.tags.length; i ++){
//                if ($scope.tags[i].name == tag.name)  {
//                    $scope.tags[i].checked = true;
//
//                    return;
//                }
//                $scope.selectedTagName = "";
//            }
        }
        $scope.selectedTag = "";
        
        $scope.checkTag = function(tag){
            if(tag.checked){
                tag.checked = false;
            }
            else{
                tag.checked = true;
            }
            $scope.selectedTagName = "";
            console.log(tag);
        }
        
        Load.then(function(){
        $rootScope.requirePermissions(LEADERSHIP);
        $scope.memberslength = 20;
        $scope.$watch('search', function(){
                $scope.memberslength = 20;
        });
        $scope.loadMoreMembers = function(){
            if ($scope.memberslength < $scope.users.length){
                $scope.memberslength += 20;
            }
        }
        function getUsers(){
            var out_users = [];
            var users = $rootScope.directory;
            for (var i = 0; i < users.members.length; i ++){
                var user = users.members[i];
                user.name = users.members[i].first_name + " " + users.members[i].last_name;
                user.checked = false;
                out_users.push(user);
            }
            $scope.users = out_users
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    var users = JSON.parse(data.data);
                    $rootScope.directory = users;
                    localStorageService.set('directory', $rootScope.directory);
                    var out_users = [];
                    for (var i = 0; i < users.members.length; i ++){
                        for (var j = 0; j < $scope.users.length; j++){
                            if (users.members[i].key == $scope.users[j].key){
                                var checked = $scope.users[j].checked;
                                $scope.users[j] = users.members[i];
                                $scope.users[j].checked = checked;
                                $scope.users[j].name = users.members[i].first_name + " " + users.members[i].last_name;
                                break;
                            }
                        }
//                        var user = users.members[i];
//                        user.name = users.members[i].first_name + " " + users.members[i].last_name;
//                        user.checked = false;
//                        out_users.push(user);
                    }
//                    $scope.users = out_users;
//                    $rootScope.directory = users;
//                    console.log($rootScope.directory);
                }
                else
                    console.log('ERROR: ',data);
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });
        }
        getUsers();
        $scope.getOrganizationTags = function(){
            //initialize ng-model variables to contain selected things
            $('#tag').val('');
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/message/get_tags', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        var org_tags = JSON.parse(data.data).org_tags;
                        var out_tags = [];
                        for (var i = 0; i < org_tags.length; i++){
                            org_tags[i].checked = false;
                            out_tags.push(org_tags[i]);
                        }
                        $rootScope.tags = JSON.parse(data.data);
                        localStorageService.set('tags', $rootScope.tags);
                        $scope.org_tags = out_tags;
                        $rootScope.org_tag_data = $scope.org_tags;
                    }
                    else{
                        console.log('ERROR: ',data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
        }
        $scope.getOrganizationTags();
        $scope.addOrganizationTag = function(tag){
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/add_organization_tag', packageForSending({tag: tag}))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        if ($rootScope.tags.org_tags.indexOf({tag: tag}) == -1){
                            $rootScope.tags.org_tags.push({tag: tag});
                        }
                        if ($scope.org_tags.indexOf({tag: tag}) == -1){
                            $scope.org_tags.push({name:tag, checked:true, recent:true});
                        } 
                    }
                    else
                    {
                        console.log('ERROR: ',data);
                    }
                    
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
            
            $("#addTag input").val("");
        }
        
        $scope.removeOrganizationTag = function(){
            $('#deleteTagModal').modal('hide');
            $('#seeallTags').modal();
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/remove_organization_tag', packageForSending({tag: $scope.modaledTag.name}))
                .success(function(data){
                    if(checkResponseErrors(data)){openErrorModal(data.error)}
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
            var idx = $rootScope.tags.org_tags.indexOf($scope.modaledTag);
            $rootScope.tags.org_tags.splice(idx, 1);
            $scope.org_tags.splice($scope.org_tags.indexOf($scope.modaledTag), 1);
            var tag = $scope.modaledTag;
            $scope.modaledTag = null;
            for (var i = 0; i< $rootScope.directory.members.length; i++){
                if ($rootScope.directory.members[i].tags.indexOf(tag.name) > -1){
                    $rootScope.directory.members[i].tags.splice($rootScope.directory.members[i].tags.indexOf(tag.name), 1);
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
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/rename_organization_tag', packageForSending({old_tag: $scope.modaledTag.name, new_tag: new_tag}))
                    .success(function(data){
                        if (!checkResponseErrors(data))
                        {
                        }
                        else
                        {
                            console.log('ERROR: ',data);
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ' , data);
                    });
                var tag = $scope.modaledTag;
                $scope.rename = null;
                var idx = $rootScope.tags.org_tags.indexOf(tag);
                $rootScope.tags.org_tags[idx] = {name:new_tag, checked:false};
                $scope.org_tags[$scope.org_tags.indexOf(tag)] = {name:new_tag, checked:false};
                $scope.modaledTag = null;
                for (var i = 0; i< $rootScope.directory.members.length; i++){
                    if ($rootScope.directory.members[i].tags.indexOf(tag.name) > -1){
                        $rootScope.directory.members[i].tags[$rootScope.directory.members[i].tags.indexOf(tag.name)] = new_tag;
                    }
                }
            }
            else{
                $scope.submitted = true;
            }
        }
        
        $scope.$watch('item.tag', function() {
            if ($scope.item){
                $scope.item.tag = $scope.item.tag.replace(/\s+/g,'');
            }
        });
       
        $scope.openRenameTagModal = function(tag){
            $('#renameTagModal').modal();
            $scope.modaledTag = tag;
            $('#seeallTags').modal('hide')
        }
        
        $scope.openDeleteTagModal = function(tag){
            $('#deleteTagModal').modal();
            $scope.modaledTag = tag;
            $('#seeallTags').modal('hide');
        }
        
        function addTagsToUsers(tags, keys){
            var to_send = {tags: tags, keys: keys};
            console.log(to_send);
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/add_users_tags', packageForSending(to_send))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        console.log('success');
                    }
                    else
                    {
                        console.log('ERROR: ',data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
            for(var j = 0; j < $scope.users.length; j++){
                var user = $scope.users[j];
                console.log(user);
                for(var i = 0; i < $scope.org_tags.length; i++){
                    if ($scope.org_tags[i].checked && user.checked && user.tags.indexOf($scope.org_tags[i].name) < 0){
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
        
        function removeTagFromUser(tag, user){
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/remove_users_tags', packageForSending({'tags': [tag], 'keys': [user.key]}))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        if (user.tags.indexOf(tag) > -1){
                            user.tags.splice(user.tags.indexOf(tag), 1);
                        }
                    }
                    else
                    {
                        console.log('ERROR: ',data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
        }
        
        $scope.removeTagFromUser = function(tag, user){
            console.log(tag);
            console.log(user);
            removeTagFromUser(tag, user);
            clearCheckLabels();
        }
    });
        function clearCheckLabels(){
            for (var i = 0; i < $scope.users.length; i++){
                $scope.users[i].checked = false;
            }
            for (var i = 0; i < $scope.org_tags.length; i++){
                $scope.org_tags[i].checked = false;
            }
        }
    });

//member messaging page
    App.controller('messagingController', function($scope, $http, $q, $rootScope, Load, localStorageService) {
    routeChange();
    Load.then(function(){ 
        $rootScope.requirePermissions(LEADERSHIP);
        if ($rootScope.sentMessages){
            $scope.sentMessages = $rootScope.sentMessages;
        }
        else{
            $scope.sentMessages = [];
        }
        $scope.clearUsers = false;
        $scope.deleteMessageTip = {
            "title" : "Delete Message"
        }
        $scope.currentPage = 0;
        $scope.pageSize = 10;
        $scope.maxPageNumber = 5;
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/message/get_tags', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data)){
                    var tag_data = JSON.parse(data.data);
                    $scope.tags = tag_data;
                    $rootScope.tags = tag_data;
                    localStorageService.set('tags', $rootScope.tags);
                }
                else{
                    console.log("error: ", data.error)
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/message/recently_sent', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $scope.sentMessages = JSON.parse(data.data);
                    $rootScope.sentMessages = $scope.sentMessages;
                    console.log($scope.sentMessages);
                }
                else
                {
                    console.log("error: ", data.error)
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });      
        
        $scope.sendMessage = function(isValid, tags, title, content){
            if (isValid){
                var selectedKeys = []
                console.log('selected members', $scope.selectedMembers.length);
                for (var i = 0; i < $scope.selectedMembers.length; i++){
                    
                    if ($scope.selectedMembers[i].user){
                        selectedKeys.push($scope.selectedMembers[i].user.key);
                    }
                    else if($scope.selectedMembers[i].key){
                        selectedKeys.push($scope.selectedMembers[i].key);
                    }
                }
                var to_send = {title: title, content: content, keys: selectedKeys};
                console.log("what Im sending in message", to_send);
                $scope.updating = "pending"
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/message/send_message', packageForSending(to_send))
                    .success(function(data){
                        if (!checkResponseErrors(data))
                        {
                            $scope.updating = "done";
                            $scope.title = '';
                            $scope.content = '';
                            $scope.messagingForm.$setPristine();
                            $scope.clearUsers = true;
                            clearCheckedTags($scope.tags);
                            
                            setTimeout(function(){
                            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/message/recently_sent', packageForSending(''))
                            .success(function(data){
                                if (!checkResponseErrors(data))
                                {
                                    $scope.sentMessages = JSON.parse(data.data);
                                }
                                else
                                {
                                    console.log("error: ", data.error)
                                }
                            })
                            },2000);
                            console.log('message sent');
                        }
                        else
                        {
                            $scope.updating = "broken";
                            console.log("error: ", data.error)
                        }
                    })
                    .error(function(data) {
                        $scope.updating = "broken";
                        console.log('Error: ' , data);
                    });
                
            }
            else{ $scope.submitted = true; }
        }
        
        $scope.deleteMessage = function(message){
            $('#messageModal').modal('hide');
            var to_send = {message: message.key}
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/message/delete', packageForSending(to_send))
                    .success(function(data){
                        if (!checkResponseErrors(data))
                        {
                            console.log('message removed');
                        }
                        else
                        {
                            console.log("error: ", data.error)
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ' , data);
                    });
            $scope.sentMessages.splice($scope.sentMessages.indexOf(message), 1);
        }
        
        $scope.openMessageModal = function(message){
            $('#messageModal').modal();
            $scope.selectedMessage = message;
        }
        
        $('#showHiddenButton').click(function () {
          $(this).text(function(i, text){
              return text === "Show Recently Sent" ? "Hide Recently Sent" : "Show Recently Sent";
          })
       }); 
    });
    });

    App.controller('newEventController', function($scope, $http, $rootScope, Load, $timeout, localStorageService) {
        routeChange();
        Load.then(function(){
            $rootScope.requirePermissions(LEADERSHIP);
            $scope.event = {};
            $scope.event.tag = '';
            $scope.tags = $rootScope.tags;
            $scope.$watch('event.tag', function() {
                if (!$scope.event)
                    $scope.unavailable = false;
                $scope.event.tag = $scope.event.tag.replace(/\s+/g,'');
                $scope.unavailable = false;
                $scope.available = false;
            });
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/message/get_tags', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        $scope.tags = JSON.parse(data.data);
                        $rootScope.tags = JSON.parse(data.data);
                        localStorageService.set('tags', $rootScope.tags);
                    }
                    else{
                        console.log("error: ", data.error)
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });

            $scope.addEvent = function(isValid, event){
                if(isValid){
                    $scope.working = 'pending';
                    event.tags = getCheckedTags($scope.tags);
                    var to_send = JSON.parse(JSON.stringify(event));
                    console.log('date start', event.date_start + " " + event.time_start);
                    to_send.time_start = momentUTCTime(event.date_start + " " + event.time_start).format('MM/DD/YYYY hh:mm a');
                    to_send.time_end = momentUTCTime(event.date_end + " " + event.time_end).format('MM/DD/YYYY hh:mm a');
                    console.log(to_send.time_end);
                    $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/create', packageForSending(to_send))
                    .success(function(data){
                        if (!checkResponseErrors(data)){
                            $scope.working = 'done';
                            setTimeout(function(){window.location.assign('#/app/events/'+event.tag);},500);
                        }
                        else{
                            $scope.working = 'broken';
                            console.log('ERROR: ',data);}
                        $scope.loading = false;
                    })
                    .error(function(data) {
                        $scope.working = 'broken';
                        console.log('Error: ' , data);
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
                
                if (tag == ""){
                    $scope.isEmpty = true;
                }
                else{
                    $scope.checkWorking = 'pending';
                    $scope.unavailable = false;
                    $scope.available = false;
                    $scope.isEmpty = false;
                    console.log('Im about to send', tag);
                    $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/check_tag_availability', packageForSending(tag))
                    .success(function(data){
                        if (!checkResponseErrors(data)){
                            $scope.checkWorking = 'done';
                            $scope.available = true;
                            $scope.unavailable = false;
                        }
                        else{
                            $scope.checkWorking = 'broken';
                            $scope.unavailable = true;
                            $scope.available = false;
                        }
                    })
                    .error(function(data) {
                        $scope.checkWorking = 'broken';
                        console.log('Error: ' , data);
                    });
                }
            }
        });
        $scope.$watch('event.date_start', function(){
            if ($scope.event){
                if ($scope.event.date_start && !$scope.event.date_end){
                    $scope.event.date_end = JSON.parse(JSON.stringify($scope.event.date_start));
                    console.log(moment().add('hours', 1).format('h:[00] A'));
                    
                    $scope.event.time_start = moment().add('hours', 1).format('h:[00] A');
                    $timeout(function(){$('.picker').trigger('change')},200);
                }
            }
        })
        $scope.$watch('event.time_start', function(){
            console.log('I see that change!!!');
            if ($scope.event){
                if ($scope.event.time_start){
                    
                    $scope.event.time_end = moment($scope.event.time_start, 'h:mm A').add('hours', 1).format('h:[00] A');
                    var test = moment($scope.event.time_end, 'h:mm A').diff(moment($scope.event.time_start, 'h:mm A')) < 0;
                    if (test && $scope.event.date_start == $scope.event.date_end){
                        console.log('difference', moment($scope.event.time_end, 'h:mm A').diff(moment($scope.event.time_start, 'h:mm A')) < 0);
                        console.log('time_end', $scope.event.time_end);
                        console.log('time_start', $scope.event.time_start);
                        $scope.event.date_end = moment($scope.event.date_end).add('days', 1).format('MM/DD/YYYY');
                    }
                }
                $timeout(function(){$('.picker').trigger('change')},200);
            }
        })
    });

    App.controller('eventsController', function($scope, $http, Load, $rootScope, localStorageService) {
        routeChange();
        
        Load.then(function(){
            $rootScope.requirePermissions(MEMBER);
            $scope.events = $rootScope.events;
            $scope.eventSource = [];
            for (var i = 0; i< $scope.events.length; i++){
                $scope.eventSource.push({title: $scope.events[i].title, startTime: new Date($scope.events[i].time_start), endTime: new Date( $scope.events[i].time_end), tag: $scope.events[i].tag});}
                //send the organization and user date from registration pages
            function getEvents(){
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/get_events', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        $scope.events = JSON.parse(data.data);
                        $rootScope.events = $scope.events;
                        localStorageService.set('events', $rootScope.events);
                        for (var i = 0; i< $scope.events.length; i++){
                            if ($scope.eventSource.indexOf({title: $scope.events[i].title, startTime: new Date($scope.events[i].time_start), endTime: new Date($scope.events[i].time_end), tag: $scope.events[i].tag}) != -1){
                            $scope.eventSource.push({title: $scope.events[i].title, startTime: new Date($scope.events[i].time_start), endTime: new Date($scope.events[i].time_end), tag: $scope.events[i].tag});
                            }
                        }
                        console.log($scope.eventSource);
                    }
                    else
                        console.log('ERROR: ',data);
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                    getEvents();
                });
            }
            
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
            $scope.$watch('search', function(){
                if ($scope.current){
                    $scope.current.currentPage = 0;
                    if ($scope.search){
                        $scope.present = undefined;
                    }
                    else{
                        $scope.present = true; 
                    }
                }
            })
	   });
	});


    App.controller('eventInfoController', function($scope, $http, $stateParams, $rootScope, $q, Load, getEvents){
        routeChange();
        
        $scope.going = false;
        $scope.not_going = false;
        $scope.loading = true;
        $scope.goToReport = function(){
            window.location.assign("#/app/events/" + $stateParams.tag + "/report");
        }
        $scope.saveEvent = function(){
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
            out_string += 'DTSTART:'+moment(event.time_start).format('YYYYMMDDTHHmmss')+'Z\n';
            out_string += 'DTEND:'+moment(event.time_end).format('YYYYMMDDTHHmmss') + 'Z\n';
            out_string += 'SUMMARY:'+event.title.replace(/(\r\n|\n|\r)/gm," ") + '\n';
            out_string += 'DESCRIPTION:'+event.description.replace(/(\r\n|\n|\r)/gm," ") + '\n';
            out_string += 'END:VEVENT\nEND:VCALENDAR';
            var blob = new Blob([out_string], {type: "text/calendar;charset=utf-8"});
            console.log(blob);
            saveAs(blob, "event.ics");
        }
        
        $scope.mapEvent = function(){
            if ($scope.event.address){
                return $scope.event.address.split(' ').join('+');
            }
            return " ";
        }
        Load.then(function(){
        $rootScope.requirePermissions(MEMBER);
        $scope.tags = $rootScope.tags;
        var event_tag = $stateParams.tag;
        tryLoadEvent(0);
        getEventAndSetInfo($rootScope.events, 0);
	   });
        function tryLoadEvent(count){
            LoadEvents();
            function LoadEvents(){
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/get_events', packageForSending(''))
                    .success(function(data){
                        if (!checkResponseErrors(data)){
                            var events = JSON.parse(data.data);
                            $rootScope.events = events;
                            getEventAndSetInfo(events, count);
                        }
                        else{
                            console.log('ERROR: ',data);
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ' , data);
                        tryLoadEvent(count+1);
                    });
            }
        }   
        function getEventAndSetInfo(events, count){
            function getUsersFromKey(key){
                for (var i = 0; i < $rootScope.directory.members.length; i++){
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
                    console.log('I think I couldnt find the event');
                    return;
                }
            }
            event.going_list = []
            event.not_going_list = []
            for (var i = 0; i < event.going.length; i++){
                var user_push = getUsersFromKey(event.going[i])
                event.going_list.push(user_push);
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
                if($scope.event.address){
                $scope.address_html = $scope.event.address.split(' ').join('+');
                }
                if($scope.event.location || !$scope.event.address){
                $scope.address_html = $scope.event.location.split(' ').join('+');
                }
            $scope.time_start = momentInTimezone($scope.event.time_start).format('MM/DD/YYYY hh:mm A');
            $scope.time_end = momentInTimezone($scope.event.time_end).format('MM/DD/YYYY hh:mm A');  
            $scope.loading = false;
            $scope.eventNotFound = false;
            
            setTimeout(function(){$('.container').trigger('resize'); console.log('resizing')}, 800);
            
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
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/rsvp', packageForSending(to_send))
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
                            console.log('ERROR: ',data);
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ' , data);
                    });
        }
        $scope.formatDate = function(date){
            return moment(date).format('dddd - MMMM Do [at] h:mma');
        }
	});

    App.controller('editEventsController', function($scope, $http, $stateParams, $rootScope, $q, Load, getEvents, $timeout){
        routeChange();
        $scope.loading = true;
        Load.then(function(){
        $rootScope.requirePermissions(LEADERSHIP);
        $scope.tags = $rootScope.tags;
        var event_tag = $stateParams.tag;
        tryLoadEvent(0);
	   });
        
        //prevent form from submitting on enter
    $('#newEvent').bind("keyup keypress", function(e) {
          var code = e.keyCode || e.which; 
          if (code  == 13) {               
            e.preventDefault();
            return false;
          }
    });
        
        $scope.openDeleteEventModal = function(){
            $('#deleteEventModal').modal();
        }
        $scope.deleteEvent = function(){
            $('#deleteEventModal').modal('hide');
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/delete', packageForSending({tag: $stateParams.tag}))
            .success(function(data){
                $scope.loading = true;
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
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/get_events', packageForSending(''))
                    .success(function(data){
                        if (!checkResponseErrors(data)){
                            var events = JSON.parse(data.data);
                            $rootScope.events = events;
                            getEventAndSetInfo(events, count);
                        }
                        else{
                            console.log('ERROR: ',data);
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ' , data);
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
            $timeout(function(){$('.picker').trigger('change')},200);
        }
    $scope.submitEdits = function(isValid){
        if (isValid){
            $scope.working = 'pending';
            var to_send = JSON.parse(JSON.stringify($scope.event));
            to_send.time_start = momentUTCTime($scope.date_start + " " + $scope.time_start).format('MM/DD/YYYY hh:mm a');
            to_send.time_end = momentUTCTime($scope.date_end + " " + $scope.time_end).format('MM/DD/YYYY hh:mm a');
            to_send.tags = getCheckedTags($scope.tags);
            console.log(to_send.tags);
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/edit_event', packageForSending(to_send))
            .success(function(data){
                if (!checkResponseErrors(data)){
                    $scope.working = "done";
                    getEvents;
                    window.location.assign('#/app/events');
                }
                else{
                    $scope.working = "broken";
                    console.log('ERROR: ',data);
                }
            })
            .error(function(data) {
                $scope.working = "broken";
                console.log('Error: ' , data);
            });
        }
    }
	});

    App.controller('eventCheckInController', function($scope, $http, Load, $stateParams, $rootScope, $timeout) {
        routeChange();
        function setTimeout(scope, fn, delay) {
            var promise = $timeout(fn, delay);
            var deregister = scope.$on('$destroy', function() {
                $timeout.cancel(promise);
            });
            promise.then(deregister);
        }
        update();
        function update() {
            console.log('starting update');
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/get_check_in_info', packageForSending($stateParams.tag))
            .success(function(data){
                if (!checkResponseErrors(data)){
                    console.log('I am updating the user check in stuff!');
                    var users = JSON.parse(data.data);
                    var counter = 0;
                    if (users){
                        for (var i = 0; i < $scope.users.length; i++){
                            counter++;
                            var user = $scope.users[i];
                            if (user.attendance_data){
                                if (user.attendance_data.in_updating || user.attendance_data.out_updating){
                                    continue;
                                }
                                if (user.timestamp_moment){
                                    if (Math.abs(user.timestamp_moment.diff(moment(), 'seconds')) < 5){
                                        continue;
                                    }
                                }
                                $scope.users[i] = users[i];
                            }
                        }
                    }
                }
                setTimeout($scope, update, 15000);
            });
        }
        $scope.loading = true;
        Load.then(function(){
            $rootScope.requirePermissions(LEADERSHIP);
            getCheckInData();
            $scope.maxLength = 20;
            $scope.maxLengthIncrease = function(){
                if ($scope.users){
                    if ($scope.maxLength < $scope.users.length){
                        $scope.maxLength += 20;
                    }
                }
            }
            $scope.$watch('search', function(){
                if ($scope.search){
                    $scope.maxLength = 20;    
                }
            });
        });
        function getCheckInData(){
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/get_check_in_info', packageForSending($stateParams.tag))
            .success(function(data){
                if (!checkResponseErrors(data)){
                    $scope.users = JSON.parse(data.data);  
                    $scope.loading = false;
                    console.log('Im ending get check in data');
                }
                else{
                    console.log('ERROR: ',data);
                    $scope.eventNotFound = true;
                    $scope.loading = false;
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
                $scope.loading = false;
                $scope.eventNotFound = true;
            });
        }
        $scope.eventTag = $stateParams.tag;
        $scope.checkIn = function(member, checkStatus, clear){ //#TODO: fix controller so we can check in more than once
            member.timestamp_moment = moment();
            if(checkStatus && member.attendance_data && member.attendance_data.time_in){
                $('#checkInModal').modal();
                $scope.selectedUser = member;
                return;
            }
            $('#checkInModal').modal('hide');
            var to_send = {event_tag: $stateParams.tag, user_key: member.key};
            if (!member.attendance_data){
                    member.attendance_data = {}
            }
            if (clear){
                to_send.clear = true;
                member.attendance_data.time_in = "";
            }
            else{
                member.attendance_data.time_in = momentUTCTime();
            }
            member.in_updating = 'pending';
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/check_in', packageForSending(to_send))
            .success(function(data){
                if (!checkResponseErrors(data)){
                    member.in_updating = "done";
                    member.timestamp_moment = moment();
                }
                else{
                    member.in_updating = "broken";
                    console.log('ERROR: ',data);
                }
            })
            .error(function(data) {
                member.in_updating = "broken";
                console.log('Error: ' , data);
            });
        }
        $scope.checkOut = function(member, checkStatus, clear){
            member.timestamp_moment = moment();
            if(checkStatus && member.attendance_data && member.attendance_data.time_out && member.attendance_data.time_in){
                $('#checkOutModal').modal();
                $scope.selectedUser = member;
                return;
            }
            $('#checkOutModal').modal('hide');
            var to_send = {event_tag: $stateParams.tag, user_key: member.key};
            if (!member.attendance_data){
                member.attendance_data = {};
            }
            if (clear){
                to_send.clear = true;
                member.attendance_data.time_out = "";
            }
            else {
                member.attendance_data.time_out = momentUTCTime();
            }
            member.out_updating = 'pending';
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/check_out', packageForSending(to_send))
            .success(function(data){
                if (!checkResponseErrors(data)){
                    member.out_updating = 'done';
                    member.timestamp_moment = moment();
                }
                else{
                    console.log('ERROR: ', data);
                    member.out_updating = 'broken';
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
                member.out_updating = 'broken';
            });
        }
        $scope.formatDate = function(date){
            return momentInTimezone(date).format('lll');
        }
    });

    App.controller('eventCheckInReportController', function($scope, $http, Load, $stateParams, $rootScope, $filter, eventTagDirectorySearchFilter) {
        routeChange();
        $scope.maxLength = 0;
        $scope.maxNoShowsLength = 0;
        $scope.loading = true;
        $scope.increaseMaxLength = function(){
            if ($scope.users && $scope.shows){
                if ($scope.maxLength < $scope.users.length){
                    $scope.maxLength += 20;
                    $scope.maxNoShowsLength =($scope.maxLength - $scope.shows.length) >0 ? ( $scope.maxLength - $scope.shows.length) : 0; 
                }
            }
        }
		$scope.$watch('search', function(){
			if ($scope.search){
				$scope.maxNoShowsLength = 10;
				$scope.maxLength = 10;
			}
			else{
				$scope.maxLength = 20;
				$scope.maxNoShowsLength =($scope.maxLength - $scope.shows.length) >0 ? ( $scope.maxLength - $scope.shows.length) : 0; 
			}
		});
        
        $scope.getProfPic = function(link){
            if (link){
                return link + '=s50';
            }
            else{
                return $rootScope.defaultProfilePicture;
            }   
        }
        Load.then(function(){
            getCheckInData();
            $rootScope.requirePermissions(LEADERSHIP);
            function getCheckInData(){
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/get_check_in_info', packageForSending($stateParams.tag))
            .success(function(data){
                if (!checkResponseErrors(data)){
                    $scope.users = JSON.parse(data.data);
                    $scope.event = undefined;
                    for (var i = 0; i < $rootScope.events.length; i++){
                        if ($rootScope.events[i].tag == $stateParams.tag){
                            $scope.event = $rootScope.events[i];
                        }
                    }
                    $scope.invited = eventTagDirectorySearchFilter($rootScope.directory.members, $scope.event.tags);
                    $scope.noShows = [];
                    $scope.shows = [];
                    if ($scope.event){
                        for (var i = 0 ; i < $scope.users.length; i++){
                            for (var j = 0; j < $scope.invited.length; j++){
                                if ($scope.users[i].key == $scope.invited[j].key){
                                    var shouldAdd = false;
                                        if (!$scope.users[i].attendance_data){
                                            shouldAdd=true;
                                        }
                                        else if (!($scope.users[i].attendance_data.time_in || $scope.users[i].attendance_data.time_out)){
                                            shouldAdd=true;
                                        }
                                        if (shouldAdd){
                                            if ($scope.event.going.indexOf($scope.users[i].key) != -1){
                                                $scope.noShows.push({first_name: $scope.users[i].first_name, last_name:$scope.users[i].last_name, rsvp: 'Going'});
                                            }
                                            else if ($scope.event.not_going.indexOf($scope.users[i].key) != -1){
                                                $scope.noShows.push({first_name: $scope.users[i].first_name, last_name:$scope.users[i].last_name, rsvp: 'Going'});
                                            }
                                            else {
                                                $scope.noShows.push({first_name: $scope.users[i].first_name, last_name:$scope.users[i].last_name, rsvp: 'Going'});
                                            }
                                        }
                                        else if (!shouldAdd){
                                            $scope.shows.push($scope.users[i]);
                                        }
                                    break;
                                }
                            }
                        }
                    }
                    $scope.loading = false;
                    $scope.maxLength = 20;
                    $scope.maxNoShowsLength =($scope.maxLength - $scope.shows.length) >0 ? ( $scope.maxLength - $scope.shows.length) : 0; 
                }
                else{
                    console.log('ERROR: ', data);
                    $scope.eventNotFound = true;
                    $scope.loading = false;
                }
            })
            .error(function(data) {
                console.log('Error: ' ,  data);
                $scope.loading = false;
                $scope.eventNotFound = true;
            });
        }
//            $scope.generateReport(){
//                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/get_check_in_info', packageForSending($stateParams.tag))
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
            
            
            $scope.createReport = function(users){
                var doc = new jsPDF();
                if (!users){
                    users = $scope.users;
                }
                users = $filter('orderBy')(users, "last_name");
                // We'll make our own renderer to skip this editor
                var specialElementHandlers = {
                    '#editor': function(element, renderer){
                        return true;
                    }
                };
                var pageNumber = 1;
                doc.setFontSize(10);
                function newPage(){
                    doc.addImage(NeteGreekLogo, 'PNG', 187, 5, 15, 14);
                    doc.text(20, 14, 'Report for #'+ $stateParams.tag);
                    doc.text(188, 288, 'Page '+pageNumber);
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
                centeredText('Report for #'+ $stateParams.tag, 30);
//                doc.text(56, 30, 'Report for #'+ $stateParams.tag);
                doc.setFontSize(18);
                doc.text(30, 40, 'Attendees');
                var shifted = 20;
                
                for (var i = 0; i < users.length; i++){
                    if (users[i].attendance_data){
                        if (users[i].attendance_data.time_in || users[i].attendance_data.time_out){
                            doc.setFontSize(13);
                            doc.text(10 + shifted, current_line+=8, users[i].first_name + ' ' + users[i].last_name);
                            doc.setFontSize(10);
                            console.log(users[i].attendance_data);
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
                    }
                        current_line += 0;
                    if (current_line > 250 && shifted > 20){
                        current_line = 20;
                        shifted = 20;
                        pageNumber++;
                        doc.addPage();
                        newPage();
                    }
                    else if(current_line > 250){
                        if (originalCurrentLine){
                            current_line = 30;
                            originalCurrentLine = false;
                        }
                        else{
                            current_line = 20;
                        }
                        shifted = 110;
                    }
                }
                if ($scope.noShows.length){
                    if (current_line > 200){
                        if (shifted > 20){
                            current_line = 20;
                            shifted = 20;
                            pageNumber++;
                            doc.addPage();
                            newPage();
                        }
                        else{
                            if (originalCurrentLine){
                            current_line = 26;
                            originalCurrentLine = false;
                            }
                            else{
                                current_line = 20;
                            }
                            shifted = 110;
                        }
                    }
                    doc.setFontSize(18);
                    current_line+=5;
                    doc.text(10 + shifted, current_line+=12, 'No Shows');
                    var noShowsOrganized = $filter('orderBy')($scope.noShows, 'user.last_name');
                    
                    for (var i = 0; i < noShowsOrganized.length; i++){
                        doc.setFontSize(12);
                        doc.text(10 + shifted, current_line+=8, noShowsOrganized[i].user.first_name + ' ' + noShowsOrganized[i].user.last_name + ' - ' + noShowsOrganized[i].rsvp);
                        if (current_line > 250 && shifted > 20){
                            current_line = 20;
                            shifted = 20;
                            pageNumber++;
                            doc.addPage();
                            newPage();
                            
                        }
                        else if(current_line > 250){
                            if (originalCurrentLine){
                                current_line = 40;
                                originalCurrentLine = false;
                            }
                            else{
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
            $scope.formatDate = function(date){
                return momentInTimezone(date).format('lll');
            }
            
            $scope.downloadCSV = function(){
                var users = $filter('orderBy')($scope.users, 'last_name');
                var out = [['"Last%20Name"','"First%20Name"', '"Date%20In"', '"Time%20In"', '"Date%20Out"', '"Time%20Out"']];
                //datetime format yyyy-mm-dd hh:mm:ss
                for (var i = 0; i < users.length; i++){
                    var time_in = '';
                    var time_out = '';
                    var date_in = '';
                    var date_out = '';
                    if (users[i].attendance_data){
                        if (users[i].attendance_data.time_in){
                            var val = moment(momentInTimezone(users[i].attendance_data.time_in));
                            time_in = val.format('hh:mm a');
                            date_in = val.format('MM/DD/YYYY');
                        }
                        if (users[i].attendance_data.time_out){
                            var val2 = moment(momentInTimezone(users[i].attendance_data.time_out));
                            time_out = val2.format('hh:mm a');
                            date_out = val2.format('MM/DD/YYYY');
                        }
                    }
                    out.push([users[i].last_name.replaceAll(' ', '%20'), users[i].first_name.replaceAll(' ', '%20'), date_in.replaceAll(' ', '%20'), time_in.replaceAll(' ', '%20'), date_out.replaceAll(' ', '%20'), time_out.replaceAll(' ', '%20')]);
                }

                var csvRows = [];

                for(var i=0, l=out.length; i<l; ++i){
                    csvRows.push(out[i].join(','));
                }

                var csvString = csvRows.join("%0A");
                var a         = document.createElement('a');
                a.href        = 'data:attachment/csv,' + csvString;
                a.target      = '_blank';
                a.download    = $stateParams.tag+'.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
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


    App.controller('newPollController', function($scope, $http, Load, $rootScope) {
        routeChange();
        $scope.deletePollTip = {
            "title" : "Delete Question"
        }
        $scope.poll = {}
        $scope.poll.questions = [];
        $scope.addQuestion = function(){
            $scope.poll.questions.push({worded_question: '', type: '', choices: []});
        }
        $scope.removeQuestion = function(idx){
            $scope.poll.questions.splice(idx, 1);
        }
        $scope.addChoice = function(question, choice){
            
            if (choice && question.choices.indexOf(choice) == -1){
                question.choices.push(choice);
            }
            question.temp_choice = undefined;
        }
        $scope.removeChoice = function(question, idx){
            question.choices.splice(idx, 1);
        }
        $scope.createPoll = function(isValid){
            $scope.working = 'pending';
            var poll = $scope.poll;
            poll.tags = getCheckedTags($scope.tags);
            var to_send = JSON.parse(JSON.stringify(poll));
//            to_send.time_start = momentUTCTime(poll.date_start + " " + poll.time_start).format('MM/DD/YYYY hh:mm a');
//            to_send.time_end = momentUTCTime(poll.date_end + " " + poll.time_end).format('MM/DD/YYYY hh:mm a');
            if (isValid){
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/poll/create', packageForSending(to_send))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        $scope.working = 'done';
                        window.location.assign('#/app/polls/' + JSON.parse(data.data).key);
                    }
                    else{
                        $scope.working = 'broken';
                        console.log('ERR');
                    }
                })
                .error(function(data) {
                    $scope.working = 'broken';
                    console.log('Error: ' , data);
                });
            }
        }
        Load.then(function(){
            $rootScope.requirePermissions(LEADERSHIP);
            $scope.tags = $rootScope.tags;
        });
	});


    App.controller('pollController', function($scope, $http, Load, $rootScope, localStorageService) {
        routeChange();
        Load.then(function(){
            $scope.polls = $rootScope.polls;
            $rootScope.requirePermissions(MEMBER);
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/poll/get_polls', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        $scope.polls = JSON.parse(data.data);
                        $rootScope.polls = $scope.polls;
                        localStorageService.set('polls', $rootScope.polls);
                    }
                    else{
                        console.log('ERR');
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
        });
        
//        $scope.checkForMorePolls = function(polls, pageNum, max){
//            var len = polls.length;
//            $scope.working = true;
//            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/poll/more_polls', packageForSending(len))
//            .success(function(data){
//                if (!checkResponseErrors(data))
//                {
//                    var new_polls = JSON.parse(data.data);
//                    $rootScope.polls = new_polls;
//                    if (new_polls.length > (pageNum*(max+1)) && (pageNum != 0 || new_polls.length > max)){
//                        pageNum++;
//                    }
//                    else{
//                        $scope.noMoreHiddens = true;
//                    }
//                }
//                else{
//                    console.log('ERROR: ',data);
//                }
//                $scope.working = false;
//            })
//            .error(function(data) {
//                console.log('Error: ' , data);
//                $scope.working = false;
//            }); 
//        }
        
        $scope.showPoll = function(poll){
                window.location.assign('#/app/polls/' + poll.key);
        }
        
	});

    App.controller('pollInfoController', function($scope, $http, Load, $rootScope, $stateParams) {
        routeChange();
        Load.then(function(){
            $scope.loading = true;
            $rootScope.requirePermissions(MEMBER);
            var to_send = {key: $stateParams.key};
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/poll/get_poll_info', packageForSending(to_send))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        $scope.poll = JSON.parse(data.data);
                        $scope.creator = $rootScope.getUserFromKey($scope.poll.creator);
                    }
                    else{
                        $scope.notFound = true;
                        console.log('ERR');
                    }
                    $scope.loading = false;
                })
                .error(function(data) {
                    $scope.notFound = true;
                    console.log('Error: ' , data);
                    $scope.loading = false;
                });
        });
        $scope.closePoll = function(close){
            var to_send = {key: $stateParams.key};
            if (close === true){
                to_send.close = true;
            }
            else if (close === false){
                to_send.open = true;
            }
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/poll/edit_poll', packageForSending(to_send))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        if (close){
                            $scope.poll.open = false
                        }
                        else if (close === false){
                            $scope.poll.open = true;
                        }
                    }
                    else{
                        console.log('ERR');
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
        }
        $scope.$watchCollection('poll.questions', function(){
            console.log('Im doing stuff');
            if ($scope.poll && $scope.poll.questions){   
            for (var i = 0; i < $scope.poll.questions.length; i++){
                if (!$scope.poll.questions[i].new_response){
                    $scope.formUnfinished = true;
                    return;
                }
            }
            $scope.formUnfinished = false;}
        })
        
//        #FIXME creator undefined :-P
        
        $scope.deletePoll = function(){
            var to_send = {key: $stateParams.key};
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/poll/delete', packageForSending(to_send))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        window.location.assign('#/app/polls')
                    }
                    else{
                        console.log('ERR');
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
        }
        
        $scope.submitResponse = function(){
            var to_send = $scope.poll;
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/poll/answer_questions', packageForSending(to_send))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                       window.location.assign('#/app/polls/'+$stateParams.key + '/results');
                    }
                    else{
                        console.log('ERR');
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
        }
        
        $scope.goToResults = function(){
            window.location.assign('#/app/polls/'+$stateParams.key + '/results');
        }
	});

    App.controller('pollResultsController', function($scope, $http, Load, $rootScope, $stateParams, LoadScreen) {
        routeChange();
        $scope.openAllQuestions = function(){
            $('.pollSummary.collapse').collapse('show');
        }
        $scope.closeAllQuestions = function(){
            $('.pollSummary.in').collapse('hide');
        }
        $scope.openAllIndividuals = function(){
            $('.individualResponses.collapse').collapse('show');
        }
        $scope.closeAllIndividuals = function(){
            $('.individualResponses.in').collapse('hide');
        }
        Load.then(function(){
            $('html').trigger('resize');
            $scope.loading = true;
            if ($rootScope.currentPollResult && $rootScope.currentPollResult.key == $stateParams.key){
                
            }
            $rootScope.requirePermissions(MEMBER);
            var to_send = {key: $stateParams.key};
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/poll/get_results', packageForSending(to_send))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        $scope.poll = JSON.parse(data.data);
                        if (($scope.poll.viewers != 'everyone' && !$rootScope.checkPermissions($scope.poll.viewers))){
                            window.location.replace('#/app/polls/'+$stateParams.key);
                        }
                        var key_list = [];
                        var user_list = [];
                        for (var i = 0; i < $scope.poll.questions.length; i++){
                            var currentQuestion = $scope.poll.questions[i];
                            for (var j = 0; j < currentQuestion.responses.length; j++){
                                var idx = key_list.indexOf(currentQuestion.responses[j].key);
                                if (idx == -1){
                                    key_list.push(currentQuestion.responses[j].key);
                                    user_list.push({key:currentQuestion.responses[j].key, user: $rootScope.getUserFromKey(currentQuestion.responses[j].key), responses: new Array($scope.poll.questions.length)});
                                    var idx = key_list.indexOf(currentQuestion.responses[j].key);
                                }
                                user_list[idx].responses[i] = currentQuestion.responses[j].text;
                            }
                        }
                        $scope.individuals = user_list;
                        console.log('User list', user_list);
                    }
                    else{
                        console.log('ERR');
                        $scope.notFound = true;
                    }
                    $scope.loading = false;
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                    $scope.loading = false;
                    $scope.notFound = true;
                });
        });
        
        
    });
        

    App.controller('adminController', function($scope, $http, Load, $rootScope) {
        routeChange();
        $rootScope.requirePermissions(COUNCIL);
//        $scope.loading = true;
        Load.then(function(){
            loadSubscriptionInfo();
            function loadSubscriptionInfo(){
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/pay/subscription_info', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        $scope.subscription = JSON.parse(data.data);
                        $scope.subscription_raw = data.data;
                        $scope.loading = false;
                        $scope.pay = {};
                    }
                    else{
                        console.log('ERROR: ',data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
            }
            $scope.cancelSubscription = function(){
                $scope.loading = true;
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/pay/cancel_subscription', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        setTimeout(function(){$rootScope.refreshPage();}, 150);
                    }
                    else{
                        console.log('ERROR: ',data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
            }
            
            $scope.subscribe = function(paymentData){
                var toSend = "";
                if (paymentData){
                    toSend = paymentData;
                }
                $scope.loading = true;
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/pay/subscribe', packageForSending(toSend))
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
            
            $scope.changeTheme = function(number){
                
                $rootScope.setColor('color'+number);
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/set_colors', packageForSending({color: $rootScope.color}))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                    }
                    else{
                        $scope.error = true;    
                    }
                })
                .error(function(data) {
                    console.log('Error: ' + JSON.stringify(data));
                });
            }
            
        });
	});

//More Functions

function routeChange(){
    $('.modal-backdrop').remove();
    $('.bootstrap-datetimepicker-widget').hide();
    window.scrollTo(0, 0);
}

//checks to see if user is logged in or not
function checkLogin(){
    if($.cookie(USER_NAME) != undefined){
        return true;
    }
    else
        return false;
}

function requireLeadership(){
    if (!checkPermissions('leadership')){
        if ($rootScope.checkAlumni()){
            window.location.assign('#/app/directory/members');
        }
        else{
            window.location.assign("/#/app");
        }
    }
}

function requireCouncil(){
    if (!checkPermissions('council')){
        if ($rootScope.checkAlumni()){
            window.location.assign('#/app/directory/members');
        }
        else{
            window.location.assign("/#/app");
        }
    }
}

function requireMember(){
    if (!checkPermissions('member')){
        if ($rootScope.checkAlumni()){
            window.location.assign('#/app/directory/members');
        }
        else{
            window.location.assign("/#/app");
        }
    }
}

//clears all checked labels

//function checkPermissions(perms){
//    if (PERMS_LIST.indexOf(perms) > PERMS_LIST.indexOf($rootScope.perms)){
//        return false;
//    }
//    return true;
//}

function logoutCookies(){
    $.removeCookie(USER_NAME);
    $.removeCookie(TOKEN);
//    $.removeCookie(PERMS);
    $.removeCookie('FORM_INFO_EMPTY');
}

//function checkAlumni(){
//    if ($.cookie(PERMS) == ALUMNI){
//        return true;
//    }
//    return false;
//}

//use packageForSending(send_data) when $http.post in order to attach data to user
function packageForSending(send_data){
    var output = 
    {user_name:$.cookie(USER_NAME),
     token: $.cookie(TOKEN),
     data: JSON.stringify(send_data)};
//    console.log(output);
    return output;
}

function checkResponseErrors(received_data){
    response = received_data;
    if (response){
        if (response.error == 'TOKEN_EXPIRED' || response.error == 'BAD_TOKEN' || response.error == 'BAD_FIRST_TOKEN')
        {
            window.location.assign("/#/login");
            console.log('ERROR: ', response.error);
            return true;
        }
        else if(response.error == '')
        {
            return false;
        }
        else
        {
            console.log('ERROR: ', response.error);
            return true;    
        }
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
//    console.log(tags);
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
//    console.log(json);
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

App.directive('userNameInput', function(){
        return {
            require: 'ngModel',
            restrict: 'A',
            scope: {
                ngModel: '='
            },
            link: function(scope, elem, attrs, ctrl) {
                scope.$watch('ngModel', function() {
                    if (scope.ngModel){
                        var value = true;
//                        console.log(scope.ngModel);
                        for (var i = 0; i < scope.ngModel.length; i++){
                            if ("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.".indexOf(scope.ngModel[i]) == -1){
                                value = false;
                                break;
                            }
                        }
                        ctrl.$setValidity('userNameInput', value);
                    }
                });
            }
        };
});

App.directive('removeHttp', function(){
    return {
        require: 'ngModel',
        restrict: 'A',
        scope: {
            ngModel: '='
        },
        controller: function($scope) {
            var index = 0;
            $scope.$watch('ngModel', function(){
                if ($scope.ngModel){
                    if ($scope.ngModel.slice(0, 7).toLowerCase() == 'http://'){
                        $scope.ngModel = $scope.ngModel.slice(7);
                    }
                    if ($scope.ngModel.slice(0, 8).toLowerCase() == 'https://'){
                        $scope.ngModel = $scope.ngModel.slice(8);
                    }
                }

            })
        }};
});


App.directive('removeHashTag', function(){
    return {
        require: 'ngModel',
        restrict: 'A',
        scope: {
            ngModel: '='
        },
        controller: function($scope) {
            var index = 0;
            $scope.$watch('ngModel', function(){
                if ($scope.ngModel){
                    if ($scope.ngModel.indexOf('#') > -1){
                        $scope.ngModel = $scope.ngModel.splice($scope.ngModel.indexOf('#'), 1);
                    }
                }
            })
        }};
});


App.directive('search', function(){
        return {
            restrict: 'E',
            scope: {
                ngModel: '='
            },
            templateUrl:'/views/templates/searchdirective.html',
        };
});

App.directive('alumniYearPicker', function(){
    return {
        restrict: 'E',
        scope: {
            alumni: '=',
            search: '=',
            selectedYear: '=',
            requireRegistration: '=?',
        },
        templateUrl: '/views/templates/alumniDirectoryPicker.html',
        controller: function($scope) {
            $scope.$watch('alumni', function(){
                if ($scope.alumni){
                    if (!$scope.years){
                        $scope.years = [];
                    }
                    for (var i = 0; i < $scope.alumni.length; i++){
                        var item = {value:$scope.alumni[i].pledge_class_semester + ' '+ $scope.alumni[i].pledge_class_year, year:$scope.alumni[i].pledge_class_year, semester:$scope.alumni[i].pledge_class_semester};
                        if ($scope.alumni[i].pledge_class_year && $scope.alumni[i].pledge_class_semester && !isAlreadyAdded(item)){
                            if (!$scope.requireRegistration || ($scope.requireRegistration && $scope.alumni[i].user_name)){
                                $scope.years.push(item);
                                if (!$scope.selectedYear){
                                    $scope.selectedYear = item;
                                    $scope.highestYear = item;
                                }
                                else if (item.year > $scope.selectedYear.year){
                                    $scope.selectedYear = item;
                                    $scope.highestYear = item;
                                }
                            }
                        }
                    }
                    $scope.highestYear = $scope.years[0];
                    for (var i = 0; i < $scope.years.length; i++){
                        if ($scope.years[i].year > $scope.highestYear.year){
                            $scope.highestYear = $scope.years[i];
                        }
                    }
                     $scope.selectedYear = $scope.highestYear;
//                console.log('years', $scope.years);
//                console.log('selectedYear',$scope.selectedYear);
                }
            });
            $scope.$watch('search', function(){
                if ($scope.search){
                    if ($scope.search.length){
                        $scope.selectedYear = undefined;}
                    else{
                        $scope.selectedYear = $scope.highestYear;
                    }
                }
                else{
                    $scope.selectedYear = $scope.highestYear;
                }
            })
            function isAlreadyAdded(item){
                for (var i = 0; i < $scope.years.length; i++){
                    if (item.value == $scope.years[i].value){
                        return true;
                    }
                }
                return false;
            }
        }
    };
});


App.directive('listThing', function(){
        return {
            require: 'ngModel',
            restrict: 'E',
            templateUrl: '/views/templates/olderYoungerTemplate.html',
            transclude: true,
            scope: {
                ngModel: '=',
                currentPage:'=?',
                maxPageNumber:'=?',
            },
            controller: function($scope){
        // check if it was defined.  If not - set a default
            $scope.currentPage = $scope.currentPage || 0;
            $scope.maxPageNumber = $scope.maxPageNumber || 5;
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
                        +'<input type="text" class="form-control picker" id="'+this_id+'time" name="'+this_name+'time" ng-model="ngModel" required/>'
                        +'<span class="input-group-addon"><i class="fa fa-clock-o"></i></span></div>'
                        +'<script type="text/javascript">'
                        +'$("#'+this_id+'time").datetimepicker({'
                        +'pickDate: false,'
                        +'icons: {'
                        +'time: "fa fa-clock-o",'
                        +'date: "fa fa-calendar",'
                        +'up: "fa fa-arrow-up",'
                        +'down: "fa fa-arrow-down"'
                        +"}});"
                        +'$("#'+this_id+'time").focusout(function(){'
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
                        +'<input type="text" class="form-control picker" id="'+this_id+'date" name="'+this_name+'" ng-model="ngModel" required/>'
                        +'<span class="input-group-addon"><i class="fa fa-calendar"></i></span></div>'
                        +'<script type="text/javascript">'
                        +'$("#'+this_id+'date").datetimepicker({'
                        +'pickTime: false,'
                        +'icons: {'
                        +'time: "fa fa-clock-o",'
                        +'date: "fa fa-calendar",'
                        +'up: "fa fa-arrow-up",'
                        +'down: "fa fa-arrow-down"'
                        +'}});'
                        +'$("#'+this_id+'date").focusout(function(){'
                        +'$(this).trigger("change");'
                        +'});'
                        +'</script>'
                        );
        $compile(element.contents())(scope)
     }
  }
});


//credit: http://stackoverflow.com/questions/15417125/submit-form-on-pressing-enter-with-angularjs
App.directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keyup", function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.ngEnter, {'event': event});
                    });
                    event.preventDefault();
                }
            });
        };
    });

App.directive('netePieChart', function() {
    return{    
        scope: {
            ngModel : '=',
            realData: '='
        },
        restrict: 'E',
        replace: 'true',
        template: '<div> </div>',
        link: function (scope, element, attrs) {
            scope.$watch('ngModel', function(){
                if (scope.ngModel){
                    scope.realData = {};
                        var objectList = [];
                        for (var i = 0; i < scope.ngModel.length; i++){
                            objectList.push({c: [
                                {v: scope.ngModel[i].name},
                                {v: scope.ngModel[i].count},
                            ]})
                        }

                        scope.realData.data = {"cols": [
                            {id: "t", label: "Choice", type: "string"},
                            {id: "s", label: "Count", type: "number"}
                        ], "rows":objectList};

                        // $routeParams.chartType == BarChart or PieChart or ColumnChart...
                        scope.realData.type = 'PieChart';
                        scope.realData.options = {
                            'title': ''
                        }  
                }   
            });
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

           
            
App.directive('selectingUsers', function($rootScope){
    return {
    restrict: 'E',
    replace: 'true',
    templateUrl: '/views/templates/selectingmembers.html',
    scope:{
        ngModel: "=",
        userCount:"=",
        skipEvent:"=",
        includeUsers:"=?",
        clearUsers:"=?",
    },
    transclude: true,
    link: function (scope, element, attrs) {
        scope.usersList = [];
        scope.selectTagFromTypeAhead = function(tag){
            tag.checked = true;
            scope.selectedTagName="";
//            console.log('searching for',tag);
//            if (tag.user){
//                tag.checked = true;
//                console.log('I just checked it');
//            }
//            var tagTypes = [scope.ngModel.org_tags, scope.ngModel.perms_tags, scope.ngModel.event_tags];
//            for (var j = 0; j < tagTypes.length; j++){
//                console.log(tagTypes[j]);
//                for(var i = 0; i < tagTypes[j].length; i++){
//                    console.log(tagTypes[j][i]);
//                    if (tagTypes[j][i].name == tag.name)  {
//                        console.log('I found the tag!');
//                        tagTypes[j][i].checked = true;
//                        scope.selectedTagName = "";
//                        break;
//                    }
//                } 
//            }
        }
        scope.clickNofity = function(){
            console.log('clicked');
        }
        scope.$watch('ngModel', function(){
            if (scope.ngModel && scope.ngModel.org_tags && scope.includeUsers){
                scope.usersList = [];
                for (var i = 0; i < $rootScope.directory.members.length; i++){
                    scope.usersList.push({user: $rootScope.directory.members[i], checked:false, name:$rootScope.directory.members[i].first_name + ' ' + $rootScope.directory.members[i].last_name });
                }
                scope.allTagsList = scope.ngModel.org_tags.concat(scope.ngModel.perms_tags.concat(scope.ngModel.event_tags)).concat(scope.usersList);
            }
            else if (scope.ngModel && scope.ngModel.org_tags && !scope.skipEvent){
                scope.allTagsList = scope.ngModel.org_tags.concat(scope.ngModel.perms_tags.concat(scope.ngModel.event_tags));
            }
            else if (scope.ngModel && scope.ngModel.org_tags && scope.skipEvent){
                scope.allTagsList = scope.ngModel.org_tags.concat(scope.ngModel.perms_tags);
            }
        });
        scope.$watch('clearUsers', function(){
            if (scope.clearUsers == true){
                scope.clearUsers = false;
                for (var i = 0; i < scope.usersList.length; i++){
                    if (scope.usersList[i].checked){
                        scope.usersList[i].checked = false;
                    }
                }
            }
        })
        
     }
  }
});

App.directive('neteTag', function($compile){
    return{
        restrict: 'E',
        templateUrl: '../views/templates/tags/nete-tag.html',
        link: function(scope, element, attrs){
            $compile(element.contents())(scope)
        }
    }
});

App.directive('netetagCheck', function($compile){
    return{
        restrict: 'E',
        templateUrl: '../views/templates/tags/nete-tag-check.html',
        link: function(scope, element, attrs){
            $compile(element.contents())(scope)
        }
    }
});

App.directive('netetagDelete', function($compile){
    return{
        restrict: 'E',
        templateUrl: '../views/templates/tags/nete-tag-delete.html',
        link: function(scope, element, attrs){
            $compile(element.contents())(scope)
        }
    }
});
            
App.directive('netememberCheck', function($compile){
    return{
        restrict: 'E',
        scope:{ngModel:"="},
        templateUrl: '../views/templates/tags/nete-member-check.html',
        link: function(scope, element, attrs){
//            $compile(element.contents())(scope)
        }
    }
});

App.directive('neteMember', function($compile){
    return{
        restrict: 'E',
        scope:{ngModel:"="},
        templateUrl: '../views/templates/tags/nete-member.html',
        // link: function(scope, element, attrs){
//            $compile(element.contents())(scope)
        // }
    }
});

App.directive('netetagAll', function($compile){
    return{
        restrict: 'E',
        templateUrl: '../views/templates/tags/nete-tag-all.html',
        link: function(scope, element, attrs){
            $compile(element.contents())(scope)
        }
    }
});

App.directive('updateStatus', function($timeout){
    return{
        restrict: 'E',
        scope:  { 
            ngModel: "=",
            fnCall: "&?" 
                },
        templateUrl: '../views/templates/update-status.html',
        controller: function($scope, $element, $attrs){
            $scope.$watch('ngModel', function(){
                if ($scope.ngModel == 'done'){
//                    console.log('its done');
                    $timeout(function(){
//                        console.log('I should be changing it now');
                        $scope.ngModel = '';
                    }, 2000)
                }
            });
            $scope.callFunction = function(){
//                console.log('hi!!!!!');
                $scope.fnCall();
                
            }
//            $compile(element.contents())(scope)
        }
    }
});

//            if (attrs.options == 'all'){
//                element.append(  '<label class="label label-default checkLabel" ng-class="{\'label-primary\': tag.checked, \'label-default\': !tag.checked}">'
//                                +'<i class="fa fa-square-o checkStatus" ng-class="{\'fa-check-square-o\': tag.checked, \'fa-square-o\': !tag.checked}"></i>'
//                                +'<input type="checkbox" ng-model="tag.checked"> <li>#{{ tag.name }}</li>'
//                                +'</label>'
//                                +'<div data-toggle="dropdown" class="badge dropdown-toggle"><i class="fa fa-sort-desc"></i></div>'
//                                +'<ul class="dropdown-menu" role="menu">'
//                                +'<li><a ng-click="openRenameTagModal(tag)">Rename Tag</a></li>'
//                                +'<li><a ng-click="openDeleteTagModal(tag)">Delete Tag</a></li>'
//                                +'</ul>'
//                );
//            }
//            else if(attrs.options == 'check'){
//                element.append(  '<label class="label checkLabel" ng-class="{\'label-primary\': tag.checked, \'label-default\': !tag.checked}">'
//                                +'<i class="fa checkStatus" ng-class="{\'fa-check-square-o\': tag.checked, \'fa-square-o\': !tag.checked}"></i>'
//                                +'<input type="checkbox" ng-model="tag.checked"> <li>#{{tag.name}}</li>'
//                                +'</label>'
//                );
//            }
//            else if(attrs.options == 'delete'){
//                element.append(  '<span class="label label-default userLabel">'
//                                +'<li>#{{ tag }}</li>'
//                                +'</span>'
//                                +'<div class="badge" ng-click="removeTagsFromUsers([tag], [user.key])"><i class="fa fa-times"></i></div>'  
//                );
//            }
//            else{
//                element.append(  '<label class="label label-primary">'
//                                +'<li>#{{ tag.name }}</li>'
//                                +'</label>'
//                );
//            }

App.filter('multipleSearch', function(){ 
    return function (objects, search) {
        var searchValues = search;
        if (!search || !objects){
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
                    retList.push(object);
                }
            }
        }
        return retList;
    }
});
            
            
App.filter('nameSearch', function(){ 
    return function (objects, search, max) {
        if (!search || !objects){
            return objects;
        }
        retList = [];
        if (objects){
            for (var oPos = 0; oPos < objects.length; oPos++){
                var object = objects[oPos];
                var check = false;
                var name = object.first_name + ' ' + object.last_name;
                if(name.toString().toLowerCase().indexOf(search.toLowerCase()) > -1){
                    retList.push(object);
                }
                if (max){
                    if (retList.length >= max){
                        console.log('Im returning early');
                        return retList;
                    }
                }
            }
        }
        return retList;
    }
});
            
//App.filter('capitalizeFirst', function(){ 
//    return function (objects) {
//        if (objects){
////            console.log(objects);
//            return objects[0].toUpperCase() + objects.slice(1);
//        }
//        return retList;
//    }
//});
            
App.filter('yearSearch', function(){ 
    return function (objects, search) {
        if (!search){
            return objects;
        }
        retList = [];
        if (objects){
            for (var oPos = 0; oPos < objects.length; oPos++){
                var object = objects[oPos];
                if (object.grad_year){
                    if(object.grad_year.toString().toLowerCase() == search.toString().toLowerCase()){
                        retList.push(object);
                    }
                }
                else if (search.toString().toLowerCase() == 'unknown'){
                    retList.push(object);
                }
            }
        }
        return retList;
    }
});
            
            
App.filter('pledgeClassSearch', function(){ 
    return function (objects, search) {
        if (!search){
            return objects;
        }
        retList = [];
        if (objects){
            for (var oPos = 0; oPos < objects.length; oPos++){
                var object = objects[oPos];
                if (object.pledge_class_year == search.year && object.pledge_class_semester == search.semester){
                    retList.push(object); 
                }
                else if (search.toString().toLowerCase() == 'unknown'){
                    retList.push(object);
                }
            }
        }
        return retList;
    }
});
            
App.filter('directoryFilter', function(){ 
    return function (objects, perms) {
        var retList = []
        if (objects){
            for (var i = 0; i < objects.length; i++){
                if (objects[i].user_name && objects[i].perms == perms){
                    retList.push(objects[i]);
                }
            }
        }
        return retList;
    }
});

App.filter('removePassedEvents', function(){ 
    return function (objects, removePref) {
        var retList = [];
        var now = new Date();
        if (!objects){
            return objects;
        }
        for(var oPos = 0; oPos < objects.length; oPos++){
            
            if(moment(objects[oPos].time_end).diff(momentUTCTime(undefined)) > 0 && removePref){
                retList.push(objects[oPos]);
            }
            else if (moment(objects[oPos].time_end).diff(momentUTCTime(undefined)) < 0 && removePref === false){
                retList.push(objects[oPos]);
            }
            else if (removePref === undefined){
                retList.push(objects[oPos]);
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


App.filter('checkedFilter', function() {
    return function(input) {
        out = [];
        if  (input){
        for (var i = 0; i < input.length; i++){
            if (input[i].checked){
                out.push(input[i]);
            }
        }
    }
    return out;
    }
});

App.filter('tagDirectorySearch', function(){
    return function (objects, tags, additionalUsers) {
            var tags_list = []
        if (tags){
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
        }
            out_string = '';
            for (var j = 0; j < tags_list.length; j++){
                out_string += tags_list[j] + ' ';
            }
        var search = out_string;
//        if (!search){
//            return null;
//        }
        retList = [];
        
        var searchArray = search.split(" ");
        if (objects){
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
        }
        if (additionalUsers){
            for (var uPos = 0; uPos < additionalUsers.length; uPos++){
                if (additionalUsers[uPos].checked && retList.indexOf(additionalUsers[uPos].user) == -1){
                    retList.push(additionalUsers[uPos]);
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
        return in_objects;
    }
});

App.factory('getEvents', function($http, $rootScope){
    $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/get_events', packageForSending(''))
        .success(function(data){
            if (!checkResponseErrors(data)){
                var events = JSON.parse(data.data);
                $rootScope.events = events;
            }
            else{
                console.log('ERROR: ',data);
            }
        })
        .error(function(data) {
            console.log('Error: ' , data);
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
            $('.mainLoadingScreen').show();
            $('.nav').hide();
        },
        stop: function () {
            $rootScope.loading = false;
            $('.mainLoadingScreen').hide();
            $('.nav').show();
            $('.container').fadeIn();
            $('#body').show();
            console.log('stopping load screen');
        },
        check: function(){
            $rootScope.loading;
        }
    };
});

App.factory( 'Load', function LoadRequests($http, $q, $rootScope, LoadScreen, localStorageService){
    var defer = $q.defer();
        if (!checkLogin()){
        window.location.replace('#/login');
        defer.resolve();
    }
    function executePosts() {
          var deferred = $q.defer();
            var neededCount = 0;
          function checkIfDone() {
              console.log('neededCount', neededCount);
              if (neededCount <= 0){
                console.log('Im done loading');
                deferred.resolve();
              }
              else{
              neededCount --;}
          }
        if ($.cookie(USER_NAME) != localStorageService.get('user_name')){
            localStorage.clear();
            localStorageService.set('user_name', $.cookie(USER_NAME));
        }
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/check_login', packageForSending(''))
            .success(function(data){
                console.log('checked login');
                if (checkResponseErrors(data)){window.location.replace('/#/login'); deferred.resolve(); defer.resolve(); $rootScope.hasLoaded = true;};
            });
            
//        if ($cacheFactory.info()){
//            $rootScope.directory = JSON.parse($cacheFactory.get('directory'));
//            return deferred.promise;
//        }
//            $rootScope.directory = localStorageService.get('directory');
//            checkIfDone();
//        $http.get(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/info/load2/'+$.cookie(USER_NAME)+'/'+$.cookie(TOKEN))
//            .success(function(data){
//                if(!checkResponseErrors(data)){
//                    var load_data = JSON.parse(data.data);
//                    $rootScope.perms = load_data.perms;
////              directory
//                    $rootScope.directory = load_data.directory;
//                    for (var i = 0; i< $rootScope.directory.members.length; i++){
//                        if($rootScope.directory.members[i].user_name == $.cookie(USER_NAME)){
//                            $rootScope.me = $rootScope.directory.members[i];
//                            break;
//                        }
//                    }
//                    localStorageService.set('directory', $rootScope.directory);
////              notifications
//                    $rootScope.notifications = load_data.notifications.notifications;
//                    localStorageService.set('notifications', $rootScope.notifications);
//                    $rootScope.notification_lengths = {unread:load_data.notifications.new_notifications_length, read:load_data.notifications.notifications_length, hidden:load_data.notifications.hidden_notifications_length};
//                    for (var i = 0; i < $rootScope.notifications.length; i++){
//                            $rootScope.notifications[i].collapseOut = true; 
//                    }
//                    $rootScope.hidden_notifications = load_data.notifications.hidden_notifications;
//                    $rootScope.updateNotificationBadge();
////              events    
//                    $rootScope.events = load_data.events;
//                    localStorageService.set('events', $rootScope.events);
//
////                    $cacheFactory.put('events', JSON.stringify($rootScope.events));
////              tags
//                    $rootScope.tags = load_data.tags;
//                    localStorageService.set('tags', $rootScope.tags);
//
////                    $cacheFactory.put('tags', JSON.stringify($rootScope.tags));
////              organization
//                    $rootScope.subscribed = true;
//                    $rootScope.setColor(load_data.organization_data.color);
//                    $rootScope.organization = load_data.organization_data;
//                    $rootScope.polls = load_data.polls;
//                    localStorageService.set('organization', $rootScope.organization);
//                    localStorageService.set('polls', $rootScope.polls);
//                    $rootScope.hasLoaded = true;
//                    $('#body').show();
//                    $('#mobileMenu').show();
//                }
//                checkIfDone();
//            })
//            .error(function(data) {
//                console.log('Error: ' , data);
//                checkIfDone();
//            });
            $rootScope.directory = localStorageService.get('directory');
            if ($rootScope.directory){
                $rootScope.perms = 'alumni';
                for (var i = 0; i < $rootScope.directory.members.length; i++){
                    if ($rootScope.directory.members[i].user_name == $.cookie(USER_NAME)){
                        $rootScope.me = $rootScope.directory.members[i];
                        $rootScope.perms = $rootScope.me.perms;
                        break;
                    }
                }
            }
            else{
                neededCount++;
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        $rootScope.directory = JSON.parse(data.data);
                        localStorageService.set('directory', $rootScope.directory);
                    }
                    checkIfDone();
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                    checkIfDone();
                });
            }
            var load_data = localStorageService.get('notifications');
            if (load_data){
                try{
                    $rootScope.notifications = load_data.notifications;
                    $rootScope.notification_lengths = {unread:load_data.new_notifications_length, read:load_data.notifications_length, hidden:load_data.hidden_notifications_length};
                    for (var i = 0; i < $rootScope.notifications.length; i++){
                            $rootScope.notifications[i].collapseOut = true; 
                    }
                    $rootScope.hidden_notifications = load_data.hidden_notifications;
                    $rootScope.updateNotificationBadge();
                    $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/get', packageForSending(''))
                    .success(function(data){
                        var load_data = JSON.parse(data.data);
                        localStorageService.set('notifications', load_data);
                        $rootScope.notifications = load_data.notifications;
                        $rootScope.notification_lengths = {unread:load_data.new_notifications_length, read:load_data.notifications_length, hidden:load_data.hidden_notifications_length};
                        for (var i = 0; i < $rootScope.notifications.length; i++){
                                $rootScope.notifications[i].collapseOut = true; 
                        }
                        $rootScope.hidden_notifications = load_data.hidden_notifications;
                        $rootScope.updateNotificationBadge();
                        })
                    .error(function(data) {
                            console.log('Error: ' , data);
                        });
                }
                catch(err){localStorageService.remove('notifications'); $rootScope.refreshPage();}
            }
            else {
                neededCount++;
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/get', packageForSending(''))
                .success(function(data){
                    var load_data = JSON.parse(data.data);
                    localStorageService.set('notifications', load_data);
                    $rootScope.notifications = load_data.notifications;
                    $rootScope.notification_lengths = {unread:load_data.new_notifications_length, read:load_data.notifications_length, hidden:load_data.hidden_notifications_length};
                    for (var i = 0; i < $rootScope.notifications.length; i++){
                            $rootScope.notifications[i].collapseOut = true; 
                    }
                    $rootScope.hidden_notifications = load_data.hidden_notifications;
                    $rootScope.updateNotificationBadge();
                    checkIfDone();
                    })
                .error(function(data) {
                        console.log('Error: ' , data);
                        checkIfDone();
                    });  
            }
//            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/get_organization_tags', packageForSending(''))
//                .success(function(data){
//                    if (!checkResponseErrors(data)){
//                        $rootScope.tags.organizationTags = JSON.parse(data.data).tags;
//                    }
//                });
            $rootScope.tags = localStorageService.get('tags');
            if (!$rootScope.tags){
                neededCount++;
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/message/get_tags', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        var tag_data = JSON.parse(data.data);
                        $rootScope.tags = tag_data;
                        localStorageService.set('tags', $rootScope.tags);
                    }
                    else{
                        console.log("error: " , data.error)
                    }
                    checkIfDone();
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                    checkIfDone();
                });
            }
            $rootScope.organization = localStorageService.get('organization_data');
            if ($rootScope.organization){
                try{
                    $rootScope.subscribed = true;
                    $rootScope.setColor($rootScope.organization.color);
                    $rootScope.organization = $rootScope.organization;
                    $rootScope.me = $rootScope.organization.me;
                    console.log('me', $rootScope.me);
                    $rootScope.perms = $rootScope.me.perms;

                    $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/organization/info', packageForSending(''))
                    .success(function(data){
                        $rootScope.setColor(JSON.parse(data.data).color);
                        $rootScope.organization = JSON.parse(data.data);
                        console.log('me', $rootScope.me);
                        $rootScope.me = $rootScope.organization.me;
                        $rootScope.perms = $rootScope.me.perms;
                        localStorageService.set('organization_data', $rootScope.organization);
                    });
                }
                catch(err){localStorageService.remove('organization_data'); $rootScope.refreshPage();}
            }
            else{
                neededCount++;
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/organization/info', packageForSending(''))
                .success(function(data){
                    $rootScope.subscribed = true;
                    $rootScope.setColor(JSON.parse(data.data).color);
                    $rootScope.organization = JSON.parse(data.data);
                    $rootScope.me = $rootScope.organization.me;
                    $rootScope.perms = $rootScope.me.perms;
                    localStorageService.set('organization_data', JSON.parse(data.data));
                    checkIfDone();
                })
                .error(function(data) {
                    checkIfDone();
                });
            }
            $rootScope.events = localStorageService.get('events');
            if (!$rootScope.events){
                neededCount++;
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/get_events', packageForSending(''))
                    .success(function(data){
                        if (!checkResponseErrors(data)){
                            $rootScope.events = JSON.parse(data.data);
                            localStorageService.set('events', $rootScope.events);
                        }
                        else{
                            console.log('ERROR: ',data);
                        }
                        checkIfDone();
                    })
                    .error(function(data) {
                        console.log('Error: ' , data);
                        checkIfDone();
                    });
            }
            $rootScope.polls = localStorageService.get('polls');
            if (!$rootScope.polls){
                neededCount++;
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/poll/get_polls', packageForSending(''))
                    .success(function(data){
                        if (!checkResponseErrors(data)){
                            $rootScope.polls = JSON.parse(data.data);
                            localStorageService.set('polls', $rootScope.polls);
                            checkIfDone();
                        }
                        else{
                            checkIfDone();
                            console.log('ERR');
                        }
                    })
                    .error(function(data) {
                        checkIfDone();
                        console.log('Error: ' , data);
                    });
            }
        checkIfDone();
        return deferred.promise;
        }
            LoadScreen.start();
            executePosts().then(function() {
                LoadScreen.stop();
                console.log('I just stopped the load screen');
                defer.resolve(); 
        });

    return defer.promise;
});

