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
memberdirectory/alumnidirectory
tagging members
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
 // var ENDPOINTS_DOMAIN = 'http://localhost:9001';
//var ENDPOINTS_DOMAIN = '';
var USER_NAME = 'USER_NAME';
var TOKEN = 'TOKEN';
var PERMS = 'PERMS';
var ALUMNI = 'alumni';
var MEMBER = 'member';
var LEADERSHIP = 'leadership';
var COUNCIL = 'council';
var LOGGED_IN = 'logged_in';
var PERMS_LIST =  [ALUMNI, MEMBER, LEADERSHIP, COUNCIL];

String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}

//initialize app
var App = angular.module('App', ['ui.router', 'ngAnimate', 'ngTouch', 'mgcrea.ngStrap', 'mgcrea.ngStrap.modal', 'mgcrea.ngStrap.aside', 'ui.rCalendar', 'imageupload', 'ngAutocomplete', 'aj.crop', 'googlechart', 'angulartics', 'angulartics.google.analytics', 'infinite-scroll', 'LocalStorageModule', 'colorpicker.module', 'wysiwyg.module', 'ngSanitize', 'ngMaterial'],  function ($compileProvider) {
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|sms|tel|data):/);
});

App.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
});

App.constant('USER_ROLES', {
    all: '*',
    council: 'council',
    leadership: 'leadership',
    member: 'member',
    alumni: 'alumni'
});

