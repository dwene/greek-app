var App = angular.module('App', ['ngRoute']);

	App.config( function ($routeProvider) {
		$routeProvider
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
				controller  : 'addmembersController'
			})
            .when('/newmember', {
                templateUrl : 'Static/newmember.html',
                controller : 'newmemberController'
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
    
});

App.controller('registerinfoController', function($scope, $http) {
    
    
    
    $scope.registerinfoClick = function(){
        //$http.post('/_ah/api/todolist/v1/checkItem/' + $.cookie('USER_TOKEN') + '/' + id)
        
        
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

        var newmemberList = [];
            
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
            
            newmemberList.push(o);
            return newmemberList;
        };

    $scope.addMember = function(){
        $('#result').text(JSON.stringify($('#addmemberForm').serializeObject()));
        return false;
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

App.controller('newmemberController', function($scope, $http){
    });


//Initialize Smoothscroll
smoothScroll.init();

// Source: http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.



function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function CSVToArray(strData, strDelimiter) {
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

function CSV2JSON(csv) {
    var array = CSVToArray(csv);
    var objArray = [];
    for (var i = 1; i < array.length; i++) {
        objArray[i - 1] = {};
        for (var k = 0; k < array[0].length && k < array[i].length; k++) {
            var key = array[0][k];
            objArray[i - 1][key] = array[i][k]
        }
    }

    var json = JSON.stringify(objArray);
    var str = json.replace(/},/g, "},\r\n");

    return str;
}

$("#convert").click(function() {
    var csv = $("#csv").val();
    var json = CSV2JSON(csv);
    $("#json").val(json);
});

$("#download").click(function() {
    var csv = $("#csv").val();
    var json = CSV2JSON(csv);
    window.open("data:text/json;charset=utf-8," + escape(json))
});



function toSend(send_data){
    var output = {user_name:$.cookie("USER_NAME"),
     token: $.cookie("TOKEN"),
     data: send_data};
    return JSON.stringify(output);
}