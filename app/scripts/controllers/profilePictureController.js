App.controller('profilePictureController', ['$scope', '$location', 'RESTService', '$http', '$rootScope', 'Session', 'Directory',
    function($scope, $location, RESTService, $http, $rootScope, Session, Directory) {
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/get_upload_url', '')
            .success(function(data) {
                if (!RESTService.hasErrors(data)) {
                    $("#profilePic").attr("action", data.data);
                    $scope.url = data.data;
                } else {
                    console.log("Error", data.error);
                }
            })
            .error(function(data) {
                console.log('Error: ', data);
            });
        $scope.user_name = Session.user_name;
        $scope.token = Session.token;
        $scope.type = "prof_pic";
        //initialize profile image variable
        var newprofileImage;

        $scope.uploadImage = function(src, crop_data) {
            console.log(crop_data);
            $scope.uploading = true;
            var img = src.slice(src.indexOf(',') + 1);
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/change_profile_image', {
                img: img,
                crop: crop_data
            })
                .success(function(data) {
                    console.log("success");
                    var me = Session.me;
                    me.prof_pic = JSON.parse(data.data);
                    console.log('What prof pic Im getting', me.prof_pic);
                    Directory.updateMe(me);
                    Session.updateMe(me);
                    $location.url('app/accountinfo');
                })
                .error(function(data) {
                    $scope.uploading = false;
                    $scope.error = true;
                    console.log("failure");
                });
        }

        $scope.uploadPicture = function() {

            console.log(newprofileImage);
            $http.post($scope.url, newprofileImage, {
                headers: {
                    'Content-Type': undefined
                },
                transformRequest: angular.identity,
            })
                .success(function(data) {
                    console.log("success");
                    console.log(data);
                })
                .error(function(data) {
                    console.log("failure");
                    console.log(data);
                });
        }





        $(function() {
            'use strict';

            var result = $('#result'),
                exifNode = $('#exif'),
                thumbNode = $('#thumbnail'),
                actionsNode = $('#actions'),
                currentFile,
                replaceResults = function(img) {
                    var content;
                    if (!(img.src || img instanceof HTMLCanvasElement)) {
                        content = $('<span>Loading image file failed</span>');
                    } else {
                        content = $('<a target="_blank">').append(img)
                            .attr('download', currentFile.name)
                            .attr('href', img.src || img.toDataURL());
                    }
                    result.children().replaceWith(content);
                    if (img.getContext) {
                        actionsNode.show();
                    }
                },
                displayImage = function(file, options) {
                    currentFile = file;
                    if (!loadImage(
                        file,
                        replaceResults,
                        options
                    )) {
                        result.children().replaceWith(
                            $('<span>Your browser does not support the URL or FileReader API.</span>')
                        );
                    }
                },
                displayExifData = function(exif) {
                    var thumbnail = exif.get('Thumbnail'),
                        tags = exif.getAll(),
                        table = exifNode.find('table').empty(),
                        row = $('<tr></tr>'),
                        cell = $('<td></td>'),
                        prop;
                    if (thumbnail) {
                        thumbNode.empty();
                        loadImage(thumbnail, function(img) {
                            thumbNode.append(img).show();
                        }, {
                            orientation: exif.get('Orientation')
                        });
                    }
                    for (prop in tags) {
                        if (tags.hasOwnProperty(prop)) {
                            table.append(
                                row.clone()
                                .append(cell.clone().text(prop))
                                .append(cell.clone().text(tags[prop]))
                            );
                        }
                    }
                    exifNode.show();
                },
                dropChangeHandler = function(e) {
                    e.preventDefault();
                    e = e.originalEvent;
                    var target = e.dataTransfer || e.target,
                        file = target && target.files && target.files[0],
                        options = {
                            maxWidth: result.width(),
                            canvas: true
                        };
                    if (!file) {
                        return;
                    }
                    exifNode.hide();
                    thumbNode.hide();
                    loadImage.parseMetaData(file, function(data) {
                        if (data.exif) {
                            options.orientation = data.exif.get('Orientation');
                            displayExifData(data.exif);
                        }
                        displayImage(file, options);
                    });
                },
                coordinates;
            // Hide URL/FileReader API requirement message in capable browsers:
            if (window.createObjectURL || window.URL || window.webkitURL || window.FileReader) {
                result.children().hide();
            }
            $(document)
                .on('dragover', function(e) {
                    e.preventDefault();
                    e = e.originalEvent;
                    e.dataTransfer.dropEffect = 'copy';
                })
                .on('drop', dropChangeHandler);
            $('#file-input').on('change', dropChangeHandler);
            $('#edit').on('click', function(event) {
                event.preventDefault();
                var imgNode = result.find('img, canvas'),
                    img = imgNode[0];
                imgNode.Jcrop({
                    setSelect: [40, 40, img.width - 40, img.height - 40],
                    onSelect: function(coords) {
                        coordinates = coords;
                    },
                    onRelease: function() {
                        coordinates = null;
                    }
                }).parent().on('click', function(event) {
                    event.preventDefault();
                });
            });
            $('#crop').on('click', function(event) {
                event.preventDefault();
                var img = result.find('img, canvas')[0];
                if (img && coordinates) {
                    replaceResults(loadImage.scale(img, {
                        left: coordinates.x,
                        top: coordinates.y,
                        sourceWidth: coordinates.w,
                        sourceHeight: coordinates.h,
                        minWidth: result.width()
                    }));
                    coordinates = null;
                }
            });

        });
    }
]);