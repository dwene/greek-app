var App = angular.module('App', ['ngRoute']);

	// configure our routes
	App.config( function ($routeProvider) {
		$routeProvider
			// route for the home page
			.when('/', {
				templateUrl : 'Static/home.html',
				controller  : 'mainController'
			})

			// route for the about page
			.when('/login', {

				templateUrl : 'Static/login.html',
				controller  : 'loginController'
			})

			// route for the contact page
			.when('/signup', {
				templateUrl : 'Static/signup.html',
				controller  : 'signupController'
			})
            .otherwise({
                redirectTo: '/'
            });
	});

    App.controller('navigationController', function($scope, $http){
        $scope.checkLogin = function(){
            return checkLogin();
        }
        
        $scope.name = function(){
            return $.cookie('first_name');
        }
        /*if($.cookie('first_name') != undefined)
            $scope.first_name = $.cookie('first_name');
        else
            $scope.first_name = '';*/
    

        
        //if($.cookie('first_name').length){$scope.first_name = $.cookie('first_name');}
        

        
        $scope.logout = function(){
                $.removeCookie('USER_TOKEN');
                window.location.replace("/#/login");
            }
    });

	// create the controller and inject Angular's $scope
	App.controller('mainController', function($scope, $http) {
        if(!checkLogin()){
        window.location.replace("/#/login");
        }
        $scope.formData = {};
        
        $scope.isitemchecked = function(checked){
            if(checked === true){
                return true;
            }else{return false;}
        };
        
        // when landing on the page, get all todos and show them
        $http.get('/_ah/api/todolist/v1/getlist/'+$.cookie('USER_TOKEN'))
            .success(function(data) {
                console.log(data.message)
                $scope.todos = JSON.parse(data.message);
								console.log($scope.todos)
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

        // when submitting the add form, send the text to the node API
        $scope.createTodo = function() {
						console.log({"message" : $scope.formData.title})
            $http.post('/_ah/api/todolist/v1/addItem/'+$.cookie('USER_TOKEN')+'/'+$scope.formData.title)
                .success(function(data) {
                    console.log(data.message)
                    usable = JSON.parse(data.message);
                    addme = {id: usable.id, checked: false, title: $scope.formData.title, timestamp: usable.timestamp};
                    console.log($scope.todos);
                    $scope.todos.push(addme);
                    //{checked:false, title:$scope.formData.title, timestamp:}
                    $scope.formData = {}; // clear the form so our user is ready to enter another
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        // check a todo after checking it
        $scope.checkTodo = function(id) {
            $http.post('/_ah/api/todolist/v1/checkItem/' + $.cookie('USER_TOKEN') + '/' + id)
                .success(function(data) {
                    //$scope.todos = JSON.parse(data.message);
                    for(var i = 0; i<$scope.todos.length; i++){
                        if($scope.todos[i].id == id){
                            if($scope.todos[i].checked){
                                $scope.todos[i].checked = false;}
                            else{
                                $scope.todos[i].checked = true;}
                        }
                    }
                    console.log(data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        // delete a todo after deleting it
        $scope.deleteTodo = function(id) {
            $http.delete('/_ah/api/todolist/v1/removeItem/' + $.cookie('USER_TOKEN') + '/' + id)
                .success(function(data) {
                    for (var i = 0; i < $scope.todos.length; i++)
                    {
                        if ($scope.todos[i].id == id)
                        {
                            $scope.todos.splice(i, 1);
                            break;
                        }
                    }
                   // $scope.todos = JSON.parse(data.message);
                    console.log(data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        $scope.clearCompleted = function() {
            $http.delete('/_ah/api/todolist/v1/deleteChecked/'+$.cookie('USER_TOKEN'))
                .success(function(data) {
                    for(var i = 0; i<$scope.todos.length; i++){
                        console.log(i)
                        if($scope.todos[i].checked){
                            $scope.todos.splice(i, 1);
                            i=0;
                        }
                    }
                    console.log($scope.todos)
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
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
                window.location.replace("/#/home");
                //debug credentials user:jakeruesink pass:jakeiscool

            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        };

    });
//
	App.controller('signupController', function($scope, $http) {
		$scope.register = function(item) {
        console.log(item)
        $http.post('/_ah/api/todolist/v1/auth/register/',item)
            .success(function(data) {
                console.log(data.message);
                cookie = data.current_token;
                
                console.log(cookie);
                $.cookie('first_name', data.first_name);
                $.cookie('USER_TOKEN', cookie);
                console.log(data);
                window.location.replace("/#/home");
                //debug credentials user:jakeruesink pass:jakeiscool

            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
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

