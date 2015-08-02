//Final/static variables. These variables are used for cookies
// var ENDPOINTS_DOMAIN = 'https://greek-app.appspot.com';
var ENDPOINTS_DOMAIN = 'http://localhost:9001';
var USER_NAME = 'USER_NAME';
var TOKEN = 'TOKEN';
var PERMS = 'PERMS';
var ALUMNI = 'alumni';
var MEMBER = 'member';
var LEADERSHIP = 'leadership';
var COUNCIL = 'council';
var LOGGED_IN = 'logged_in';
var PERMS_LIST = [ALUMNI, MEMBER, LEADERSHIP, COUNCIL];
var i;

String.prototype.replaceAll = function(str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof(str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
};

//initialize app
var App = angular.module('App', ['ui.router', 'ngAnimate', 'ngTouch', 'mgcrea.ngStrap', 'mgcrea.ngStrap.modal', 'mgcrea.ngStrap.aside', 'ui.rCalendar', 'imageupload', 'ngAutocomplete', 'aj.crop', 'googlechart', 'angulartics', 'angulartics.google.analytics', 'infinite-scroll', 'LocalStorageModule', 'colorpicker.module', 'wysiwyg.module', 'ngSanitize', 'ngMaterial'], function($compileProvider) {
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
        .when("/app/chatter", "/app/home")
        .when("/app/managemembers", "/app/managemembers/manage")
        .when("/app/managealumni", "/app/managealumni/manage")
        .when("/app/directory", "/app/directory/members")
        .when("/changepasswordfromtoken", "/changepasswordfromtoken/1");

    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'views/home.html',
        })
        .state('login', {
            url: '/login',
            templateUrl: 'views/login.html',
            controller: 'loginController'
        })
        .state('register', {
            url: '/register',
            templateUrl: 'views/register.html',
            controller: 'registerController'
        })
        .state('registerorg', {
            url: '/registerorganization',
            templateUrl: 'views/registerorganization.html',
            controller: 'registerController'
        })
        .state('registeruser', {
            url: '/registeruser',
            templateUrl: 'views/registeruser.html',
            controller: 'registerUserController'
        })
        .state('registerorginfo', {
            url: '/registerorganizationinfo',
            templateUrl: 'views/registerinfo.html',
            controller: 'registerinfoController'
        })
        .state('payment', {
            url: '/payment',
            templateUrl: 'views/payment.html',
            controller: 'paymentController'
        })
        .state('newmember', {
            url: '/newuser/:key',
            templateUrl: 'views/newmemberinfo.html',
            controller: 'newmemberinfoController'
        })
        .state('forgotpassword', {
            url: '/forgotpassword',
            templateUrl: 'views/forgot_password.html',
            controller: 'forgotPasswordController'
        })
        .state('changepasswordfromtoken', {
            url: '/changepasswordfromtoken/:token',
            templateUrl: 'views/change_password_from_token.html',
            controller: 'changePasswordFromTokenController'
        })
        .state('app', {
            url: '/app',
            templateUrl: 'views/app.html',
            controller: 'appController',
        })

            .state('app.home', {
                url : '/home',
                templateUrl : 'views/chatter.html',
                controller : 'chatterController',
            })
            .state('app.hometoken', {
                url : '/home/:token',
                templateUrl : 'views/chatter.html',
                controller : 'chatterController',
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
                    controller : 'profilePictureController',
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
        .state('app.newPoll', {
            //#TODO put this into each individual event :tag
            url: '/newpoll',
            templateUrl: 'views/newpoll.html',
            controller: 'newPollController',
            data: {
                permissions: {
                    only: [COUNCIL],
                    redirectTo: 'home'
                }
            }
        })
        .state('app.polls', {
            //#TODO put this into each individual event :tag
            url: '/polls',
            templateUrl: 'views/polls.html',
            controller: 'pollController',
            data: {
                permissions: {
                    only: [MEMBER],
                    redirectTo: 'home'
                }
            }
        })
        .state('app.pollinfo', {
            //#TODO put this into each individual event :tag
            url: '/polls/:key',
            templateUrl: 'views/pollinfo.html',
            controller: 'pollInfoController',
            data: {
                permissions: {
                    only: [MEMBER],
                    redirectTo: 'home'
                }
            }
        })
        .state('app.pollresults', {
            //#TODO put this into each individual event :tag
            url: '/polls/:key/results',
            templateUrl: 'views/pollresults.html',
            controller: 'pollResultsController',
            data: {
                permissions: {
                    only: [MEMBER],
                    redirectTo: 'home'
                }
            }
        })
        .state('app.links', {
            url: '/links',
            templateUrl: 'views/links.html',
            controller: 'LinksController',
            data: {
                permissions: {
                    only: [MEMBER],
                    redirectTo: 'home'
                }
            }
        });
});

App.config(function($mdThemingProvider) {

    $mdThemingProvider.definePalette('cyan', {
        '50': 'e0f7fa',
        '100': 'b2ebf2',
        '200': '80deea',
        '300': '4dd0e1',
        '400': '26c6da',
        '500': '00bcd4',
        '600': '00acc1',
        '700': '0097a7',
        '800': '00838f',
        '900': '006064',
        'A100': '84ffff',
        'A200': '18ffff',
        'A400': '00e5ff',
        'A700': '00b8d4',
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
        'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'],
        'contrastLightColors': undefined
    });
    $mdThemingProvider.theme('default').primaryPalette('cyan');
    $mdThemingProvider.theme('cyan').primaryPalette('cyan');
    $mdThemingProvider.theme('red').primaryPalette('red');
    $mdThemingProvider.theme('purple').primaryPalette('purple');
    $mdThemingProvider.theme('pink').primaryPalette('pink');
    $mdThemingProvider.theme('orange').primaryPalette('orange');
    $mdThemingProvider.theme('green').primaryPalette('green');
    $mdThemingProvider.theme('brown').primaryPalette('brown');
    $mdThemingProvider.theme('gray').primaryPalette('gray');

});

