App.controller('memberprofileController', function($scope, $rootScope, $stateParams, $log, $window, $mdDialog, $cordovaInAppBrowser, $cordovaEmailComposer, $mdToast, RESTService, localStorageService, Directory, $mdBottomSheet, Session){
    routeChange();
    Directory.get();
    $scope.directory = Directory.directory;

    function sendEmail(email_addr){
        $cordovaEmailComposer.isAvailable().then(function() {
            var email = {
                to: email_addr,
                cc: ''
            };
            $cordovaEmailComposer.open(email).then(null, function () {
            });
        }, function () {
           // not available
        });
    }
    $scope.sendEmail = function(email_addr){
        sendEmail(email_addr);
    }
    $scope.openBrowser = function(link){
        var options = {
          location: 'yes',
          clearcache: 'yes',
          toolbar: 'yes'
        };
        document.addEventListener("deviceready", function () {
        $cordovaInAppBrowser.open('http://'+link, '_blank', options)
          .then(function(event) {
          })
          .catch(function(event) {
          });
        }, false);
    }

    function openPhone(link){
        var options = {
          location: 'yes',
          clearcache: 'yes',
          toolbar: 'yes'
        };
        console.log('I see the link:', link);
        document.addEventListener("deviceready", function () {
            window.open('tel:'+link, '_system');
        }, false);
    }
    $scope.openPhone = function(link){
        openPhone(link);
    }

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
    var vCard = undefined;
    $scope.showProfileoptions = function($event){
        phone = $scope.phone;
        email = $scope.email;
        vCard = getVcard();
        $mdDialog.show({
          templateUrl: 'views/templates/bottomDialog.html',
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
        $scope.items = [
            //{ name: 'SMS', icon: 'fa-mobile', link: 'sms:'+ phone, download:undefined},
            { name: 'CALL', icon: 'fa-phone', phone: phone, clickable:true},
            { name: 'EMAIL', icon: 'fa-envelope',email: email, clickable:true},
            { name: 'SAVE', icon: 'fa-floppy-o', clickable:true}
        ];

        $scope.itemClick = function(item) {
            if (item.name == 'CALL'){
                console.log('Phone number I am calling', item.phone);
                openPhone(item.phone);
            }
            else if (item.name == "EMAIL"){
                sendEmail(item.email);
            }
            else if (item.name == "SAVE"){
                saveCordovaContact();
            }
            $mdDialog.hide(item);
        }
        $scope.closeDialog = function(){
            $mdDialog.hide();
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


    function saveCordovaContact(){
        var user = $scope.member;
        var contact = navigator.contacts.create();
        contact.displayName = user.first_name + ' ' + user.last_name;
        contact.nickname = user.first_name;
        // populate some fields
        var name = new ContactName();
        name.givenName = user.first_name;
        name.familyName = user.last_name;
        contact.name = name;
        if (user.phone){
            var phoneNumbers = [];
            phoneNumbers[0] = new ContactField('cell', user.phone, false);
            contact.phoneNumbers = phoneNumbers;
        }
        contact.save(onSuccess,onError);
    }

    function onSuccess(){
        $mdToast.show($mdToast.simple().content('Contact Saved'));
    }

    function onError(){
        $mdToast.show($mdToast.simple().content('Unknown error. Contact not saved.'));
    }
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
    $scope.isThisMe = function(){
        if ($scope.member){return $scope.member.user_name == Session.me.user_name;}
        return false;  
    }
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