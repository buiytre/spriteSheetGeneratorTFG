var URL = window.webkitURL || window.URL;
var nullFunction = function(event){
    event.preventDefault();
};

const IMGDATARED = 0;
const IMGDATAGREEN = 1;
const IMGDATABLUE = 2;
const IMGDATAALPHA = 3;

var transparentColor = false;
var puntosVisitados = null;
var imageDataPixels;
//*******MODES PROGRAMA
var modeCanvas = 0;     //indica en que modo esta trabajando el canvas
const IMPORTEDIMAGE = 1;
const FRAMETOSELECT = 2;
const FRAMESELECTED = 3;

var modeFrame = 0;      // indica si el canvas esta trabajando para ajustar los frames a la animación o para editarlos
const MODEADJUST = 1;
const MODEEDIT = 2;

var modeSelection = 0;
const SELECTIONDEFAULT = 0;
const SELECTIONAUTO = 1;
/**************************************************/
var canvas;     //canvas central
var ctx;        //ctx para el canvas central
var sheet;      //sprite sheet

var img = new Image;    // imagen cargada a traves del load
var posImage = new Point; //Posicion de la imagen

var currentScale = 1;   //ESCALA del zoom

//*******control mouse******
var mouseMode = 0;
const MOUSESELECTIONMODE = 1;
const MOUSEMOVEMODE = 2;
var startClickLeft = new Point;         //Click inicial del boton izquierdo del mouse
var startClickRight = new Point;        //Click inicial del boton derecho del mouse
var mousePos = new Point;               //Posicion actual del mouse
var isDownLeft = false;                 //Indica si el boton izquierdo esta pulsado
var isDownRight = false;                //Indica si el boton derecho esta pulsado

//********Control selection*****
const MARGENSELECCION = 8;
var selectionTL = new Point;
selectionTL.reset();
var selectionBR = new Point;
selectionBR.reset();
var selectionMove = false;
var selectionResizeTop = false;
var selectionResizeBot = false;
var selectionResizeLeft = false;
var selectionResizeRight = false;
var selectionResize = false;

//********Selected sprite in adjustmode
var selectedFrame = -1;
var imageSprAdj = new Image;
var posSprAdj = new Point;
var posFrame = new Point;
var bTransparencyPreview = false;

var listOfFrames = new Array();

var busy = false;
/**
 * Funcion que devuelve la posicion del raton en el canvas
 * @param cv
 * @param e
 * @returns {{x: number, y: number}}
 */
function getMousePos(cv, e) {
    var rect = cv.getBoundingClientRect();
    return {x: e.clientX - rect.left, y: e.clientY - rect.top};
}

/**
 * evento de mantener el raton pulsado
 * @param event
 */
function doMouseDown(event){
    switch (event.which){
        case 1:
            startClickLeft = getMousePos(canvas, event);
            isDownLeft = true;
            switch (modeCanvas){
                case FRAMETOSELECT:
                    selectFrame();
                    break;
            }

            break;
        case 3:
            startClickRight = getMousePos(canvas,event);
            isDownRight = true;
            break;
        default:
            break;
    }
    switch (mouseMode){
        case MOUSESELECTIONMODE:
            checkMoveAndResizeSelection();
            break;
    }
}

function invertSelectionTLBR(){
    if (selectionTL.x > selectionBR.x){
        var newSelectionTL = new Point();
        var newSelectionBR = new Point();
        newSelectionTL.x = selectionBR.x;
        newSelectionTL.y = selectionTL.y;
        newSelectionBR.x = selectionTL.x;
        newSelectionBR.y = selectionBR.y;
        selectionTL = newSelectionTL;
        selectionBR = newSelectionBR;
        if (selectionResizeLeft){
            selectionResizeRight = true;
            selectionResizeLeft = false;
        }else{
            selectionResizeRight = false;
            selectionResizeLeft = true;
        }
    }
    if (selectionTL.y > selectionBR.y){
        var newSelectionTL = new Point();
        var newSelectionBR = new Point();
        newSelectionTL.x = selectionTL.x;
        newSelectionTL.y = selectionBR.y;
        newSelectionBR.x = selectionBR.x;
        newSelectionBR.y = selectionTL.y;
        selectionTL = newSelectionTL;
        selectionBR = newSelectionBR;
        if (selectionResizeTop){
            selectionResizeBot = true;
            selectionResizeTop = false;
        }else{
            selectionResizeBot = false;
            selectionResizeTop = true;
        }
    }
}

function changeCursorMoveOrSelection(){
    var selectionInside = false;
    var rl = false;
    var rr = false;
    var rt = false;
    var rb = false;

    if (mousePos.x >= (selectionTL.x - MARGENSELECCION) && mousePos.x <= (selectionBR.x + MARGENSELECCION) && mousePos.y >= (selectionTL.y - MARGENSELECCION) && mousePos.y <= (selectionBR.y + MARGENSELECCION)){
        selectionInside = true;
    }

    if (selectionInside) {
        if (mousePos.x >= (selectionTL.x - MARGENSELECCION) && mousePos.x <= (selectionTL.x + MARGENSELECCION)) {
            rl = true;
        } else {
            rl = false;
        }
        if (mousePos.x >= (selectionBR.x - MARGENSELECCION) && mousePos.x <= (selectionBR.x + MARGENSELECCION)) {
            rr = true;
        } else {
            rr = false;
        }
        if (mousePos.y >= (selectionTL.y - MARGENSELECCION) && mousePos.y <= (selectionTL.y + MARGENSELECCION)) {
            rt = true;
        } else {
            rt = false;
        }
        if (mousePos.y >= (selectionBR.y - MARGENSELECCION) && mousePos.y <= (selectionBR.y + MARGENSELECCION)) {
            rb = true;
        } else {
            rb = false;
        }

        if (rl || rr || rt || rb) {
            if (!busy) {
                if ((rl || rr) && !rt && !rb) {
                    $("body").css("cursor", "ew-resize");
                } else if ((rt || rb) && !rr && !rl) {
                    $("body").css("cursor", "ns-resize");
                } else if ((rt && rl)) {
                    $("body").css("cursor", "nw-resize");
                } else if ((rt && rr)) {
                    $("body").css("cursor", "ne-resize");
                } else if ((rb && rl)) {
                    $("body").css("cursor", "sw-resize");
                } else if ((rb && rr)) {
                    $("body").css("cursor", "se-resize");
                }
            }
        } else {
            $("body").css("cursor", "pointer");
        }
    }else{
        if (!busy){
            $("body").css("cursor", "default");
        }
    }
}