//Set up run commands for the app
App.run(function($rootScope, $state, $stateParams, $q, $timeout, $state, $location, AuthService, Session, AUTH_EVENTS, RESTService, localStorageService, Links, Polls, Directory, Tags, Events, Organization, Chatter) {


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
    $rootScope.$on('$stateChangeStart', function(event, next) {
        if (!next.data) {
            console.log("I am going somewhere with no data", next);
            return;
        }
        if (!AuthService.loginAttempted()) {
            console.log("I am ignoring the fact I cant be here", next);
            return;
        } else {
            var authorizedRoles = next.data.permissions.only;
            if (!AuthService.isAuthorized(authorizedRoles)) {
                console.log('I am rejecting you.');
                event.preventDefault();
                if (AuthService.isAuthenticated()) {
                    // user is not allowed
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                } else {
                    // user is not logged in
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                }
            }
        }
    });

    $rootScope.$on('$locationChangeStart', function(event) {
        $('.modal-backdrop').remove();
        $('.bootstrap-datetimepicker-widget').hide();
        window.scrollTo(0, 0);
    });

    $rootScope.$on(AUTH_EVENTS.notAuthenticated, function() {
        if (AuthService.loginAttempted()) {
            Session.destroy();
            console.log('location state', $location.path());
            if ($location.path() != '/login') {
                $location.path('login');
            }
            $location.path('login');
        }
    });
    $rootScope.$on(AUTH_EVENTS.logoutSuccess, function() {
        console.log('Im logging out');
        AuthService.destroy();
        Session.destroy();
        Directory.destroy();
        Events.destroy();
        Tags.destroy();
        Polls.destroy();
        Links.destroy();
        Organization.destroy();
        Chatter.destroy();
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
        if ($state.current.name != 'login' && $state.current.name != 'register' && $state.current.name != 'registerorg' && $state.current.name != 'newmember') {
            $location.path('login');
        }
    });

    var iosConfig = {
        "badge": true,
        "sound": true,
        "alert": true,
    };

    $rootScope.$on(AUTH_EVENTS.loginSuccess, function() {
        //  document.addEventListener("deviceready", function(){
        //     $cordovaPush.register(iosConfig).then(function(result) {
        //       console.log("result: " + result);
        //       RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/auth/v1/set_iphone_token',result.deviceToken)
        //     }, function(err) {
        //         console.log('something went wrong', err);
        // });
        // });

        if ($state.data) {
            var authorizedRoles = $state.data.permissions.only;
            if (!AuthService.isAuthorized(authorizedRoles)) {
                if (Session.perms == 'alumni') {
                    $location.path('directory');
                } else {
                    $location.path('home');
                }
            }
        }
    });

    $rootScope.$watch('color', function() {
        $('body').attr('md-theme', $rootScope.color);
        $('body').attr('class', 'theme-' + $rootScope.color);
    });
    $rootScope.changeTheme = function(color) {
        $rootScope.color = color;

        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/auth/v1/set_colors', {
            color: $rootScope.color
        })
            .success(function(data) {
                if (!RESTService.hasErrors(data)) {} else {
                    $scope.error = true;
                }
            })
            .error(function(data) {
                console.log('Error: ' + JSON.stringify(data));
            });

    };
    $rootScope.checkPermissions = function(perms) {
        if (!AuthService.isAuthenticated()) {
            return false;
        } else {
            if (PERMS_LIST.indexOf(perms) > PERMS_LIST.indexOf(Session.perms)) {
                return false;
            }
            return true;
        }
    };
        console.log('changing color');
        if (Organization.organization) {
            if (Organization.organization.color) {
                $rootScope.color = Organization.organization.color;
            } else {
                $rootScope.color = 'cyan';
            }
        } else {
            $rootScope.color = 'cyan';
        }

    $rootScope.$state = $state;
    $rootScope.defaultProfilePicture = 'images/defaultprofile.png';
    $rootScope.setColor = function(color) {
        $mdThemingProvider.theme('default').primaryPalette(color);
    };
    $rootScope.routeChange = function() {
        $('.modal-backdrop').remove();
        $('.bootstrap-datetimepicker-widget').hide();
        window.scrollTo(0, 0);
    };
 

    $rootScope.refreshPage = function() {
        window.location.reload();
    };
    $rootScope.doNothing = function() {
        return false;
    };
    $rootScope.requirePermissions = function(perms) {
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
    };

    $rootScope.checkAlumni = function() {
        if ($rootScope.perms == ALUMNI) {
            return true;
        }
        return false;
    };

    $rootScope.checkLogin = function() {
        return checkLogin();
    };

    $rootScope.logout = function() {};

    $rootScope.updateNotificationBadge = function() {
        var count = 0;
        if ($rootScope.notifications) {
            for (i = 0; i < $rootScope.notifications.length; i++) {
                if ($rootScope.notifications[i].new) {
                    count++;
                }
            }
            $rootScope.notification_count = count;
        }
    };

    $rootScope.getNameFromKey = function(key) {
        if ($rootScope.directory.members) {
            for (i = 0; i < $rootScope.directory.members.length; i++) {
                if ($rootScope.directory.members[i].key == key) {
                    return $rootScope.directory.members[i].first_name + ' ' + $rootScope.directory.members[i].last_name;
                }
            }
        }
        return 'Unknown';
    };
    $rootScope.getUserFromKey = function(key) {
        if ($rootScope.directory.members) {
            for (i = 0; i < $rootScope.directory.members.length; i++) {
                if ($rootScope.directory.members[i].key == key) {
                    return $rootScope.directory.members[i];
                }
            }
        }
        return undefined;
    };
    $rootScope.showNav = true;
});

