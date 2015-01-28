/**
 *  Esta clase spriteSheet contiene todos los sprites que puede tener un spritesheet
 *  @author: Ignacio Soto Alsina
 *  @version: 27/11/2014
 */

const ORGANIZEBYSHELF = 1;
const ORGANIZEHORIZONTAL = 2;
const ORGANIZELEFTTOP = 3;

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
    this.frameSelected = -1;
    this.spriteSelected = -1;
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

/**
 *
 * @param sprite
 * @param rename
 * @returns {boolean}
 */
Spritesheet.prototype.addSprite = function(sprite,rename){
    var exists = false;
    if (!rename){
        this.spriteList.forEach(function(spr){
            if (spr.name == sprite.name){
                exists = true;
            }
        });
        if (!exists){
            this.spriteList[this.spriteList.length] = sprite;
            return true;
        }else{
            return false;
        }
    }else{
        var i = 0;
        sprite.name = "Sprite " + i;
        for (var j = 0; j < this.spriteList.length; j++){
            if (sprite.name == this.spriteList[j].name){
                j = 0;
                i = i + 1;
                sprite.name = "Sprite " + i;
            }
        }
        this.spriteList[this.spriteList.length] = sprite;
        return true;
    }
};

/**
 *
 * @param spriteName
 */
Spritesheet.prototype.deleteSprite = function(spriteName){
    var found = false;
    for (var i=0; i < this.spriteList.length && !found; i++){
        if (this.spriteList[i].getName() == spriteName){
            found = true;
            this.spriteList.splice(i,1);
        }
    }
};

/**
 *
 * @param spriteName
 * @param frame
 */
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

/**
 *
 * @returns {Number}
 */
Spritesheet.prototype.getNumberSprites = function(){
    return this.spriteList.length;
};

/**
 * create a canvas with all the frames of all the sprites
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

/**
 *
 * @param type
 */
Spritesheet.prototype.organizeFunction = function(type){
    switch (type){
        case ORGANIZELEFTTOP:
            this.organizeSpriteSheetLeftTop();
            break;
        case ORGANIZEBYSHELF:
            this.organizeSpriteSheetShelf(1024);
            break;
        case ORGANIZEHORIZONTAL:
            this.organizeSpriteSheetHorizontalOnly();
            break;
        default:
            this.organizeSpriteSheetLeftTop();
            break;
    }

};

/**
 *
 */
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
};

/**
 *
 * @param a
 * @param b
 * @returns {number}
 */
Spritesheet.prototype.orderMetaByHeightDesc = function(a,b){
    return b.height - a.height;
};

/**
 *
 * @param a
 * @param b
 * @returns {number}
 */
Spritesheet.prototype.orderMetaByHeightAsc = function(a,b){
    return b.height - a.height;
};

/**
 *
 * @param a
 * @param b
 * @returns {number}
 */
Spritesheet.prototype.orderMetaByHeightWidthAsc = function(a,b){
    var calc = b.height - a.height;
    if (calc == 0){
        return b.width - a.width;
    }else{
        return calc;
    }
};

/**
 *
 */
Spritesheet.prototype.fillMetaWithNoPosition = function(){
    this.frameMetaData = new Array();
    for (var i=0; i < this.spriteList.length; i++){
        for (var j=0; this.spriteList[i].existsFrame(j); j++){
            var imageFrame = this.spriteList[i].getFrame(j).getImageFrame();
            var pos = new Point(-1,-1);
            this.frameMetaData[this.frameMetaData.length] = {indexSprite: i, indexFrame: j, pos: pos, width: (imageFrame.width+1), height: (imageFrame.height+1)};
        }
    }
};

/**
 *
 * @param maxWidth
 */
Spritesheet.prototype.organizeSpriteSheetShelf = function(maxWidth){
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
            levels[j] = {height: (this.frameMetaData[i].height+2), width: (this.frameMetaData[i].width+2), frames: framesInLevel};
        }
    }

    var y = 0;
    this.wMax = 0;
    for (var i =0; i < levels.length;i++){
        if (this.wMax < levels[i].width) this.wMax = levels[i].width;
        var x = 0;
        for (var j = 0; j < levels[i].frames.length; j++){
            this.frameMetaData[levels[i].frames[j]].pos = new Point((x+1),(y+1));
            x = x + 2 + this.frameMetaData[levels[i].frames[j]].width;
        }
        y = y + 2 + levels[i].height;
    }
    this.hMax = y;
};

/**
 *
 */
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
            matrix[0][0] = {width:actualWidth, height: actualHeight, isFree: true, value: -1, x:0,y:0};
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
    this.wMax = minWidth;
    this.hMax = minHeight;
    this.fillMetaDataWithArea(minWidth, minHeight);


};