/**
 * Funcion que indica si el raton esta dentro de una seleccion o en un lateral (o si esta fuera de ella)
 */
function checkMoveAndResizeSelection(){
    var selectionInside = false;
    if (mousePos.x >= (selectionTL.x - MARGENSELECCION) && mousePos.x <= (selectionBR.x + MARGENSELECCION) && mousePos.y >= (selectionTL.y - MARGENSELECCION) && mousePos.y <= (selectionBR.y + MARGENSELECCION)){
        selectionInside = true;
    }

    if (selectionInside) {
        if (mousePos.x >= (selectionTL.x - MARGENSELECCION) && mousePos.x <= (selectionTL.x + MARGENSELECCION)) {
            selectionResizeLeft = true;
        } else {
            selectionResizeLeft = false;
        }
        if (mousePos.x >= (selectionBR.x - MARGENSELECCION) && mousePos.x <= (selectionBR.x + MARGENSELECCION)) {
            selectionResizeRight = true;
        } else {
            selectionResizeRight = false;
        }
        if (mousePos.y >= (selectionTL.y - MARGENSELECCION) && mousePos.y <= (selectionTL.y + MARGENSELECCION)) {
            selectionResizeTop = true;
        } else {
            selectionResizeTop = false;
        }
        if (mousePos.y >= (selectionBR.y - MARGENSELECCION) && mousePos.y <= (selectionBR.y + MARGENSELECCION)) {
            selectionResizeBot = true;
        } else {
            selectionResizeBot = false;
        }

        if (selectionResizeLeft || selectionResizeRight || selectionResizeTop || selectionResizeBot) {
            selectionResize = true;
            selectionMove = false;
        } else {
            selectionMove = true;
            selectionResize = false;
        }
    }else{
        selectionResize = false;
        selectionMove = false;
    }
}

/**
 * evento de levantar el click del raton
 * @param event
 */
function doMouseUp(event){
    switch (event.which){
        case 1:
//            endClickLeft = getMousePos(canvas, event);
            isDownLeft = false;
            break;
        case 3:
//            endClickRight = getMousePos(canvas,event);
            isDownRight = false;
            break;
        default:
            break;
    }
}

function doMouseDblClick(event){
    switch (event.which){
    case 1:
         if (modeCanvas == IMPORTEDIMAGE && mouseMode == MOUSESELECTIONMODE){
                if (transparentColor){
                    getSelectionAroundPoint(mousePos,imageDataPixels);
                    pinta();
                    pintaSelection();
                }
                break;
        }
        break;
    }
}

function selectFrame(){
    selectedFrame = sheet.getSelection($("#spriteList").val(), mousePos);
    if (selectedFrame != -1){
        posSprAdj.x = 0;
        posSprAdj.y = 0;
        var spriteName =  $("#spriteList").val();
        imageSprAdj = sheet.getSelectionImage(spriteName,selectedFrame);
        $("#milisecondsText").val(sheet.getMs(spriteName,selectedFrame));
        var p = sheet.getPositionFrame(spriteName,selectedFrame);
        posFrame.x = p.x;
        posFrame.y = p.y;
        mouseMode = MOUSEMOVEMODE;
        modeCanvas = FRAMESELECTED;
    }
    pinta();
    pintaSelection();
}



/**
 * evento que controla el movimiento del raton
 * @param event
 */