//More Functions

function routeChange() {
    $('.modal-backdrop').remove();
    $('.bootstrap-datetimepicker-widget').hide();
    window.scrollTo(0, 0);
}

//checks to see if user is logged in or not
function checkLogin() {
    // if($.cookie(USER_NAME) != undefined){
    //     return true;
    // }
    // else
    //     return false;
    return true;
}

function requireLeadership() {
    //     if (!checkPermissions('leadership')){
    //         if ($rootScope.checkAlumni()){
    //             window.location.assign('#/app/directory/members');
    //         }
    //         else{
    //             window.location.assign("/#/app");
    //         }
    //     }
}

function requireCouncil() {
    // if (!checkPermissions('council')){
    //     if ($rootScope.checkAlumni()){
    //         window.location.assign('#/app/directory/members');
    //     }
    //     else{
    //         window.location.assign("/#/app");
    //     }
    // }
}

function requireMember() {
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

function logoutCookies() {
    $.removeCookie(USER_NAME);
    $.removeCookie(TOKEN);
    //    $.removeCookie(PERMS);
    $.removeCookie('FORM_INFO_EMPTY');
}

//use packageForSending(send_data) when $http.post in order to attach data to user
function packageForSending(send_data) {
    var output = {
        user_name: $.cookie(USER_NAME),
        token: $.cookie(TOKEN),
        data: JSON.stringify(send_data)
    };
    //    console.log(output);
    return output;
}

function checkResponseErrors(received_data) {
    response = received_data;
    if (response) {
        if (response.error === '') {
            return false;
        } else {
            console.log('ERROR: ', response.error);
            return true;
        }
    }
}

function checkCacheRefresh(timestamp) {
    if (!timestamp) {
        return true;
    } else if (timestamp.add(15, 'minutes').diff(moment()) < 0) {
        return true;
    }
    return false;
}

//This should be called at the beginning of any controller that uses the checkbox tags
function clearCheckedTags(tags) {
    for (i = 0; i < tags.org_tags.length; i++)
        tags.org_tags[i].checked = false;
    for (i = 0; i < tags.perms_tags.length; i++)
        tags.perms_tags[i].checked = false;
    for (i = 0; i < tags.event_tags.length; i++)
        tags.event_tags[i].checked = false;
    return tags;
}

function getCheckedTags(tags) {
    //    console.log(tags);
    var org_tags = [];
    var perms_tags = [];
    var event_tags = [];
    for (i = 0; i < tags.org_tags.length; i++) {
        if (tags.org_tags[i].checked)
            org_tags.push(tags.org_tags[i].name);
    }
    for (i = 0; i < tags.event_tags.length; i++) {
        if (tags.event_tags[i].checked)
            event_tags.push(tags.event_tags[i].name);
    }
    for (i = 0; i < tags.perms_tags.length; i++) {
        if (tags.perms_tags[i].checked) {
            perms_tags.push(tags.perms_tags[i].name.toLowerCase());
        }
    }
    return {
        org_tags: org_tags,
        event_tags: event_tags,
        perms_tags: perms_tags
    };
}

function openErrorModal(error) {
    $('#errorModal').modal();
}

//easy way to get parameters from URL (use for non-sensitive info)
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
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
    var arrData = [
        []
    ];
    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;
    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches == objPattern.exec(strData)) {
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
    for (i = 1; i < array.length; i++) {
        objArray[i - 1] = {};
        for (var k = 0; k < array[0].length && k < array[i].length; k++) {
            var key = array[0][k];
            objArray[i - 1][key] = array[i][k];
        }
    }

    var json = JSON.stringify(objArray);
    //    console.log(json);
    var str = json.replace(/},/g, "},\r\n");

    return JSON.parse(str);
}

