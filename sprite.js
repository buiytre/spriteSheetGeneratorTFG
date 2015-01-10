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
    this.maxWidth = 0;
    this.maxHeight = 0;
    this.minInterval = 100;

    this.canvasTmpExportAnimation = null;
    this.timeCanvasAnimToExport = null;
    this.timeEncoderToExport = null;
    this.nExport = 0;
    this.finishedLoop = false;
    this.encoder = null;
    this.encoderEnd = false;
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
    if (this.maxWidth < frame.width) this.maxWidth = frame.width;
    if (this.maxHeight < frame.height) this.maxHeight = frame.height;
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
    this.recalculateMaxWidthHeight();
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
    this.recalculateMaxWidthHeight();
    this.recalculateMinInterval();
};

Sprite.prototype.recalculateMaxWidthHeight = function(){
    this.maxWidth = 0;
    this.maxHeight = 0;
    for (var i=0; i < this.frameList.length; i++){
        if (this.maxWidth < this.frameList[i].width) this.maxWidth = this.frameList[i].width;
        if (this.maxHeight < this.frameList[i].height) this.maxHeight = this.frameList[i].height;
    }
};

Sprite.prototype.recalculateMinInterval = function(){
    this.minInterval = this.timeMs[0];
    for (var i = 1; i < this.timeMs.length; i++){
        if (this.timeMs[i] < this.minInterval) this.minInterval = this.timeMs[i];
    }
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
    this.recalculateMinInterval();
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
    if (this.n >= this.frameList.length) this.n = 0;
    this.paintNextFrame(ctx, this.n);
    var time = this.timeMs[this.n];
    this.n = this.n+1;
    this.timeAnimationInverval = setTimeout(this.doPaintAnimation.bind(this), time);
};

Sprite.prototype.paintNextFrame = function(ctx, nFrame){
    var fr = this.frameList[nFrame];
    var position = this.pos[nFrame];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.drawImage(fr.getImageFrame(), 0, 0);
    ctx.restore();
};

Sprite.prototype.stopAnimation = function(){
    clearTimeout(this.timeAnimationInverval);
};

Sprite.prototype.getMaxWidth = function(){
    return this.maxWidth;
};

Sprite.prototype.getMaxHeight = function(){
    return this.maxHeight;
};

Sprite.prototype.stopExportToGif = function(){
    if (this.timeCanvasAnimToExport != null) clearTimeout(this.timeCanvasAnimToExport);
    if (this.timeEncoderToExport != null) clearInterval(this.timeEncoderToExport);
};

Sprite.prototype.doPaintExportAnimation = function(){
    if (this.timeCanvasAnimToExport != null) clearTimeout(this.timeCanvasAnimToExport);
    var ctx = this.canvasTmpExportAnimation.getContext('2d');
    if (this.nExport < this.frameList.length){
        this.paintNextFrame(ctx, this.nExport);
        var time = this.timeMs[this.nExport];
        this.encoder.addFrame(ctx);
        this.nExport = this.nExport + 1;
        this.timeCanvasAnimToExport = setTimeout(this.doPaintExportAnimation.bind(this),time);
    }else{
        this.finishedLoop = true;
    }
};

Sprite.prototype.doEncoderExportAnimation = function(){
    if (!this.finishedLoop){
        var ctx = this.canvasTmpExportAnimation.getContext('2d');
        this.encoder.addFrame(ctx);
    }else{
        this.encoder.finish();
        this.encoderEnd = true;
        this.stopExportToGif();
    }
};

Sprite.prototype.exportToGif = function(){
    this.canvasTmpExportAnimation = document.createElement("canvas");
    this.canvasTmpExportAnimation.width = this.maxWidth;
    this.canvasTmpExportAnimation.height = this.maxHeight;
    this.finishedLoop = false;
    this.encoderEnd = false;
    this.stopExportToGif();
    this.nExport = 0;

    this.encoder = new GIFEncoder();
    this.encoder.setRepeat(0);
    this.encoder.setDelay(this.minInterval); //go to next frame every n milliseconds
    this.encoder.setSize(this.maxWidth,this.maxHeight);
    this.encoder.start();

    this.timeEncoderToExport = setInterval(this.doEncoderExportAnimation.bind(this),this.minInterval);
    this.doPaintExportAnimation();
};

Sprite.prototype.getResultGif = function(){
    if (!this.encoderEnd) return -1;
    var binary_gif = this.encoder.stream().getData(); //notice this is different from the as3gif package!
    var data_url = 'data:image/gif;base64,'+encode64(binary_gif);
    return data_url;
};