function doMouseMove(event) {
    mousePos = getMousePos(canvas, event);
    $("#coords").text( "x: " + mousePos.x + " y: "+ mousePos.y + " selectionTL x: " + selectionTL.x + " y: " + selectionTL.y + " selectionBR x: " + selectionBR.x + " y: " + selectionBR.y);
    switch (modeCanvas) {
        case IMPORTEDIMAGE:
            switch (mouseMode) {
                case MOUSEMOVEMODE:
                    if (isDownLeft) {
                        posImage.x = posImage.x + (mousePos.x - startClickLeft.x);
                        posImage.y = posImage.y + (mousePos.y - startClickLeft.y);
                        pinta();
                        imageDataPixels = ctx.getImageData(0,0,canvas.width,canvas.height);
                        startClickLeft = getMousePos(canvas, event);
                    }
                    break;
                case MOUSESELECTIONMODE:
                    invertSelectionTLBR();
                    changeCursorMoveOrSelection();
                    if (isDownLeft) {
                        if (selectionMove || selectionResize) {
                            var incrementX = (mousePos.x - startClickLeft.x);
                            var incrementY = (mousePos.y - startClickLeft.y);
                            startClickLeft = getMousePos(canvas, event);
                            if (selectionMove) {
                                selectionTL.x = selectionTL.x + incrementX;
                                selectionBR.x = selectionBR.x + incrementX;
                                selectionTL.y = selectionTL.y + incrementY;
                                selectionBR.y = selectionBR.y + incrementY;
                            } else {
                                if (selectionResizeLeft) {
                                    selectionTL.x = selectionTL.x + incrementX;
                                }
                                if (selectionResizeRight) {
                                    selectionBR.x = selectionBR.x + incrementX;

                                }
                                if (selectionResizeTop) {
                                    selectionTL.y = selectionTL.y + incrementY;
                                }
                                if (selectionResizeBot) {
                                    selectionBR.y = selectionBR.y + incrementY;
                                }
                            }
                        } else { // crear selection
                            selectionTL.x = startClickLeft.x;
                            selectionTL.y = startClickLeft.y;
                            selectionBR.x = mousePos.x;
                            selectionBR.y = mousePos.y;
                        }
                        pinta();
                        pintaSelection();
                    }
                    break;
            }
            break;
        case FRAMETOSELECT:
            pinta();
            sheet.paintSelection($("#spriteList").val(), mousePos, canvas);
            break;
        case FRAMESELECTED:
            if (isDownLeft){
                switch (modeFrame){
                    case MODEEDIT:
                        posSprAdj.x = posSprAdj.x + (mousePos.x - startClickLeft.x);
                        posSprAdj.y = posSprAdj.y + (mousePos.y - startClickLeft.y);
                        break;
                    case MODEADJUST:
                        posFrame.x = posFrame.x + (mousePos.x - startClickLeft.x);
                        posFrame.y = posFrame.y + (mousePos.y - startClickLeft.y);
                        break;
                }
                startClickLeft = getMousePos(canvas, event);
                pinta();
                pintaSelection();

            }
            break;
    }
}

/**
 * funcion que pinta el recuadro de seleccion
 */
function pintaSelection() {
    ctx.save();
    switch (modeCanvas){
        case IMPORTEDIMAGE:
            if (modeSelection == SELECTIONDEFAULT) {
                if (selectionTL.defined() && selectionBR.defined()) {
                    ctx.fillStyle = 'rgba(255,0,0,0.1)';
                    ctx.strokeStyle = '#000000';
                    ctx.strokeRect(selectionTL.x, selectionTL.y, selectionBR.x - selectionTL.x, selectionBR.y - selectionTL.y);
                    ctx.fillRect(selectionTL.x, selectionTL.y, selectionBR.x - selectionTL.x, selectionBR.y - selectionTL.y);

                }
            }else if (modeSelection == SELECTIONAUTO){
                ctx.translate(canvas.width/2,canvas.height/2);
                ctx.translate(posImage.x, posImage.y);
                ctx.scale(currentScale,currentScale);
                ctx.translate(-img.width/2,-img.height/2);

                ctx.fillStyle = 'rgba(255,0,0,0.1)';
                ctx.strokeStyle = '#000000';
                for (var i=0; i < listOfFrames.length; i++){
                    ctx.strokeRect(listOfFrames[i].TL.x, listOfFrames[i].TL.y, listOfFrames[i].BR.x - listOfFrames[i].TL.x, listOfFrames[i].BR.y - listOfFrames[i].TL.y);
                    ctx.fillRect(listOfFrames[i].TL.x, listOfFrames[i].TL.y, listOfFrames[i].BR.x - listOfFrames[i].TL.x, listOfFrames[i].BR.y - listOfFrames[i].TL.y);
                }

            }
            break;
        case FRAMESELECTED:
            ctx.strokeStyle = '#000000';
            ctx.translate(posFrame.x, posFrame.y);
            ctx.strokeRect(0, 0, imageSprAdj.width, imageSprAdj.height);
            break;
    }
    ctx.restore();
}

/**
 * limpia el canvas
 */
function clear(){
    ctx.clearRect(0,0,canvas.width, canvas.height);
}

function pintaTransparency(){
    ctx.save();
    ctx.globalAlpha = 0.5;
    var spriteName = $("#spriteList").val();
    var spr = sheet.getSpriteByName(spriteName);
    var i;
    i = 0;
    while (spr.existsFrame(i)){
        if (i != selectedFrame){
            var frame = spr.getFrame(i);
            var p = spr.getPositionFrame(i);
            ctx.drawImage(frame.getImageFrame(), p.x, p.y);
        }
        i = i + 1;
    }
    ctx.restore();
}

/**
 * pinta la imagen en el canvas conservando posicion y zoom
 */
function pinta(){
    clear();
    ctx.save();
    switch (modeCanvas){
        case IMPORTEDIMAGE:
            ctx.translate(canvas.width/2,canvas.height/2);
            ctx.translate(posImage.x, posImage.y);
            ctx.scale(currentScale,currentScale);
            ctx.translate(-img.width/2,-img.height/2);
            ctx.drawImage(img,0,0);
            break;
        case FRAMETOSELECT:
            var spriteName =  $("#spriteList").val();
            sheet.paintFrameSelection(spriteName,canvas);
            break;
        case FRAMESELECTED:
            if (bTransparencyPreview){
                pintaTransparency();
            }
            ctx.translate(posFrame.x, posFrame.y);
            ctx.translate(posSprAdj.x, posSprAdj.y);
            ctx.drawImage(imageSprAdj,0,0);
            break;
    }
    ctx.restore();
}

/**
 * Añade la imagen del canvas que va desde ori hasta dest como frame del sprite seleccionado
 * @param ori
 * @param dest
 */
function saveFrameToSprite(ori, dest){
    //guardar el frame al sprite
    var frameTmp = getSelectedFrame(ori,dest, canvas);
    var spriteName = $("#spriteList").val();
    sheet.addFrameToSprite(spriteName, frameTmp);
    changePreview();
}

/**
 * Devuelve un frame desde ori a dest del canvas principal
 * @param ori
 * @param dest
 * @returns {Frame}
 */
