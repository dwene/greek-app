'use strict';

angular.module('aj.crop', [])
  .directive('imgCropped', function($window) {
    var bounds = {}
      ;

    return {
      restrict: 'E',
      replace: true,
      scope: { src:'=', selected:'&', ratio:'=?' },
      //link: function (scope, element, attr) {
      link: function (scope, element) {
        var myImg
          , clear = function() {
              if (myImg) {
                myImg.next().remove();
                myImg.remove();
                myImg = undefined;
              }
            }
          ;

        scope.$watch('src', function (nv) {
          clear();

          //console.log('[src]');
          //console.log(nv);
          if (!nv) { // newValue
            return;
          }

          element.after('<img/>');
          myImg = element.next();
          myImg.attr('src', nv);
          $window.jQuery(myImg).Jcrop(
            { trackDocument: true
            , onSelect: function(cords) {
                scope.$apply(function() {
                  cords.bx = bounds.x;
                  cords.by = bounds.y;
                  scope.selected({cords: cords});
                });
              }
            , aspectRatio: scope.ratio || 1
            , boxWidth: 240
            }
          , function () {
              // Use the API to get the real image size  
              var boundsArr = this.getBounds();
              bounds.x = boundsArr[0];
              bounds.y = boundsArr[1];
            }
          );
        });
        
        scope.$on('$destroy', clear);
      }
    };
  });

// TODO create proper module
angular.module('App')
  .factory("fileReader", function ($q) {
    var onLoad = function (reader, deferred, Sscope) {
      return function () {
        Sscope.$apply(function () {
        checkEXIFData(reader.result).then(function (result_2){
          deferred.resolve(result_2);
        })
        });
      };
    };
    var onError = function (reader, deferred, Sscope) {
      return function () {
        Sscope.$apply(function () {
          deferred.reject(reader.result);
        });
      };
    };
    var onProgress = function (reader, Sscope) {
      return function (event) {
        Sscope.$broadcast(
          "fileProgress"
        , { total: event.total
          , loaded: event.loaded
          }
        );
      };
    };
    var getReader = function (deferred, Sscope) {
      var reader = new FileReader();
      reader.onload = onLoad(reader, deferred, Sscope);
      reader.onerror = onError(reader, deferred, Sscope);
      reader.onprogress = onProgress(reader, Sscope);
      return reader;
    };
    var checkEXIFData = function(result){
      var bin = atob(result.split(',')[1]);
      var exif = EXIF.readFromBinaryFile(new BinaryFile(bin));
      var orientation = exif.Orientation;
      var new_result;
      var deferred = $q.defer();
      if (orientation){
          var transform;
          var img = new Image();
          img.src = result;
          img.onload = function(){
            var canvas = document.createElement('canvas');
            switch (orientation) {
              case  8:
                    canvas.width = img.height;
                    canvas.height = img.width;
                    transform = "left";
              break;
              case  6:
                    canvas.width = img.height;
                    canvas.height = img.width;
                    transform = "right";
              break;
              case  1:
                    canvas.width = img.width;
                    canvas.height = img.height;
              break;
              case  3:
                    canvas.width = img.height;
                    canvas.height = img.width;
                    transform = "flip";
              break;
         
              default:
                    width = img.width;
                    height = img.height;
            }
            var ctx = canvas.getContext("2d");
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
           // console.log('transform', transform);
            switch (transform) {
         
                case ('left'):
                      ctx.setTransform(0, -1, 1, 0, 0, canvas.height);
                      ctx.drawImage(img, 0, 0, canvas.height, canvas.width);
                      
                break;
                case ('right'):
                      ctx.setTransform(0, 1, -1, 0, canvas.width, 0);
                      ctx.drawImage(img, 0, 0, canvas.height, canvas.width);
                      // ctx.drawImage(img, 0, 0, 100, 100);
                break;
                case ('flip'):
                      ctx.setTransform(1, 0, 0, -1, 0, canvas.height);
                      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                      // ctx.drawImage(img, 0, 0, 100, 100);
                default:
                      ctx.setTransform(1, 0, 0, 1, 0, 0);
                      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                      // ctx.drawImage(img, 0, 0, 100, 100);
            }
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          new_result = canvas.toDataURL();
          canvas.remove();
          img.remove();
          //console.log('new result a', new_result);
          deferred.resolve(new_result);
          }
        }
        else{
          deferred.resolve(result);
        }
        return deferred.promise;
    }
    var readAsDataURL = function (file, Sscope) {
      var deferred = $q.defer();
      var reader = getReader(deferred, Sscope);
      reader.readAsDataURL(file);
      return deferred.promise;
    };
    return { readAsDataUrl: readAsDataURL };
  });

