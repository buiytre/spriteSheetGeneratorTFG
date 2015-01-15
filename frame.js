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

    var dif = 0;
    for (var i=0; i < dataOrig.data.length; i++){
        if (dataOrig.data[i] != dataDest.data[i]){
            dif++;
        }
    }
    return ((100 * dif) / dataOrig.data.length);
};