function getSelectedFrame(ori, dest, canv){
    var cont = canv.getContext('2d');
    var width = (dest.x+1) - ori.x;
    var height = (dest.y+1) - ori.y;
    var imgData = cont.getImageData(ori.x,ori.y,width,height);

    var newCanvas = document.createElement("canvas");
    newCanvas.width = width;
    newCanvas.height = height;

    newCanvas.getContext("2d").putImageData(imgData,0,0);
    var dataURL = newCanvas.toDataURL("image/png");
    var newFrame = new Frame(dataURL);

    return newFrame;
}

/**
 * evento de carga de la pagina
 */
window.onload= function(){
    canvas = document.getElementById('preview');
    ctx = canvas.getContext('2d');
    canvas.width = $('#preview').width();
    canvas.height = $('#preview').height();
    tranparencyMatrix = _.range(canvas.width).map(function(){
        return _.range(canvas.height).map(function(){
            return true;
        });
    });
    canvas.addEventListener('click',nullFunction,false);
    canvas.addEventListener('contextmenu',nullFunction,false);
    canvas.addEventListener('mousedown', nullFunction, false);
    canvas.addEventListener('mouseup', nullFunction, false);
    canvas.addEventListener('mousemove', nullFunction, false);
    canvas.addEventListener('dblclick', nullFunction, false);

    canvas.addEventListener('mousedown', doMouseDown, false);
    canvas.addEventListener('mouseup', doMouseUp, false);
    canvas.addEventListener('mousemove', doMouseMove, false);
    canvas.addEventListener('dblclick', doMouseDblClick, false);
    var inputFile = document.getElementById("imagen");
    inputFile.addEventListener('change', function (event) {
        var file = event.target.files[0];

        var url = URL.createObjectURL(file);
        img.onload = function(){
            loadImage();
            pinta();
            pintaSelection();
        };
        img.src = url;
    });
    $(window).resize(function(){
        canvas.with = $('#preview').width();
        canvas.height = $('#preview').height();
        pinta();
        pintaSelection();
        imageDataPixels = ctx.getImageData(0,0,canvas.width,canvas.height);
    });
    sheet = new Spritesheet();
};


/**
 * Funcion que se ejecuta an cuanto se carga la imagen
 */
function loadImage(){
    currentScale = 1;
    mouseMode = MOUSESELECTIONMODE;
    modeCanvas = IMPORTEDIMAGE;
    posImage = new Point(0,0);
   // clear();
    pinta();
    transparentColor = false;
    imageDataPixels = ctx.getImageData(0,0,canvas.width,canvas.height);
    detectTransparentColor();
}


function detectTransparentColor(){
    var canv = document.createElement("canvas");
    canv.width = img.width;
    canv.height = img.height;
    var cnt = canv.getContext('2d');
    cnt.drawImage(img,0,0,canv.width,canv.height);
    var imageTransParentData = ctx.getImageData(0,0,canv.width,canv.height);
    for (var x=0; x<imageTransParentData.width && !transparentColor; x++){
        for (var y=0; y<imageTransParentData.height && !transparentColor; y++){
            var pixelCoord = x*4+y*imageTransParentData.width*4;
            if (imageTransParentData.data[pixelCoord+IMGDATAALPHA] == 0){
                transparentColor = true;
            }
         }
    }
}

function isTransparent(x,y, dataImage){
    var pixelCoord = x*4+y*dataImage.width*4;
    if (dataImage.data[pixelCoord+IMGDATAALPHA] == 0){
        return true;
    }else{
        return false;
    }
}

function isFrameCompletelyInsideArea(pointAreaTL,pointAreaBR, pointFrameTL, pointFrameBR){
    if (!isFrameOutsideLeft(pointAreaTL,pointAreaBR, pointFrameTL, pointFrameBR) && !isFrameOutsideRight(pointAreaTL,pointAreaBR, pointFrameTL, pointFrameBR) &&
        !isFrameOutsideTop(pointAreaTL,pointAreaBR, pointFrameTL, pointFrameBR) && !isFrameOutsideBottom(pointAreaTL,pointAreaBR, pointFrameTL, pointFrameBR)){
        return true;
    }else{
        return false;
    }
}

function isAreaInsideFrame(pointAreaTL,pointAreaBR, pointFrameTL, pointFrameBR) {
    if (isFrameOutsideLeft(pointAreaTL,pointAreaBR, pointFrameTL, pointFrameBR) && isFrameOutsideRight(pointAreaTL,pointAreaBR, pointFrameTL, pointFrameBR) &&
        isFrameOutsideTop(pointAreaTL,pointAreaBR, pointFrameTL, pointFrameBR) && isFrameOutsideBottom(pointAreaTL,pointAreaBR, pointFrameTL, pointFrameBR)){
        return true;
    }else{
        return false;
    }
}

function isFrameOutsideLeft(pointAreaTL,pointAreaBR, pointFrameTL, pointFrameBR) {
    if ((pointAreaTL.x > pointFrameTL.x)) {
        return true;
    }else{
        return false;
    }
}

function isFrameOutsideRight(pointAreaTL,pointAreaBR, pointFrameTL, pointFrameBR) {
    if (pointAreaBR.x < pointFrameBR.x){
        return true;
    }else{
        return false;
    }

}

function isFrameOutsideTop(pointAreaTL,pointAreaBR, pointFrameTL, pointFrameBR) {
    if (pointAreaTL.y  > pointFrameTL.y){
        return true;
    }else{
        return false;
    }
}

function isFrameOutsideBottom(pointAreaTL,pointAreaBR, pointFrameTL, pointFrameBR) {
    if (pointAreaBR.y < pointFrameBR.y){
        return true;
    }else{
        return false;
    }
}

