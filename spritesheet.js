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
//    this.frameSpriteSheetOrganized = false;
    this.frameMetaData = new Array(); // {indexSprite, indexFrame, pos}
    this.wMax = 0;
    this.hMax = 0;
    this.oldAnimation = -1;
};

/**
 * Crea un nuevo sprite dentro del spritesheet
 * @param name nombre del sprite
 * @returns {boolean} Devuelve true si el sprite se ha creado
 */
Spritesheet.prototype.createSprite = function(name){
    var exists = false;
    this.spriteList.forEach(function(spr){
        if (spr.name == name){
            exists = true;
        }
    });
    if (!exists) {
        var position = this.spriteList.length;
        this.spriteList[position] = new Sprite(name);
        return true;
    }else{
        return false;
    }
};

Spritesheet.prototype.deleteSprite = function(spriteName){
    var found = false;
    for (var i=0; i < this.spriteList.length && !found; i++){
        if (this.spriteList[i].getName() == spriteName){
            found = true;
            this.spriteList.splice(i,1);
        }
    }
};

Spritesheet.prototype.addFrameToSprite = function(spriteName, frame){
    //buscar el nombre del sprite y añadir el frame
    var found = false;
    for (var i=0; i < this.spriteList.length && !found; i++){
        if (this.spriteList[i].getName() == spriteName){
            this.spriteList[i].addFrame(frame);
            found = true;
        }
    }
};

Spritesheet.prototype.paintFrameSelection = function(spriteName, canvas) {
    var ctx = canvas.getContext('2d');
    var thisSprite = this.getSpriteByName(spriteName);
    if (thisSprite != null){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        var y = 0;
        for (var i=0;thisSprite.existsFrame(i);i++){
            var image = thisSprite.getFrame(i).getImageFrame();
            ctx.drawImage(image,0,y,image.width,image.height);
            y = y + image.height;
        }
    }
};

/**
 * create a canvas with all the frames of all the sprites in horizontal
 * @returns {HTMLElement}
 */
Spritesheet.prototype.getSpriteSheet = function(){
    this.organizeFunction();
    var newCanvas = document.createElement("canvas");
    var ctx = newCanvas.getContext('2d');
    newCanvas.width = this.wMax;
    newCanvas.height = this.hMax;
    for (var i=0; i < this.frameMetaData.length;i++){
        var frameMeta = this.frameMetaData[i];
        var image = this.spriteList[frameMeta.indexSprite].getFrame(frameMeta.indexFrame).getImageFrame();
        ctx.drawImage(image,frameMeta.pos.x,frameMeta.pos.y);
    }
    return newCanvas;
};

Spritesheet.prototype.organizeFunction = function(){
    this.organizeSpriteSheetHorizontalOnly();
};

Spritesheet.prototype.organizeSpriteSheetHorizontalOnly = function(){
    this.wMax = 0;
    this.hMax = 0;
    var countFrames = 0;
    this.frameMetaData = new Array();
    for (var i=0; i < this.spriteList.length; i++){
        for (var j=0; this.spriteList[i].existsFrame(j); j++){
            var pos = new Point(1+this.wMax, 1);    // sumamos 1 para tener margen de seleccion por la izq y arriba de 1 px
            var img = this.spriteList[i].getFrame(j).getImageFrame();
            var frameMeta = {indexSprite: i, indexFrame: j, pos: pos, width: (img.width+1), height: (img.height+1)}; //sumamos 1 para tener margen de seleccion por abajo y la der
            this.frameMetaData[countFrames] = frameMeta;
            this.wMax = this.wMax + frameMeta.width;
            if (this.hMax < img.height) this.hMax = frameMeta.height;
            countFrames++;
        }
    }
    this.frameSpriteSheetOrganized = true;
};


Spritesheet.prototype.organizeSpriteSheetFFDH = function(maxWidth){
    var countFrames = 0;
    this.frameMetaData = new Array();
    for (var i=0; i < this.spriteList.length; i++){
        for (j=0; this.spriteList[i].existsFrame(j); j++){
            var imageFrame = this.spriteList[i].getFrame(j).getImageFrame();
            var pos = new Point(0,0);
            var frameMeta = {indexSprite: i, indexFrame: j, pos: pos, width: (imageFrame.width+1), height: (imageFrame.height+1)};
            this.frameMetaData[countFrames] = frameMeta;
            countFrames++;
        }
    }
    var levels = new Array();
    for (var i= 0; i < countFrames; i++){
        for (var j=0; j<levels.length;j++){
            var frameMeta = this.frameMetaData[i];
            if ((this.frameMetaData[i].width + levels[j].width) < maxWidth){

            }
        }
        if (j== levels.length){
            //creamos un nuevo nivel
            var level = {height: this.frameMetaData[i].height, width: this.frameMetaData[i].width};
            levels[j] = level;
        }
    }

    this.frameSpriteSheetOrganized = true;
};


