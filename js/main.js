//initialize app
var App = angular.module('App', ['ngRoute']);

//define routes and link to their controllers
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

//controller for the navigation header
    App.controller('navigationController', function($scope, $http){
        $scope.checkLogin = function(){
            return checkLogin();
        }
        
        $scope.logout = function(){
                $.removeCookie('USER_TOKEN');
                window.location.replace("/#/login");
         }
    });


//controller for the home page
    App.controller('homeController', function($scope, $http) {
           
        
	});


//controller for the login page
	App.controller('loginController', function($scope, $http) {

        //need to update login controller
//        $scope.login = function(user_name, password) {
//        console.log(user_name + ' ' +password)
//        $http.get('/_ah/api/todolist/v1/auth/login/' + user_name + '/' + password)
//            .success(function(data) {
//                console.log(data.message);
//                cookie = data.current_token;
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
//controller for the registration page
    App.controller('registerController', function($scope, $http) {
        //this page passes parameters through a get method to register info
    });

//controller for the register info page
    App.controller('registerinfoController', function($scope, $http) {
    
        //ng-click on form button click
        $scope.registerinfoClick = function(item){
            
            //define organization based on parameters passed from registration page
            var organization = {name: getParameterByName('org_name'), school: getParameterByName('org_school'), type:getParameterByName('org_type')}
            //format data for the api
            data_tosend = {organization: organization, user: item}
            
            console.log(toSend(data_tosend));
            
            //send the organization and user date from registration pages
            $http.post('/_ah/api/netegreek/v1/auth/register_organization', toSend(data_tosend))
            .success(function(data){
                $.cookie("TOKEN") = data.data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
                
        };
    
	});

//controller for the payment page
    App.controller('paymentController', function($scope, $http) {
        //skip payment page right now
        $scope.submitPayment = function(){
            window.location.replace("/#/app/addmembers");
        };
        
    });

//controller for the main app page
    App.controller('appController', function($scope, $http) {
        
//        if(!checkLogin()){
//        window.location.replace("/#/login");
//        }
        
	});

//controller for the add members page
    App.controller('addmembersController', function($scope, $http) {
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
            
            newmemberList.push(o);
            return newmemberList;
        };
    
        //ng-click for the form to add one member at a time
        $scope.addMember = function(){
            $('#result').text(JSON.stringify($('#addmemberForm').serializeObject()));
        };
        
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
        document.getElementById('uploadMembers').addEventListener('change', readSingleFile, false);
        
       //this function takes the CSV, converts it to JSON and outputs it
        $scope.addMembers = function(){
            
            //check to see if file is being read
            if(filecontents == null){
             //do nothing
            alert('you have not selected a file');
            }
            else{
                //converts CSV file to JSON
                newmemberList.push(CSV2JSON(filecontents));
                //outputs object to result
                $('#result').text(newmemberList);
            }
            
        };
    
    });

//controller for new member page
    App.controller('newmemberController', function($scope, $http){
    
    });

//More Functions

//checks to see if user is logged in or not
function checkLogin(){
    if($.cookie('USER_TOKEN') != undefined)
        return true;
    else
        return false;
}

//use toSend(send_data) when $http.post in order to attach data to user
function toSend(send_data){
    var output = 
    {user_name:$.cookie("TOKEN"),
     token: $.cookie("TOKEN"),
     data: JSON.stringify(send_data)};
    return output;
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