App.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/")
    .when("/", "/app/home")
    .when("/app", "/app/home")
    .when("/app/managemembers", "/app/managemembers/manage")
    .when("/app/managealumni", "/app/managealumni/manage")
    .when("/app/directory", "/app/directory/members")
    .when("/changepasswordfromtoken", "/changepasswordfromtoken/1");
    
      $stateProvider 
        .state('home', {
                url: '/', 
				templateUrl : 'views/home.html',
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
        .state('registerorginfo', {
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
                controller : 'appController',
        })
            .state('app.home', {
                url : '/home',
                templateUrl : 'views/apphome.html',
                controller : 'appHomeController',
            })
            .state('app.managemembers', {
                    url : '/managemembers',
                    templateUrl : 'views/managemembers.html',
                    data: {
                        permissions: {
                            only: [LEADERSHIP, COUNCIL],
                            redirectTo: 'home'
                        }
                    }
                })
                .state('app.managemembers.manage', {
                        url : '/manage',
                        templateUrl : 'views/managingmembers.html',
                        controller: 'manageMembersController',
                        data: {
                            permissions: {
                                only: [COUNCIL],
                                redirectTo: 'home'
                            }
                        }
                    })
                .state('app.managemembers.add', {
                        url : '/add',
                        templateUrl : 'views/addingmembers.html',
                        controller: 'addMembersController',
                        data: {
                            permissions: {
                                only: [COUNCIL],
                                redirectTo: 'home'
                            }
                        }
                    })
                .state('app.managemembers.tag', {
                        url : '/tag',
                        templateUrl : 'views/taggingmembers.html',
                        controller: 'membertagsController',
                        data: {
                            permissions: {
                                only: [COUNCIL, LEADERSHIP],
                                redirectTo: 'home'
                            }
                        }
                    })
            .state('app.managealumni', {
                    url : '/managealumni',
                    templateUrl : 'views/managealumni.html',
                })
                .state('app.managealumni.add' , {
                        url : '/add',
                        templateUrl : 'views/addingalumni.html',
                        controller: 'addAlumniController',
                        data: {
                            permissions: {
                                only: [COUNCIL],
                                redirectTo: 'home'
                            }
                        }
                    })
                .state('app.managealumni.manage' , {
                        url : '/manage',
                        templateUrl : 'views/managingalumni.html',
                        controller: 'managealumniController',
                        data: {
                            permissions: {
                                only: [COUNCIL],
                                redirectTo: 'home'
                            }
                        }
                    })
            .state('app.incorrectperson', {
                    url : '/incorrectperson',
                    templateUrl : 'views/incorrectperson.html',
                    controller : 'incorrectpersonController'
                })
            .state('app.accountinfo', {
                    url : '/accountinfo',
                    templateUrl : 'views/accountinfo.html',
                    controller : 'accountinfoController',
                    data: {
                        permissions: {
                            only: [LOGGED_IN],
                            redirectTo: 'home'
                        }
                    }
                })
            .state('app.uploadprofilepicture', {
                    url : '/uploadprofilepicture',
                    templateUrl : 'views/uploadprofilepicture.html',
                    controller : 'profilepictureController',
                    data: {
                        permissions: {
                            only: [LOGGED_IN],
                            redirectTo: 'home'
                        }
                    } 
                })
            .state('app.directory', {
                    url : '/directory',
                    templateUrl : 'views/directory.html',
                    data: {
                        permissions: {
                            only: [LOGGED_IN],
                            redirectTo: 'home'
                        }
                    }
                })
                .state('app.directory.members', {
                    url : '/members',
                    templateUrl : 'views/memberdirectory.html',
                    controller : 'membersDirectoryController',
                    data: {
                        permissions: {
                            only: [LOGGED_IN],
                            redirectTo: 'home'
                        }
                    }  
                })
                .state('app.directory.alumni', {
                    url : '/alumni',
                    templateUrl : 'views/alumnidirectory.html',
                    controller : 'alumniDirectoryController',
                    data: {
                        permissions: {
                            only: [LOGGED_IN],
                            redirectTo: 'home'
                        }
                    } 
                })
            .state('app.memberprofile', {
                    url : '/directory/:id',
                    templateUrl : 'views/memberprofile.html',
                    controller : 'memberprofileController',
                    data: {
                        permissions: {
                            only: [LOGGED_IN],
                            redirectTo: 'home'
                        }
                    }  
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
                    controller : 'messagingController',
                    data: {
                        permissions: {
                            only: [COUNCIL, LEADERSHIP],
                            redirectTo: 'home'
                        }
                    }
                })
            .state('app.newevent', {
                    url : '/newevent',
                    templateUrl : 'views/newevent.html',
                    controller : 'newEventController',
                    data: {
                        permissions: {
                            only: [COUNCIL],
                            redirectTo: 'home'
                        }
                    }
                })
            .state('app.events', {
                    url : '/events',
                    templateUrl : 'views/events.html',
                    controller : 'eventsController',
                    data: {
                        permissions: {
                            only: [MEMBER],
                            redirectTo: 'home'
                        }
                    }
                })
            .state('app.eventInfo', {
                    url : '/events/:tag',
                    templateUrl : 'views/eventinfo.html',
                    controller : 'eventInfoController',
                    data: {
                        permissions: {
                            only: [MEMBER],
                            redirectTo: 'home'
                        }
                    }
                })
            .state('app.editEvent',{
                    url : '/events/:tag/edit',
                    templateUrl : 'views/editevent.html',
                    controller : 'editEventsController',
                    data: {
                        permissions: {
                            only: [LEADERSHIP],
                            redirectTo: 'home'
                        }
                    }
                })
            .state('app.eventCheckin',{
                    url : '/events/:tag/checkin',
                    templateUrl : 'views/eventcheckin.html',
                    controller : 'eventCheckInController',
                    data: {
                        permissions: {
                            only: [LEADERSHIP],
                            redirectTo: 'home'
                        }
                    }
                })
            .state('app.eventCheckinReport',{
                //#TODO put this into each individual event :tag
                    url : '/events/:tag/report',
                    templateUrl : 'views/eventcheckinreport.html',
                    controller : 'eventCheckInReportController',
                    data: {
                        permissions: {
                            only: [LEADERSHIP],
                            redirectTo: 'home'
                        }
                    }
                })
            .state('app.admin',{
                //#TODO put this into each individual event :tag
                    url : '/admin',
                    templateUrl : 'views/admin.html',
                    controller : 'adminController',
                    data: {
                        permissions: {
                            only: [COUNCIL],
                            redirectTo: 'home'
                        }
                    }
                })            
            .state('app.organizationPictureUpload',{
                //#TODO put this into each individual event :tag
                    url : '/uploadorganizationimage',
                    templateUrl : 'views/uploadOrganizationImage.html',
                    controller : 'organizationPictureController',
                    data: {
                        permissions: {
                            only: [COUNCIL],
                            redirectTo: 'home'
                        }
                    }
                })
            .state('app.newPoll',{
            //#TODO put this into each individual event :tag
                url : '/newpoll',
                templateUrl : 'views/newpoll.html',
                controller : 'newPollController',
                data: {
                        permissions: {
                            only: [COUNCIL],
                            redirectTo: 'home'
                        }
                    }
                })
            .state('app.polls',{
            //#TODO put this into each individual event :tag
                url : '/polls',
                templateUrl : 'views/polls.html',
                controller : 'pollController',
                data: {
                        permissions: {
                            only: [MEMBER],
                            redirectTo: 'home'
                        }
                    }
                })
            .state('app.pollinfo',{
            //#TODO put this into each individual event :tag
                url : '/polls/:key',
                templateUrl : 'views/pollinfo.html',
                controller : 'pollInfoController',
                data: {
                        permissions: {
                            only: [MEMBER],
                            redirectTo: 'home'
                        }
                    }
                })
            .state('app.pollresults',{
        //#TODO put this into each individual event :tag
                    url : '/polls/:key/results',
                    templateUrl : 'views/pollresults.html',
                    controller : 'pollResultsController',
                    data: {
                        permissions: {
                            only: [MEMBER],
                            redirectTo: 'home'
                        }
                    }
                })
            .state('app.links', {
                    url: '/links',
                    templateUrl : 'views/links.html',
                    controller : 'LinksController',
                    data: {
                        permissions: {
                            only: [MEMBER],
                            redirectTo: 'home'
                        }
                    }
                })
    });

