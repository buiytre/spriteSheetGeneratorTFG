/**
 *  Esta clase sprite contiene información sobre un sprite como los frames que tienen
 *  @author: Ignacio Soto Alsina
 *  @version: 27/11/2014
 */

/**
 *
 * @constructor
 */
var Sprite = function(name){
    this.n = 0;
    this.frameList = new Array();
    this.name = name;
};

/**
 * metodo que añade un frame al framelist
 * @param frame Frame a añadir al sprite
 */
Sprite.prototype.addFrame = function (frame){
    this.frameList[this.frameList.length] = frame;
};

/**
 * metodo que devuelve el nombre del sprite
 * @returns {String}
 */
Sprite.prototype.getName = function(){
    return this.name;
};

/**
 * Reemplaza el frame en la posicion n por el frame indicado
 * @param frame frame que sustituira al antiguo
 * @param n posicion del frame a sustituir
 */
Sprite.prototype.replaceFrame = function(frame, n){
    if (this.frameList.length <= n) throw "The sprite not contains frame number "+n;
    this.frameList[this.frameList.length] = frame;
};

/**
 * Elimina un frame del sprite
 * @param n Entero que indica la posición del sprite a eliminar
 */
Sprite.prototype.delFrame = function(n){
    if (this.frameList.length <= n) throw "The sprite not contains frame number "+n;
    this.frameList.splice(n,n);
};

/**
 * metodo que devuelve el siguiente frame en una animación
 * @returns {Frame}
 */
Sprite.prototype.getNextFrame = function(){
    if (this.frameList.length == 0){
        throw "The sprite not contains any frame";
    }
    if (this.n >= this.frameList.length) {
        this.n = this.frameList.length - 1;
    }
    return this.frameList[this.n++];
};

Sprite.prototype.hasNextFrame = function(){
    var hasNext = true;
    console.log("N: " + this.n + "/" + this.frameList.length );
    if (this.n >= this.frameList.length){
          hasNext = false;
    }
    return hasNext;
};
/**
 * metodo que devuelve el frame de la posición n
 * @param n entero que indica la posición del frame a recibir
 * @returns {Frame} frame en la posición n
 */
Sprite.prototype.getFrame = function(n){
    if (this.frameList.length <= n) throw "The sprite not contains frame number "+n;
    return this.frameList[n];
};

/**
 *  metodo que resetea la animación al primer frame
 */
Sprite.prototype.resetAnimation = function(){
    this.n = 0;
};