function isFrameParciallyInArea(pointAreaTL,pointAreaBR, pointFrameTL, pointFrameBR) {
    if ((pointFrameTL.x < pointAreaTL.x && pointFrameBR.x < pointAreaTL.x) ||
        (pointFrameTL.x > pointAreaBR.x && pointFrameBR.x > pointAreaBR.x) ||
        (pointFrameTL.y < pointAreaTL.y && pointFrameBR.y < pointAreaTL.y) ||
        (pointFrameTL.y > pointAreaBR.y && pointFrameBR.y > pointAreaBR.y)) {
        return false;
    }else{
        return true;
    }
}

function newAreasToCheck(areaToCheck,i, frameTL, frameBR, pointLooking){
//    pinta();
//    ctx.fillRect(frameTL.x, frameTL.y, frameBR.x - frameTL.x, frameBR.y - frameTL.y);
//    ctx.strokeRect(areaToCheck[i].pTL.x, areaToCheck[i].pTL.y, areaToCheck[i].pBR.x - areaToCheck[i].pTL.x, areaToCheck[i].pBR.y - areaToCheck[i].pTL.y);
    var pActuBR = new Point(areaToCheck[i].pBR.x,areaToCheck[i].pBR.y);
    if (isFrameParciallyInArea(areaToCheck[i].pTL,areaToCheck[i].pBR,frameTL,frameBR) || isFrameCompletelyInsideArea(areaToCheck[i].pTL,areaToCheck[i].pBR,frameTL,frameBR)){
        if (isFrameCompletelyInsideArea(areaToCheck[i].pTL,areaToCheck[i].pBR,frameTL,frameBR)){
            //creamos el siguiente cuadrante a la derecha de la imagen
            var quadTL = new Point(frameBR.x+1,frameTL.y);
            var quadBR = new Point(areaToCheck[i].pBR.x, frameBR.y);
            areaToCheck[areaToCheck.length] = {pTL:quadTL,pBR:quadBR};
//            ctx.strokeRect(quadTL.x, quadTL.y, quadBR.x - quadTL.x, quadBR.y - quadTL.y);

            //Creamos el cuadrante que queda abajo del sprite
            var quad2TL =  new Point(areaToCheck[i].pTL.x, frameBR.y+1);
            var quad2BR = new Point(areaToCheck[i].pBR.x,areaToCheck[i].pBR.y);
            areaToCheck[areaToCheck.length] = {pTL:quad2TL,pBR:quad2BR};
//            ctx.strokeRect(quad2TL.x, quad2TL.y, quad2BR.x - quad2TL.x, quad2BR.y - quad2TL.y);

            // lo que nos queda comprobar de este cuadrante lo ponemos como izquierda de la imagen
            pActuBR.x = frameTL.x-1;
            pActuBR.y = frameBR.y;
        }else if(isAreaInsideFrame(areaToCheck[i].pTL,areaToCheck[i].pBR,frameTL,frameBR)){
            //Si el frame ocupa el area ya estamos
            pActuBR.x = areaToCheck[i].pTL.x; // we are done
            pActuBR.y = areaToCheck[i].pTL.y; // we are done
        }else{
            //el frame se sale por algun lado
            //si no sale por la derecha creamos el area a la derecha del frame
            if (!isFrameOutsideRight(areaToCheck[i].pTL,areaToCheck[i].pBR,frameTL,frameBR)){
                var quadTL  = new Point(frameBR.x+1,pointLooking.y);
                var quadBR;
                if (!isFrameOutsideBottom(areaToCheck[i].pTL,areaToCheck[i].pBR,frameTL,frameBR)) {
                    quadBR = new Point(areaToCheck[i].pBR.x, frameBR.y);
                }else{
                    quadBR = new Point(areaToCheck[i].pBR.x, areaToCheck[i].pBR.y);
                }
                areaToCheck[areaToCheck.length] = {pTL:quadTL,pBR:quadBR};
//                ctx.strokeRect(quadTL.x, quadTL.y, quadBR.x - quadTL.x, quadBR.y - quadTL.y);

            }

            if (!isFrameOutsideBottom(areaToCheck[i].pTL,areaToCheck[i].pBR,frameTL,frameBR)) {
                //Creamos el cuadrante que queda abajo del sprite
                var quadTL2 = new Point(areaToCheck[i].pTL.x, frameBR.y+1);
                var quadBR2 = new Point(areaToCheck[i].pBR.x,areaToCheck[i].pBR.y);
                areaToCheck[areaToCheck.length] = {pTL:quadTL2,pBR:quadBR2};
  //              ctx.strokeRect(quadTL2.x, quadTL2.y, quadBR2.x - quadTL2.x, quadBR2.y - quadTL2.y);
                pActuBR.y = frameBR.y; //cambiamos la zona actual para no solaparnos con la nueva zona
            }

            if (!isFrameOutsideLeft(areaToCheck[i].pTL,areaToCheck[i].pBR,frameTL,frameBR)) {
                // lo que nos queda comprobar de este cuadrante lo ponemos como izquierda de la imagen
                pActuBR.x =  frameTL.x-1;
            }else{
                //la izquierda del frame le toca a otro area y entonces ya hemos acabado en esta
                pActuBR.x = areaToCheck[i].pTL.x; // we are done
                pActuBR.y = areaToCheck[i].pTL.y; // we are done
            }
        }
    }
    areaToCheck[i].pBR.x = pActuBR.x;
    areaToCheck[i].pBR.y = pActuBR.y;
    //ctx.strokeRect(areaToCheck[i].pTL.x, areaToCheck[i].pTL.y, areaToCheck[i].pBR.x - areaToCheck[i].pTL.x, areaToCheck[i].pBR.y - areaToCheck[i].pTL.y);

}

