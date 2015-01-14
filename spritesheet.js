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
    this.frameMetaData = new Array(); //{indexSprite, indexFrame, pos, width, height};
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
    //this.organizeSpriteSheetHorizontalOnly();
    //this.organizeSpriteSheetFFDH(1024);
    this.organizeSpriteSheetLeftTop();
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

Spritesheet.prototype.orderMetaByHeightDesc = function(a,b){
    return b.height - a.height;
};

Spritesheet.prototype.orderMetaByHeightAsc = function(a,b){
    return b.height - a.height;
};

Spritesheet.prototype.orderMetaByHeightWidthAsc = function(a,b){
    var calc = b.height - a.height;
    if (calc == 0){
        return b.width - a.width;
    }else{
        return calc;
    }
};

Spritesheet.prototype.fillMetaWithNoPosition = function(){
    this.frameMetaData = new Array();
    for (var i=0; i < this.spriteList.length; i++){
        for (var j=0; this.spriteList[i].existsFrame(j); j++){
            var imageFrame = this.spriteList[i].getFrame(j).getImageFrame();
            var pos = new Point(-1,-1);
            var frameMeta = {indexSprite: i, indexFrame: j, pos: pos, width: (imageFrame.width+1), height: (imageFrame.height+1)};
            this.frameMetaData[this.frameMetaData.length] = frameMeta;
        }
    }
};

Spritesheet.prototype.organizeSpriteSheetFFDH = function(maxWidth){
    this.fillMetaWithNoPosition();
    this.frameMetaData.sort(this.orderMetaByHeightAsc);

    var levels = new Array();
    for (var i= 0; i < this.frameMetaData.length; i++){
        var inserted = false;
        for (var j=0; !inserted && j<levels.length;j++){
            if (((this.frameMetaData[i].width+2) + levels[j].width) < maxWidth && (this.frameMetaData[i].height-2) < levels[j].height){
                levels[j].width = levels[j].width + (this.frameMetaData[i].width+2);
                levels[j].frames[levels[j].frames.length] = i;
                inserted = true;
            }
        }
        if (!inserted){
            //creamos un nuevo nivel
            var framesInLevel = new Array();
            framesInLevel[0] = i;
            var level = {height: (this.frameMetaData[i].height+2), width: (this.frameMetaData[i].width+2), frames: framesInLevel};
            levels[j] = level;
        }
    }

    var y = 0;
    this.wMax = 0;
    for (var i =0; i < levels.length;i++){
        if (this.wMax < levels[i].width) this.wMax = levels[i].width;
        var x = 0;
        for (var j = 0; j < levels[i].frames.length; j++){
            var newPos = new Point((x+1),(y+1));
            this.frameMetaData[levels[i].frames[j]].pos = newPos;
            x = x + 2 + this.frameMetaData[levels[i].frames[j]].width;
        }
        y = y + 2 + levels[i].height;
    }
    this.hMax = y;

    this.frameSpriteSheetOrganized = true;
};

Spritesheet.prototype.organizeSpriteSheetLeftTop = function(){
    this.fillMetaWithNoPosition();
    this.frameMetaData.sort(this.orderMetaByHeightWidthAsc);
    var actualHeight;
    var actualWidth;
    var minWidth;
    var minHeight;
    var maxObjWidth = 0;
    var areaObjects = 0;
    if (this.frameMetaData.length > 0) {
        actualHeight = this.frameMetaData[0].height;
        actualWidth  = this.frameMetaData[0].width;
        maxObjWidth = this.frameMetaData[0].width;
        areaObjects = areaObjects + this.frameMetaData[0].height * this.frameMetaData[0].width;
    }
    for (var i=1; i<this.frameMetaData.length; i++){
        actualWidth = actualWidth + this.frameMetaData[i].width;
        if (maxObjWidth < this.frameMetaData[i].width) maxObjWidth = this.frameMetaData[i].width;
        areaObjects = areaObjects + this.frameMetaData[i].height * this.frameMetaData[i].width;
    }
    minWidth = actualWidth;
    minHeight = actualHeight;
    while (actualWidth > maxObjWidth) {
        if (actualWidth * actualHeight >= minWidth * minHeight) {
            actualWidth = actualWidth - 1;
        } else {
            var  matrix = [];
            matrix[0] = [];
            var cell = {width:actualWidth, height: actualHeight, isFree: true, value: -1, x:0,y:0};
            matrix[0][0] = cell;
            if (this.fitAllItems(matrix)) {
                if ((actualWidth * actualHeight) < (minWidth * minHeight)) {
                    minWidth = actualWidth;
                    minHeight = actualHeight;
                }
                actualWidth = actualWidth - 1;
            } else {
                actualHeight = actualHeight + 1;
            }
        }
        while ((actualHeight * actualWidth) < areaObjects) {
            actualHeight = actualHeight + 1;
        }
    }

    //alert("minimum width =" + minWidth + " minimum height=" + minHeight);
    this.wMax = minWidth;
    this.hMax = minHeight;
    this.fillMetaDataWithArea(minWidth, minHeight);

    this.frameSpriteSheetOrganized = true;

};