function momentInTimezone(date) {
    return moment(date).add(moment().tz(jstz.determine().name()).format('ZZ') / 100, 'hours');
}

function momentUTCTime(date) {
    return moment(date).subtract(moment().tz(jstz.determine().name()).format('ZZ') / 100, 'hours');
}

function spliceSlice(str, index, count) {
    return str.slice(0, index) + str.slice(index + count);
}


App.filter('multipleSearch', function() {
    return function(objects, search) {
        var searchValues = search;
        if (!search || !objects) {
            return objects;
        }
        retList = [];
        var searchArray = search.split(" ");
        for (var oPos = 0; oPos < objects.length; oPos++) {
            var object = objects[oPos];
            for (var sPos = 0; sPos < searchArray.length; sPos++) {
                var check = false;
                var searchItem = searchArray[sPos];
                for (var item in object) {
                    if (object[item] && object[item].toString().toLowerCase().indexOf(searchItem.toLowerCase()) > -1) {
                        check = true;
                        break;
                    }
                }
                if (!check) {
                    break;
                }
                if (sPos == searchArray.length - 1 && check) {
                    retList.push(object);
                }
            }
        }
        return retList;
    };
});

App.filter('htmlToPlaintext', function() {
    return function(text) {
        return String(text).replace(/<[^>]+>/gm, ' ').replace(/&nbsp;/gi, '');
    };
});

