App.controller('membertagsController', function($scope, $http, $rootScope, Load, localStorageService) 
{
    routeChange();
    
    $scope.selectTagFromTypeAhead = function(tag){
        console.log('looking for tag', tag);
        console.log('all tags', $scope.tags);
        var tags = $scope.org_tags;
        for(var i = 0; i < tags.length; i++){
            if (tags[i].name == tag.name){
                console.log('I found the tag!');
                tags[i].checked = true;
                $scope.selectedTagName = "";
                break;
            }
        } 
    }
    $scope.selectedTag = "";
    
    $scope.checkTag = function(tag){
        if(tag.checked){
            tag.checked = false;
        }
        else{
            tag.checked = true;
        }
        $scope.selectedTagName = "";
        console.log(tag);
    }
    
    Load.then(function(){
        $rootScope.requirePermissions(LEADERSHIP);
        $scope.memberslength = 20;
        $scope.$watch('search', function(){
            $scope.memberslength = 20;
        });
        $scope.loadMoreMembers = function(){
            if ($scope.memberslength < $scope.users.length){
                $scope.memberslength += 20;
            }
        }
        function getUsers(){
            var out_users = [];
            var users = $rootScope.directory;
            for (var i = 0; i < users.members.length; i ++){
                var user = users.members[i];
                user.name = users.members[i].first_name + " " + users.members[i].last_name;
                user.checked = false;
                out_users.push(user);
            }
            $scope.users = out_users
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/directory', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    var users = JSON.parse(data.data);
                    $rootScope.directory = users;
                    localStorageService.set('directory', $rootScope.directory);
                    var out_users = [];
                    for (var i = 0; i < users.members.length; i ++){
                        for (var j = 0; j < $scope.users.length; j++){
                            if (users.members[i].key == $scope.users[j].key){
                                var checked = $scope.users[j].checked;
                                $scope.users[j] = users.members[i];
                                $scope.users[j].checked = checked;
                                $scope.users[j].name = users.members[i].first_name + " " + users.members[i].last_name;
                                break;
                            }
                        }
                    }
                }
                else
                    console.log('ERROR: ',data);
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });
            }
            getUsers();
        $scope.getOrganizationTags = function(){
        //initialize ng-model variables to contain selected things
        $('#tag').val('');
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/message/get_tags', packageForSending(''))
        .success(function(data){
            if (!checkResponseErrors(data)){
                var org_tags = JSON.parse(data.data).org_tags;
                var out_tags = [];
                for (var i = 0; i < org_tags.length; i++){
                    org_tags[i].checked = false;
                    out_tags.push(org_tags[i]);
                }
                $rootScope.tags = JSON.parse(data.data);
                localStorageService.set('tags', $rootScope.tags);
                $scope.org_tags = out_tags;
                $rootScope.org_tag_data = $scope.org_tags;
            }
            else{
                console.log('ERROR: ',data);
            }
        })
        .error(function(data) {
            console.log('Error: ' , data);
        });
    }
    $scope.getOrganizationTags();
    $scope.addOrganizationTag = function(tag){
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/add_organization_tag', packageForSending({tag: tag}))
        .success(function(data){
            if (!checkResponseErrors(data))
            {
                if ($rootScope.tags.org_tags.indexOf({tag: tag}) == -1){
                    $rootScope.tags.org_tags.push({tag: tag});
                }
                if ($scope.org_tags.indexOf({tag: tag}) == -1){
                    $scope.org_tags.push({name:tag, checked:true, recent:true});
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
        
        $("#addTag input").val("");
    }
    
    $scope.removeOrganizationTag = function(){
        $('#deleteTagModal').modal('hide');
        $('#seeallTags').modal();
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/remove_organization_tag', packageForSending({tag: $scope.modaledTag.name}))
        .success(function(data){
            if(checkResponseErrors(data)){openErrorModal(data.error)}
        })
        .error(function(data) {
            console.log('Error: ' , data);
        });
        var idx = $rootScope.tags.org_tags.indexOf($scope.modaledTag);
        $rootScope.tags.org_tags.splice(idx, 1);
        $scope.org_tags.splice($scope.org_tags.indexOf($scope.modaledTag), 1);
        var tag = $scope.modaledTag;
        $scope.modaledTag = null;
        for (var i = 0; i< $rootScope.directory.members.length; i++){
            if ($rootScope.directory.members[i].tags.indexOf(tag.name) > -1){
                $rootScope.directory.members[i].tags.splice($rootScope.directory.members[i].tags.indexOf(tag.name), 1);
            }
        }
        for (var i = 0; i< $scope.users.length; i++){
            if ($scope.users[i].tags.indexOf(tag.name) > -1){
                $scope.users[i].tags.splice($scope.users[i].tags.indexOf(tag.name), 1);
            }
        }
    }
    
    $scope.renameOrganizationTag = function(new_tag, isValid){

        if(isValid){
            $('#renameTagModal').modal('hide')
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/rename_organization_tag', packageForSending({old_tag: $scope.modaledTag.name, new_tag: new_tag}))
            .success(function(data){
                if (!checkResponseErrors(data))
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
            var idx = $rootScope.tags.org_tags.indexOf(tag);
            $rootScope.tags.org_tags[idx] = {name:new_tag, checked:false};
            $scope.org_tags[$scope.org_tags.indexOf(tag)] = {name:new_tag, checked:false};
            $scope.modaledTag = null;
            for (var i = 0; i< $rootScope.directory.members.length; i++){
                if ($rootScope.directory.members[i].tags.indexOf(tag.name) > -1){
                    $rootScope.directory.members[i].tags[$rootScope.directory.members[i].tags.indexOf(tag.name)] = new_tag;
                }
            }
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
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/add_users_tags', packageForSending(to_send))
        .success(function(data){
            if (!checkResponseErrors(data))
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
        for(var j = 0; j < $scope.users.length; j++){
            var user = $scope.users[j];
            console.log(user);
            for(var i = 0; i < $scope.org_tags.length; i++){
                if ($scope.org_tags[i].checked && user.checked && user.tags.indexOf($scope.org_tags[i].name) < 0){
                    user.tags.push($scope.org_tags[i].name);
                    console.log('tag name '+ $scope.org_tags[i].name);
                }
            }
        }
    }
    
    $scope.addTagsToUsers = function(){
        var tags = $scope.org_tags;
        var users = $scope.users;
        selected_tags = [];
        selected_keys = [];
        console.log($scope.org_tags);
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
    }
    
    function removeTagFromUser(tag, user){
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/remove_users_tags', packageForSending({'tags': [tag], 'keys': [user.key]}))
        .success(function(data){
            if (!checkResponseErrors(data))
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
    }
});
function clearCheckLabels(){
    for (var i = 0; i < $scope.users.length; i++){
        $scope.users[i].checked = false;
    }
    for (var i = 0; i < $scope.org_tags.length; i++){
        $scope.org_tags[i].checked = false;
    }
}
});