/**
 *  Esta clase spriteSheet contiene todos los sprites que puede tener un spritesheet
 *  @author: Ignacio Soto Alsina
 *  @version: 27/11/2014
 */

/**
 *
 * @constructor
 */
var Spritesheet = function(){
    this.spriteList = new Array();
    this.maxwidth = 0;
    this.maxheight = 0;
};

/**
 * Crea un nuevo sprite dentro del spritesheet
 * @param name nombre del sprite
 * @returns {int} posicion donde ha creado el sprite
 */
Spritesheet.prototype.createSprite = function(name){
    var position = this.spriteList.length;
    this.spriteList[position] = new Sprite(name);
    return position;
};

Spritesheet.prototype.addFrameToSprite = function(spriteName, frame){
    //buscar el nombre del sprite y añadir el frame
    var found = false;
    for (var i=0; i < this.spriteList.length && !found; i++){
        if (this.spriteList[i].getName() == spriteName){
            this.spriteList[i].addFrame(frame);
            found = true;
            this.maxwidth = this.maxwidth + frame.width;
            this.maxheight = this.maxheight + frame.height;
        }
    }
};

Spritesheet.prototype.paintSpritePreview = function(spriteName, canvas) {
    canvas.height = this.maxheight;
    var ctx = canvas.getContext('2d');
    var thisSprite = this.getSpriteByName(spriteName);
    if (thisSprite != null){
        thisSprite.resetAnimation();
        ctx.clearRect(0,0,canvas.width,canvas.height);
        var y = 0;
        while (thisSprite.hasNextFrame()){
            var frameTmp = thisSprite.getNextFrame();
            var image = frameTmp.getImageFrame();
            ctx.drawImage(image,0,y,image.width,image.height);
            y = y + image.height;
        }
    }
};

Spritesheet.prototype.getSpriteSheet = function(){
    var newCanvas = document.createElement("canvas");
    var ctx = newCanvas.getContext('2d');
    var w = 0;
    var h = 0;
    newCanvas.width = this.maxwidth;
    newCanvas.height = this.maxheight;
    for (var i=0; i < this.spriteList.length; i++){
        this.spriteList[i].resetAnimation();
        while (this.spriteList[i].hasNextFrame()){
            var spr = this.spriteList[i].getNextFrame();
            var img = spr.getImageFrame();
            ctx.drawImage(img,w,h);
            w = w + img.width;
            h = h + img.height;
        }
    }
    return newCanvas;
};

Spritesheet.prototype.getSpriteByName = function(spriteName){
    for (var i=0; i < this.spriteList.length; i++){
        if (this.spriteList[i].getName() == spriteName){
            return this.spriteList[i];
        }
    }
    return null;
};

Spritesheet.prototype.paintSelection = function(spriteName, mousePos,canvas) {
    var ctx = canvas.getContext('2d');
    var thisSprite = this.getSpriteByName(spriteName);
    if (thisSprite != null){
        var yIni = 0;
        thisSprite.resetAnimation();
        var found = false;
        while (thisSprite.hasNextFrame() && !found){
            var frameTmp = thisSprite.getNextFrame();
            var image = frameTmp.getImageFrame();
            var yEnd = yIni + image.height;
            if (mousePos.y <= yEnd && mousePos.y >= yIni && mousePos.x >= 0 && mousePos.x <= image.width){
                this.paintSpritePreview(spriteName, canvas);
                ctx.strokeStyle = "#f00";
                ctx.strokeRect(0, yIni, image.width, image.height);
                found = true;
            }
            yIni = yEnd;
        }
    }
    if (!found){
        this.paintSpritePreview(spriteName, canvas);
    }
};