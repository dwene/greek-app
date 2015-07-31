App.controller('LinksController', ['$scope', '$rootScope', '$mdDialog', 'RESTService', 'localStorageService', 'Links', 'Organization',
    function($scope, $rootScope, $mdDialog, RESTService, localStorageService, Links, Organization) {
        routeChange();
        Links.get();
        $scope.linkGroups = Links.groups;
        if ($scope.linkGroups) {
            $scope.loading_finished = true;
        }
        $scope.$on('links:updated', function() {
            console.log('$scope.links',Links.groups);
            $scope.linkGroups = Links.groups;
            $scope.loading_finished = true;
        });
        
        var selectedGroup;
        var selectedLink;
        var groups;
        

        $scope.showConfirmDelete = function(group){
            selectedGroup = group;
        }     
        $scope.openEditLinkDialog = function(link, group) {
            selectedLink = link;
            selectedGroup = group;
            groups = $scope.linkGroups;
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'views/templates/links/editLinkDialog.html'
            });
        }
        $scope.openNewLinkDialog = function() {
            groups = $scope.linkGroups;
            selectedLink = {};
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'views/templates/links/newLinkDialog.html',
                parent: angular.element(document.body)
            });
        }
        $scope.openDeleteLinkDialog = function(link) {
            selectedLink = link;
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'views/templates/links/deleteLinkDialog.html'
            });
        }
        $scope.openEditGroupDialog = function(group) {
            selectedGroup = group;
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'views/templates/links/editGroupDialog.html'
            });
        }

        $scope.deleteGroup = function(group) {
                deleteGroup(group);
        }

        $scope.deleteLink = function(link, group){
            deleteLink(link);
        }


        function DialogController($scope, $mdDialog) {

            $scope.group = selectedGroup;
            $scope.link = selectedLink;
            $scope.groups = groups;
            if (selectedLink && selectedGroup) {
                $scope.tempLink = JSON.parse(JSON.stringify(selectedLink));
                $scope.tempGroup = JSON.parse(JSON.stringify(selectedGroup));
            }
            $scope.closeDialog = function() {
                $mdDialog.hide();
            }
            $scope.deleteGroup = function(group) {
                deleteGroup(group);
                $mdDialog.hide();
            }
            $scope.renameGroup = function(name) {
                renameGroup(selectedGroup, name);
                $mdDialog.hide();
            }
            $scope.createLink = function(title, link, group, newGroup) {
                createLink(title, link, group, newGroup);
                $mdDialog.hide();
            }
            $scope.deleteLink = function(link, group) {
                console.log('group deleting link from', group)
                deleteLink(link, group);
                $mdDialog.hide();
            }
            $scope.editLink = function(link, group, newGroup) {
                editLink(link, group, newGroup);
                $mdDialog.hide();
            }
            // $scope.createGroup = function(group) {
            //     createGroup(group);
            //     $mdDialog.hide();
            // }
        }

        // function createGroup(group) {
        //     var to_send = {
        //         group: group
        //     };
        //     RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/link/v1/create_group', to_send)
        //         .success(function(data) {
        //             if (!RESTService.hasErrors(data)) {
        //                 var parsed = JSON.parse(data.data);
        //                 $scope.linkGroups.push(parsed.group);
        //             } else {
        //                 console.log('ERR');
        //             }
        //         })
        //         .error(function(data) {
        //             console.log('Error: ', data);
        //         });
        // }

        function deleteGroup(group) {
            for (i = 0; i < $scope.linkGroups.length; i++){
                if (group.key === $scope.linkGroups[i].key){
                    $scope.linkGroups.splice(i, 1);    
                }
            }

            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/link/v1/delete_group', {group: group})
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                    } else {
                        console.log('ERR');
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        }

        function createLink(title, url, group, newGroup) {
            var link = {title: title, link: url}
            var to_send = {
                group: group,
                link: link,
                newGroup: newGroup
            };
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/link/v1/create', to_send)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        var parsed = JSON.parse(data.data);
                        console.log('returned link to group', parsed);
                        if (parsed.newGroup){
                            $scope.linkGroups.push(parsed.group);
                        }
                        else{
                            for (i = 0; i < $scope.linkGroups.length; i++){
                                if ($scope.linkGroups[i].key === parsed.link.group){
                                    $scope.linkGroups[i].links.push(parsed.link);
                                }
                            }
                        }
                        console.log('linkGroups', $scope.linkGroups);   
                    } else {
                        console.log('ERR');
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        }

        function deleteLink(link, group) {
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/link/v1/delete', {'key': link.key})
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        group.links.splice(group.links.indexOf(link), 1);
                    } else {
                        console.log('ERR');
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        }

        function editLink(link, group, newGroup) {
            if (newGroup === false){
                link.group = group.key;
            }
            console.log('group', group);
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/link/v1/edit', {link: link, group: group, newGroup: newGroup})
                    .success(function(data) {
                        if (!RESTService.hasErrors(data)) {
                            selectedLink.title = link.title;
                            selectedLink.link = link.link;
                            if (group !== selectedGroup) {
                                selectedGroup.links.splice(selectedGroup.links.indexOf(selectedLink), 1);
                                if (newGroup) {
                                    var parsedGroup = JSON.parse(data.data);
                                    $scope.linkGroups.push(parsedGroup);
                                }
                                else {
                                    selectedLink.group = group.key;
                                    group.links.push(selectedLink);
                                }
                            }
                        } else {
                            console.log('ERR');
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ', data);
                    });
        }

        function renameGroup(group, name) {
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/link/v1/rename_group', {key:group.key, name:name})
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        group.name = name;

                    } else {
                        console.log('ERR');
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        }
    }
]);