/**
 * Created with Vim7.3 ubuntu12.04
 * @fileOverview : 
 * @author : Lyle <lylechen2014@gmial.com>
 * @since : 2015-01-21 11:30:29
 * @filename : peasUpload.js
 * @version :  上传前压缩，修正部分位置问题
 * @description : 
 */

;(function($){
      //构造函数
      $.uploadCanvas = function() {

             this.settings = {
                 type: 'image',
                 maxSize: 3072000,
                 url :'upload.php',
                 uploadBefore : null,
                 uploadSuccess : function(){console.log('upload success')},
                 uploadError : function(){console.log('upload error')}
             };

             this.upload = function(e,options) {
                 this.dependEnv();
                 this.settings = $.extend(this.settings, options);
                 var file = this.getFile(e);
                 if (this.filterFile(file)) {
                     this.fileRead(file); 
                 }
             };

             this.dependEnv = function() {
                  try{
                       var canvas = document.createElement("canvas"),
                           ctx = canvas.getContext('2d');
                  } catch(err){
                       this.errorLog("html5 canvas is not supported! upload, upload rely it.");   
                       return;     
                  }
             };

             this.getFile = function(e) {
                  return  e.target.files[0];
             };            

             this.filterFile = function(file) {
                  var bool = true;
                  if (file.type.indexOf(this.settings.type) == 0) {
                        if (file.size >= this.settings.maxSize) {
                            bool = false; 
                            this.errorLog('This photo should be less than '+this.settings.maxSize/1000+'KB.');  
                        }           
                  } else {
                        bool = false; 
                        this.errorLog('This photo is not in the image.');
                  } 
                  return bool;
             };

             this.errorLog = function(error) {
                  alert(error);
             };

             this.fileRead = function(file) {
                  var tthis = this,
                      reader = new FileReader();
 
			          reader.readAsDataURL(file); 
                      reader.onload = function(e){
                            tthis.createImg(e);
                      };
                      reader.onError = function(e) {
                            tthis.errorLog("This photo can not be resolved!");
                            return;
                      }; 

             };

             this.createImg = function(e) {
                      var tthis = this,
                          dataURL = e.target.result,
                          img = new Image();
                          
                          img.src = dataURL;
                          img.onload = function(e) {
                              tthis.exifImg(this);
                          };
                          img.onerror = function() {
                              tthis.errorLog("This photo not as the image object loads!");
                              return;
                          }
             }; 

             this.exifImg = function(img) {
                   var tthis = this;
                   EXIF.getData(img, function(){
                        var exifInfo = EXIF.getAllTags(this);
                        tthis.importCanvas(img,exifInfo);
                   }); 
             };
 
             this.importCanvas = function(img,exifInfo) {
                   var base64,rotate = 0,
                       orientation = exifInfo.Orientation, 
                       canvas = document.createElement("canvas"),
                       ctx = canvas.getContext('2d');
                       if (orientation == 3) {
                            rotate = 180;
                            canvas.width = img.height;                                   
                            canvas.height = img.width;
                            ctx.translate(canvas.width,canvas.height);
                       } else if (orientation == 6) {
                            rotate = 90;
                            canvas.width = img.height;                                   
                            canvas.height = img.width;                                        
                            ctx.translate(canvas.width,0);
                       } else if (orientation == 8) {
                            rotate = 270;
                            canvas.width = img.height;                                   
                            canvas.height = img.width;                                        
                            ctx.translate(0,canvas.height);
                       } else {
                            canvas.width = img.width;                                   
                            canvas.height = img.height;   
                       };

                       if (exifInfo.Orientation) {
                           exifInfo.Orientation = 1;
                       }
                       ctx.clearRect(0, 0, canvas.width, canvas.height);                              
                       ctx.rotate(rotate * Math.PI / 180);  
                       ctx.drawImage(img, 0, 0);
                       ctx.save();
                       base64 = canvas.toDataURL('image/jpeg',0.5);
                       $('body').append('<img width=400 src="'+base64+'">');
                       this.uploadToServer(base64,exifInfo);
             };
          
             this.uploadToServer = function(base64,exifInfo) {
                   var tthis = this;
                   $.ajax({
                       url : this.settings.url,
                       type : 'POST',
                       data : {base64:base64,exif:exifInfo},
                       success : function() {
                            if (tthis.settings.uploadSuccess) {
                                tthis.settings.uploadSuccess(); 
                            }
                       },
                       error : function(xhr, errorType, error) {
                            if (tthis.settings.uploadError) {
                                tthis.settings.uploadError(); 
                            }
                       }
                   });
             }; 

          };

})($)

