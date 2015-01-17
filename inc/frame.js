/**
 *  Esta clase Frame contiene información sobre un frame de una animación
 *  @author: Ignacio Soto Alsina
 *  @version: 27/11/2014
 */


/**
 *
 * @param img El src de una imagen con la que se creara el frame
 * @constructor Construye un frame a partir de una imagen
 */
var Frame = function(img){
    this.image = document.createElement("IMG");
    this.image.src = img;
    this.width = this.image.width ;
    this.height = this.image.height;
};

/**
 * Metodo que devuelve la imagen del frame
 * @returns {HTMLElement|*}
 */
Frame.prototype.getImageFrame = function(){
    return this.image;
};

/**
 *  Metodo que descarga en el navegador del usuario la imagen del frame
 */
Frame.prototype.downloadFrame = function(){
    window.open(this.image.src);
};

Frame.prototype.eval = function(pixelOrig, imageDataOrig, pixelDest, imageDataDest){
    var pixelCoordOrig = pixelOrig.x*4+pixelOrig.y*imageDataOrig.width*4;
    var redOrig = imageDataOrig.data[pixelCoordOrig];
    var greenOrig = imageDataOrig.data[pixelCoordOrig+1];
    var blueOrig = imageDataOrig.data[pixelCoordOrig+2];
    var alphaOrig = imageDataOrig.data[pixelCoordOrig+3];
    var pixelCoordDest = pixelDest.x*4+pixelDest.y*imageDataDest.width*4;
    var redDest = imageDataDest.data[pixelCoordDest];
    var greenDest = imageDataDest.data[pixelCoordDest+1];
    var blueDest = imageDataDest.data[pixelCoordDest+2];
    var alphaDest = imageDataDest.data[pixelCoordDest+3];
    var diff = Math.abs(redDest - redOrig) + Math.abs(greenDest - greenOrig) + Math.abs(blueDest - blueOrig) + Math.abs(alphaDest - alphaOrig);
    return diff / (255*4);
};


Frame.prototype.isPointAround = function(point,dataOrig,dataDest){
    var diff = 0;
    var numPointsCompared = 0;
    for (var x=point.x-1; x < point.x+1; x++){
        for (var y=point.y-1; y < point.y+1; y++){
            if (y >= 0 && y < dataDest.height && x >= 0 && x < dataDest.width){
                numPointsCompared++;
                diff = diff + this.eval(point, dataOrig, new Point(x,y),dataDest);
            }
        }
    }
    return diff / numPointsCompared;
};


Frame.prototype.compareWith = function(canvas,x,y){
    var ctx = canvas.getContext('2d');
    var dataDest = ctx.getImageData(0,0,canvas.width,canvas.height);

    var canvThisImage = document.createElement('canvas');
    canvThisImage.width = canvas.width;
    canvThisImage.height = canvas.height;
    ctx = canvThisImage.getContext('2d');
    ctx.clearRect(0,0,canvThisImage.width,canvThisImage.height);
    ctx.drawImage(this.image,x,y);
    var dataOrig = ctx.getImageData(0,0,canvThisImage.width, canvThisImage.height);

    var diff = 0;
    for (var x=0; x<dataOrig.width; x++){
        for (var y=0; y<dataOrig.height; y++){
            diff = diff + this.isPointAround(new Point(x,y),dataOrig,dataDest);
        }
    }

    return (diff / (dataOrig.width * dataOrig.height));
};