/**
 *
 * @param w
 * @param h
 */
Spritesheet.prototype.fillMetaDataWithArea = function(w, h){
    var  matrix = [];
    matrix[0] = [];
    matrix[0][0] = {width:w, height: h, isFree: true, value: -1, x:0,y:0};
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

    for (var i=0; i < matrix.length; i++){
        for (var j=0; j < matrix[i].length; j++){
            if (matrix[i][j].value != -1){
                var pos = this.frameMetaData[matrix[i][j].value].pos;
                if (pos.x == -1  && pos.y == -1){
                    this.frameMetaData[matrix[i][j].value].pos =  new Point(matrix[i][j].x,matrix[i][j].y);
                }
            }
        }
    }
};

/**
 *
 * @param matrix
 * @returns {boolean}
 */
Spritesheet.prototype.fitAllItems = function(matrix){
    var fit = true;
    for (var i = 0; fit && (i < this.frameMetaData.length); i++){
        fit = false;
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

/**
 *
 * @param matrix
 * @param wObj
 * @param hObj
 * @param i
 * @param j
 * @returns {boolean}
 */
Spritesheet.prototype.checkAreaFree = function(matrix, wObj, hObj, i, j) {
    var hRemaining = hObj;
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
    return !(hRemaining > 0);
};

/**
 *
 * @param matrix
 * @param k
 * @param width
 */
Spritesheet.prototype.addColumn = function(matrix,k, width){
    for (var i=0; i < matrix.length;i++){
        matrix[i].length = matrix[i].length + 1;
        for (var j=matrix[i].length - 1; j >= k; j--){
            if (j == k){
                matrix[i][j].width = width;
            }else{
                matrix[i][j] = {width: (matrix[i][j-1].width), height : (matrix[i][j-1].height), isFree : (matrix[i][j-1].isFree), value: (matrix[i][j-1].value), x: (matrix[i][j-1].x), y: (matrix[i][j-1].y)};
                if ((j-1) == k){
                    matrix[i][j].width = matrix[i][j].width - width;
                }
            }
        }
    }
};

/**
 *
 * @param matrix
 * @param k
 * @param height
 */
Spritesheet.prototype.addRow = function(matrix,k, height){
    matrix.length = matrix.length + 1;
    matrix[matrix.length -1] = [];
    matrix[matrix.length-1].length = matrix[0].length;
    for (var i=matrix.length - 1; i >= k;i--){
        for (var j=0; j < matrix[i].length; j++){
            if (i==k){
                matrix[i][j].height = height;
            }else{
                matrix[i][j] = {width: (matrix[i-1][j].width), height : (matrix[i-1][j].height), isFree : (matrix[i-1][j].isFree), value: (matrix[i-1][j].value), x: (matrix[i-1][j].x), y: (matrix[i-1][j].y)};
                if ((i-1) == k){
                    matrix[i][j].height = matrix[i][j].height - height;
                }
            }

        }
    }
};

/**
 *
 * @param spriteName
 * @returns {boolean}
 */
Spritesheet.prototype.existsSprite = function(spriteName){
    return !(this.getSpriteByName(spriteName) == null);
};

/**
 *
 * @param spriteName
 * @returns {*}
 */
Spritesheet.prototype.getSpriteByName = function(spriteName){
    for (var i=0; i < this.spriteList.length; i++){
        if (this.spriteList[i].getName() == spriteName){
            return this.spriteList[i];
        }
    }
    return null;
};

/**
 *
 * @param spriteName
 * @returns {*}
 */
Spritesheet.prototype.getPositionSpriteByName = function(spriteName){
    for (var i=0; i < this.spriteList.length; i++){
        if (this.spriteList[i].getName() == spriteName){
            return i;
        }
    }
    return null;
};

/**
 *
 * @param spriteName
 * @param canvas
 */
Spritesheet.prototype.paintFrameSelectionImage = function(spriteName, canvas) {
    var ctx = canvas.getContext('2d');
    var thisSprite = this.getSpriteByName(spriteName);
    if (thisSprite != null){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        var x = 0;
        var y = 0;
        for (var i=0;thisSprite.existsFrame(i);i++){
            var image = thisSprite.getFrame(i).getImageFrame();
            ctx.save();
            ctx.translate(thisSprite.getMaxWidth()/2,thisSprite.getMaxHeight()/2);
            ctx.translate(x, y);
            ctx.translate(-image.width/2,-image.height/2);
            ctx.drawImage(image,0,0);
            ctx.restore();
            x = x + thisSprite.getMaxWidth();
            if ((x + thisSprite.getMaxWidth()) > canvas.width){
                x = 0;
                y = y + thisSprite.getMaxHeight();
            }
        }
    }
};


/**
 *
 * @param spriteName
 * @returns {number}
 */
Spritesheet.prototype.maxYRect = function(spriteName) {
    var thisSprite = this.getSpriteByName(spriteName);
    var y = 0;
    var x = 0;
    if (thisSprite != null){
        for (var i=0;thisSprite.existsFrame(i);i++){
            x = x + thisSprite.getMaxWidth();
            if ((x + thisSprite.getMaxWidth()) > canvas.width){
                x = 0;
                y = y + thisSprite.getMaxHeight();
            }
        }
    }
    return y;
};

/**
 *
 * @param spriteName
 * @param mousePos
 * @param canvas
 * @param yDespl
 * @returns {number}
 */
Spritesheet.prototype.paintSelectionRect = function(spriteName, mousePos,canvas, yDespl) {
    var ctx = canvas.getContext('2d');
    var thisSprite = this.getSpriteByName(spriteName);
    var spriteSelected = -1;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (thisSprite != null){
        var x = 0;
        var y = - yDespl;
        for (var i=0;thisSprite.existsFrame(i);i++){
            var image = thisSprite.getFrame(i).getImageFrame();
            var yEnd = y + thisSprite.getMaxHeight();
            var xEnd = x + thisSprite.getMaxWidth();
            ctx.save();
            ctx.translate(thisSprite.getMaxWidth()/2,thisSprite.getMaxHeight()/2);
            ctx.translate(x, y);
            ctx.translate(-image.width/2,-image.height/2);
            ctx.drawImage(image,0,0);
            ctx.restore();
            ctx.save();
            if (this.spriteSelected == spriteName && this.frameSelected == i){
                ctx.fillStyle = 'rgba(255,0,0,0.1)';
                ctx.strokeStyle = '#000000';
                ctx.strokeRect(x, y, thisSprite.getMaxWidth(), thisSprite.getMaxHeight());
                ctx.strokeRect(x, y, thisSprite.getMaxWidth(), thisSprite.getMaxHeight());
            }else if (mousePos.y <= yEnd && mousePos.y >= y && mousePos.x >= x && mousePos.x <= xEnd){
                ctx.strokeStyle = "#f00";
                ctx.strokeRect(x, y, thisSprite.getMaxWidth(), thisSprite.getMaxHeight());
                spriteSelected = i;
            }

            ctx.restore();
            x = x + thisSprite.getMaxWidth();
            if ((x + thisSprite.getMaxWidth()) > canvas.width){
                x = 0;
                y = y + thisSprite.getMaxHeight();
            }
        }
    }
    return spriteSelected;
};

/**
 *
 * @param spriteName
 * @param mousePos
 * @param yDespl
 * @returns {number|*}
 */
Spritesheet.prototype.marcaFrameSelected = function(spriteName, mousePos, yDespl){
    var thisSprite = this.getSpriteByName(spriteName);
    this.spriteSelected = -1;
    if (thisSprite != null){
        var x = 0;
        var y = -yDespl;
        var found = false;
        for (var i=0;thisSprite.existsFrame(i) && !found;i++){
            var image = thisSprite.getFrame(i).getImageFrame();
            var yEnd = y + thisSprite.getMaxHeight();
            var xEnd = x + thisSprite.getMaxWidth()
            if (mousePos.y <= yEnd && mousePos.y >= y && mousePos.x >= x && mousePos.x <= xEnd){
                found = true;
                this.spriteSelected = spriteName;
                this.frameSelected = i;
            }
            x = x + thisSprite.getMaxWidth();
            if ((x + thisSprite.getMaxWidth()) > canvas.width){
                x = 0;
                y = y + thisSprite.getMaxHeight();
            }
        }
    }
    return this.frameSelected;
};


/**
 *
 * @param spriteName
 * @param nFrame
 * @returns {*}
 */
Spritesheet.prototype.getSelectionImage = function(spriteName, nFrame) {
    var thisSprite = this.getSpriteByName(spriteName);
    if (thisSprite != null) {
        if (thisSprite.existsFrame(nFrame)) {
            return thisSprite.getFrame(nFrame).getImageFrame();
        }
    }
    return null; //if not found
};

/**
 *
 * @param spriteName
 * @param nFrame
 * @returns {*}
 */
Spritesheet.prototype.getPositionFrame = function(spriteName, nFrame){
    var thisSprite = this.getSpriteByName(spriteName);
    if (thisSprite != null){
        if (thisSprite.existsFrame(nFrame)){
            return thisSprite.getPositionFrame(nFrame);
        }
    }
};

/**
 *
 * @param spriteName
 * @param nFrame
 * @returns {*}
 */
Spritesheet.prototype.getMs = function(spriteName, nFrame){
    var thisSprite = this.getSpriteByName(spriteName);
    if (thisSprite != null){
        if (thisSprite.existsFrame(nFrame)){
            return thisSprite.getMs(nFrame);
        }
    }
};

/**
 *
 * @param spriteName
 * @param nFrame
 * @param pos
 */
Spritesheet.prototype.setPositionFrame = function(spriteName, nFrame, pos){
    var thisSprite = this.getSpriteByName(spriteName);
    if (thisSprite != null){
        if (thisSprite.existsFrame(nFrame)){
            thisSprite.setPositionFrame(nFrame, pos);
        }
    }
};

/**
 *
 * @param spriteName
 * @param nFrame
 * @param ms
 */
Spritesheet.prototype.setMsToFrame = function(spriteName, nFrame, ms){
    var thisSprite = this.getSpriteByName(spriteName);
    if (thisSprite != null){
        if (thisSprite.existsFrame(nFrame)){
            thisSprite.setMs(nFrame, ms);
        }
    }
};

/**
 *
 * @param spriteName
 * @param ms
 */
Spritesheet.prototype.setMsFixedToAll = function(spriteName, ms){
    var thisSprite =this.getSpriteByName(spriteName);
    if (thisSprite != null){
        for (var i = 0; thisSprite.existsFrame(i);i++){
            thisSprite.setMs(i,ms);
        }
    }
};

/**
 *
 * @param spriteName
 * @param nframe
 * @param frame
 */
Spritesheet.prototype.modifyFrameN = function(spriteName, nframe, frame){
    var thisSprite = this.getSpriteByName(spriteName);
    if (thisSprite != null){
        if (thisSprite.existsFrame(nframe)){
            thisSprite.replaceFrame(frame, nframe);
        }
    }
};

/**
 *
 */
Spritesheet.prototype.stopOldAnimation = function(){
    if (this.oldAnimation != -1){
        this.spriteList[this.oldAnimation].stopAnimation();
        this.oldAnimation = -1;
    }
};

/**
 *
 * @param spriteName
 * @param canvas
 */
Spritesheet.prototype.paintAnimation = function(spriteName, canvas){
    var thisSprite = this.getPositionSpriteByName(spriteName);
    if (thisSprite != null){
        this.stopOldAnimation();
        this.oldAnimation = thisSprite;
        this.spriteList[thisSprite].paintAnimation(canvas);
    }
};

/**
 *
 * @param spriteName
 * @param nFrame
 */
Spritesheet.prototype.delFrame = function(spriteName, nFrame){
    var thisSprite = this.getSpriteByName(spriteName);
    if (thisSprite != null){
        if (thisSprite.existsFrame(nFrame)){
            thisSprite.delFrame(nFrame);
        }
    }
};

/**
 *
 * @returns {number}
 */
Spritesheet.prototype.getNumberTotalFrames = function() {
    var n = 0;
    for (var i=0; i < this.spriteList.length;i++){
        n = n + this.spriteList[i].getNumberFrames();
    }
    return n;
};

/**
 *
 * @param spriteName
 * @returns {number}
 */
Spritesheet.prototype.getNumberFrames = function(spriteName){
    var thisSprite = this.getSpriteByName(spriteName);
    var n = 0;
    if (thisSprite != null){
        n = thisSprite.getNumberFrames();
    }
    return n;
};

/**
 *  retorna la posicion del vector del sprite y del frame, la posicion donde tiene que pintarse y la altura y la amplitud del frame
 * @param sprite
 * @param frame
 * @returns {*}
 */
Spritesheet.prototype.getMetaDataInfoFrom = function(sprite,frame){
    for (var i=0; i < this.frameMetaData.length;i++){
        var frMeta = this.frameMetaData[i];
        if (frMeta.indexSprite == sprite && frMeta.indexFrame == frame) return frMeta;
    }
    return null;
};

/**
 *
 * @returns {string}
 */
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

/**
 *
 * @param spriteName
 * @param nFrame
 */
Spritesheet.prototype.interpolateNextFrame = function(spriteName,nFrame){
    var thisSprite = this.getSpriteByName(spriteName);
    thisSprite.interpolateNextFrame(nFrame);
};

/**
 *
 * @param spriteName
 * @param func
 */
Spritesheet.prototype.autoTuneTimeMs = function(spriteName, func){
    var thisSprite = this.getSpriteByName(spriteName);
    thisSprite.autoTuneTimeMs(func);
};

/**
 *
 * @param num
 */
Spritesheet.prototype.setSelectedFrame = function(num){
    if (this.spriteSelected >= 0 && this.spriteSelected < this.spriteList.length) {
        if (num <= this.spriteList[this.spriteSelected].getNumberFrames() && num >= 0) {
            this.frameSelected = num;
        } else {
            this.frameSelected = -1;
        }
    }else{
        this.frameSelected = -1;
    }
}