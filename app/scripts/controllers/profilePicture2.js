    App.controller('profilepicture2Controller', function($scope, $location, RESTService, $http, $rootScope, Session, Directory){
    $scope.uploading = true;
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/get_upload_url', '')
            .success(function(data){
                if (!RESTService.hasErrors(data))
                {
                    $scope.uploading = false;
                }
                else
                {
                    console.log("Error" , data.error);
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });
            $scope.user_name = Session.user_name;
            $scope.token = Session.token;
            $scope.type = "prof_pic";
        
        $scope.uploadImage = function(src, crop_data){
            console.log(crop_data);
            $scope.uploading = true;
            var img = src.slice(src.indexOf(',')+1);
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/change_profile_image', {img:img, crop:crop_data})
            .success(function(data){
                console.log("success");
                var me = Session.me;
                me.prof_pic = JSON.parse(data.data);
                console.log('What prof pic Im getting', me.prof_pic);
                Directory.updateMe(me);
                $location.url('app/accountinfo');
            })
            .error(function(data) {
                $scope.uploading = false;
                $scope.error = true;
                console.log("failure");
            });
        }


document.getElementsByTagName('input')[0].onchange = function (e) {
 
 
    e.preventDefault();
    if(this.files.length === 0) return;
    var imageFile = this.files[0];
    var img = new Image();
    var reader = new FileReader()
    reader.readAsDataURL(file);
    var url = window.URL ? window.URL : window.webkitURL;
    img.src = url.createObjectURL(imageFile);
 
    img.onload = function(e) {
        url.revokeObjectURL(this.src);
        var width;
        var height;
        var binaryReader = new FileReader();
     
        binaryReader.onloadend=function(d) {
        var exif, transform = "none";
        exif=EXIF.readFromBinaryFile(createBinaryFile(d.target.result));
     
        if(typeof exif != 'undefined') {
     
        switch (exif.Orientation) {
     
          case  8:
                width = img.height;
                height = img.width;
                transform = "left";
          break;
          case  6:
                width = img.height;
                height = img.width;
                transform = "right";
          break;
          case  1:
                width = img.width;
                height = img.height;
          break;
          case  3:
                width = img.height;
                height = img.width;
                transform = "flip";
          break;
     
          default:
                width = img.width;
                height = img.height;
         
        } 
     
        /* proportional sizing ... */
        
        var MAX_WIDTH = 1000;
        var MAX_HEIGHT = 1000;
     
        switch (true) {
     
            case (width/MAX_WIDTH > height/MAX_HEIGHT):
                  switch (true) {
                    case (width > MAX_WIDTH):
                          height *= MAX_WIDTH / width;
                          width = MAX_WIDTH;
                    break;
                  }
            break;
            case (height > MAX_HEIGHT):
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
            break;
     
        }
        
        var canvas = $('#photoedit')[0];
     
        canvas.width = width;
        canvas.height = height;
        
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
     
        switch (transform) {
     
            case ('left'):
                  ctx.setTransform(0, -1, 1, 0, 0, height);
                  // ctx.drawImage(img, 0, 0, height, width);
                  ctx.drawImage(img, 0, 0, 100, 100);
            break;
            case ('right'):
                  ctx.setTransform(0, 1, -1, 0, width, 0);
                  // ctx.drawImage(img, 0, 0, height, width);
                  ctx.drawImage(img, 0, 0, 100, 100);
            break;
            case ('flip'):
                  ctx.setTransform(1, 0, 0, -1, 0, height);
                  // ctx.drawImage(img, 0, 0, width, height);
                  ctx.drawImage(img, 0, 0, 100, 100);
            default:
                  ctx.setTransform(1, 0, 0, 1, 0, 0);
                  // ctx.drawImage(img, 0, 0, width, height);
                  ctx.drawImage(img, 0, 0, 100, 100);
        }
     
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        } 
        };
        binaryReader.readAsArrayBuffer(imageFile);
    };
 
};









    //     $scope.file_changed = function(){
    //         binaryReader.onloadend=function(d) {
    //         var exif, transform = "none";
    //         exif=EXIF.readFromBinaryFile(createBinaryFile(d.target.result));
         
    //         if(typeof exif != 'undefined') {
         
    //             switch (exif.Orientation) {
             
    //               case  8:
    //                     width = img.height;
    //                     height = img.width;
    //                     transform = "left";
    //               break;
    //               case  6:
    //                     width = img.height;
    //                     height = img.width;
    //                     transform = "right";
    //               break;
    //               case  1:
    //                     width = img.width;
    //                     height = img.height;
    //               break;
    //               case  3:
    //                     width = img.height;
    //                     height = img.width;
    //                     transform = "flip";
    //               break;
             
    //               default:
    //                     width = img.width;
    //                     height = img.height;
                 
    //             } 
    //         }
    //                 var canvas = $('#photoedit')[0];
         
    //         canvas.width = width;
    //         canvas.height = height;
            
    //         var ctx = canvas.getContext("2d");
    //         ctx.fillStyle = 'white';
    //         ctx.fillRect(0, 0, canvas.width, canvas.height);
         
    //         switch (transform) {
         
    //             case ('left'):
    //                   ctx.setTransform(0, -1, 1, 0, 0, height);
    //                   // ctx.drawImage(img, 0, 0, height, width);
    //                   ctx.drawImage(img, 0, 0, 100, 100);
    //             break;
    //             case ('right'):
    //                   ctx.setTransform(0, 1, -1, 0, width, 0);
    //                   // ctx.drawImage(img, 0, 0, height, width);
    //                   ctx.drawImage(img, 0, 0, 100, 100);
    //             break;
    //             case ('flip'):
    //                   ctx.setTransform(1, 0, 0, -1, 0, height);
    //                   // ctx.drawImage(img, 0, 0, width, height);
    //                   ctx.drawImage(img, 0, 0, 100, 100);
    //             default:
    //                   ctx.setTransform(1, 0, 0, 1, 0, 0);
    //                   // ctx.drawImage(img, 0, 0, width, height);
    //                   ctx.drawImage(img, 0, 0, 100, 100);
    //         }
    //         ctx.setTransform(1, 0, 0, 1, 0, 0);
    //     }
    // }
        // $scope.content = '<div>:)</div>';
        // var currentFile,
        //     result = $('#result'),
        //     displayImage = function(file, options) {
        //         currentFile = file;
        //         if (!loadImage(
        //                 file,
        //                 replaceResults,
        //                 options
        //             )) {
        //             $scope.content="<span>This browser does not support uploading images :(</span>";
        //         }
        //     },
        //     replaceResults = function (img) {
        //         if (!(img.src || img instanceof HTMLCanvasElement)) {
        //             $scope.content = $('<span>Loading image file failed</span>');
        //         } else {
        //             $scope.content = '<div>').append(img)
        //                 .attr('href', img.src || img.toDataURL());
        //         }
        //         console.log('content', $scope.content);
        //         result.children().replaceWith($scope.content);
        //     };

        // $scope.file_changed = function (e, files){
        //     e.preventDefault();
        //     e = e.originalEvent;
        //     console.log('files', files);
        //     var file = files[0],
        //         options = {
        //             maxWidth: 300,
        //             canvas: true
        //         };
        //     if (!file) {
        //         return;
        //     }
        //     // exifNode.hide();
        //     // thumbNode.hide();
        //     loadImage.parseMetaData(file, function (data) {
        //         if (data.exif) {
        //             options.orientation = data.exif.get('Orientation');
        //         }
        //         displayImage(file, options);
        //     });
        // }

        // var result = $('#result'),
        //     // thumbNode = $('#thumbnail'),
        //     actionsNode = $('#actions'),
        //     // currentFile,
        //     replaceResults = function (img) {
        //         var content;
        //         if (!(img.src || img instanceof HTMLCanvasElement)) {
        //             content = $('<span>Loading image file failed</span>');
        //         } else {
        //             content = $('<a target="_blank">').append(img)
        //                 .attr('download', currentFile.name)
        //                 .attr('href', img.src || img.toDataURL());
        //         }
        //         result.children().replaceWith(content);
        //         if (img.getContext) {
        //             actionsNode.show();
        //         }
        //     },
        //     displayImage = function (file, options) {
        //         currentFile = file;
        //         if (!loadImage(
        //                 file,
        //                 replaceResults,
        //                 options
        //             )) {
        //             result.children().replaceWith(
        //                 $('<span>Your browser does not support the URL or FileReader API.</span>')
        //             );
        //         }
        //     },
        //     displayExifData = function (exif) {
        //         var thumbnail = exif.get('Thumbnail'),
        //             tags = exif.getAll(),
        //             table = exifNode.find('table').empty(),
        //             row = $('<tr></tr>'),
        //             cell = $('<td></td>'),
        //             prop;
        //         if (thumbnail) {
        //             thumbNode.empty();
        //             loadImage(thumbnail, function (img) {
        //                 thumbNode.append(img).show();
        //             }, {orientation: exif.get('Orientation')});
        //         }
        //         for (prop in tags) {
        //             if (tags.hasOwnProperty(prop)) {
        //                 table.append(
        //                     row.clone()
        //                         .append(cell.clone().text(prop))
        //                         .append(cell.clone().text(tags[prop]))
        //                 );
        //             }
        //         }
        //         exifNode.show();
        //     },
        //     dropChangeHandler = function (e) {
        //         e.preventDefault();
        //         e = e.originalEvent;
        //         var target = e.dataTransfer || e.target,
        //             file = target && target.files && target.files[0],
        //             options = {
        //                 maxWidth: result.width(),
        //                 canvas: true
        //             };
        //         if (!file) {
        //             return;
        //         }
        //         exifNode.hide();
        //         thumbNode.hide();
        //         loadImage.parseMetaData(file, function (data) {
        //             if (data.exif) {
        //                 options.orientation = data.exif.get('Orientation');
        //                 displayExifData(data.exif);
        //             }
        //             displayImage(file, options);
        //         });
        //     },
        //     coordinates;
        // Hide URL/FileReader API requirement message in capable browsers:
        // if (window.createObjectURL || window.URL || window.webkitURL || window.FileReader) {
        //     result.children().hide();
        // }
        // $(document)
        //     .on('dragover', function (e) {
        //         e.preventDefault();
        //         e = e.originalEvent;
        //         e.dataTransfer.dropEffect = 'copy';
        //     })
        //     .on('drop', dropChangeHandler);
        // $('#file-input').on('change', dropChangeHandler);
        // $('#edit').on('click', function (event) {
        //     var imgNode = result.find('img, canvas'),
        //         img = imgNode[0];
        //     imgNode.Jcrop({
        //         setSelect: [40, 40, img.width - 40, img.height - 40],
        //         onSelect: function (coords) {
        //             coordinates = coords;
        //         },
        //         onRelease: function () {
        //             coordinates = null;
        //         }
        //     }).parent().on('click', function (event) {
        //         event.preventDefault();
        //     });
        // });
        // $('#crop').on('click', function (event) {
        //     event.preventDefault();
        //     var img = result.find('img, canvas')[0];
        //     if (img && coordinates) {
        //         replaceResults(loadImage.scale(img, {
        //             left: coordinates.x,
        //             top: coordinates.y,
        //             sourceWidth: coordinates.w,
        //             sourceHeight: coordinates.h,
        //             minWidth: result.width()
        //         }));
        //         coordinates = null;
        //     }
        // });

    // });
    });