Spritesheet.prototype.existsSprite = function(spriteName){
    if (this.getSpriteByName(spriteName) == null){
        return false;
    }else{
        return true;
    }
};

Spritesheet.prototype.getSpriteByName = function(spriteName){
    for (var i=0; i < this.spriteList.length; i++){
        if (this.spriteList[i].getName() == spriteName){
            return this.spriteList[i];
        }
    }
    return null;
};

Spritesheet.prototype.getPositionSpriteByName = function(spriteName){
    for (var i=0; i < this.spriteList.length; i++){
        if (this.spriteList[i].getName() == spriteName){
            return i;
        }
    }
    return null;
};

Spritesheet.prototype.paintSelection = function(spriteName, mousePos,canvas) {
    var ctx = canvas.getContext('2d');
    var spriteSelected = -1;
    var n = 0;
    var thisSprite = this.getSpriteByName(spriteName);
    if (thisSprite != null){
        var yIni = 0;
        var found = false;
        for (var i=0; thisSprite.existsFrame(i) && !found; i++){
            var image = thisSprite.getFrame(i).getImageFrame();
            var yEnd = yIni + image.height;
            if (mousePos.y <= yEnd && mousePos.y >= yIni && mousePos.x >= 0 && mousePos.x <= image.width){
                ctx.strokeStyle = "#f00";
                ctx.strokeRect(0, yIni, image.width, image.height);
                found = true;
                spriteSelected = n;
            }
            n=n+1;
            yIni = yEnd;
        }
    }
    return spriteSelected;
};

Spritesheet.prototype.getSelection = function(spriteName, mousePos){
    var spriteSelected = -1;
    var thisSprite = this.getSpriteByName(spriteName);
    if (thisSprite != null){
        var yIni = 0;
        var found = false;
        for (var i=0; thisSprite.existsFrame(i) && !found; i++){
            var image = thisSprite.getFrame(i).getImageFrame();
            var yEnd = yIni + image.height;
            if (mousePos.y <= yEnd && mousePos.y >= yIni && mousePos.x >= 0 && mousePos.x <= image.width){
                found = true;
                spriteSelected = i;
            }
            yIni = yEnd;
        }
    }
    return spriteSelected;
};

Spritesheet.prototype.getSelectionImage = function(spriteName, nFrame) {
    var thisSprite = this.getSpriteByName(spriteName);
    if (thisSprite != null) {
        if (thisSprite.existsFrame(nFrame)) {
            return thisSprite.getFrame(nFrame).getImageFrame();
        }
    }
    return null; //if not found
};

Spritesheet.prototype.getPositionFrame = function(spriteName, nFrame){
    var thisSprite = this.getSpriteByName(spriteName);
    if (thisSprite != null){
        if (thisSprite.existsFrame(nFrame)){
            return thisSprite.getPositionFrame(nFrame);
        }
    }
};

Spritesheet.prototype.getMs = function(spriteName, nFrame){
    var thisSprite = this.getSpriteByName(spriteName);
    if (thisSprite != null){
        if (thisSprite.existsFrame(nFrame)){
            return thisSprite.getMs(nFrame);
        }
    }
};

Spritesheet.prototype.setPositionFrame = function(spriteName, nFrame, pos){
    var thisSprite = this.getSpriteByName(spriteName);
    if (thisSprite != null){
        if (thisSprite.existsFrame(nFrame)){
            thisSprite.setPositionFrame(nFrame, pos);
        }
    }
};

Spritesheet.prototype.setMs = function(spriteName, nFrame, ms){
    var thisSprite = this.getSpriteByName(spriteName);
    if (thisSprite != null){
        if (thisSprite.existsFrame(nFrame)){
            thisSprite.setMs(nFrame, ms);
        }
    }
};