function detectFrames(){
    if (transparentColor == true){
        $("body").css("cursor", "wait");
        listOfFrames = new Array();
        var areaToCheck = new Array();
        $("#numFramesDetected").html("Numero de sprites detectados: 0");
        var canvasAutoDetect = document.createElement("canvas");
        var ctxAutoDetect = canvasAutoDetect.getContext('2d');
        canvasAutoDetect.width = img.width;
        canvasAutoDetect.height = img.height
        ctxAutoDetect.drawImage(img,0,0);
        var imageDataToDetect = ctxAutoDetect.getImageData(0,0,canvasAutoDetect.width,canvasAutoDetect.height);
        areaToCheck[0] = {pTL:new Point(0,0), pBR:new Point(imageDataToDetect.width,imageDataToDetect.height)};
        for (var i=0; i < areaToCheck.length; i++){
            for (var y=areaToCheck[i].pTL.y; y < areaToCheck[i].pBR.y;y++){
                for (var x=areaToCheck[i].pTL.x; x < areaToCheck[i].pBR.x; x++){
                    if (!isTransparent(x,y, imageDataToDetect)){
                        pinta();
                        ctx.save();
                        ctx.translate(canvas.width/2,canvas.height/2);
                        ctx.translate(posImage.x, posImage.y);
                        ctx.scale(currentScale,currentScale);
                        ctx.translate(-img.width/2,-img.height/2);
                        ctx.strokeRect(areaToCheck[i].pTL.x, areaToCheck[i].pTL.y, areaToCheck[i].pBR.x - areaToCheck[i].pTL.x, areaToCheck[i].pBR.y - areaToCheck[i].pTL.y);
                        var pointFound = new Point(x,y);
                        getSelectionAroundPoint(pointFound,imageDataToDetect);
                        pintaSelection();
                        ctx.restore();
                        //añadimos el frame a la lista de frames
                        var frame = getSelectedFrame(selectionTL, selectionBR, canvasAutoDetect);
                        var pointTL = new Point(selectionTL.x, selectionTL.y);
                        var pointBR = new Point(selectionBR.x, selectionBR.y);
                        var detectedFrame = {TL: pointTL, BR: pointBR, frame:frame};
                        listOfFrames[listOfFrames.length] = detectedFrame;

//                        pinta();
  //                      ctx.strokeRect(selectionTL.x, selectionTL.y, selectionBR.x - selectionTL.x, selectionBR.y - selectionTL.y);
    //                    ctx.strokeRect(areaToCheck[i].pTL.x, areaToCheck[i].pTL.y, areaToCheck[i].pBR.x - areaToCheck[i].pTL.x, areaToCheck[i].pBR.y - areaToCheck[i].pTL.y);
                        //creamos nuevas areas alrededor de ese frame
                        newAreasToCheck(areaToCheck,i, selectionTL, selectionBR, pointFound);
      //                  pinta();
        //                ctx.fillRect(selectionTL.x, selectionTL.y, selectionBR.x - selectionTL.x, selectionBR.y - selectionTL.y);
          //              for (var j=i; j < areaToCheck.length;j++){
            //                ctx.strokeRect(areaToCheck[j].pTL.x, areaToCheck[j].pTL.y, areaToCheck[j].pBR.x - areaToCheck[j].pTL.x, areaToCheck[j].pBR.y - areaToCheck[j].pTL.y);
              //          }
                        //comprobamos si ese frame esta en otras areas a mirar (parcialmente) y creamos nuevas areas a su alrededor
                        for (var j=i+1; j < areaToCheck.length; j++) {
                            newAreasToCheck(areaToCheck, j, selectionTL, selectionBR, areaToCheck[j].pTL);
                        }
                //        pinta();
                  //      ctx.fillRect(selectionTL.x, selectionTL.y, selectionBR.x - selectionTL.x, selectionBR.y - selectionTL.y);
                    //    for (var j=i; j < areaToCheck.length;j++){
                      //      ctx.strokeRect(areaToCheck[j].pTL.x, areaToCheck[j].pTL.y, areaToCheck[j].pBR.x - areaToCheck[j].pTL.x, areaToCheck[j].pBR.y - areaToCheck[j].pTL.y);
                       // }

                        $("#numFramesDetected").html("Numero de sprites detectados: " + listOfFrames.length);
                    }
                }
            }
        }
        selectionTL.x = 0;
        selectionTL.y = 0;
        selectionBR.x = 0;
        selectionBR.y = 0;
        modeSelection = SELECTIONAUTO;
        pinta();
        pintaSelection();
        $("body").css("cursor", "default");
        if (confirm("¿Desea Intentar autodetectar las animaciones para estos frames?")){
            $("body").css("cursor", "wait");
            autoDetectAnimations();
            $("body").css("cursor", "default");
        }
        modeSelection = SELECTIONDEFAULT;
        pinta();
    }else{
        alert ("no se puede detectar el color transparente en la imgen");
    }
}



