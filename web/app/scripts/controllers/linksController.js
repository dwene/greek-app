App.controller('LinksController', ['$scope', '$rootScope', '$mdDialog', 'RESTService', 'localStorageService', 'Links', 'Organization',
    function($scope, $rootScope, $mdDialog, RESTService, localStorageService, Links, Organization) {
        routeChange();
        Organization.get();
        if (Organization.organization) {
            $scope.groups = Organization.organization.link_groups;
        }
        $scope.$on('organization:updated', function() {
            $scope.groups = Organization.organization.link_groups;
        });
        Links.get();
        $scope.links = Links.links;
        if ($scope.links) {
            $scope.loading_finished = true;
        }
        $scope.$on('links:updated', function() {
            $scope.links = Links.links;
            $scope.loading_finished = true;
        });
        var selectedGroup;
        var selectedLink;
        var groups;
        $scope.openEditLinkDialog = function(link) {
            selectedLink = link;
            groups = $scope.groups;
            $mdDialog.show({
                controller: ('DialogController' ['$scope', '$mdDialog', DialogController]),
                templateUrl: 'views/templates/links/editLinkDialog.html'
            });
        }
        $scope.openNewLinkDialog = function() {
            groups = $scope.groups;
            selectedLink = {};
            $mdDialog.show({
                controller: ('DialogController' ['$scope', '$mdDialog', DialogController]),
                templateUrl: 'views/templates/links/newLinkDialog.html'
            });
        }
        $scope.openDeleteLinkDialog = function(link) {
            selectedLink = link;
            $mdDialog.show({
                controller: ('DialogController' ['$scope', '$mdDialog', DialogController]),
                templateUrl: 'views/templates/links/deleteLinkDialog.html'
            });
        }
        $scope.openRenameGroupDialog = function(group) {
            selectedGroup = group;
            $mdDialog.show({
                controller: ('DialogController' ['$scope', '$mdDialog', DialogController]),
                templateUrl: 'views/templates/links/renameGroupDialog.html'
            });
        }
        $scope.openDeleteGroupDialog = function(group) {
            selectedGroup = group;
            $mdDialog.show({
                controller: ('DialogController' ['$scope', '$mdDialog', DialogController]),
                templateUrl: 'views/templates/links/deleteGroupDialog.html'
            });
        }



        function DialogController($scope, $mdDialog) {
            $scope.groups = groups;
            $scope.selectedGroup = selectedGroup;
            $scope.selectedLink = selectedLink;
            if (selectedLink) {
                $scope.temp_link = {
                    link: selectedLink.link,
                    title: selectedLink.title,
                    group: selectedLink.group
                };
            }
            $scope.closeDialog = function() {
                $mdDialog.hide();
            }
            $scope.deleteGroup = function(group) {
                deleteGroup(group);
                $mdDialog.hide();
            }
            $scope.renameGroup = function(old_group, group) {
                renameGroup(old_group, group);
                $mdDialog.hide();
            }
            $scope.createLink = function(title, link, group) {
                createLink(title, link, group);
                $mdDialog.hide();
            }
            $scope.deleteLink = function(link) {
                deleteLink(link);
                $mdDialog.hide();
            }
            $scope.editLink = function(title, link, group, current_link) {
                editLink(title, link, group, current_link);
                $mdDialog.hide();
            }
            $scope.createGroup = function(group) {
                createGroup(group);
                $mdDialog.hide();
            }
        }

        function createGroup(group) {
            var to_send = {
                group: group
            };
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/link/create_group', to_send)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        if ($scope.groups.indexOf(group) == -1) {
                            $scope.groups.push(group);
                            $scope.checkCreateGroup = "done";
                        }
                    } else {
                        console.log('ERR');
                        $scope.checkCreateGroup = "broken";
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                    $scope.checkCreateGroup = "broken";
                });
        }

        function deleteGroup(group) {
            var to_send = {
                group: group
            };
            $scope.checkDeleteGroup = "pending";
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/link/delete_group', to_send)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        $('#deleteGroupModal').modal('hide');
                        $scope.checkDeleteGroup = "done";
                        for (var i = 0; i < $scope.links.length; i++) {
                            if ($scope.links[i].group == group) {
                                $scope.links.splice(i, 1);
                                i--;
                            }
                            if ($scope.groups.indexOf(group) != -1) {
                                $scope.groups.splice($scope.groups.indexOf(group), 1);
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

        function createLink(title, link, group) {
            var to_send = {
                group: group,
                title: title,
                link: link
            };
            $scope.checkCreateLink = "pending";
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/link/create', to_send)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        $('#newLinkModal').modal('hide');
                        $scope.checkCreateLink = "done";
                        if ($scope.groups.indexOf(group) == -1) {
                            $scope.groups.push(group);
                        }
                        $scope.links.push({
                            title: title,
                            link: link,
                            group: group,
                            key: JSON.parse(data.data)
                        });
                    } else {
                        console.log('ERR');
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        }

        function deleteLink(link) {
            var to_send = {
                key: link.key
            };
            $scope.checkDeleteLink = "pending";
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/link/delete', to_send)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        $('#deleteLinkModal').modal('hide');
                        $scope.checkDeleteLink = "done";
                        for (var i = 0; i < $scope.links.length; i++) {
                            if ($scope.links[i].key == link.key) {
                                $scope.links.splice(i, 1);
                                break;
                            }
                        }
                    } else {
                        console.log('ERR', data.error);
                        $scope.checkDeleteLink = "broken";
                    }
                })
                .error(function(data) {
                    $scope.checkDeleteLink = "broken";
                    console.log('Error: ', data);
                });
        }

        function editLink(title, link, group, current_link) {
            var to_send = {
                key: current_link.key,
                link: link,
                title: title,
                group: group
            };
            $scope.checkEditLink = "pending";
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/link/edit', to_send)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        $('#editLinkModal').modal('hide');
                        $scope.checkEditLink = "done";
                        current_link.title = title;
                        current_link.group = group;
                        current_link.link = link;
                        if ($scope.groups.indexOf(group) == -1) {
                            $scope.groups.push(group);
                        }
                    } else {
                        console.log('ERR', data.error);
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        }

        function renameGroup(old_group, group) {
            var to_send = {
                old_group: old_group,
                group: group
            };
            $scope.checkRenameGroup = "pending";
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/link/rename_group', to_send)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        $scope.checkRenameGroup = "done";
                        $('#renameGroupModal').modal('hide');
                        for (var i = 0; i < $scope.links.length; i++) {
                            if ($scope.links[i].group == old_group) {
                                $scope.links[i].group = group;
                            }
                        }
                        if ($scope.groups.indexOf(old_group) != -1) {
                            $scope.groups[$scope.groups.indexOf(old_group)] = group;
                            console.log("I found the old group and am changing it");
                        } else {
                            $scope.groups.push(group);
                        }

                    } else {
                        console.log('ERR');
                        $scope.checkRenameGroup = "broken";
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                    $scope.checkRenameGroup = "broken";
                });
        }
    }
]);