Spritesheet.prototype.fillMetaDataWithArea = function(w, h){
    var  matrix = [];
    matrix[0] = [];
    var cell = {width:w, height: h, isFree: true, value: -1, x:0,y:0};
    matrix[0][0] = cell;
    this.fitAllItems(matrix);

    var y = 0;
    for (var i=0; i< matrix.length; i++){
        var x = 0;
        var lastHeight = 0;
        for (var j=0; j < matrix[i].length; j++){
            matrix[i][j].x = x;
            matrix[i][j].y = y;
            x = x + matrix[i][j].width;
            lastHeight = matrix[i][j].height;
        }
        y = y + lastHeight;
    }
    var textXY = "";
    var textWidthHeight = "";
    var spriteInPosition = "";
    for (var i=0; i < matrix.length;i++){
        textXY = textXY + "<br />[";
        textWidthHeight = textWidthHeight + "<br />[";
        spriteInPosition = spriteInPosition + "<br />[";
        for (var j=0; j < matrix[i].length; j++){
            textXY = textXY + "[x:" +  matrix[i][j].x+ " y:" + matrix[i][j].y +"]";
            textWidthHeight = textWidthHeight + "[width:" +  matrix[i][j].width+ " height:" + matrix[i][j].height +"]";
            spriteInPosition = spriteInPosition + "[sprite: " + matrix[i][j].value + "]";
        }
        textXY = textXY + "]";
        textWidthHeight= textWidthHeight + "]";
        spriteInPosition= spriteInPosition + "]";
    }
    for (var i=0; i < matrix.length; i++){
        for (var j=0; j < matrix[i].length; j++){
            if (matrix[i][j].value != -1){
                var pos = this.frameMetaData[matrix[i][j].value].pos;
                if (pos.x == -1  && pos.y == -1){
                    var newPos = new Point(matrix[i][j].x,matrix[i][j].y);
                    this.frameMetaData[matrix[i][j].value].pos = newPos;
                }
            }
        }
    }
    var metadataText = "";
    for (var i=0; i < this.frameMetaData.length; i++){
        metadataText = metadataText +"[x:"+ this.frameMetaData[i].pos.x +" y:" + this.frameMetaData[i].pos.y + " indexSprite:" + this.frameMetaData[i].indexSprite + " indexFrame " +  this.frameMetaData[i].indexFrame + " width " + this.frameMetaData[i].width + "x" + this.frameMetaData[i].height + "<br />";
    }
    $("#test").html(textXY+"<br />"+textWidthHeight+"<br />"+spriteInPosition+"<br />"+metadataText+"<br /> Area " +  this.wMax + "x"  +this.hMax+"<br />");
    $("#test").hide();
};


Spritesheet.prototype.fitAllItems = function(matrix){
    var fit = true;
    for (var i = 0; fit && (i < this.frameMetaData.length); i++){
        var fit = false;
        for (var j=0; !fit && (j < matrix.length); j++){
            for (var k=0; !fit && (k < matrix[j].length);k++){
                if (matrix[j][k].isFree) {
                    var width = matrix[j][k].width;
                    var height = matrix[j][k].height;
                    var wObj = this.frameMetaData[i].width;
                    var hObj = this.frameMetaData[i].height;
                    if (wObj <= width && hObj <= height) {
                        if (wObj < width){
                            this.addColumn(matrix,k,wObj);
                        }
                        if (hObj < height){
                            this.addRow(matrix,j,hObj);
                        }
                        matrix[j][k].isFree = false;
                        matrix[j][k].value = i;
                        fit = true;
                    }else {
                        //var freeWidth = this.checkRightWidth(matrix,wObj,j,k);
                        //var freeHeight = this.checkBotHeight(matrix,hObj,j,k);
                        //if (wObj <= freeWidth && hObj <= freeHeight){
                        var freeArea = this.checkAreaFree(matrix,wObj,hObj, j,k);
                        if (freeArea){
                            var column = k;
                            var row = j;
                            var wRemaining = wObj;
                            var hRemaining = hObj;
                            var hSubstracted = 0;
                            while (wRemaining > 0){
                                if (wRemaining <  matrix[row][column].width) {
                                    this.addColumn(matrix, column, wRemaining);
                                }
                                if (hObj <  matrix[row][column].height) {
                                    this.addRow(matrix, row, hObj);
                                }
                                matrix[row][column].isFree = false;
                                matrix[row][column].value = i;
                                wRemaining = wRemaining - matrix[row][column].width;
                                hSubstracted = matrix[row][column].height;
                                if (wRemaining > 0) column = column + 1;
                            }
                            var columnAfterFinish = column;
                            hRemaining = hRemaining - hSubstracted;
                            row = row + 1;
                            while (hRemaining > 0){
                                if (hRemaining < matrix[row][columnAfterFinish].height) {
                                    this.addRow(matrix, row, hRemaining);
                                }
                                for (column = k; column <= columnAfterFinish; column++){
                                    matrix[row][column].isFree = false;
                                    matrix[row][column].value = i;
                                }
                                hRemaining = hRemaining - matrix[row][columnAfterFinish].height;
                                row = row + 1;
                            }
                            fit = true;
                        }
                    }
                }
            }
        }
    }
    return fit;
};

