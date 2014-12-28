App.controller('LinksController', function($scope, $rootScope, RESTService, Load, localStorageService, Links){
        routeChange();
        Load.then(function(){
            $rootScope.requirePermissions(MEMBER);
            $scope.groups = $rootScope.link_groups;
            Links.get();
            $scope.links = Links.links;
            if ($scope.links){
                $scope.loading_finished = true;
            }
            $scope.$on('links:updated', function(){
                $scope.loading_finished = true;
            });
            $scope.openEditLinkModal = function(link){
                $scope.temp_link = {link:link.link, title:link.title, group:link.group};
                $scope.selectedLink = link;
                $('#editLinkModal').modal();
            } 
            $scope.openNewLinkModal = function(){
                $scope.temp_link = {};
                $('#newLinkModal').modal();
            }
            $scope.openDeleteLinkModal = function(link){
                $('#deleteLinkModal').modal();
                $scope.selectedLink = link;
            }
            $scope.openRenameGroupModal = function(group){
                $('#renameGroupModal').modal();
                $scope.selectedGroup = group;
                $scope.newGroupName = "";
            }
            $scope.openDeleteGroupModal = function(group){
                $('#deleteGroupModal').modal();
                $scope.selectedGroup = group;
            }
            $scope.createGroup = function(group){
                var to_send = {group:group};
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/link/create_group', to_send)
                .success(function(data){
                    if (!RESTService.hasErrors(data)){
                        if ($scope.groups.indexOf(group) == -1){
                            $scope.groups.push(group);
                            $scope.checkCreateGroup = "done";
                        }
                    }
                    else{
                        console.log('ERR');
                        $scope.checkCreateGroup = "broken";
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                    $scope.checkCreateGroup = "broken";
                });
            }
            $scope.deleteGroup = function(group){
                var to_send = {group:group};
                $scope.checkDeleteGroup = "pending";
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/link/delete_group', to_send)
                .success(function(data){
                    if (!RESTService.hasErrors(data)){
                        $('#deleteGroupModal').modal('hide');
                        $scope.checkDeleteGroup = "done";
                        for (var i = 0; i < $scope.links.length; i++){
                            if ($scope.links[i].group == group){
                                $scope.links.splice(i, 1);
                                i--;
                            }
                            if ($scope.groups.indexOf(group) != -1){
                                $scope.groups.splice($scope.groups.indexOf(group), 1);
                            }
                        }
                    }
                    else{
                        console.log('ERR');
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
            }
            $scope.createLink = function(title, link, group){
                var to_send = {group:group, title:title, link:link};
                $scope.checkCreateLink = "pending";
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/link/create', to_send)
                .success(function(data){
                    if (!RESTService.hasErrors(data)){
                        $('#newLinkModal').modal('hide');
                        $scope.checkCreateLink = "done";
                        if ($scope.groups.indexOf(group) ==-1){
                            $scope.groups.push(group);
                        }
                        $scope.links.push({title: title, link: link, group:group, key:JSON.parse(data.data)});
                    }
                    else{
                        console.log('ERR');
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
            }
            $scope.deleteLink = function(link){
                var to_send = {key:link.key};
                $scope.checkDeleteLink = "pending";
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/link/delete', to_send)
                .success(function(data){
                    if (!RESTService.hasErrors(data)){
                        $('#deleteLinkModal').modal('hide');
                        $scope.checkDeleteLink = "done";
                        for(var i = 0; i<$rootScope.links.length; i++){
                            if ($rootScope.links[i].key == link.key){
                                $rootScope.links.splice(i, 1); 
                                break;
                            }
                        }
                    }
                    else{
                        console.log('ERR', data.error);
                        $scope.checkDeleteLink = "broken";
                    }
                })
                .error(function(data) {
                    $scope.checkDeleteLink = "broken";
                    console.log('Error: ' , data);
                });
            }
            $scope.editLink = function(title, link, group, current_link){
                var to_send = {key:current_link.key, link:link, title:title, group:group};
                $scope.checkEditLink = "pending";
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/link/edit', to_send)
                .success(function(data){
                    if (!RESTService.hasErrors(data)){
                        $('#editLinkModal').modal('hide');
                        $scope.checkEditLink = "done";
                        current_link.title = title;
                        current_link.group = group;
                        current_link.link = link;
                        if ($scope.groups.indexOf(group) == -1){
                            $scope.groups.push(group);
                        }
                    }
                    else{
                        console.log('ERR', data.error);
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
            }
            $scope.renameGroup = function(old_group, group){
                var to_send = {old_group:old_group, group:group};
                $scope.checkRenameGroup = "pending";
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/link/rename_group', to_send)
                .success(function(data){
                    if (!RESTService.hasErrors(data)){
                        $scope.checkRenameGroup = "done";
                        $('#renameGroupModal').modal('hide');
                       for (var i = 0; i < $scope.links.length; i++){
                            if ($scope.links[i].group == old_group){
                                $scope.links[i].group = group;
                            }
                        }
                        if ($scope.groups.indexOf(old_group) != -1){
                            $scope.groups[$scope.groups.indexOf(old_group)] = group;
                            console.log("I found the old group and am changing it");
                        }
                        else{
                            $scope.groups.push(group);
                        }
                        
                    }
                    else{
                        console.log('ERR');
                        $scope.checkRenameGroup = "broken";
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                    $scope.checkRenameGroup = "broken";
                });
            }
        });
    });