App.filter('nameSearch', function() {
    return function(objects, search, max) {
        if (!search || !objects) {
            return objects;
        }
        retList = [];
        if (objects) {
            for (var oPos = 0; oPos < objects.length; oPos++) {
                var object = objects[oPos];
                var check = false;
                var name = object.first_name + ' ' + object.last_name;
                if (name.toString().toLowerCase().indexOf(search.toLowerCase()) > -1) {
                    retList.push(object);
                }
                if (max) {
                    if (retList.length >= max) {
                        console.log('Im returning early');
                        return retList;
                    }
                }
            }
        }
        return retList;
    };
});

App.filter('linkGroup', function() {
    return function(objects, group) {
        if (!group || !objects) {
            return objects;
        }
        retList = [];
        if (objects) {
            for (var oPos = 0; oPos < objects.length; oPos++) {
                //console.log(objects[oPos]);
                if (objects[oPos].group == group) {
                    retList.push(objects[oPos]);
                }
            }
        }
        return retList;
    };
});

App.filter('capitalizeFirst', function() {
    return function(objects) {
        if (objects) {
            return objects[0].toUpperCase() + objects.slice(1);
        }
        return retList;
    };
});

App.filter('yearSearch', function() {
    return function(objects, search) {
        if (!search) {
            return objects;
        }
        retList = [];
        if (objects) {
            for (var oPos = 0; oPos < objects.length; oPos++) {
                var object = objects[oPos];
                if (object.grad_year) {
                    if (object.grad_year.toString().toLowerCase() == search.toString().toLowerCase()) {
                        retList.push(object);
                    }
                } else if (search.toString().toLowerCase() == 'unknown') {
                    retList.push(object);
                }
            }
        }
        return retList;
    };
});


App.filter('pledgeClassSearch', function() {
    return function(objects, search) {
        if (!search) {
            return objects;
        }
        retList = [];
        if (objects) {
            for (var oPos = 0; oPos < objects.length; oPos++) {
                var object = objects[oPos];
                if (object.pledge_class_year == search.year && object.pledge_class_semester == search.semester) {
                    retList.push(object);
                } else if (search.toString().toLowerCase() == 'unknown') {
                    retList.push(object);
                }
            }
        }
        return retList;
    };
});

App.filter('directoryFilter', function() {
    return function(objects, perms) {
        var retList = [];
        if (objects) {
            for (i = 0; i < objects.length; i++) {
                if (objects[i].user_name && objects[i].perms == perms) {
                    retList.push(objects[i]);
                }
            }
        }
        return retList;
    };
});

App.filter('removePassedEvents', function() {
    return function(objects, removePref) {
        var retList = [];
        var now = new Date();
        if (!objects) {
            return objects;
        }
        for (var oPos = 0; oPos < objects.length; oPos++) {

            if (moment(objects[oPos].time_end).diff(momentUTCTime(undefined)) > 0 && removePref) {
                retList.push(objects[oPos]);
            } else if (moment(objects[oPos].time_end).diff(momentUTCTime(undefined)) < 0 && removePref === false) {
                retList.push(objects[oPos]);
            } else if (removePref === undefined) {
                retList.push(objects[oPos]);
            }
        }
        return retList;
    };
});

App.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        if (input) {
            return input.slice(start);
        }
        return input;
    };
});


App.filter('checkedFilter', function() {
    return function(input) {
        out = [];
        if (input) {
            for (i = 0; i < input.length; i++) {
                if (input[i].checked) {
                    out.push(input[i]);
                }
            }
        }
        return out;
    };
});