App.config(function($mdThemingProvider) {
    
    $mdThemingProvider.definePalette('blue', {
        '50': 'e3f2fd',
        '100': 'bbdefb',
        '200': '90caf9',
        '300': '64b5f6',
        '400': '42a5f5',
        '500': '2196f3',
        '600': '1e88e5',
        '700': '1976d2',
        '800': '1565c0',
        '900': '0d47a1',
        'A100': '82b1ff',
        'A200': '448aff',
        'A400': '2979ff',
        'A700': '2962ff',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'],
        'contrastLightColors': undefined
    });    
    $mdThemingProvider.definePalette('red', {
        '50': 'ffebee',
        '100': 'ffcdd2',
        '200': 'ef9a9a',
        '300': 'e57373',
        '400': 'ef5350',
        '500': 'f44336',
        '600': 'e53935',
        '700': 'd32f2f',
        '800': 'c62828',
        '900': 'b71c1c',
        'A100': 'ff8a80',
        'A200': 'ff5252',
        'A400': 'ff1744',
        'A700': 'd50000',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'],
        'contrastLightColors': undefined
    });    
    $mdThemingProvider.definePalette('purple', {
        '50': 'f3e5f5',
        '100': 'e1bee7',
        '200': 'ce93d8',
        '300': 'ba68c8',
        '400': 'ab47bc',
        '500': '9c27b0',
        '600': '8e24aa',
        '700': '7b1fa2',
        '800': '6a1b9a',
        '900': '4a148c',
        'A100': 'ea80fc',
        'A200': 'e040fb',
        'A400': 'd500f9',
        'A700': 'aa00ff',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'],
        'contrastLightColors': undefined
    });    
    $mdThemingProvider.definePalette('pink', {
        '50': 'fce4ec',
        '100': 'f8bbd0',
        '200': 'f48fb1',
        '300': 'f06292',
        '400': 'ec407a',
        '500': 'e91e63',
        '600': 'd81b60',
        '700': 'c2185b',
        '800': 'ad1457',
        '900': '880e4f',
        'A100': 'ff80ab',
        'A200': 'ff4081',
        'A400': 'f50057',
        'A700': 'c51162',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'],
        'contrastLightColors': undefined
    });
    $mdThemingProvider.definePalette('green', {
        '50': '4caf50',
        '100': 'e8f5e9',
        '200': 'c8e6c9',
        '300': 'a5d6a7',
        '400': '66bb6a',
        '500': '4caf50',
        '600': '43a047',
        '700': '388e3c',
        '800': '2e7d32',
        '900': '1b5e20',
        'A100': 'b9f6ca',
        'A200': '69f0ae',
        'A400': '00e676',
        'A700': '00c853',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100', 'A200', 'A400', 'A700'],
        'contrastLightColors': undefined
    });
    $mdThemingProvider.definePalette('orange', {
        '50': 'fbe9e7',
        '100': 'ffccbc',
        '200': 'ffab91',
        '300': 'ff8a65',
        '400': 'ff7043',
        '500': 'ff5722',
        '600': 'f4511e',
        '700': 'e64a19',
        '800': 'd84315',
        '900': 'bf360c',
        'A100': 'ff9e80',
        'A200': 'ff6e40',
        'A400': 'ff3d00',
        'A700': 'dd2c00',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100', 'A200'],
        'contrastLightColors': undefined
    });
    $mdThemingProvider.definePalette('brown', {
        '50': 'efebe9',
        '100': 'd7ccc8',
        '200': 'bcaaa4',
        '300': 'a1887f',
        '400': '8d6e63',
        '500': '795548',
        '600': '6d4c41',
        '700': '5d4037',
        '800': '4e342e',
        '900': '3e2723',
        'A100': 'ff9e80',
        'A200': 'ff6e40',
        'A400': 'ff3d00',
        'A700': 'dd2c00',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': ['50', '100', '200'],
        'contrastLightColors': undefined
    });
    $mdThemingProvider.definePalette('gray', {
        '50': 'fafafa',
        '100': 'f5f5f5',
        '200': 'eeeeee',
        '300': 'e0e0e0',
        '400': 'bdbdbd',
        '500': '9e9e9e',
        '600': '757575',
        '700': '616161',
        '800': '424242',
        '900': '212121',
        'A100': '82b1ff',
        'A200': '448aff',
        'A400': '2979ff',
        'A700': '2962ff',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': ['50', '100', '200','300','400','A100'],
        'contrastLightColors': undefined
    });
});

