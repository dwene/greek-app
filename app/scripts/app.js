// Final/static variables
var ENDPOINTS_DOMAIN = 'https://greek-app.appspot.com';
// var ENDPOINTS_DOMAIN = 'http://localhost:9001';
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

// Set up run commands for the app
App.run( function($rootScope, $state, $stateParams, $q, $timeout, $state, $location, AuthService, Session, AUTH_EVENTS, RESTService, localStorageService, Links, Polls, Directory, Tags, Events, Organization, Chatter) {
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
    $rootScope.setColor = function(color) {
        $mdThemingProvider.theme('default').primaryPalette(color);
    };

    $rootScope.logout = function() {};

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

});

//More Functions

function logoutCookies() {
    $.removeCookie(USER_NAME);
    $.removeCookie(TOKEN);
    $.removeCookie('FORM_INFO_EMPTY');
}

//use packageForSending(send_data) when $http.post in order to attach data to user
function packageForSending(send_data) {
    var output = {
        user_name: $.cookie(USER_NAME),
        token: $.cookie(TOKEN),
        data: JSON.stringify(send_data)
    };
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

function momentInTimezone(date) {
    return moment(date).add(moment().tz(jstz.determine().name()).format('ZZ') / 100, 'hours');
}

function momentUTCTime(date) {
    return moment(date).subtract(moment().tz(jstz.determine().name()).format('ZZ') / 100, 'hours');
}

function spliceSlice(str, index, count) {
    return str.slice(0, index) + str.slice(index + count);
}
