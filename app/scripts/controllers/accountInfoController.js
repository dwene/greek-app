App.controller('accountinfoController', ['$scope', 'RESTService', '$rootScope', '$timeout', 'Organization', 'AUTH_EVENTS', 'Session', 'Directory', '$location', function($scope, RESTService, $rootScope, $timeout, Organization, AUTH_EVENTS, Session, Directory, $location){
    $scope.session = Session;
    $scope.updatedInfo = false;
    initialize();
    $scope.checkAlumni = Session.perms === 'alumni';

    function initialize(){
        var me = JSON.parse(JSON.stringify(Session.me));
        if(me.dob){
            me.dob = moment(me.dob).format('MM/DD/YYYY');
        }
        if(me.phone){
            me.phone = me.phone.replace(/[^0-9.]/g, '');
            if (me.phone.length === 10){
                me.phone = me.phone.slice(0, 3) + '-' + me.phone.slice(3, 6) + '-' + me.phone.slice(6, 10);
            }
            else{
                me.phone = "";
            }
        }
        $scope.item = me;
    }

    $scope.changePassword = function(old_pass, new_pass) {
        var to_send = {password:new_pass, old_password: old_pass};
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/auth/v1/change_password', to_send)
        .success(function(data) {
            if(!checkResponseErrors(data)){
                $scope.passwordChanged = true;
                $rootScope.passwordChanged = true;
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
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
    
    $scope.goToMe = function(){
            $location.path('app/directory/'+Session.user_name);
    }
    
    $scope.checkAlumni = function() {
        return Session.perms != 'alumni';
    }
        
        
    $scope.updateAccount = function(isValid){
        debugger;
        var to_send = JSON.parse(JSON.stringify($scope.item));
        to_send.phone = to_send.phone.replace(/[^0-9.]/g, '');

        if(isValid){
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/update_user_directory_info', to_send)
            .success(function(data){
                if (!RESTService.hasErrors(data))
                {
                    $scope.updatedInfo = true;
                    Directory.updateMe(to_send);
                    Session.updateMe(to_send);
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
        else{
        //for validation purposes
        $scope.submitted = true;
        $scope.updatedInfo = false;
        }
    }
    $scope.updateEmailPrefs = function(option){
        var to_send = {email_prefs: option}
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/update_user_directory_info', to_send)
            .success(function(data){
                if (!RESTService.hasErrors(data))
                {
                    Session.me.email_prefs = option;
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
    
    $scope.months = [
        {value:1, name:'January'},
        {value:2, name:'February'},
        {value:3, name:'March'},
        {value:4, name:'April'},
        {value:5, name:'May'},
        {value:6, name:'June'},
        {value:7, name:'July'},
        {value:8, name:'August'},
        {value:9, name:'September'},
        {value:10, name:'October'},
        {value:11, name:'November'},
        {value:12, name:'December'}
    ];
    
    $scope.states = [
        {value:'AL', name:'Alabama'},
        {value:'AK', name:'Alaska'},
        {value:'AZ', name:'Arizona'},
        {value:'AR', name:'Arkansas'},
        {value:'CA', name:'California'},
        {value:'CO', name:'Colorado'},
        {value:'CT', name:'Connecticut'},
        {value:'DE', name:'Delaware'},
        {value:'DC', name:'District of Columbia'},
        {value:'FL', name:'Florida'},
        {value:'GA', name:'Georgia'},
        {value:'HI', name:'Hawaii'},
        {value:'ID', name:'Idaho'},
        {value:'IL', name:'Illinois'},
        {value:'IN', name:'Indiana'},
        {value:'IA', name:'Iowa'},
        {value:'KS', name:'Kansas'},
        {value:'KY', name:'Kentucky'},
        {value:'LA', name:'Louisiana'},
        {value:'ME', name:'Maine'},
        {value:'MD', name:'Maryland'},
        {value:'MA', name:'Massachusetts'},
        {value:'MI', name:'Michigan'},
        {value:'MN', name:'Minnesota'},
        {value:'MS', name:'Mississippi'},
        {value:'MO', name:'Missouri'},
        {value:'MT', name:'Montana'},
        {value:'NE', name:'Nebraska'},
        {value:'NV', name:'Nevada'},
        {value:'NH', name:'New Hampshire'},
        {value:'NJ', name:'New Jersey'},
        {value:'NM', name:'New Mexico'},
        {value:'NY', name:'New York'},
        {value:'NC', name:'North Carolina'},
        {value:'ND', name:'North Dakota'},
        {value:'OH', name:'Ohio'},
        {value:'OK', name:'Oklahoma'},
        {value:'OR', name:'Oregon'},
        {value:'PA', name:'Pennsylvania'},
        {value:'RI', name:'Rhode Island'},
        {value:'SC', name:'South Carolina'},
        {value:'SD', name:'South Dakota'},
        {value:'TN', name:'Tennessee'},
        {value:'TX', name:'Texas'},
        {value:'UT', name:'Utah'},
        {value:'VT', name:'Vermont'},
        {value:'VA', name:'Virginia'},
        {value:'WA', name:'Washington'},
        {value:'WV', name:'West Virginia'},
        {value:'WI', name:'Wisconsin'},
        {value:'WY', name:'Wyoming'}
    ];
    
}])


