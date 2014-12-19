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