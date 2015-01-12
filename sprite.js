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

    this.nAnimation = 0;
    this.canvasTmpExportAnimation = null;
    this.timeCanvasAnimToExport = null;
    this.nExport = 0;
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
    this.nAnimation = 0;
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
    this.nAnimation = 0;
};

/**
 * Elimina un frame del sprite
 * @param n Entero que indica la posición del sprite a eliminar
 */
Sprite.prototype.delFrame = function(n){
    if (this.frameList.length <= n) throw "The sprite not contains frame number "+n;
    this.frameList.splice(n,1);
    this.pos.splice(n,1);
    this.timeMs.splice(n,1);
    if (this.n == n) this.n = 0;
    this.recalculateMaxWidthHeight();
    this.nAnimation = 0;
};

Sprite.prototype.recalculateMaxWidthHeight = function(){
    this.maxWidth = 0;
    this.maxHeight = 0;
    for (var i=0; i < this.frameList.length; i++){
        if (this.maxWidth < this.frameList[i].width + this.pos[i].x) this.maxWidth = this.frameList[i].width + this.pos[i].x;
        if (this.maxHeight < this.frameList[i].height + this.pos[i].y) this.maxHeight = this.frameList[i].height + this.pos[i].y;
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
};

Sprite.prototype.setPositionFrame = function(n, pos){
    if (this.pos.length <= n) throw "The sprite not contains frame number "+n;
    this.pos[n].x = pos.x;
    this.pos[n].y = pos.y;
    this.recalculateMaxWidthHeight();
};

Sprite.prototype.existsFrame = function(n){
    if (this.frameList.length <= n) return false;
    else return true;
};

/**
 *  metodo que resetea la animación al primer frame
 */
Sprite.prototype.resetAnimation = function(){
    this.nAnimation = 0;
};

Sprite.prototype.paintAnimation = function(canvas){
    if (this.frameList.length != 0){
        this.canvasAnimation = canvas;
        this.doPaintAnimation();
    }else{
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,canvas.width,canvas.height);
    }
};

Sprite.prototype.resetSelection = function(){
    this.n = 0;
};

Sprite.prototype.doPaintAnimation = function(){
    if(this.timeAnimationInverval != null) clearTimeout(this.timeAnimationInverval);
    var ctx = this.canvasAnimation.getContext('2d');
    if (this.frameList.length > 0) {
        if (this.nAnimation >= this.frameList.length) this.nAnimation = 0;
        this.paintNextFrame(ctx, this.nAnimation, null);
        var time = this.timeMs[this.nAnimation];
        this.nAnimation = this.nAnimation + 1;
        this.timeAnimationInverval = setTimeout(this.doPaintAnimation.bind(this), time);
    }
};

Sprite.prototype.paintNextFrame = function(ctx, nFrame, transparency){
    var fr = this.frameList[nFrame];
    var position = this.pos[nFrame];
    if (transparency == null) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }else{
        ctx.fillStyle = transparency;
        ctx.fillRect(0,0,canvas.width, canvas.height);
    }
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.drawImage(fr.getImageFrame(), 0, 0);
    ctx.restore();
};

Sprite.prototype.stopAnimation = function(){
    if (this.timeAnimationInverval != null) clearInterval(this.timeAnimationInverval);
};

Sprite.prototype.getMaxWidth = function(){
    return this.maxWidth;
};

Sprite.prototype.getMaxHeight = function(){
    return this.maxHeight;
};

Sprite.prototype.stopExportToGif = function(){
    if (this.timeCanvasAnimToExport != null) clearTimeout(this.timeCanvasAnimToExport);
};

Sprite.prototype.doPaintExportAnimation = function(){
    if (this.timeCanvasAnimToExport != null) clearTimeout(this.timeCanvasAnimToExport);
    if (this.nExport < this.frameList.length){
        var ctx = this.canvasTmpExportAnimation.getContext('2d');
        this.paintNextFrame(ctx, this.nExport,"#00FF00");
        var time = this.timeMs[this.nExport];
        this.encoder.setDelay(time);
        this.encoder.addFrame(ctx);
        this.nExport = this.nExport + 1;
        this.timeCanvasAnimToExport = setTimeout(this.doPaintExportAnimation.bind(this),time);
    }else{
        this.encoder.finish();
        this.encoderEnd = true;
        this.canvasTmpExportAnimation = null;
    }
};

Sprite.prototype.exportToGif = function(){
    this.canvasTmpExportAnimation = document.createElement("canvas");
    this.canvasTmpExportAnimation.width = this.maxWidth;
    this.canvasTmpExportAnimation.height = this.maxHeight;
    this.encoderEnd = false;
    this.stopExportToGif();
    this.nExport = 0;
    this.encoder = new GIFEncoder();
    this.encoder.setRepeat(0);
    this.encoder.setTransparent(0x00FF00);
    this.encoder.setSize(this.maxWidth,this.maxHeight);
    this.encoder.start();
    this.doPaintExportAnimation();
};

Sprite.prototype.getResultGif = function(){
    if (!this.encoderEnd) return -1;
    var binary_gif = this.encoder.stream().getData();
    var data_url = 'data:image/gif;base64,'+encode64(binary_gif);
    return data_url;
};

Sprite.prototype.getNumberFrames = function(){
    return this.frameList.length;
};