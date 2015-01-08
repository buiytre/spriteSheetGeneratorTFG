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
    this.pos = new Array();
    this.timeMs = new Array();
    this.name = name;
    this.timeAnimationInverval = null;
    this.canvasAnimation = null;
};

/**
 * metodo que añade un frame al framelist
 * @param frame Frame a añadir al sprite
 */
Sprite.prototype.addFrame = function (frame){
    this.frameList[this.frameList.length] = frame;
    var point = new Point();
    point.x = 0;
    point.y = 0;
    this.pos[this.pos.length] = point;
    this.timeMs[this.timeMs.length] = 100;

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
    this.frameList[n] = frame;
};

/**
 * Elimina un frame del sprite
 * @param n Entero que indica la posición del sprite a eliminar
 */
Sprite.prototype.delFrame = function(n){
    if (this.frameList.length <= n) throw "The sprite not contains frame number "+n;
    this.frameList.splice(n,n);
    this.pos.splice(n,n);
    this.timeMs.splice(n,n);
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

Sprite.prototype.getMs = function(n){
    if (this.timeMs.length <= n) throw "The sprite not contains frame number "+n;
    return this.timeMs[n];
};

Sprite.prototype.getPositionFrame = function(n){
    if (this.pos.length <= n) throw "The sprite not contains frame number "+n;
    return this.pos[n];
};

Sprite.prototype.setMs = function(n, ms){
    if (this.timeMs.length <= n) throw "The sprite not contains frame number "+n;
    this.timeMs[n] = ms;
};

Sprite.prototype.setPositionFrame = function(n, pos){
    if (this.pos.length <= n) throw "The sprite not contains frame number "+n;
    this.pos[n].x = pos.x;
    this.pos[n].y = pos.y;
};

Sprite.prototype.existsFrame = function(n){
    if (this.frameList.length <= n) return false;
    else return true;
};

/**
 *  metodo que resetea la animación al primer frame
 */
Sprite.prototype.resetAnimation = function(){
    this.n = 0;
};

Sprite.prototype.paintAnimation = function(canvas){
    if (this.frameList.length != 0){
        this.canvasAnimation = canvas;
        this.doPaintAnimation();
    }
};

Sprite.prototype.doPaintAnimation = function(){
    if(this.timeAnimationInverval != null) clearTimeout(this.timeAnimationInverval);
    var ctx = this.canvasAnimation.getContext('2d');
    if (this.n >= this.frameList.length) {
        this.n = 0;
    }
    var fr = this.frameList[this.n];
    var time = this.timeMs[this.n];
    var position = this.pos[this.n];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.drawImage(fr.getImageFrame(), 0, 0);
    ctx.restore();
    this.n = this.n + 1;
    this.timeAnimationInverval = setTimeout(this.doPaintAnimation.bind(this), time);
};

Sprite.prototype.stopAnimation = function(){
    clearTimeout(this.timeAnimationInverval);
};