function autoDetectAnimations(){
    var frameInSprite = new Array;
    var listaSprites = new Array;
    var spritesIntroducidos = 0;
    var percentDifference = $("#percentDifferenceText").val();
    if (!percentDifference){
        percentDifference = 5;  //by default 5
    }
    var maxWidth = 0;
    var maxHeight = 0;
    for (var i=0; i < listOfFrames.length; i++){
        frameInSprite[i] = -1;
        if (maxWidth < listOfFrames[i].frame.width) maxWidth = listOfFrames[i].frame.width;
        if (maxHeight < listOfFrames[i].frame.height) maxHeight = listOfFrames[i].frame.height;
    }

    var canv = document.createElement("canvas");
    var ctxt = canv.getContext('2d');
    canv.width = maxWidth;
    canv.height = maxHeight;
    for (var i=0; i < listOfFrames.length; i++){
        if (frameInSprite[i] == -1){
            listaSprites[spritesIntroducidos] = new Sprite("Sprite " + spritesIntroducidos);
            listaSprites[spritesIntroducidos].addFrame(listOfFrames[i].frame);
            frameInSprite[i] = spritesIntroducidos;
            var frameImage = listOfFrames[i].frame.getImageFrame();
            ctxt.clearRect(0,0,canv.width,canv.height);
            ctxt.drawImage(frameImage,0,0);
            for (var j=i+1; j < listOfFrames.length; j++){
                if (frameInSprite[j] == -1) {
                    var dif = listOfFrames[j].frame.compareWith(canv, 0, 0);
                    dif = dif*100;
                    if (dif <= percentDifference) {
                        frameInSprite[j] = spritesIntroducidos;
                        listaSprites[spritesIntroducidos].addFrame(listOfFrames[j].frame);
                    }
                }
            }
            spritesIntroducidos++;
        }
    }

    for (var i=0; i < listaSprites.length; i++) {
        if (sheet.addSprite(listaSprites[i])) {
            $("#spriteList").append('<option value="' + listaSprites[i].getName() + '">' + listaSprites[i].getName() + '</option>');
            $("#spriteName").val('');
        }
    }
}

/**
 * click en el boton de seleccion inicializa el modo seleccion
 */
function selectionModeBtn() {
//    selectionTL.reset();
//    selectionBR.reset();
    mouseMode = MOUSESELECTIONMODE;
    modeCanvas = IMPORTEDIMAGE;
    pinta();
    pintaSelection();
}

/**
 * click en el boton de mover (inicializa el modo mover)
 */
function moveModeBtn(){
    mouseMode = MOUSEMOVEMODE;
    pinta();
}

/**
 * click en el boton Zoom in, hace que se amplie el zoom
 */
function zoomInBtn(){
    currentScale += 0.1;
    pinta();
}

/**
 * click en el boton Zoom Out, hace que se reduzca el zoom
 */
function zoomOutBtn(){
    currentScale -= 0.1;
    pinta();
}

/**
 * click de boton añadir al frame, añade la imagen seleccionada como frame de un sprite
 */
function addFrameBtn(){
    if (document.getElementById("spriteList").selectedIndex == -1) {
        alert("Has de seleccionar un sprite antes");
    }else {
        if (selectionTL.defined() && selectionBR.defined()){
            pinta();
            saveFrameToSprite(selectionTL, selectionBR);
            pinta();
            pintaSelection();
        }
    }
}

/**
 * Click en el boton que Añade sprite en la lista de sprites
 */
function addSpriteBtn(){
    var name = $("#spriteName").val();
    name = name.trim();
    if (name != '') {
        if (sheet.existsSprite(name)){
            alert("el nombre del sprite ya existe y no se ha podido crear");
        }else {
            if (sheet.createSprite(name)) {
                $("#spriteList").append('<option value="' + name + '">' + name + '</option>');
                $("#spriteName").val('');
                $("#spriteList").val(name);
            } else {
                alert("ha ocurrido un error interno en la aplicación");
            }
        }
    }else{
        alert("debes introducir un nombre");
    }
}

/**
 * click del boton que descarga el spritesheet
 */
function exportSheetBtn(){
    var data = sheet.getSpriteSheet().toDataURL();
    downloadThis('spriteSheet.png',data);
}

function downloadClanLibXMLbtn(){
    var data = sheet.getClanLibXML();
    downloadThis('resources.xml',data);
    var data = sheet.getSpriteSheet().toDataURL();
    downloadThis('spriteSheet.png',data);
}

function downloadThis(fileName, data){
    var link = document.createElement('a');
    link.setAttribute('download',fileName);
    link.setAttribute('href', data);
    link.click();
}

function changePreview(){
    var spriteName = $("#spriteList").val();
    sheet.stopOldAnimation();
    sheet.paintAnimation(spriteName, $("#previewSpriteCanvas").get(0));
}

function transparencyBtn(){
    if($("#transparency").is(':checked')) {
        bTransparencyPreview = true;
    }else{
        bTransparencyPreview = false;
    }
    pinta();
    pintaSelection();
}

function adjustFrameBtn(){
    modeCanvas = FRAMETOSELECT;
    modeFrame = MODEADJUST;
    pinta();
}

function editFrameBtn(){
    modeCanvas = FRAMETOSELECT;
    modeFrame = MODEEDIT;
    pinta();
}

function saveAdjustedFrameBtn(){
    bTransparencyPreview = false;
    pinta();
    var ini = new Point;
    var fin = new Point;
    ini.x = posFrame.x;
    ini.y = posFrame.y;
    fin.x = ini.x + imageSprAdj.width;
    fin.y = ini.y + imageSprAdj.height;
    var frameTmp = getSelectedFrame(ini,fin, canvas);
    var spriteName = $("#spriteList").val();
    sheet.modifyFrameN(spriteName, selectedFrame, frameTmp);
    sheet.setPositionFrame(spriteName, selectedFrame, posFrame);
    imageSprAdj = sheet.getSelectionImage(spriteName,selectedFrame);
    posSprAdj.x = 0;
    posSprAdj.y = 0;
    if($("#transparency").is(':checked')) {
        bTransparencyPreview = true;
    }else{
        bTransparencyPreview = false;
    }
    pinta();
    pintaSelection();
    changePreview();

}