angular.module('App').directive("ajFileSelect", function () {
  return {
    scope: {
      "ajChange": "&ajChange"
    , "ajModel": "=ajModel"
    }
  , link: function(dirScope, el) {
      el.bind("change", function(e) {
        console.log(e.currentTarget.files[0]);
        dirScope.ajModel.file = (e.srcElement || e.target || e.currentTarget).files[0];
        console.log('ajFileSelect about to call getFile()', dirScope.ajModel);
        dirScope.ajChange();
      });
    }
  };
});

angular.module('App')
  .controller('ProfilePicCtrl', function ($window, $timeout, $scope, fileReader) {
    var scope = this
      ;
    scope.file = {};
    scope.getFile = function () {
        scope.cropData = false;
        $scope.cropped = false;
      $scope.progress = 0;
      
      $scope.loading_image = true;
      fileReader.readAsDataUrl(scope.file.file, $scope).then(function (result) {
        //console.log('readAsDataUrl: result.length === ', result.length);
        //console.log(result);
        // var bin = atob(result.split(',')[1]);
        // var exif = EXIF.readFromBinaryFile(new BinaryFile(bin));
        // // alert(exif.Orientation);
        // console.log('about to enter if');
        // var new_result;

        // if (exif.Orientation){
        //   var transform;
        //   var img = new Image();
        //   img.src = result;
        //   img.onload = function(){
        //     var canvas = document.createElement('canvas');
        //     switch (exif.Orientation) {
        //       case  8:
        //             canvas.width = img.height;
        //             canvas.height = img.width;
        //             transform = "left";
        //       break;
        //       case  6:
        //             canvas.width = img.height;
        //             canvas.height = img.width;
        //             transform = "right";
        //       break;
        //       case  1:
        //             canvas.width = img.width;
        //             canvas.height = img.height;
        //       break;
        //       case  3:
        //             canvas.width = img.height;
        //             canvas.height = img.width;
        //             transform = "flip";
        //       break;
         
        //       default:
        //             width = img.width;
        //             height = img.height;
        //     }

        //     var ctx = canvas.getContext("2d");
        //     ctx.fillStyle = 'white';
        //     ctx.fillRect(0, 0, canvas.width, canvas.height);
        //     console.log('transform', transform);
        //     switch (transform) {
         
        //         case ('left'):
        //               ctx.setTransform(0, -1, 1, 0, 0, canvas.height);
        //               ctx.drawImage(img, 0, 0, canvas.height, canvas.width);
                      
        //         break;
        //         case ('flip'):
        //               ctx.setTransform(0, 1, -1, 0, canvas.width, 0);
        //               ctx.drawImage(img, 0, 0, canvas.height, canvas.width);
        //               // ctx.drawImage(img, 0, 0, 100, 100);
        //         break;
        //         case ('right'):
        //               ctx.setTransform(1, 0, 0, -1, 0, canvas.height);
        //               ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        //               // ctx.drawImage(img, 0, 0, 100, 100);
        //         default:
        //               ctx.setTransform(1, 0, 0, 1, 0, 0);
        //               ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        //               // ctx.drawImage(img, 0, 0, 100, 100);
        //     }
        //   //ctx.setTransform(1, 0, 0, 1, 0, 0);
        //   new_result = canvas.toDataURL();
        //   console.log('this new result', new_result);
        //   canvas.remove();
        //   }
        //   img.remove();
        // }
        // checkEXIFData(result, exif.Orientation);
        // console.log('new_result', good_stuff);
        //console.log('here is the result', result);
        $scope.loading_image = false;
        scope.imageSrc = result;
        $scope.imageSrc = result;
        $timeout(function(){
          //scope.initJcrop();
        });
      });
    };


    $scope.rotateImage = function(direction){
            var new_result;
            var transform;
            var img = new Image();
            img.src = $scope.imageSrc;
            img.onload = function(){
              var canvas = document.createElement('canvas');
              switch (direction) {
                case  "left":
                      canvas.width = img.height;
                      canvas.height = img.width;
                      transform = "left";
                break;
                case  "right":
                      canvas.width = img.height;
                      canvas.height = img.width;
                      transform = "right";
                break;
                default:
                      canvas.width = img.width;
                      canvas.height = img.height;
              }
              var ctx = canvas.getContext("2d");
              ctx.fillStyle = 'white';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
             // console.log('transform', transform);
              switch (transform) {
                  case ('left'):
                        ctx.setTransform(0, -1, 1, 0, 0, canvas.height);
                        ctx.drawImage(img, 0, 0, canvas.height, canvas.width);
                        
                  break;
                  case ('right'):
                        ctx.setTransform(0, 1, -1, 0, canvas.width, 0);
                        ctx.drawImage(img, 0, 0, canvas.height, canvas.width);
                        // ctx.drawImage(img, 0, 0, 100, 100);
                  break;
                  case ('flip'):
                        ctx.setTransform(1, 0, 0, -1, 0, canvas.height);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        // ctx.drawImage(img, 0, 0, 100, 100);
                  default:
                        ctx.setTransform(1, 0, 0, 1, 0, 0);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        // ctx.drawImage(img, 0, 0, 100, 100);
              }
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            new_result = canvas.toDataURL();
            canvas.remove();
            img.remove();
            $scope.imageSrc = new_result;
            scope.imageSrc = new_result;
            $timeout(function(){
              $scope.cropped = false;
              scope.initJcrop();
            })   
        }
    }

    $scope.$on("fileProgress", function(e, progress) {
      $scope.progress = progress.loaded / progress.total;
    });

    scope.initJcrop = function () {

      console.log('init jcrop');
      $window.jQuery('img.aj-crop').Jcrop({
        onSelect: function () {
          //$scope.$apply();
          console.log('onSelect', arguments);
        }
      , onChange: function () {
          //$scope.$apply();
          console.log('onChange', arguments);
        }
      , trackDocument: true
      , aspectRatio: scope.ratio || 1
      });
    };

    // http://plnkr.co/edit/Iizykd7UORy3po1h5mfm?p=preview
    scope.cropOpts = {
      ratioW: 1
    , ratioH: 1
    };
    $scope.selected = function (cords) {
      var scale
        ;

      scope.picWidth = cords.w;
      scope.picHeight = cords.h;

      console.log('scale');
      if (scope.picWidth > 240) {
        scale = (240 / scope.picWidth);
        console.log(scope.picHeight);
        scope.picHeight *= scale;
        scope.picWidth *= scale;
        console.log(scale);
      }

      if (scope.picHeight > 240) {
        scale = (240 / scope.picHeight);
        scope.picHeight *= scale;
        scope.picWidth *= scale;
        console.log(scale);
      }

      console.log('[cords]', scope.picWidth / scope.picHeight);
      console.log(cords);
      scope.cropData = JSON.stringify(cords);
      $scope.cropped = true;

      var rx = scope.picWidth / cords.w
        , ry = scope.picHeight / cords.h
        , canvas = document.createElement("canvas")
        , context = canvas.getContext('2d')
        , imageObj = $window.jQuery('img#preview')[0]
        ;

      //$window.jQuery('.canvas-preview').children().remove();
      // context.translate(cords.w/2, cords.h/2);
      // context.rotate(90 * (Math.PI/180));
      canvas.width = cords.w;
      canvas.height = cords.h;
      // context.clearRect(0,0,canvas.width,canvas.height);
      // context.save();
      // context.translate(canvas.width/2,canvas.height/2);

      // // rotate the canvas to the specified degrees
      // context.rotate(90*Math.PI/180);

      // // draw the image
      // // since the context is rotated, the image will be rotated also
      // context.drawImage(imageObj,-canvas.width/2,-canvas.height/2);

      // // we’re done with the rotating so restore the unrotated context
      // context.restore();


      //context.drawImage(imageObj, cords.x, cords.y, cords.w, cords.h, 0, 0, cords.w, cords.h);
      //context.drawImage(imageObj, 0, 0);
      //$window.jQuery('.canvas-preview').append(canvas);

      $window.jQuery('img#preview').css({
        width: Math.round(rx * cords.bx) + 'px',
        height: Math.round(ry * cords.by) + 'px',
        marginLeft: '-' + Math.round(rx * cords.x) + 'px',
        marginTop: '-' + Math.round(ry * cords.y) + 'px'
          
      });



    };
  });
    // function checkEXIFData($q, result){
    //   var bin = atob(reader.result.split(',')[1]);
    //   var exif = EXIF.readFromBinaryFile(new BinaryFile(bin));
    //   var orientation = exif.Orientation;
    //   var new_result;
    //   var deferred = $q.defer();
    //   if (orientation){
    //       var transform;
    //       var img = new Image();
    //       img.src = result;
    //       img.onload = function(){
    //         var canvas = document.createElement('canvas');
    //         switch (orientation) {
    //           case  8:
    //                 canvas.width = img.height;
    //                 canvas.height = img.width;
    //                 transform = "left";
    //           break;
    //           case  6:
    //                 canvas.width = img.height;
    //                 canvas.height = img.width;
    //                 transform = "right";
    //           break;
    //           case  1:
    //                 canvas.width = img.width;
    //                 canvas.height = img.height;
    //           break;
    //           case  3:
    //                 canvas.width = img.height;
    //                 canvas.height = img.width;
    //                 transform = "flip";
    //           break;
         
    //           default:
    //                 width = img.width;
    //                 height = img.height;
    //         }
    //         var ctx = canvas.getContext("2d");
    //         ctx.fillStyle = 'white';
    //         ctx.fillRect(0, 0, canvas.width, canvas.height);
    //         console.log('transform', transform);
    //         switch (transform) {
         
    //             case ('left'):
    //                   ctx.setTransform(0, -1, 1, 0, 0, canvas.height);
    //                   ctx.drawImage(img, 0, 0, canvas.height, canvas.width);
                      
    //             break;
    //             case ('flip'):
    //                   ctx.setTransform(0, 1, -1, 0, canvas.width, 0);
    //                   ctx.drawImage(img, 0, 0, canvas.height, canvas.width);
    //                   // ctx.drawImage(img, 0, 0, 100, 100);
    //             break;
    //             case ('right'):
    //                   ctx.setTransform(1, 0, 0, -1, 0, canvas.height);
    //                   ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    //                   // ctx.drawImage(img, 0, 0, 100, 100);
    //             default:
    //                   ctx.setTransform(1, 0, 0, 1, 0, 0);
    //                   ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    //                   // ctx.drawImage(img, 0, 0, 100, 100);
    //         }
    //       ctx.setTransform(1, 0, 0, 1, 0, 0);
    //       new_result = canvas.toDataURL();
    //       canvas.remove();
    //       img.remove();
    //       console.log('new result a', new_result);
    //       deferred.resolve(new_result);
    //       }
    //     }
    //     else{
    //       deferred.resolve(result);
    //     }
    //     return deferred.promise;
    // }
