var App = angular.module('App', ['ngRoute']);

	// configure our routes
	App.config( function ($routeProvider) {
		$routeProvider
			// route for the home page
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
            .when('/app/addmembers', {
				templateUrl : 'Static/addmembers.html',
				controller  : 'appController'
			})
            .otherwise({
                redirectTo: '/'
            });
	});

    App.controller('navigationController', function($scope, $http){
        $scope.checkLogin = function(){
            return checkLogin();
        }
        
        $scope.logout = function(){
                $.removeCookie('USER_TOKEN');
                window.location.replace("/#/login");
         }
    });

	// create the controller and inject Angular's $scope
	App.controller('homeController', function($scope, $http) {
           
        
	});

    App.controller('appController', function($scope, $http) {
//        if(!checkLogin()){
//        window.location.replace("/#/login");
//        }
        $scope.formData = {};
        
	});

//if controllers are needed for these pages
	App.controller('loginController', function($scope, $http) {

        $scope.login = function(user_name, password) {
        console.log(user_name + ' ' +password)
        $http.get('/_ah/api/todolist/v1/auth/login/' + user_name + '/' + password)
            .success(function(data) {
                console.log(data.message);
                cookie = data.current_token;
                console.log(cookie);
                $.cookie('first_name', data.first_name);
                $.cookie('USER_TOKEN', cookie);
                console.log(data);
                window.location.replace("/#/app");
                //debug credentials user:jakeruesink pass:jakeiscool

            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        };

    });

App.controller('registerController', function($scope, $http) {
    $scope.registerClick = function(){
        window.location.replace("/#/registerinfo");
    };
    
});

App.controller('registerinfoController', function($scope, $http) {
    
    $scope.registerinfoClick = function(){
        window.location.replace("/#/payment");
    };
    
//		$scope.register = function(item) {
//        console.log(item)
//        $http.post('/_ah/api/todolist/v1/auth/register/',item)
//            .success(function(data) {
//                console.log(data.message);
//                cookie = data.current_token;
//                
//                console.log(cookie);
//                $.cookie('first_name', data.first_name);
//                $.cookie('USER_TOKEN', cookie);
//                console.log(data);
//                window.location.replace("/#/app");
//                //debug credentials user:jakeruesink pass:jakeiscool
//
//            })
//            .error(function(data) {
//                console.log('Error: ' + data);
//            });
//        };
	});

App.controller('paymentController', function($scope, $http) {
    $scope.submitPayment = function(){
        window.location.replace("/#/app/addmembers");
    };
    
});

App.controller('addmembersController', function($scope, $http) {
    $scope.addMember = function(){

    };
    
    $scope.addMembers = function(){

    };
    
});

function checkLogin(){
    if($.cookie('USER_TOKEN') != undefined)
        return true;
    else
        return false;
}

//Initialize Smoothscroll
smoothScroll.init();