function setMilisecondsBtn(){
    var numberMiliseconds = $("#milisecondsText").val();
    if ($.isNumeric(numberMiliseconds)){
        sheet.stopOldAnimation();
        sheet.setMsToFrame($("#spriteList").val(),selectedFrame,numberMiliseconds);
        sheet.paintAnimation($("#spriteList").val(),$("#previewSpriteCanvas").get(0));
        alert('Numero de milisegundos del frame fijado a ' + numberMiliseconds);
    }else{
        alert("El numero de milisegundos no es un numero");
    }
}

function exportAnimatedGifBtn(){
    var spr = sheet.getSpriteByName($("#spriteList").val());
    $("body").css("cursor", "wait");
    busy = true;
    spr.exportToGif();
    setTimeout(function(){
        exportAnimatedGifDelay(spr);
    },500);
/*
*/
}

function exportAnimatedGifDelay(spr){
    var resultData = spr.getResultGif();
    if (resultData == -1){
        $("body").css("cursor", "wait");
        busy = true;
        setTimeout(function(){
            exportAnimatedGifDelay(spr);
        },1000);
    }else{
        $("body").css("cursor", "default");
        busy = false;
        var link = document.createElement('a');

        link.setAttribute('download', $("#spriteList").val() + '.gif');
        link.setAttribute('href', resultData);
        link.click();
        pinta();
    }
}

function deleteSpriteBtn(){
    if ($("#spriteList").prop("selectedIndex")  == -1) {
        alert("Has de seleccionar un sprite antes");
    }else {
        var spriteName = $("#spriteList").val();
        if (confirm('¿Seguro que quieres eliminar el sprite ' + spriteName + '?')) {
            sheet.stopOldAnimation();
            sheet.deleteSprite(spriteName);
            $("#spriteList option[value='"+ spriteName +"']").remove();
            $("#spriteList").prop("selectedIndex",-1);
        }
    }
}

function deleteFrameBtn(){
    var selectedSprite = $("#spriteList").val();
    if (selectedSprite == null || selectedFrame == -1){
        alert("Has de seleccionar un frame de un sprite antes");
    }else{
        if (confirm('¿seguro que quieres eliminar el frame ' + selectedFrame + ' del sprite ' + selectedSprite +'?')){
            sheet.stopOldAnimation();
            sheet.delFrame(selectedSprite,selectedFrame);
            if (sheet.getNumberFrames(selectedSprite) > 0){
                modeCanvas = FRAMETOSELECT;
                sheet.paintAnimation(selectedSprite,$("#previewSpriteCanvas").get(0));
            }else{
                modeCanvas = IMPORTEDIMAGE;
            }
            pinta();
        }
    }
}

function getSelectionAroundPoint(point, imageData){
    puntosVisitados = _.range(imageData.width).map(function(){
        return _.range(imageData.height).map(function(){
            return false;
        });
    });
    point.x = Math.round(point.x);
    point.y = Math.round(point.y);
    markPixel(point.x, point.y,true,imageData);
    var minX = point.x - 1;
    var maxX = point.x + 1;
    var minY = point.y - 1;
    var maxY = point.y + 1;

    var finish = false;
    while (!finish){
        finish = true;
        for (var y = minY; y <= maxY; y++){
            for (var x = minX; x <= maxX; x++){
                if (!pixelIsMarked(x,y, imageData) && !isTransparent(x,y,imageData) && isNeighbourOfMarkedPixel(x,y, imageData)){
                    if (markPixel(x,y,true,imageData)){
                        finish = false;
                        if (x - 1 < minX) minX = x - 1;
                        if (x + 1 > maxX) maxX = x + 1;
                        if (y - 1 < minY) minY = y - 1;
                        if (y + 1 > maxY) maxY = y + 1;
                    }
                }
            }
        }
    }
    selectionTL.x = minX + 1;
    selectionTL.y = minY + 1;
    selectionBR.x = maxX - 1;
    selectionBR.y = maxY - 1;
}


function pixelIsMarked(x,y,imageData){
    if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height){
        return false;
    }
    return puntosVisitados[x][y];
}

function isNeighbourOfMarkedPixel(x,y,imageData){
    return (
           pixelIsMarked(x - 1,y, imageData)
        || pixelIsMarked(x + 1,y, imageData)
        || pixelIsMarked(x, y - 1, imageData)
        || pixelIsMarked(x, y + 1, imageData)
    );
}

function markPixel(x,y, value, imageData){
    if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height){
        return false;
    }
    puntosVisitados[x][y] = value;
    return true;
}

function interpolateNextFrameBtn(){
    var selectedSprite = $("#spriteList").val();
    if (selectedSprite == null || selectedFrame == -1){
        alert("Has de seleccionar un frame de un sprite antes");
    }else{
        sheet.stopOldAnimation();
        sheet.interpolateNextFrame(selectedSprite,selectedFrame);
        modeCanvas = FRAMETOSELECT;
        sheet.paintAnimation(selectedSprite,$("#previewSpriteCanvas").get(0));
        pinta();
    }
}


/*
function resizeCanvas(canvas, width, height){
    var newCanvas = document.createElement("canvas");
    newCanvas.width =   canvas.width;
    newCanvas.height = canvas.height;
    newCanvas.getContext("2d").drawImage(canvas,0,0);

    canvas.width = width;
    canvas.height = height;

    canvas.getContext("2d").drawImage(newCanvas,0,0);
}
*/
function setAutoMsFastBtn(){
    var selectedSprite = $("#spriteList").val();
    var spr = new Sprite(" ");
    sheet.autoTuneTimeMs(selectedSprite,spr.autoTuneCalcFastDiffFunc);
}

function setAutoMsSlowBtn(){
    var selectedSprite = $("#spriteList").val();
    var spr = new Sprite(" ");
    sheet.autoTuneTimeMs(selectedSprite,spr.autoTuneCalcSlowDiffFunc);
}