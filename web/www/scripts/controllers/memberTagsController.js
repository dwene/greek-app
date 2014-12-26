App.controller('membertagsController', function($scope, RESTService, $rootScope, Load, localStorageService, Directory, Tags) 
{
    $scope.dataLoaded = $scope.directoryLoaded && $scope.tagsLoaded;
    $scope.watches = [$scope.directoryLoaded, $scope.tagsLoaded];
    $scope.$watchCollection('[directoryLoaded, tagsLoaded]', function(){
        if ($scope.tagsLoaded && $scope.directoryLoaded){
            $scope.dataLoaded = true;
        }
        else{
            $scope.dataLoaded = false;
        }
    })
    routeChange();
    $scope.selectTagFromTypeAhead = function(tag){
        console.log('looking for tag', tag);
        console.log('all tags', $scope.tags);
        var tags = $scope.tags.org_tags;
        for(var i = 0; i < tags.length; i++){
            if (tags[i].name == tag.name){
                console.log('I found the tag!');
                tags[i].checked = true;
                $scope.selectedTagName = "";
                break;
            }
        } 
    }
    // $scope.$watch($scope.directory, function(){
    //     if ($scope.tags && $scope.directory){
    //         $scope.dataLoaded = true;
    //     }
    // })
    // $scope.$watch($scope.tags, function(){
    //     if ($scope.tags && $scope.directory){
    //         $scope.dataLoaded = true;
    //     }
    // })
    $scope.selectedTag = "";
    
    $scope.checkTag = function(tag){
        if(tag.checked){
            tag.checked = false;
        }
        else{
            tag.checked = true;
        }
        $scope.selectedTagName = "";
    }
    Load.then(function(){
        $rootScope.requirePermissions(LEADERSHIP);
        $scope.memberslength = 20;
        $scope.$watch('search', function(){
            $scope.memberslength = 20;
        });
        $scope.loadMoreMembers = function(){
            if ($scope.directory){
                if ($scope.memberslength < $scope.directory.members.length){
                    $scope.memberslength += 20;
                }
            }
        }
        function getUsers(){
            var out_users = [];
            $scope.directory = Directory.get();
            var users = $scope.directory.members;
            for (var i = 0; i < users.length; i ++){
                var user = users[i];
                user.name = users[i].first_name + " " + users[i].last_name;
                user.checked = false;
                out_users.push(user);
            }
            $scope.directoryLoaded = true;
            // $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory', packageForSending(''))
            // .success(function(data){
            //     if (!checkResponseErrors(data))
            //     {
            //         var users = JSON.parse(data.data);
            //         $rootScope.directory = users;
            //         localStorageService.set('directory', $rootScope.directory);
            //         var out_users = [];
            //         for (var i = 0; i < users.members.length; i ++){
            //             for (var j = 0; j < $scope.directory.length; j++){
            //                 if (users.members[i].key == $scope.directory[j].key){
            //                     var checked = $scope.directory[j].checked;
            //                     $scope.directory[j] = users.members[i];
            //                     $scope.directory[j].checked = checked;
            //                     $scope.directory[j].name = users.members[i].first_name + " " + users.members[i].last_name;
            //                     break;
            //                 }
            //             }
            //         }
            //     }
            //     else
            //         console.log('ERROR: ',data);
            // })
            // .error(function(data) {
            //     console.log('Error: ' , data);
            // });
            }
            if (Directory.check()){
                getUsers();
            }
            $scope.$on('directory:updated', function(){
                getUsers();
            });
        $scope.getOrganizationTags = function(){
        //initialize ng-model variables to contain selected things
        // $('#tag').val('');
        // $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/message/get_tags', packageForSending(''))
        // .success(function(data){
        //     if (!checkResponseErrors(data)){
        //         var org_tags = JSON.parse(data.data).org_tags;
        //         var out_tags = [];
        //         for (var i = 0; i < org_tags.length; i++){
        //             org_tags[i].checked = false;
        //             out_tags.push(org_tags[i]);
        //         }
        //         $rootScope.tags = JSON.parse(data.data);
        //         // localStorageService.set('tags', $rootScope.tags);
        //         $scope.tags.org_tags = out_tags;
        //         // $rootScope.org_tag_data = $scope.tags.org_tags;
        //     }
        //     else{
        //         console.log('ERROR: ',data);
        //     }
        // })
        // .error(function(data) {
        //     console.log('Error: ' , data);
        // });
            if (Tags.check()){
                $scope.tags = Tags.get();
                $scope.tagsLoaded = true;
            }
            else{
                $scope.$on('tags:updated', function(){
                    $scope.tags = Tags.get();
                    $scope.tagsLoaded = true;
                });
            }

        }
    $scope.getOrganizationTags();
    $scope.addOrganizationTag = function(tag){
        $scope.addTagLoading = 'loading';
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/add_organization_tag', {tag: tag})
        .success(function(data){
            if (!RESTService.hasErrors(data))
            {
                $scope.addTagLoading = 'done';
                if ($scope.tags.org_tags.indexOf({name: tag}) == -1){
                    $scope.tags.org_tags.push({name:tag, checked:true, recent:true});
                    Tags.set($scope.tags);
                    $("#addTag input").val("");
                }
                // if ($scope.tags.org_tags.indexOf({tag: tag}) == -1){
                //     $scope.tags.org_tags.push({name:tag, checked:true, recent:true});
                // } 
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
    
    $scope.removeOrganizationTag = function(){
        $('#deleteTagModal').modal('hide');
        $('#seeallTags').modal();
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/remove_organization_tag', {tag: $scope.modaledTag.name})
        .success(function(data){
            if(RESTService.hasErrors(data)){openErrorModal(data.error)}
        })
        .error(function(data) {
            console.log('Error: ' , data);
        });
        var idx = $scope.tags.org_tags.indexOf($scope.modaledTag);
        $scope.tags.org_tags.splice(idx, 1);
        // $scope.tags.org_tags.splice($scope.tags.org_tags.indexOf($scope.modaledTag), 1);
        Tags.set($scope.tags);
        var tag = $scope.modaledTag;
        $scope.modaledTag = null;
        for (var i = 0; i< $scope.directory.members.length; i++){
            if ($scope.directory.members[i].tags.indexOf(tag.name) > -1){
                $scope.directory.members[i].tags.splice($scope.directory.members[i].tags.indexOf(tag.name), 1);
            }
        }
        Directory.set($scope.directory);
        // for (var i = 0; i< $scope.directory.length; i++){
        //     if ($scope.directory[i].tags.indexOf(tag.name) > -1){
        //         $scope.directory[i].tags.splice($scope.directory[i].tags.indexOf(tag.name), 1);
        //     }
        // }
    }
    
    $scope.renameOrganizationTag = function(new_tag, isValid){

        if(isValid){
            $('#renameTagModal').modal('hide')
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/rename_organization_tag', {old_tag: $scope.modaledTag.name, new_tag: new_tag})
            .success(function(data){
                if (!RESTService.hasErrors(data))
                {
                }
                else
                {
                    console.log('ERROR: ',data);
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });
            var tag = $scope.modaledTag;
            $scope.rename = null;
            // var idx = $scope.tags.org_tags.indexOf(tag);
            // $scope.tags.org_tags[idx] = {name:new_tag, checked:false};
            $scope.tags.org_tags[$scope.tags.org_tags.indexOf(tag)] = {name:new_tag, checked:false};
            $scope.modaledTag = null;
            for (var i = 0; i< $scope.directory.members.length; i++){
                if ($scope.directory.members[i].tags.indexOf(tag.name) > -1){
                    $scope.directory.members[i].tags[scope.directory.members[i].tags.indexOf(tag.name)] = new_tag;
                }
            }
            Directory.set($scope.directory);
        }
        else{
            $scope.submitted = true;
        }
    }
    
    $scope.$watch('item.tag', function() {
        if ($scope.item){
            $scope.item.tag = $scope.item.tag.replace(/\s+/g,'');
        }
    });

    $scope.openRenameTagModal = function(tag){
        $('#renameTagModal').modal();
        $scope.modaledTag = tag;
        $('#seeallTags').modal('hide')
    }
    
    $scope.openDeleteTagModal = function(tag){
        $('#deleteTagModal').modal();
        $scope.modaledTag = tag;
        $('#seeallTags').modal('hide');
    }
    
    function addTagsToUsers(tags, keys){
        var to_send = {tags: tags, keys: keys};
        console.log(to_send);
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/add_users_tags', to_send)
        .success(function(data){
            if (!RESTService.hasErrors(data))
            {
                console.log('success');
            }
            else
            {
                console.log('ERROR: ',data);
            }
        })
        .error(function(data) {
            console.log('Error: ' , data);
        });
        for(var j = 0; j < $scope.directory.members.length; j++){
            var user = $scope.directory.members[j];
            console.log(user);
            for(var i = 0; i < $scope.tags.org_tags.length; i++){
                if ($scope.tags.org_tags[i].checked && user.checked && user.tags.indexOf($scope.tags.org_tags[i].name) < 0){
                    user.tags.push($scope.tags.org_tags[i].name);
                    console.log('tag name '+ $scope.tags.org_tags[i].name);
                }
            }
        }
    }
    
    $scope.addTagsToUsers = function(){
        var tags = $scope.tags.org_tags;
        var users = $scope.directory.members;
        selected_tags = [];
        selected_keys = [];
        console.log($scope.tags.org_tags);
        for (var i = 0; i < tags.length; i++){
            if (tags[i].checked){
                selected_tags.push(tags[i].name);
            }
        }
        for (var i = 0; i < users.length; i++){
            if (users[i].checked){
                selected_keys.push(users[i].key);
            }
        }
        console.log(selected_keys);
        console.log(selected_tags);
        addTagsToUsers(selected_tags, selected_keys);
        clearCheckLabels();
        Directory.set($scope.directory);
    }
    
    function removeTagFromUser(tag, user){
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/remove_users_tags', {'tags': [tag], 'keys': [user.key]})
        .success(function(data){
            if (!RESTService.hasErrors(data))
            {
                if (user.tags.indexOf(tag) > -1){
                    user.tags.splice(user.tags.indexOf(tag), 1);
                }
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
    
    $scope.removeTagFromUser = function(tag, user){
        console.log(tag);
        console.log(user);
        removeTagFromUser(tag, user);
        clearCheckLabels();
        Directory.set($scope.directory);
    }
});
function clearCheckLabels(){
    for (var i = 0; i < $scope.directory.members.length; i++){
        $scope.directory.members[i].checked = false;
    }
    for (var i = 0; i < $scope.tags.org_tags.length; i++){
        $scope.tags.org_tags[i].checked = false;
    }
}
});