App.filter('tagDirectorySearch', function() {
    return function(objects, tags, additionalUsers) {
        var tags_list = [];
        if (tags) {
            if (tags.org_tags) {
                for (i = 0; i < tags.org_tags.length; i++) {
                    if (tags.org_tags[i].checked) {
                        tags_list.push(tags.org_tags[i].name);
                    }
                }
            }
            if (tags.perms_tags) {
                for (var j = 0; j < tags.perms_tags.length; j++) {
                    if (tags.perms_tags[j].checked) {
                        if (tags.perms_tags[j].name == "everyone") {
                            tags_list.push("member");
                            tags_list.push("leadership");
                            tags_list.push("council");
                        } else if (tags.perms_tags[j].name == "Members") {
                            tags_list.push("member");
                        } else {
                            tags_list.push(tags.perms_tags[j].name);
                        }
                    }
                }
            }
        }
        out_string = '';
        for (i = 0; i < tags_list.length; i++) {
            out_string += tags_list[i] + ' ';
        }
        var search = out_string;
        retList = [];

        var searchArray = search.split(" ");
        if (objects) {
            for (var oPos = 0; oPos < objects.length; oPos++) {
                var object = objects[oPos];
                for (var sPos = 0; sPos < searchArray.length; sPos++) {
                    var check = false;
                    var searchItem = searchArray[sPos];
                    if (object.tags.indexOf(searchItem.toString()) > -1 && retList.indexOf(object) == -1) {
                        retList.push(object);
                        break;
                    } else if (object.perms.toLowerCase() == searchItem.toString().toLowerCase() && retList.indexOf(object) == -1) {
                        retList.push(object);
                        break;
                    }
                }
            }
        }
        if (additionalUsers) {
            for (var uPos = 0; uPos < additionalUsers.length; uPos++) {
                if (additionalUsers[uPos].checked && retList.indexOf(additionalUsers[uPos].user) == -1) {
                    retList.push(additionalUsers[uPos]);
                }
            }
        }
        return retList;
    };
});

App.filter('eventTagDirectorySearch', function() {
    return function(objects, tags) {
        if (!tags) {
            return null;
        }
        var tags_list = tags.org_tags.concat(tags.perms_tags);
        out_string = '';
        for (var j = 0; j < tags_list.length; j++) {
            out_string += tags_list[j] + ' ';
        }
        var search = out_string;
        if (!search) {
            return null;
        }
        retList = [];
        var searchArray = search.split(" ");
        for (var oPos = 0; oPos < objects.length; oPos++) {
            var object = objects[oPos];
            for (var sPos = 0; sPos < searchArray.length; sPos++) {
                var check = false;
                var searchItem = searchArray[sPos];
                if (searchItem.toString().toLowerCase() == 'everyone') {
                    return objects;
                }

                if (object.tags.indexOf(searchItem.toString()) > -1 && retList.indexOf(object) == -1) {
                    retList.push(object);
                    break;
                }
                if (object.perms.toLowerCase() == searchItem.toString().toLowerCase() && retList.indexOf(object) == -1) {
                    retList.push(object);
                    break;
                }
            }
        }
        return retList;
    };
});


App.filter('displayTime', function(){
    return function(time){
        return momentInTimezone(time).calendar();
    };
});

App.filter('directorySearch', function() {
    return function(in_objects, search) {
        var searchValues = search;
        if (!search) {
            return in_objects;
        }
        var out_objects = [];
        console.log(in_objects.length);
        for (var j = 0; j < in_objects.length; j++) {
            var objects = in_objects[j].data;
            retList = [];
            var searchArray = search.split(" ");
            for (var oPos = 0; oPos < objects.length; oPos++) {
                var object = objects[oPos];
                for (var sPos = 0; sPos < searchArray.length; sPos++) {
                    var check = false;
                    var searchItem = searchArray[sPos];
                    for (var item in object) {
                        if (object[item] && object[item].toString().toLowerCase().indexOf(searchItem.toLowerCase()) > -1) {
                            check = true;
                            break;
                        }
                    }
                    if (!check) {
                        break;
                    }
                    if (sPos == searchArray.length - 1 && check) {
                        retList.push(object);
                    }
                }
            }
            if (retList.length > 0) {
                in_objects[j].data = retList;
            }
        }
        return in_objects;
    };
});


App.factory('registerOrganizationService', function() {
    var data = undefined;

    return {
        get: function() {
            return data;
        },
        set: function(_data) {
            data = _data;
        }
    };
});
