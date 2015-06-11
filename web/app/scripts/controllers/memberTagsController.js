App.controller('membertagsController', ['$scope', 'RESTService', '$rootScope', '$mdDialog', '$timeout', 'localStorageService', 'Directory', 'Tags',
    function($scope, RESTService, $rootScope, $mdDialog, $timeout, localStorageService, Directory, Tags) {
        Tags.get();
        Directory.get();
        var tags;
        console.log('This is the directory', Directory.directory);
        if (Directory.directory) {
            console.log('I have the directory');
            getUsers();
        }
        $scope.$on('directory:updated', function() {
            $scope.directory = Directory.directory;
            getUsers();
        });

        $scope.openSeeAllDialog = function(ev) {
            tags = $scope.tags;
            $mdDialog.show({
                controller: ('tagMembersController', ['$scope', '$mdDialog', tagMembersController]),
                templateUrl: 'views/templates/taggingMembersTagsDialog.html',
                targetEvent: ev
            });
        }
        var selectedTag;

        function tagMembersController($scope, $mdDialog) {
            $scope.addOrganizationTag = function(new_tag) {
                addOrganizationTag(new_tag);
                $mdDialog.hide();
            }
            $scope.tags = tags;
            $scope.closeModal = function() {
                $mdDialog.hide();
            }

            $scope.openRenameTagModal = function(tag) {
                $scope.selectedTag = tag;
                $scope.showDelete = false;
                $scope.showRename = true;
                $scope.new_name = "";
            }

            $scope.openDeleteTagModal = function(tag, ev) {
                $scope.selectedTag = tag;
                $scope.showRename = false;
                $scope.showDelete = true;
            }

            $scope.tag = selectedTag;
            $scope.renameTag = function(new_tag, isValid) {
                if (isValid) {
                    renameOrganizationTag(new_tag, $scope.selectedTag);
                    $scope.showRename = false;
                }
            }
            $scope.deleteTag = function() {
                removeOrganizationTag($scope.selectedTag);
                $scope.showDelete = false;
            }
        }
        $scope.openDeleteTagModal = function() {
            openDeleteTagModal($scope.tags.org_tags[0], undefined);
        }
        // function openRenameTagModal(tag, ev){
        //     selectedTag = tag;
        //     $mdDialog.show({
        //             controller: tagMembersController,
        //             templateUrl: 'views/templates/renameTagDialog.html',
        //             targetEvent: ev
        //     });
        // }

        // function openDeleteTagModal(tag, ev){
        //     selectedTag = tag;
        //     $mdDialog.show({
        //             controller: anotherController,
        //             templateUrl: 'views/templates/deleteTagDialog.html',
        //             targetEvent: ev
        //     });
        // }

        // function anotherController($mdDialog, $scope){
        //     $scope.closeModal = function(){
        //         $mdDialog.hide();
        //     }
        // }

        $scope.selectedTag = "";
        $scope.dataLoaded = $scope.directoryLoaded && $scope.tagsLoaded;
        $scope.watches = [$scope.directoryLoaded, $scope.tagsLoaded];
        $scope.$watchCollection('[directoryLoaded, tagsLoaded]', function() {
            if ($scope.tagsLoaded && $scope.directoryLoaded) {
                $scope.dataLoaded = true;
            } else {
                $scope.dataLoaded = false;
            }
        })

        $scope.selectTagFromTypeAhead = function(tag) {
            var tags = $scope.tags.org_tags;
            for (var i = 0; i < tags.length; i++) {
                if (tags[i].name == tag.name) {
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

        $scope.checkTag = function(tag) {
            if (tag.checked) {
                tag.checked = false;
            } else {
                tag.checked = true;
            }
            $scope.selectedTagName = "";
            $('#tag_name').val('');
        }
        $scope.memberslength = 20;
        $scope.loadMoreMembers = function() {
            if ($scope.directoryLoaded) {
                if ($scope.memberslength < $scope.directory.members.length) {
                    $scope.memberslength += 20;
                }
            }
        }
        $scope.change = function() {
            $scope.memberslength = 20;
        }

        function getUsers() {
            var out_users = [];
            $scope.directory = Directory.directory;
            var users = $scope.directory.members;
            for (var i = 0; i < users.length; i++) {
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
        $scope.getOrganizationTags = function() {
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
            if (Tags.check()) {
                $scope.tags = Tags.tags;
                $scope.tagsLoaded = true;
            } else {
                $scope.$on('tags:updated', function() {
                    $scope.tags = Tags.tags;
                    $scope.tagsLoaded = true;
                });
            }

        }

        $scope.getOrganizationTags();

        function spliceSlice(str, index, count, add) {
            return str.slice(0, index) + (add || "") + str.slice(index + count);
        }

        function addOrganizationTag(tag) {
            var real_tag = tag.toLowerCase().replace(/ /g, '');
            var i = 0;
            while (i < real_tag.length) {
                if (i >= real_tag.length) {
                    break;
                }
                if ("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._".indexOf(real_tag[i]) == -1) {
                    real_tag = spliceSlice(real_tag, i, 1, '');
                    i--;
                }
                i++;
            }
            $scope.addTagLoading = 'loading';
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/add_organization_tag', {
                tag: real_tag
            })
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        $scope.addTagLoading = 'done';
                        if ($scope.tags.org_tags.indexOf({
                            name: real_tag
                        }) == -1) {
                            $scope.tags.org_tags.push({
                                name: real_tag,
                                checked: true,
                                recent: true
                            });
                            //                    Tags.set($scope.tags);
                            $("#seeallTags input").val("");
                        }
                        // if ($scope.tags.org_tags.indexOf({tag: tag}) == -1){
                        //     $scope.tags.org_tags.push({name:tag, checked:true, recent:true});
                        // } 
                    } else {
                        console.log('ERROR: ', data);
                    }

                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        }

        function removeOrganizationTag(tag) {
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/remove_organization_tag', {
                tag: tag.name
            })
                .success(function(data) {
                    if (RESTService.hasErrors(data)) {
                        openErrorModal(data.error)
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
            var idx = $scope.tags.org_tags.indexOf(tag);
            $scope.tags.org_tags.splice(idx, 1);
            // $scope.tags.org_tags.splice($scope.tags.org_tags.indexOf($scope.modaledTag), 1);
            Tags.set($scope.tags);
            for (var i = 0; i < $scope.directory.members.length; i++) {
                if ($scope.directory.members[i].tags.indexOf(tag.name) > -1) {
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

        function renameOrganizationTag(new_tag, tag) {

            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/rename_organization_tag', {
                old_tag: tag.name,
                new_tag: new_tag
            })
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {} else {
                        console.log('ERROR: ', data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
            $scope.rename = null;
            // var idx = $scope.tags.org_tags.indexOf(tag);
            // $scope.tags.org_tags[idx] = {name:new_tag, checked:false};
            $scope.tags.org_tags[$scope.tags.org_tags.indexOf(tag)] = {
                name: new_tag,
                checked: false
            };
            for (var i = 0; i < $scope.directory.members.length; i++) {
                if ($scope.directory.members[i].tags.indexOf(tag.name) > -1) {
                    $scope.directory.members[i].tags[scope.directory.members[i].tags.indexOf(tag.name)] = new_tag;
                }
            }
            Directory.set($scope.directory);
            Tags.set($scope.tags);
        }

        $scope.$watch('item.tag', function() {
            if ($scope.item) {
                $scope.item.tag = $scope.item.tag.replace(/\s+/g, '');
            }
        });



        function addTagsToUsers(tags, keys) {
            var to_send = {
                tags: tags,
                keys: keys
            };
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/add_users_tags', to_send)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        console.log('success');
                    } else {
                        console.log('ERROR: ', data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
            for (var j = 0; j < $scope.directory.members.length; j++) {
                var user = $scope.directory.members[j];
                for (var i = 0; i < $scope.tags.org_tags.length; i++) {
                    if ($scope.tags.org_tags[i].checked && user.checked && user.tags.indexOf($scope.tags.org_tags[i].name) < 0) {
                        user.tags.push($scope.tags.org_tags[i].name);
                        console.log('tag name ' + $scope.tags.org_tags[i].name);
                    }
                }
            }
        }

        $scope.addTagsToUsers = function() {
            var tags = $scope.tags.org_tags;
            var users = $scope.directory.members;
            selected_tags = [];
            selected_keys = [];
            for (var i = 0; i < tags.length; i++) {
                if (tags[i].checked) {
                    selected_tags.push(tags[i].name);
                }
            }
            for (var i = 0; i < users.length; i++) {
                if (users[i].checked) {
                    selected_keys.push(users[i].key);
                }
            }
            addTagsToUsers(selected_tags, selected_keys);
            clearCheckLabels();
            Directory.set($scope.directory);
        }

        function removeTagFromUser(tag, user) {
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/manage/remove_users_tags', {
                'tags': [tag],
                'keys': [user.key]
            })
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        if (user.tags.indexOf(tag) > -1) {
                            user.tags.splice(user.tags.indexOf(tag), 1);
                        }
                    } else {
                        console.log('ERROR: ', data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        }

        $scope.removeTagFromUser = function(tag, user) {
            removeTagFromUser(tag, user);
            clearCheckLabels();
            Directory.set($scope.directory);
        }

        function clearCheckLabels() {
            for (var i = 0; i < $scope.directory.members.length; i++) {
                $scope.directory.members[i].checked = false;
            }
            for (var i = 0; i < $scope.tags.org_tags.length; i++) {
                $scope.tags.org_tags[i].checked = false;
            }
        }
    }
]);