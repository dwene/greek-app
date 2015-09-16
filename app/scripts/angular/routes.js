angular.module("App").config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/")
        .when("/", "/app/home")
        .when("/app", "/app/home")
        .when("/app/chatter", "/app/home")
        .when("/app/managemembers", "/app/managemembers/manage")
        .when("/app/managealumni", "/app/managealumni/manage")
        .when("/app/directory", "/app/directory/members")
        .when("/changepasswordfromtoken", "/changepasswordfromtoken/1")
        .when("/app/events", "/app/events/calendar");

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
            controller: 'appController as app',
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
            .state('app.events.newevent', {
                    url : '/newevent',
                    templateUrl : 'views/newevent.html',
                    controller : 'newEventController',
                    data: {
                        permissions: {
                            only: [LEADERSHIP],
                            redirectTo: 'home'
                        }
                    }
                })
            .state('app.events.calendar', {
                    url : '/calendar',
                    templateUrl : 'views/calendar.html',
                    controller : 'calendarController',
                    data: {
                        permissions: {
                            only: [MEMBER],
                            redirectTo: 'home'
                        }
                    }
                })
            .state('app.events.eventInfo', {
                    url : '/:tag',
                    templateUrl : 'views/eventinfo.html',
                    controller : 'eventInfoController as eventInfo',
                    data: {
                        permissions: {
                            only: [MEMBER],
                            redirectTo: 'home'
                        }
                    }
                })
            .state('app.events.editEvent',{
                    url : '/:tag/edit',
                    templateUrl : 'views/editevent.html',
                    controller : 'editEventsController as vm',
                    data: {
                        permissions: {
                            only: [LEADERSHIP],
                            redirectTo: 'home'
                        }
                    }
                })
            .state('app.events.eventCheckin',{
                    url : '/:tag/checkin',
                    templateUrl : 'views/eventcheckin.html',
                    controller : 'eventCheckInController as checkIn',
                    data: {
                        permissions: {
                            only: [LEADERSHIP],
                            redirectTo: 'home'
                        }
                    }
                })
            .state('app.events.eventCheckinReport',{
                //#TODO put this into each individual event :tag
                    url : '/:tag/report',
                    templateUrl : 'views/eventcheckinreport.html',
                    controller : 'eventCheckInReportController as checkInReport',
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