//Set up run commands for the app
    App.run(function ($rootScope, $state, $stateParams, $q, $timeout, LoadScreen, $state, $location, AuthService, Session, AUTH_EVENTS, RESTService, localStorageService, Links, Polls, Directory, Tags, Events, Organization, Inbox){
        // FastClick.attach(document.body);


        // Permission
        // .defineRole(COUNCIL, function($stateParams){
        //     if (Auth.get() === COUNCIL){
        //         return true;
        //     } else {
        //         return false;
        //     }
        // })
        // .defineRole(LEADERSHIP, function($stateParams){
        //     if (Auth.get() == COUNCIL || Auth.get() == LEADERSHIP){
        //         return true;
        //     } else {
        //         return false;
        //     }
        // })
        // .defineRole(MEMBER, function($stateParams){
        //     if (Auth.get() == COUNCIL || Auth.get() == LEADERSHIP || Auth.get() == MEMBER){
        //         return true;
        //     } else {
        //         return false;
        //     }
        // })
        // .defineRole(ALUMNI, function($stateParams){
        //     if (Auth.get() == ALUMNI || Auth.get() ==  COUNCIL || Auth.get() == LEADERSHIP || Auth.get() == MEMBER){
        //         return true;
        //     } else {
        //         return false;
        //     }
        // });

        $rootScope.$on('$stateChangeStart', function (event, next) {
            if (!next.data){console.log("I am going somewhere with no data", next); return;}
            if (!AuthService.loginAttempted()){console.log("I am ignoring the fact I cant be here", next); return;}
            else{
                var authorizedRoles = next.data.permissions.only;
                if (!AuthService.isAuthorized(authorizedRoles)) {
                    console.log('I am rejecting you.');
                  event.preventDefault();
                  if (AuthService.isAuthenticated()){
                    // user is not allowed
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                  } else {
                    // user is not logged in
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                  }
                }
            }
        });

        $rootScope.$on(AUTH_EVENTS.notAuthenticated, function(){
            if (AuthService.loginAttempted()){
                Session.destroy();
                console.log('location state', $location.path());
                if ($location.path() != '/login'){
                    $location.path('login');
                }
                $location.path('login');
            }
        });

        $rootScope.$on(AUTH_EVENTS.logoutSuccess, function(){
            console.log('Im logging out');
            AuthService.destroy();
            Session.destroy();
            Inbox.destroy();
            Directory.destroy();
            Events.destroy();
            Tags.destroy();
            Polls.destroy();
            Links.destroy();
            localStorageService.clearAll();
            $.removeCookie('FORM_INFO_EMPTY');
            $rootScope.directory = {};
            $rootScope.me = undefined;
            $rootScope.polls = undefined;
            $rootScope.perms = undefined;
            $rootScope.events = undefined;
            $rootScope.notifications = undefined;
            $rootScope.hidden_notifications = undefined;
            $rootScope.updateNotificationBadge();
            console.log($state);
            if ($state.current.name != 'login' && $state.current.name != 'register' && $state.current.name != 'registerorg'){
                $location.path('login');
            }
        });

        $rootScope.$on(AUTH_EVENTS.loginSuccess, function(){
            if ($state.data){
                var authorizedRoles = $state.data.permissions.only;
                if (!AuthService.isAuthorized(authorizedRoles)) {
                    if(Session.perms == 'alumni'){
                        $location.path('directory');
                    }
                    else{
                        $location.path('home');
                    }   
                }
            }
        });

        $rootScope.checkPermissions = function(perms){
            if (!AuthService.isAuthenticated()){
                return false;
            }
            else{
                if (PERMS_LIST.indexOf(perms) > PERMS_LIST.indexOf(Session.perms)){
                    return false;
                }
                    return true;
            }
        }
        $rootScope.$state = $state;
        // $rootScope.color = 'color1';
        // $rootScope.perms = 'alumni';
        // $('body').addClass('dark');
        // $('body').removeClass('light');
        // $rootScope.$stateParams = $stateParams;
        // $rootScope.directory = {};
        // $rootScope.users = $rootScope.directory;
        // $rootScope.notification_count = "0";
        // $rootScope.tags = {};
        // $rootScope.updatingNotifications = false;
        // $rootScope.allTags = [];
        $rootScope.defaultProfilePicture = 'images/defaultprofile.png';
        // $rootScope.hasLoaded = false;
        $rootScope.setColor = function(color){
            $mdThemingProvider.theme('default').primaryColor(color);
        }
        $rootScope.routeChange = function(){
            $('.modal-backdrop').remove();
            $('.bootstrap-datetimepicker-widget').hide()
            window.scrollTo(0, 0);
        }
//         $rootScope.updateNotifications = function(){
//             $('.fa-refresh').addClass('fa-spin');
//             RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/get', '')
//             .success(function(data){
//             if ($rootScope.notification_lengths.unread + $rootScope.notification_lengths.read + $rootScope.notification_lengths.hidden != (JSON.parse(data.data).new_notifications_length + JSON.parse(data.data).hidden_notifications_length + JSON.parse(data.data).notifications_length)){    
                
//                 $timeout(function(){
//                     for (var i = 0; i < $rootScope.notifications.length; i++){
//                         $rootScope.notifications[i].collapseOut = false;
//                     }
//                 })
//                 $timeout(function(){
//                     $rootScope.notifications = JSON.parse(data.data).notifications;
//                     $rootScope.notification_lengths = {unread:JSON.parse(data.data).new_notifications_length, read:JSON.parse(data.data).notifications_length, hidden: JSON.parse(data.data).hidden_notifications_length};
// //                    $rootScope.notifications_length = JSON.parse(data.data).notifications_length;
// //                    $rootScope.new_notifications_length = JSON.parse(data.data).new_notifications_length;
// //                    $rootScope.hidden_notifications_length = JSON.parse(data.data).hidden_notifications_length;
//                     for (var i = 0; i < $rootScope.notifications.length; i++){
//                         $rootScope.notifications[i].collapseOut = true; 
// //                        $rootScope.notifications[i].content = $rootScope.notifications[i].content.replace(RegExp("(\\w{" + 5 + "})(\\w)", "g"),  
// //                            function(all,text,char){
// //                                return text + "&shy;" + char;
// //                            });

//                     }
//                 })
//                 $timeout(function(){
//                     $rootScope.updateNotificationBadge();
//                 })
//             }
//                 $timeout(function(){
//                     $('.fa-refresh').removeClass('fa-spin')
//                 });
//             })
                
//             .error(function(data) {
//                 console.log('Error: ' , data);
//             });
//         }
        
        $rootScope.refreshPage = function(){
            window.location.reload();
        }
        
        $rootScope.requirePermissions = function(perms){
            // if ($rootScope.perms){
            //     if (!$rootScope.checkPermissions(perms)){
            //         if ($rootScope.checkAlumni()){
            //             window.location.assign('#/app/directory/members');
            //         }
            //         else{
            //             window.location.assign("/#/app/home");
            //         }
            //     } 
            // }
            // else{
            //     window.location.assign('/#/login');
            // }
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
        $rootScope.showNav = true;
    });

//More Functions

function routeChange(){
    $('.modal-backdrop').remove();
    $('.bootstrap-datetimepicker-widget').hide();
    window.scrollTo(0, 0);
}

//checks to see if user is logged in or not
function checkLogin(){
    // if($.cookie(USER_NAME) != undefined){
    //     return true;
    // }
    // else
    //     return false;
    return true;
}

 function requireLeadership(){
//     if (!checkPermissions('leadership')){
//         if ($rootScope.checkAlumni()){
//             window.location.assign('#/app/directory/members');
//         }
//         else{
//             window.location.assign("/#/app");
//         }
//     }
}

function requireCouncil(){
    // if (!checkPermissions('council')){
    //     if ($rootScope.checkAlumni()){
    //         window.location.assign('#/app/directory/members');
    //     }
    //     else{
    //         window.location.assign("/#/app");
    //     }
    // }
}

function requireMember(){
    // if (!checkPermissions('member')){
    //     if ($rootScope.checkAlumni()){
    //         window.location.assign('#/app/directory/members');
    //     }
    //     else{
    //         window.location.assign("/#/app");
    //     }
    // }
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
        if(response.error == '')
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

function checkCacheRefresh(timestamp){
    if (!timestamp){
        return true;
    }
    else if (timestamp.add(15, 'minutes').diff(moment()) < 0){
        return true;
    }
    return false;
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
    return moment(date).add(moment().tz(jstz.determine().name()).format('ZZ')/100, 'hours');
}

function momentUTCTime(date){
    return moment(date).subtract( moment().tz(jstz.determine().name()).format('ZZ')/100, 'hours'); 
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



App.directive('onFinishRender', function ($timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      if (scope.$last === true) {
          console.log('I found the last element');
          scope.$evalAsync(attr.onFinishRender);
      }
    }
  }
});


// App.directive('targetBlank', function() {
//     return {
//         restrict: 'A',
//         link: function(scope, element, attrs) {
//             scope.$watch(attrs.targetBlank, function(){
//                 element.find('a').attr('target', '_blank');
//             });
//         }
//     };
// });

App.directive('userNameInput', function(){
        return {
            require: 'ngModel',
            restrict: 'A',
            scope: {
                ngModel: '='
            },
            controller: function(scope, elem, attrs, ctrl) {
                scope.$watch('ngModel', function() {
                    if (scope.ngModel){
                        var value = true;
//                        console.log(scope.ngModel);
                        for (var i = 0; i < scope.ngModel.length; i++){
                            if ("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._".indexOf(scope.ngModel[i]) == -1){
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
            templateUrl:'views/templates/searchdirective.html',
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
        templateUrl: 'views/templates/alumniDirectoryPicker.html',
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
            templateUrl: 'views/templates/olderYoungerTemplate.html',
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

App.directive('loadDirective', function(){
  return {
    scope: {
        ngModel : '='
    },
    restrict: 'EA',
    replace: 'true',
    transclude: 'true',
    templateUrl: 'views/templates/loadingTemplate.html',
  }
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
                        +'<input type="text" class="form-control picker" id="'+this_id+'time" name="'+this_name+'time" ng-model="ngModel"/>'
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
                        +'<input type="text" class="form-control picker" id="'+this_id+'date" name="'+this_name+'" ng-model="ngModel"/>'
                        +'<span class="input-group-addon"><i class="fa fa-calendar"></i></span></div>'
                        +'<script type="text/javascript">'
                        +'$("#'+this_id+'date").datetimepicker({'
                            +'pickTime: false,'
                            +'icons: {time: "fa fa-clock-o", date: "fa fa-calendar", up: "fa fa-arrow-up", down: "fa fa-arrow-down"'
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

           
            
App.directive('selectingUsers', function($rootScope, Directory, Tags){
    return {
    restrict: 'E',
    replace: 'true',
    templateUrl: 'views/templates/selectingmembers.html',
    scope:{
        tags:"=",
        localTags:"=?",
        includeUsers:"=?",
        clearUsers:"=?",
    },
    transclude: true,
    link: function (scope, element, attrs) {
        scope.usersList = [];
        Directory.get();
        if (!scope.localTags){
            console.log('im getting local tags');
            Tags.get();
            scope.tags = Tags.tags;
            scope.$on('tags:updated', function(){
                scope.tags = Tags.tags;
                update();
            });
        }
        scope.directory = Directory.directory;
        scope.$on('directory:updated', function(){
            scope.directory = Directory.directory;
            update();
        });
        
        update();
        scope.selectTagFromTypeAhead = function(tag){
            tag.checked = true;
            scope.selectedTagName="";
        }
        function update(){
            if (scope.tags && scope.tags.org_tags && scope.includeUsers && scope.directory){
                scope.usersList = [];
                console.log('scope.directory', scope.directory);
                for (var i = 0; i < scope.directory.members.length; i++){
                    scope.usersList.push({user: scope.directory.members[i], checked:false, name:scope.directory.members[i].first_name + ' ' + scope.directory.members[i].last_name });
                }
                scope.allTagsList = scope.tags.org_tags.concat(scope.tags.perms_tags.concat(scope.usersList));
            }
            else if (scope.tags && scope.tags.org_tags){
                scope.allTagsList = scope.tags.org_tags.concat(scope.tags.perms_tags);
            }
        }
        // scope.$watch('ngModel', function(){
        //     if (scope.ngModel && scope.ngModel.org_tags && scope.includeUsers && scope.directory){
        //         scope.usersList = [];
        //         console.log('scope.directory', scope.directory);
        //         for (var i = 0; i < scope.directory.members.length; i++){
        //             scope.usersList.push({user: scope.directory.members[i], checked:false, name:scope.directory.members[i].first_name + ' ' + scope.directory.members[i].last_name });
        //         }
        //         scope.allTagsList = scope.ngModel.org_tags.concat(scope.ngModel.perms_tags.concat(scope.usersList));
        //     }
        //     else if (scope.ngModel && scope.ngModel.org_tags){
        //         scope.allTagsList = scope.ngModel.org_tags.concat(scope.ngModel.perms_tags);
        //     }
        // });
        scope.$watch('clearUsers', function(){
            if (scope.clearUsers == true){
                scope.clearUsers = false;
                for (var i = 0; i < scope.usersList.length; i++){
                    if (scope.usersList[i].checked){
                        scope.usersList[i].checked = false;
                    }
                }
            }
        });
     }
  }
});

App.directive('neteTag', function($compile){
    return{
        restrict: 'E',
        templateUrl: 'views/templates/tags/nete-tag.html',
        link: function(scope, element, attrs){
            $compile(element.contents())(scope)
        }
    }
});

App.directive('netetagCheck', function($compile){
    return{
        restrict: 'E',
        templateUrl: 'views/templates/tags/nete-tag-check.html',
        link: function(scope, element, attrs){
            $compile(element.contents())(scope)
        }
    }
});

App.directive('netetagDelete', function($compile){
    return{
        restrict: 'E',
        templateUrl: 'views/templates/tags/nete-tag-delete.html',
        link: function(scope, element, attrs){
            $compile(element.contents())(scope)
        }
    }
});
            
App.directive('netememberCheck', function($compile){
    return{
        restrict: 'E',
        scope:{ngModel:"="},
        templateUrl: 'views/templates/tags/nete-member-check.html',
        link: function(scope, element, attrs){
//            $compile(element.contents())(scope)
        }
    }
});

App.directive('neteMember', function($compile){
    return{
        restrict: 'E',
        scope:{ngModel:"="},
        templateUrl: 'views/templates/tags/nete-member.html',
        // link: function(scope, element, attrs){
//            $compile(element.contents())(scope)
        // }
    }
});

App.directive('netetagAll', function($compile){
    return{
        restrict: 'E',
        templateUrl: 'views/templates/tags/nete-tag-all.html',
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
        templateUrl: 'views/templates/update-status.html',
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

App.filter('htmlToPlaintext', function() {
    return function(text) {
      return String(text).replace(/<[^>]+>/gm, ' ').replace(/&nbsp;/gi,'');
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

App.filter('linkGroup', function(){ 
    return function (objects, group) {
        if (!group || !objects){
            return objects;
        }
        retList = [];
        if (objects){
            for (var oPos = 0; oPos < objects.length; oPos++){
                //console.log(objects[oPos]);
                if(objects[oPos].group == group){
                    retList.push(objects[oPos]);
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

App.factory('getEvents', function($http, $rootScope, RESTService){
    RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/get_events', '')
        .success(function(data){
            if (!RESTService.hasErrors(data)){
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
            $('body').show();
            routeChange();
            console.log('stopping load screen');
        },
        check: function(){
            $rootScope.loading;
        }
    };
});

// App.factory( 'Login', function($http, $q, $rootScope){
//     var logged_in = false;
//     return{
//         check: function(){
//             var defer = $q.defer();
//             $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/check_login', packageForSending(''))
//                 .success(function(data){
//                     if (!RESTService.hasErrors(data)){logged_in = true;} 
//                         defer.resolve();
//                         console.log("returned login result: ", data);
//                  })
//                 .error(function(data){
//                     defer.resolve();
//                 });
//             return defer.promise;
//         },
//         set: function(val){
//             logged_in = val;
//         },
//         get: function(){
//             return logged_in;
//         }
//     }
// });



App.factory( 'Load', function LoadRequests($http, $q){
    //console.log('Starting the load factory');
    var defer = $q.defer();
    defer.resolve();
        // if (!checkLogin()){
        //     window.location.replace('#/login');
        //     defer.resolve();
        // }
    // var organization = Organization.get();
    // var notifications = Notifications.get();
    // if (organization){
    //     defer.resolve();
    // }
    // else{
    //     $rootScope.$on('organization:updated', function(){
    //         defer.resolve();
    //     });
    // }
    // function executePosts() {
    //       var deferred = $q.defer();
    //         var neededCount = 0;
    //       function checkIfDone() {
    //           console.log('neededCount', neededCount);
    //           if (neededCount <= 0){
    //             console.log('Im done loading');
    //             deferred.resolve();
    //           }
    //           else{
    //           neededCount --;}
    //       }

    //     console.log('user_name', $.cookie(USER_NAME));
    //     if ($.cookie(USER_NAME) != localStorageService.get('user_name')){
    //         localStorage.clear();
    //         localStorageService.set('user_name', $.cookie(USER_NAME));
    //     }






        // $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/check_login', packageForSending(''))
        //     .success(function(data){
        //         console.log('----------THIS-LOGIN-WORKS----------');
        //         if (RESTService.hasErrors(data)){window.location.replace('/#/login'); deferred.resolve(); defer.resolve(); $rootScope.hasLoaded = true;};
        //     });
            
//        if ($cacheFactory.info()){
//            $rootScope.directory = JSON.parse($cacheFactory.get('directory'));
//            return deferred.promise;
//        }
//            $rootScope.directory = localStorageService.get('directory');
//            checkIfDone();
//        $http.get(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/info/load2/'+$.cookie(USER_NAME)+'/'+$.cookie(TOKEN))
//            .success(function(data){
//                if(!RESTService.hasErrors(data)){
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
//             $rootScope.directory = localStorageService.get('directory');
//             if ($rootScope.directory){
//                 $rootScope.perms = 'alumni';
//                 for (var i = 0; i < $rootScope.directory.members.length; i++){
//                     if ($rootScope.directory.members[i].user_name == $.cookie(USER_NAME)){
//                         $rootScope.me = $rootScope.directory.members[i];
//                         $rootScope.perms = $rootScope.me.perms;
//                         break;
//                     }
//                 }
//             }
//             else{
//                 neededCount++;
//                 $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory', packageForSending(''))
//                 .success(function(data){
//                     if (!RESTService.hasErrors(data)){
//                         $rootScope.directory = JSON.parse(data.data);
//                         localStorageService.set('directory', $rootScope.directory);
//                     }
//                     checkIfDone();
//                 })
//                 .error(function(data) {
//                     console.log('Error: ' , data);
//                     checkIfDone();
//                 });
//             }
//             var load_data = localStorageService.get('notifications');
//             if (load_data){
//                 try{
//                     $rootScope.notifications = load_data.notifications;
//                     $rootScope.notification_lengths = {unread:load_data.new_notifications_length, read:load_data.notifications_length, hidden:load_data.hidden_notifications_length};
//                     for (var i = 0; i < $rootScope.notifications.length; i++){
//                             $rootScope.notifications[i].collapseOut = true; 
//                     }
//                     $rootScope.hidden_notifications = load_data.hidden_notifications;
//                     $rootScope.updateNotificationBadge();
//                     $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/get', packageForSending(''))
//                     .success(function(data){
//                         var load_data = JSON.parse(data.data);
//                         localStorageService.set('notifications', load_data);
//                         $rootScope.notifications = load_data.notifications;
//                         $rootScope.notification_lengths = {unread:load_data.new_notifications_length, read:load_data.notifications_length, hidden:load_data.hidden_notifications_length};
//                         for (var i = 0; i < $rootScope.notifications.length; i++){
//                                 $rootScope.notifications[i].collapseOut = true; 
//                         }
//                         $rootScope.hidden_notifications = load_data.hidden_notifications;
//                         $rootScope.updateNotificationBadge();
//                         })
//                     .error(function(data) {
//                             console.log('Error: ' , data);
//                         });
//                 }
//                 catch(err){localStorageService.remove('notifications'); $rootScope.refreshPage();}
//             }
//             else {
//                 neededCount++;
//                 $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/get', packageForSending(''))
//                 .success(function(data){
//                     var load_data = JSON.parse(data.data);
//                     localStorageService.set('notifications', load_data);
//                     $rootScope.notifications = load_data.notifications;
//                     $rootScope.notification_lengths = {unread:load_data.new_notifications_length, read:load_data.notifications_length, hidden:load_data.hidden_notifications_length};
//                     for (var i = 0; i < $rootScope.notifications.length; i++){
//                             $rootScope.notifications[i].collapseOut = true; 
//                     }
//                     $rootScope.hidden_notifications = load_data.hidden_notifications;
//                     $rootScope.updateNotificationBadge();
//                     checkIfDone();
//                     })
//                 .error(function(data) {
//                         console.log('Error: ' , data);
//                         checkIfDone();
//                     });  
//             }
// //            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/get_organization_tags', packageForSending(''))
// //                .success(function(data){
// //                    if (!RESTService.hasErrors(data)){
// //                        $rootScope.tags.organizationTags = JSON.parse(data.data).tags;
// //                    }
// //                });
//             $rootScope.tags = localStorageService.get('tags');
//             if (!$rootScope.tags){
//                 neededCount++;
//                 $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/message/get_tags', packageForSending(''))
//                 .success(function(data){
//                     if (!RESTService.hasErrors(data)){
//                         var tag_data = JSON.parse(data.data);
//                         $rootScope.tags = tag_data;
//                         localStorageService.set('tags', $rootScope.tags);
//                     }
//                     else{
//                         console.log("error: " , data.error)
//                     }
//                     checkIfDone();
//                 })
//                 .error(function(data) {
//                     console.log('Error: ' , data);
//                     checkIfDone();
//                 });
//             }
            // $rootScope.organization = localStorageService.get('organization_data');
            // if ($rootScope.organization){
            //     try{
            //         $rootScope.subscribed = true;
            //         $rootScope.link_groups = $rootScope.organization.link_groups;
            //         $rootScope.setColor($rootScope.organization.color);
            //         $rootScope.organization = $rootScope.organization;
            //         $rootScope.link_groups = $rootScope.organization.link_groups;
            //         $rootScope.me = $rootScope.organization.me;
            //         console.log('me', $rootScope.me);
            //         $rootScope.perms = $rootScope.me.perms;

            //         $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/organization/info', packageForSending(''))
            //         .success(function(data){
            //             $rootScope.setColor(JSON.parse(data.data).color);
            //             $rootScope.organization = JSON.parse(data.data);
            //             console.log('me', $rootScope.me);
            //             $rootScope.me = $rootScope.organization.me;
            //             $rootScope.link_groups = $rootScope.organization.link_groups;
            //             $rootScope.perms = $rootScope.me.perms;
            //             localStorageService.set('organization_data', $rootScope.organization);
            //         });
            //     }
            //     catch(err){localStorageService.remove('organization_data'); $rootScope.refreshPage();}
            // }
            // else{
            //     neededCount++;
            //     $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/organization/info', packageForSending(''))
            //     .success(function(data){
            //         $rootScope.subscribed = true;
            //         $rootScope.setColor(JSON.parse(data.data).color);
            //         $rootScope.organization = JSON.parse(data.data);
            //         $rootScope.me = $rootScope.organization.me;
            //         $rootScope.link_groups = $rootScope.organization.link_groups;
            //         $rootScope.perms = $rootScope.me.perms;
            //         localStorageService.set('organization_data', JSON.parse(data.data));
            //         checkIfDone();
            //     })
            //     .error(function(data) {
            //         checkIfDone();
            //     });
            // }
        //     $rootScope.events = localStorageService.get('events');
        //     if (!$rootScope.events){
        //         neededCount++;
        //         $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/get_events', packageForSending(''))
        //             .success(function(data){
        //                 if (!RESTService.hasErrors(data)){
        //                     $rootScope.events = JSON.parse(data.data);
        //                     localStorageService.set('events', $rootScope.events);
        //                 }
        //                 else{
        //                     console.log('ERROR: ',data);
        //                 }
        //                 checkIfDone();
        //             })
        //             .error(function(data) {
        //                 console.log('Error: ' , data);
        //                 checkIfDone();
        //             });
        //     }
        //     $rootScope.polls = localStorageService.get('polls');
        //     if (!$rootScope.polls){
        //         neededCount++;
        //         $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/poll/get_polls', packageForSending(''))
        //             .success(function(data){
        //                 if (!RESTService.hasErrors(data)){
        //                     $rootScope.polls = JSON.parse(data.data);
        //                     localStorageService.set('polls', $rootScope.polls);
        //                     checkIfDone();
        //                 }
        //                 else{
        //                     checkIfDone();
        //                     console.log('ERR');
        //                 }
        //             })
        //             .error(function(data) {
        //                 checkIfDone();
        //                 console.log('Error: ' , data);
        //             });
        //     }
        //     $rootScope.links = localStorageService.get('links');
        //     if (!$rootScope.links){
        //         neededCount++;
        //         $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/link/get', packageForSending(''))
        //         .success(function(data){
        //             if (!RESTService.hasErrors(data)){
        //                 $rootScope.links = JSON.parse(data.data);
        //                 localStorageService.set('links', $rootScope.links);
        //             }
        //             checkIfDone();
        //         })
        //         .error(function(data) {
        //             console.log('Error: ' , data);
        //             checkIfDone();
        //         });
        //     }
        // checkIfDone();
        //return deferred.promise;
        //}
        //     executePosts().then(function() {
        //         defer.resolve(); 
        // });

    return defer.promise;
});

