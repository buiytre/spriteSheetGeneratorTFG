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
        thisSprite.resetSelection();
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
    var wMax = 0;
    var hMax = 0;
    for (var i=0; i < this.spriteList.length; i++){
        this.spriteList[i].resetSelection();
        while (this.spriteList[i].hasNextFrame()){
            var fr = this.spriteList[i].getNextFrame();
            var img = fr.getImageFrame();
            wMax = wMax + img.width;
            if (hMax < img.height) hMax = img.height;
        }
    }
    newCanvas.width = wMax;
    newCanvas.height = hMax;
    var w = 0;
    var h = 0;
    for (var i=0; i < this.spriteList.length; i++){
        this.spriteList[i].resetSelection();
        while (this.spriteList[i].hasNextFrame()){
            var fr = this.spriteList[i].getNextFrame();
            var img = fr.getImageFrame();
            ctx.drawImage(img,w,h);
            w = w + img.width;
//            h = h + img.height;
        }
    }
    return newCanvas;
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
        thisSprite.resetSelection();
        var found = false;
        while (thisSprite.hasNextFrame() && !found){
            var frameTmp = thisSprite.getNextFrame();
            var image = frameTmp.getImageFrame();
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
    var n = 0;
    var thisSprite = this.getSpriteByName(spriteName);
    if (thisSprite != null){
        var yIni = 0;
        thisSprite.resetSelection();
        var found = false;
        while (thisSprite.hasNextFrame() && !found){
            var frameTmp = thisSprite.getNextFrame();
            var image = frameTmp.getImageFrame();
            var yEnd = yIni + image.height;
            if (mousePos.y <= yEnd && mousePos.y >= yIni && mousePos.x >= 0 && mousePos.x <= image.width){
                found = true;
                spriteSelected = n;
            }
            n=n+1;
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

Spritesheet.prototype.getClanLibXML = function(){
    var text = "";
    text = '<?xml version="1.0" encoding="iso-8859-1"?>\r\n';
    text = text +'<resources>\r\n';
    var x = 0;
    for (var i = 0; i < this.spriteList.length; i++){
        text = text +'    <sprite name="'+this.spriteList[i].name+'">\r\n';
        text = text +'        <image file="spriteSheet.png">\r\n';
        for (var j=0; j < this.spriteList[i].getNumberFrames(); j++){
            var fr = this.spriteList[i].getFrame(j);
            text = text +'             <grid pos="'+x+',0" size="'+fr.width +','+fr.height+'" array="1,1" />\r\n';
            x = x + fr.width;
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