Spritesheet.prototype.checkAreaFree = function(matrix, wObj, hObj, i, j) {
    var hRemaining = hObj;
    var nextCol = j;
    var nextRow = i;
    while (nextRow < matrix.length && hRemaining > 0){
        var wRemaining = wObj;
        var nextCol = j;
        var lastHeight = 0;
        while (nextCol < matrix[nextRow].length && wRemaining > 0 && matrix[nextRow][nextCol].isFree){
            wRemaining = wRemaining - matrix[nextRow][nextCol].width;
            lastHeight = matrix[nextRow][nextCol].height;
            nextCol++;
        }
        if (wRemaining > 0) return false;
        hRemaining = hRemaining - lastHeight;
        nextRow++;
    }
    if (hRemaining > 0) return false;
    return true;
};
/*
Spritesheet.prototype.checkRightWidth = function(matrix, wObj, i, j){
    var wRight = 0;
    var nextCol = j;
    while (wRight < wObj && nextCol < matrix[i].length && matrix[i][nextCol].isFree ){
        wRight = wRight + matrix[i][nextCol].width;
        nextCol = nextCol + 1;
    }
    return wRight;
};

Spritesheet.prototype.checkBotHeight = function(matrix,hObj,i,j){
    var hBot = 0;
    var nextHeight = i;
    while (hBot < hObj && nextHeight < matrix.length && matrix[nextHeight][j].isFree){
        hBot = hBot + matrix[nextHeight][j].height;
        nextHeight = nextHeight + 1;
    }
    return hBot;
};*/

Spritesheet.prototype.addColumn = function(matrix,k, width){
    for (var i=0; i < matrix.length;i++){
        matrix[i].length = matrix[i].length + 1;
        for (var j=matrix[i].length - 1; j >= k; j--){
            if (j == k){
                matrix[i][j].width = width;
            }else{
                var cell = {width: (matrix[i][j-1].width), height : (matrix[i][j-1].height), isFree : (matrix[i][j-1].isFree), value: (matrix[i][j-1].value), x: (matrix[i][j-1].x), y: (matrix[i][j-1].y)};
                matrix[i][j] = cell;
                if ((j-1) == k){
                    matrix[i][j].width = matrix[i][j].width - width;
                }
            }
        }
    }
};

Spritesheet.prototype.addRow = function(matrix,k, height){
    matrix.length = matrix.length + 1;
    matrix[matrix.length -1] = [];
    matrix[matrix.length-1].length = matrix[0].length;
    for (var i=matrix.length - 1; i >= k;i--){
        for (var j=0; j < matrix[i].length; j++){
            if (i==k){
                matrix[i][j].height = height;
            }else{
                var cell = {width: (matrix[i-1][j].width), height : (matrix[i-1][j].height), isFree : (matrix[i-1][j].isFree), value: (matrix[i-1][j].value), x: (matrix[i-1][j].x), y: (matrix[i-1][j].y)};
                matrix[i][j] = cell;
                if ((i-1) == k){
                    matrix[i][j].height = matrix[i][j].height - height;
                }
            }

        }
    }
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

Spritesheet.prototype.setMsToFrame = function(spriteName, nFrame, ms){
    var thisSprite = this.getSpriteByName(spriteName);
    if (thisSprite != null){
        if (thisSprite.existsFrame(nFrame)){
            thisSprite.setMs(nFrame, ms);
        }
    }
};

Spritesheet.prototype.setMsFixedToAll = function(spriteName, ms){
    var thisSprite =this.getSpriteByName(spriteName);
    if (thisSprite != null){
        for (var i = 0; thisSprite.existsFrame(i);i++){
            thisSprite.setMs(i,ms);
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