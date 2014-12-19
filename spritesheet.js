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

Spritesheet.prototype.paintSprite = function(spriteName, canvas) {
    var ctx = canvas.getContext('2d');
    var found = false;
    for (var i=0; i < this.spriteList.length && !found; i++){
        if (this.spriteList[i].getName() == spriteName){
            var thisSprite = this.spriteList[i];
            setInterval(function(){
                ctx.clearRect(0,0,canvas.width,canvas.height);
                var image = thisSprite.getNextFrame().getImageFrame();
                ctx.drawImage(image,0,0,image.width, image.height,0,0,image.width,image.height);
            }, 1000/24);
            found = true;
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
            console.log("AAAAA: " + w + " " + h + " " + img.width + " " + img.height);
            ctx.drawImage(img,w,h);
            w = w + img.width;
            h = h + img.height;
        }
    }
    return newCanvas;
};