Spritesheet.prototype.modifyFrameN = function(spriteName, nframe, frame){
    var thisSprite = this.getSpriteByName(spriteName);
    if (thisSprite != null){
        if (thisSprite.existsFrame(nframe)){
            thisSprite.replaceFrame(frame, nframe);
        }
    }
};

Spritesheet.prototype.stopOldAnimation = function(){
    if (this.oldAnimation != -1){
        this.spriteList[this.oldAnimation].stopAnimation();
        this.oldAnimation = -1;
    }
};

Spritesheet.prototype.paintAnimation = function(spriteName, canvas){
    var thisSprite = this.getPositionSpriteByName(spriteName);
    if (thisSprite != null){
        this.stopOldAnimation();
        this.oldAnimation = thisSprite;
        this.spriteList[thisSprite].paintAnimation(canvas);
    }
};

Spritesheet.prototype.delFrame = function(spriteName, nFrame){
    var thisSprite = this.getSpriteByName(spriteName);
    if (thisSprite != null){
        if (thisSprite.existsFrame(nFrame)){
            thisSprite.delFrame(nFrame);
        }
    }
};

Spritesheet.prototype.getNumberFrames = function(spriteName){
    var thisSprite = this.getSpriteByName(spriteName);
    var n = 0;
    if (thisSprite != null){
        n = thisSprite.getNumberFrames();
    }
    return n;
};

Spritesheet.prototype.getMetaDataInfoFrom = function(sprite,frame){
    for (var i=0; i < this.frameMetaData.length;i++){
        var frMeta = this.frameMetaData[i];
        if (frMeta.indexSprite == sprite && frMeta.indexFrame == frame) return frMeta;
    }
    return null;
};

Spritesheet.prototype.getClanLibXML = function(){
    this.organizeFunction();
    var text = "";
    text = '<?xml version="1.0" encoding="iso-8859-1"?>\r\n';
    text = text +'<resources>\r\n';
    var x = 0;
    for (var i = 0; i < this.spriteList.length; i++){
        text = text +'    <sprite name="'+this.spriteList[i].name+'">\r\n';
        text = text +'        <image file="spriteSheet.png">\r\n';
        for (var j=0; j < this.spriteList[i].getNumberFrames(); j++){
            var fr = this.spriteList[i].getFrame(j);
            var metaData = this.getMetaDataInfoFrom(i,j);
            text = text +'             <grid pos="'+metaData.pos.x+','+metaData.pos.y+'" size="'+fr.width +','+fr.height+'" array="1,1" />\r\n';
        }
        text = text +'        </image>\r\n';
        text = text +'        <animation speed="200" loop="yes" pingpong="no" />\r\n';
        for (var j=0; j < this.spriteList[i].getNumberFrames(); j++) {
            var pos = this.spriteList[i].getPositionFrame(j);
            var timeMs = this.spriteList[i].getMs(j);
            text = text + '        <frame nr='+ j + ' speed="' + timeMs +'" x="'+ pos.x + '" y="'+pos.y + '"/>\r\n';
        }
        text = text +'    </sprite>\r\n';
    }
    text = text +'</resources>\r\n';

    text = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
    return text;

};

Spritesheet.prototype.getCocos2Dplist = function(){
    var text = "";
    text = '<?xml version="1.0" encoding="UTF-8"?>\r\n';
    text = '<plist version="1.0">\r\n';
    text = '    <dict>\r\n';
    text = '        <key>frames</key>\r\n';
    text = '        <dict>\r\n';
    //toDo
    //              <key>slice01_01.png</key>
    //              <dict>
    //                  <key>frame</key>
    //                  <string>{{423,777},{43,47}}</string>
    //                  <key>offset</key>
    //                  <string>{0,0}</string>
    //                  <key>rotated</key>
    //                  <false/>
    //                  <key>sourceColorRect</key>
    //                  <string>{{0,0},{43,47}}</string>
    //                  <key>sourceSize</key>
    //                  <string>{43,47}</string>
    //              </dict>
    //ftodo
    text = '        </dict>\r\n';
    text = '    </dict>\r\n';
    text = '</plist>\r\n';
}

Spritesheet.prototype.interpolateNextFrame = function(spriteName,nFrame){
    var thisSprite = this.getSpriteByName(spriteName);
    thisSprite.interpolateNextFrame(nFrame);
};