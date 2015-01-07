App.controller('memberprofileController', function($scope, $rootScope, $stateParams, $log, $window, RESTService, localStorageService, Directory, $mdBottomSheet){
    routeChange();
        Directory.get();
        $scope.directory = Directory.directory;
        console.log('here is the directory', $scope.directory);
        if ($scope.directory){
            loadMemberData();
        }
        
        $scope.$on('directory:updated', function(){
            $scope.directory = Directory.directory;
            loadMemberData();
        });
        if ($stateParams.id.toString().length < 2){
            $location.path('app/directory');
        }
    var phone = $scope.phone;
    var email = $scope.email;
    var vCard = getVcard();
    $scope.showProfileoptions = function($event){
        phone = $scope.phone;
        email = $scope.email;
        vCard = getVcard();
        $mdBottomSheet.show({
          templateUrl: 'views/templates/bottomGrid.html',
          controller: profileOptionsCtrl,
          targetEvent: $event
        }).then(function(clickedItem) {
            switch(clickedItem.name){
                case 'SMS': break;
                case 'CALL': break;
                case 'EMAIL': break;
                case 'SAVE': break;
                default: $log('button not found');
            }
            $scope.alert = clickedItem.name + ' clicked!';
        });
    }
    
    function profileOptionsCtrl($scope, $mdBottomSheet) {

        $scope.removeTouch = function(){
                alert();
                document.getElementById("bottomSheet").click();
        }
        
        $scope.items = [
            { name: 'SMS', icon: 'fa-mobile', link: 'sms:'+ phone, download:undefined},
            { name: 'CALL', icon: 'fa-phone', link: 'tel:' + phone, download:undefined},
            { name: 'EMAIL', icon: 'fa-envelope',link: 'mailto:' + email, download:undefined},
            { name: 'SAVE', icon: 'fa-floppy-o', link: vCard, download:'contact.vcf'}
        ];

        $scope.itemClick = function(item) {
            $mdBottomSheet.hide(item);
        }

        // $scope.items = [
        //     { name: 'Hangout', icon: 'fa-mobile' },
        //     { name: 'Mail', icon: 'fa-mobile' },
        //     { name: 'Message', icon: 'fa-mobile' },
        //     { name: 'Copy', icon: 'fa-mobile' },
        //     { name: 'Facebook', icon: 'fa-mobile' },
        //     { name: 'Twitter', icon: 'fa-mobile' },
        //   ];
        //   $scope.listItemClick = function($index) {
        //     var clickedItem = $scope.items[$index];
        //     $mdBottomSheet.hide(clickedItem);
        //   };

    };
    function getVcard(){
        var user = $scope.member;
        var out_string = 'BEGIN:VCARD\nVERSION:2.1\n\rN:' + user.last_name + ';' + user.first_name + ';;;\n\r'; //name
        out_string += 'FN:' + user.first_name + ' ' + user.last_name + '\n\r';//FN
        if (user.phone){
        out_string += 'TEL;CELL:' + user.phone + '\n\r';} //Phone
        if (user.email){
        out_string += 'EMAIL;PREF;INTERNET:' + user.email + '\n\r';}//Email
        if (user.prof_pic){
        out_string += 'PHOTO;PNG:'+user.prof_pic + '\n\r';}//picture
//        out_string += 'ADR;TYPE=home;LABEL=' + '\"' + user.address + '\\n'+ user.city + ',' + user.state + ' ' +user.zip + '\\nUnited States of America\"\n';
        if (user.address){
        out_string += 'ADR;HOME:;;'+user.address+';'+user.city+';'+user.state+';'+user.zip+';United States of America\n\r';}
        out_string += 'END:VCARD';
        return 'data:text/vcard,' + encodeURIComponent(out_string);
    }
    $scope.saveVcard = function(){
        var user = $scope.member;
        var out_string = 'BEGIN:VCARD\nVERSION:2.1\n\rN:' + user.last_name + ';' + user.first_name + ';;;\n\r'; //name
        out_string += 'FN:' + user.first_name + ' ' + user.last_name + '\n\r';//FN
        if (user.phone){
        out_string += 'TEL;CELL:' + user.phone + '\n\r';} //Phone
        if (user.email){
        out_string += 'EMAIL;PREF;INTERNET:' + user.email + '\n\r';}//Email
        if (user.prof_pic){
        out_string += 'PHOTO;PNG:'+user.prof_pic + '\n\r';}//picture
//        out_string += 'ADR;TYPE=home;LABEL=' + '\"' + user.address + '\\n'+ user.city + ',' + user.state + ' ' +user.zip + '\\nUnited States of America\"\n';
        if (user.address){
        out_string += 'ADR;HOME:;;'+user.address+';'+user.city+';'+user.state+';'+user.zip+';United States of America\n\r';}//address
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
        //var blob = new Blob([out_string], {type: "text/vcard;charset=utf-8"});
//        var csvString = csvRows.join("%0A");
               var a         = document.createElement('a');
               a.href        = 'data:text/vcard,' + encodeURIComponent(out_string);
               a.target      = '_blank';
               a.download    = 'contact.vcf';
               console.log(a.href);
               document.body.appendChild(a);
               a.click();
               document.body.removeChild(a);
        //saveAs(blob, ($scope.member.first_name + '_' + $scope.member.last_name) || "contact" + ".vcf");
    }
        
        
        // $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory', packageForSending(''))
        //     .success(function(data){
        //         if (!checkResponseErrors(data))
        //         {
        //             var directory = JSON.parse(data.data)
        //             $rootScope.directory = directory;
        //             localStorageService.set('directory', $rootScope.directory);
        //             LoadScreen.stop();
        //             $scope.members = directory.members;
        //             loadMemberData();
        //         }
        //         else
        //         {
        //             console.log("error: ", data.error)
        //         }
        //     })
        //     .error(function(data) {
        //         console.log('Error: ' , data);
        //     });        
    



        function loadMemberData(){
            for(var i = 0; i<$scope.directory.members.length; i++)
            {
                if($scope.directory.members[i].user_name == $stateParams.id)
                {
                    $scope.member = $scope.directory.members[i];
                    $scope.prof_pic = $scope.directory.members[i].prof_pic;
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
                    $scope.birthday = $scope.member.dob;
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
                    $scope.loading_finished = true;
                    return;
                }
            }
            for(var i = 0; i<$scope.directory.alumni.length; i++)
            {
                if($scope.directory.alumni[i].user_name == $stateParams.id)
                {
                    $scope.member = $scope.directory.alumni[i];
                    $scope.prof_pic = $scope.member.prof_pic;
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
                    $scope.birthday = $scope.member.dob;
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
                    $scope.loading_finished = true;
                    break;
                }
            }  
        }
            
});