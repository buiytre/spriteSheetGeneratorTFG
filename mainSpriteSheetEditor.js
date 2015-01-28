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
const MODESELECT = 0;
const MODEADJUST = 1;
const MODEEDIT = 2;

var modeSelection = 0;
const SELECTIONDEFAULT = 0;
const SELECTIONAUTO = 1;
/**************************************************/
var canvas;     //canvas central
var ctx;        //ctx para el canvas central
var sheet;      //sprite sheet
var imgTmp = new Image;
var img = new Image;    // imagen cargada a traves del load
var posImage = new Point; //Posicion de la imagen

var currentScale = 1;   //ESCALA del zoom

//*******control mouse******
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
var spriteSelectedName = -1;
var imageSprAdj = new Image;
var posSprAdj = new Point;
var posFrame = new Point;
var bTransparencyPreview = false;

var bAddFrameOnReturn = false;

var modeDifference = 0;
const SLOWDIF = 1;
const FASTDIF = 2;


var listOfFrames = new Array();

var busy = false;


/*******************************************
 *  EVENTOS DE LA PAGINA
 *****************************************/
/**
 * evento de carga de la pagina
 */
window.onload= function(){
    canvas = document.getElementById('preview');
    ctx = canvas.getContext('2d');

    var pw = canvas.parentNode.clientWidth;
    var ph = canvas.parentNode.clientHeight;

    canvas.height = pw * 0.95 * (canvas.height/canvas.width);
    canvas.width = pw * 0.95;
    canvas.style.top = (ph-canvas.height)/2 + "px";
    canvas.style.left = (pw-canvas.width)/2 + "px";

    var canvasSprite = document.getElementById('previewSpriteCanvas');
    var ctxSprite = canvas.getContext('2d');

    pw = canvas.parentNode.clientWidth;
    ph = canvas.parentNode.clientHeight;

    canvasSprite.height = pw * 0.5 * (canvas.height/canvas.width);
    canvasSprite.width = pw * 0.17;
    canvasSprite.style.top = (ph-canvasSprite.height)/2 + "px";
    canvasSprite.style.left = (pw-canvasSprite.width)/2 + "px";

    transparencyMatrix = new Array();
    for(var i=0;i<canvas.width;i++){
        transparencyMatrix[i]=new Array();
        for(var j=0;j<canvas.height;j++){
            transparencyMatrix[i][j]=true;
        }
    }
    document.addEventListener('onselectstart',nullFunction,false);
    document.addEventListener('contextmenu',nullFunction,false);
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
        /*        imgTmp.onload = function(){
         loadImage();
         pinta();
         pintaSelection();
         };*/
        imgTmp.src = url;
    });
    $(window).resize(function(){
        canvas = document.getElementById('preview');
        ctx = canvas.getContext('2d');

        var pw = canvas.parentNode.clientWidth;
        var ph = canvas.parentNode.clientHeight;

        canvas.height = pw * 0.9* (canvas.height/canvas.width);
        canvas.width = pw * 0.99;
        canvas.style.top = (ph-canvas.height)/2 + "px";
        canvas.style.left = (pw-canvas.width)/2 + "px";
        var canvasSprite = document.getElementById('previewSpriteCanvas');
        var ctxSprite = canvas.getContext('2d');

        pw = canvas.parentNode.clientWidth;
        ph = canvas.parentNode.clientHeight;

        canvasSprite.height = pw * 0.5 * (canvas.height/canvas.width);
        canvasSprite.width = pw * 0.17;
        canvasSprite.style.top = (ph-canvasSprite.height)/2 + "px";
        canvasSprite.style.left = (pw-canvasSprite.width)/2 + "px";
        pinta();
        pintaSelection();
        imageDataPixels = ctx.getImageData(0,0,canvas.width,canvas.height);
    });
    sheet = new Spritesheet();
    putCanvasInModeImport();
    imgTmp = document.createElement('img');
    imgTmp.src = "resources/white.png";
    loadImageTemp();
};


/*******************************************
 *  Manejo del raton
 *****************************************/
/**
 * Funcion que devuelve la posicion del raton en el canvas
 * @param cv
 * @param e
 * @returns {{x: number, y: number}}
 */
function getMousePos(cv,e){
    var rect = cv.getBoundingClientRect();
    // getBoundingClientRect ignora border y padding, asi que lo calculamos nosotros mediante jquery
    var widthLeft = Number($(canvas).css('border-left-width').replace(/[^-\d\.]/g, ''));
    var widthTop = Number($(canvas).css('border-top-width').replace(/[^-\d\.]/g, ''));
    var padLeft = Number($(canvas).css('padding-left').replace(/[^-\d\.]/g, ''));
    var padTop = Number($(canvas).css('padding-top').replace(/[^-\d\.]/g, ''));
    var x = (e.clientX - rect.left);
    var y = (e.clientY - rect.top);
    x = x - padLeft;
    y = y - padTop;
    x = x - widthLeft;
    y = y - widthTop;
    return {x:  x, y: y};
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
            if (modeCanvas == FRAMETOSELECT){
                marcaFrame();
            }
            break;
        case 3:
            startClickRight = getMousePos(canvas,event);
            isDownRight = true;
            break;
        default:
            break;
    }
    checkMoveAndResizeSelection();
}

/**
 * evento de levantar el click del raton
 * @param event
 */
function doMouseUp(event){
    switch (event.which){
        case 1:
            isDownLeft = false;
            break;
        case 3:
            isDownRight = false;
            break;
        default:
            break;
    }
}

/**
 * Evento doble click del raton
 * @param event
 */
function doMouseDblClick(event){
    switch (event.which){
        case 1:
            if (modeCanvas == IMPORTEDIMAGE){
                if (transparentColor){
                    imageDataPixels = ctx.getImageData(0,0,canvas.width,canvas.height);
                    $("#loadBar").modal('show');
                    getSelectionAroundPoint(mousePos,imageDataPixels, finishDblClick);
                }
                break;
            }
            break;
    }
}

function finishDblClick(){
    selectionTL.x = minX + 1;
    selectionTL.y = minY + 1;
    selectionBR.x = maxX - 1;
    selectionBR.y = maxY - 1;
    $("#loadBar").modal('hide');
    pinta();
    pintaSelection();
}

/**
 * evento que controla el movimiento del raton
 * @param event
 */
function doMouseMove(event) {
    mousePos = getMousePos(canvas, event);
    // $("#info").text( "x: " + mousePos.x + " y: "+ mousePos.y + " selectionTL x: " + selectionTL.x + " y: " + selectionTL.y + " selectionBR x: " + selectionBR.x + " y: " + selectionBR.y);
    switch (modeCanvas) {
        case IMPORTEDIMAGE:
            if (isDownRight) {
                var incrX = (mousePos.x - startClickRight.x);
                var incrY = (mousePos.y - startClickRight.y);
                posImage.x = posImage.x + incrX;
                posImage.y = posImage.y + incrY;
                if (selectionTL.x && selectionTL.y && selectionBR.x && selectionBR.y){
                    selectionTL.x = selectionTL.x + incrX;
                    selectionTL.y = selectionTL.y + incrY;
                    selectionBR.x = selectionBR.x + incrX;
                    selectionBR.y = selectionBR.y + incrY;
                }
                imageDataPixels = ctx.getImageData(0,0,canvas.width,canvas.height);
                startClickRight = getMousePos(canvas, event);
            }
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
            }
            pinta();
            pintaSelection();
            break;
        case FRAMETOSELECT:
            if (isDownRight) {
                var incrY = (mousePos.y - startClickRight.y);
                var maxY = sheet.maxYRect(spriteSelectedName);
                if (posImage.y + incrY < maxY){
                    posImage.y = posImage.y + incrY;
                }
                if (posImage.y < 0) posImage.y = 0;
                startClickRight = getMousePos(canvas, event);
            }
            pinta();
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
            }
            pinta();
            pintaSelection();
            break;
    }
}
/**
 * Funciones para el manejo del raton en el canvas (selección)
 */
/**
 * esta función invierte el TL y BR de la selección si el BR pasa a estar mas arriba o mas
 * a la izquierda que el TL
 */
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

/**
 * funcion que se encarga de cambiar el cursor del raton si esta dentro de una selección
 */
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

/***
 * Manejo de zoom
 */
/**
 * click en el boton Zoom in, hace que se amplie el zoom
 */
function zoomInBtn(){
    currentScale += 0.1;
    pinta();
    imageDataPixels = ctx.getImageData(0,0,canvas.width,canvas.height);
}

/**
 * click en el boton Zoom Out, hace que se reduzca el zoom
 */
function zoomOutBtn(){
    currentScale -= 0.1;
    pinta();
    imageDataPixels = ctx.getImageData(0,0,canvas.width,canvas.height);
}

/**
 * Funciones de pintar en canvas
 */
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

/**
 * Pinta la todos los Frames de una animacion con transparencias en el modo Onion Skining
 */
function pintaTransparency(){
    ctx.save();
    ctx.globalAlpha = 0.5;
    var spr = sheet.getSpriteByName(spriteSelectedName);
    var i;
    i = 0;
    while (spr.existsFrame(i)){
        if (i != selectedFrame){
            var frame = spr.getFrame(i);
            var p = spr.getPositionFrame(i);
            if (frame.getImageFrame().width && frame.getImageFrame().height) ctx.drawImage(frame.getImageFrame(), p.x, p.y);
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
            if (img.width && img.height) ctx.drawImage(img,0,0);
            break;
        case FRAMETOSELECT:
            sheet.paintSelectionRect($("#spriteList").val(), mousePos, canvas, posImage.y);
            break;
        case FRAMESELECTED:
            if (bTransparencyPreview){
                pintaTransparency();
            }
            ctx.translate(posFrame.x, posFrame.y);
            ctx.translate(posSprAdj.x, posSprAdj.y);
            if (imageSprAdj.width && imageSprAdj.height) ctx.drawImage(imageSprAdj,0,0);
            break;
    }
    ctx.restore();
}
/**
 * Funciones para el modo importar imagen
 */

/**
 * Funcion que se ejecuta en cuanto se carga una imagen en la aplicación
 */
function loadImageTemp(){
    img = document.createElement('img');
    img.src = imgTmp.src;
    loadImage();
    pinta();
    pintaSelection();
    $('#loadImageModal').modal('hide')
}

/**
 * Esta funcion es la funcion que acepta definitivamente el archivo seleccionado en el menu de importar
 */
function loadImage(){
    currentScale = 1;
    modeCanvas = IMPORTEDIMAGE;
    posImage = new Point(0,0);
    // clear();
    selectionTL.x = undefined;
    selectionTL.y = undefined;
    selectionBR.x = undefined;
    selectionBR.y = undefined;
    pinta();
    transparentColor = false;
    imageDataPixels = ctx.getImageData(0,0,canvas.width,canvas.height);
    detectTransparentColor();
}

/**
 * Funcion que detecta si la imagen introducida tiene el color alfa definido
 */
function detectTransparentColor(){
    var canv = document.createElement("canvas");
    canv.width = img.width;
    canv.height = img.height;
    var cnt = canv.getContext('2d');
    if (img.width && img.height) cnt.drawImage(img,0,0,canv.width,canv.height);
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


function processLoop( actionFunc, numTimes, doneFunc ) {
    var i = 0;
    var f = function () {
        if (i < numTimes) {
            actionFunc( i++ );  // closure on i
            setTimeout( f, 10 )
        }
        else if (doneFunc) {
            doneFunc();
        }
    };
    f();
}

/**
 * Devuelve la seleccion alrededor de un punto seleccionado (automaticamente
 * @param point
 * @param imageData
 */
var imageDataTmp = {'width':0,'height': 0,'data':new Array()};
var minX;
var maxX;
var minY;
var maxY;
function getSelectionAroundPoint(point, imageData, onEnd){
    minX =0;
    minY = 0;
    maxX = 0;
    maxY = 0;
    imageDataTmp.width = imageData.width;
    imageDataTmp.height = imageData.height;
    for (var i=0; i < imageData.data.length; i++){
        imageDataTmp.data[i] = imageData.data[i];
    }
    puntosVisitados = new Array();
    for(var i=0;i<imageDataTmp.width;i++){
        puntosVisitados[i]=new Array();
        for(var j=0;j<imageDataTmp.height;j++){
            puntosVisitados[i][j]=false;
        }
    }
    point.x = Math.round(point.x);
    point.y = Math.round(point.y);
    markPixel(point.x, point.y,true,imageDataTmp);
    minX = point.x - 1;
    maxX = point.x + 1;
    minY = point.y - 1;
    maxY = point.y + 1;
    setTimeout(function(){
        checkPoints(onEnd);
    }, 0);

}


function checkPoints(func){
    var changed = false;
    for (var y = minY; y <= maxY; y++){
        for (var x = minX; x <= maxX; x++){
            if (!pixelIsMarked(x,y, imageDataTmp) && !isTransparent(x,y,imageDataTmp) && isNeighbourOfMarkedPixel(x,y, imageDataTmp)){
                if (markPixel(x,y,true,imageDataTmp)){
                    if (x - 1 < minX) minX = x - 1;
                    if (x + 1 > maxX) maxX = x + 1;
                    if (y - 1 < minY) minY = y - 1;
                    if (y + 1 > maxY) maxY = y + 1;
                    changed = true;
                }
            }
        }
    }
    if (changed){
        var val = $("#progressBar").val();
        if (val>= 100){
            $("#progressBar").val(0);
        }else{
            $("#progressBar").val(val+1);
        }
        setTimeout(function(){
            checkPoints(func);
        },0);
    }else{
        func();
    }
}



/**
 * Funcion auxiliar de getSelectionAroundPoint que se utiliza para saber si ya hemos visitado un pixel
 * @param x
 * @param y
 * @param imgData
 * @returns {*}
 */
function pixelIsMarked(x,y,imgData){
    if (x < 0 || y < 0 || x >= imgData.width || y >= imgData.height){
        return false;
    }
    return puntosVisitados[x][y];
}
/**
 * Funcion auxiliar de getSelectionAroundPoint que se utiliza para saber si un vecino del punto x y esta visitado
 * @param x
 * @param y
 * @param imgData
 * @returns {*}
 */
function isNeighbourOfMarkedPixel(x,y,imgData){
    return (
    pixelIsMarked(x - 1,y, imgData)
    || pixelIsMarked(x + 1,y, imgData)
    || pixelIsMarked(x, y - 1, imgData)
    || pixelIsMarked(x, y + 1, imgData)
    );
}

/**
 * Funcion auxiliar de getSelectionAroundPoint que se utiliza para marcar un pixel como visitado
 * @param x
 * @param y
 * @param value
 * @param imageData
 * @returns {boolean}
 */
function markPixel(x,y, value, imgData){
    if (x < 0 || y < 0 || x >= imgData.width || y >= imgData.height){
        return false;
    }
    puntosVisitados[x][y] = value;
    return true;
}
/**
 * indica si un pixel en el punto x y es transparente
 * @param x
 * @param y
 * @param dataImage
 * @returns {boolean}
 */
function isTransparent(x,y, imgData){
    var pixelCoord = x*4+y*imgData.width*4;
    if (imgData.data[pixelCoord+IMGDATAALPHA] == 0){
        return true;
    }else{
        return false;
    }
}

/****************
 *
 *  Funciones para la funcionalidad de añadir Frames
 *
 **********/
/**
 * Añade la imagen del canvas que va desde ori hasta dest como frame del sprite seleccionado
 * @param ori
 * @param dest
 */
function saveFrameToSprite(ori, dest){
    //guardar el frame al sprite
    var frameTmp = getSelectedFrame(ori,dest, canvas);
    sheet.addFrameToSprite(spriteSelectedName, frameTmp);
    changePreview();
}

/**
 * Devuelve un frame desde ori a dest del canvas principal
 * @param ori
 * @param dest
 * @param canv
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

    return (new Frame(dataURL));
}
/**
 * Marca un frame en el modo Sprite
 */
function marcaFrame(){
    selectedFrame = sheet.marcaFrameSelected(spriteSelectedName, mousePos,posImage.y);
    pinta();
    pintaSelection();
}


function newAreasToCheck(areaToCheck,i, frameTL, frameBR, pointLooking){
    var pActuBR = new Point(areaToCheck[i].pBR.x,areaToCheck[i].pBR.y);
    if (isFrameParciallyInArea(areaToCheck[i].pTL,areaToCheck[i].pBR,frameTL,frameBR) || isFrameCompletelyInsideArea(areaToCheck[i].pTL,areaToCheck[i].pBR,frameTL,frameBR)){
        if (isFrameCompletelyInsideArea(areaToCheck[i].pTL,areaToCheck[i].pBR,frameTL,frameBR)){
            //creamos el siguiente cuadrante a la derecha de la imagen
            var quadTL = new Point(frameBR.x+1,frameTL.y);
            var quadBR = new Point(areaToCheck[i].pBR.x, frameBR.y);
            areaToCheck[areaToCheck.length] = {pTL:quadTL,pBR:quadBR};

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
            }

            if (!isFrameOutsideBottom(areaToCheck[i].pTL,areaToCheck[i].pBR,frameTL,frameBR)) {
                //Creamos el cuadrante que queda abajo del sprite
                var quadTL2 = new Point(areaToCheck[i].pTL.x, frameBR.y+1);
                var quadBR2 = new Point(areaToCheck[i].pBR.x,areaToCheck[i].pBR.y);
                areaToCheck[areaToCheck.length] = {pTL:quadTL2,pBR:quadBR2};
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
    return ((pointAreaTL.x > pointFrameTL.x));
}

function isFrameOutsideRight(pointAreaTL,pointAreaBR, pointFrameTL, pointFrameBR) {
    if (pointAreaBR.x < pointFrameBR.x){
        return true;
    }else{
        return false;
    }

}

function isFrameOutsideTop(pointAreaTL,pointAreaBR, pointFrameTL, pointFrameBR) {
    return (pointAreaTL.y  > pointFrameTL.y);
}

function isFrameOutsideBottom(pointAreaTL,pointAreaBR, pointFrameTL, pointFrameBR) {
    return (pointAreaBR.y < pointFrameBR.y);
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

/**
 * Funcion que autodetecta frames en el canvas
 */
var xAuto;
var yAuto;
var areaToCheck;
var canvasAutoDetect;
var ctxAutoDetect;
var imageDataToDetect;
var areasToCheckN;
var pointFound;
function autoDetectFrames(){
    listOfFrames = new Array();
    areaToCheck = new Array();
    canvasAutoDetect = document.createElement("canvas");
    ctxAutoDetect = canvasAutoDetect.getContext('2d');
    canvasAutoDetect.width = img.width;
    canvasAutoDetect.height = img.height;
    if (img.width && img.height) ctxAutoDetect.drawImage(img, 0, 0);
    imageDataToDetect = ctxAutoDetect.getImageData(0, 0, canvasAutoDetect.width, canvasAutoDetect.height);
    areaToCheck[0] = {pTL: new Point(0, 0), pBR: new Point(imageDataToDetect.width, imageDataToDetect.height)};
    areasToCheckN = 0;
    setTimeout(function(){
        areasToCheck();
    },0);

}

function areasToCheck(){
    if (areasToCheckN >= areaToCheck.length){
        selectionTL.x = 0;
        selectionTL.y = 0;
        selectionBR.x = 0;
        selectionBR.y = 0;
        endAutoDetectFrames();
    }else{
        setTimeout(function(){
            yAuto = areaToCheck[areasToCheckN].pTL.y;
            loopY();
        },0);
    }
}


function loopY(){
    var val = $("#progressBar").val();
    if (val>= 100){
        $("#progressBar").val(0);
    }else{
        $("#progressBar").val(val+1);
    }
    if (yAuto >= areaToCheck[areasToCheckN].pBR.y){
        setTimeout(function(){
            areasToCheckN++;
            areasToCheck();

        },0);
    }else{
        setTimeout(function(){
            xAuto = areaToCheck[areasToCheckN].pTL.x;
            loopX();
        },0);
    }
}

function loopX(){
    if (xAuto >= areaToCheck[areasToCheckN].pBR.x) {
        setTimeout(function(){
            yAuto++;
            loopY();
        },0);
    }else{
        if (!isTransparent(xAuto, yAuto, imageDataToDetect)) {
            pointFound = new Point(xAuto, yAuto);
            getSelectionAroundPoint(pointFound, imageDataToDetect,continueLoopX);
        }else{
            xAuto++;
            loopX();
        }
    }
}

function continueLoopX(){
    //añadimos el frame a la lista de frames

    selectionTL.x = minX + 1;
    selectionTL.y = minY + 1;
    selectionBR.x = maxX - 1;
    selectionBR.y = maxY - 1;

    var frame = getSelectedFrame(selectionTL, selectionBR, canvasAutoDetect);
    var pointTL = new Point(selectionTL.x, selectionTL.y);
    var pointBR = new Point(selectionBR.x, selectionBR.y);
    listOfFrames[listOfFrames.length] = {TL: pointTL, BR: pointBR, frame: frame};

    //creamos nuevas areas alrededor de ese frame
    newAreasToCheck(areaToCheck, areasToCheckN, selectionTL, selectionBR, pointFound);
    //comprobamos si ese frame esta en otras areas a mirar (parcialmente) y creamos nuevas areas a su alrededor
    for (var j = areasToCheckN + 1; j < areaToCheck.length; j++) {
        newAreasToCheck(areaToCheck, j, selectionTL, selectionBR, areaToCheck[j].pTL);
    }
    setTimeout(function(){
        xAuto++;
        loopX();
    },0);

}

function endAutoDetectFrames(){
    modeSelection = SELECTIONAUTO;
    pinta();
    pintaSelection();
    $("body").css("cursor", "default");
    $("body").css("cursor", "wait");
    autoDetectAnimations(percentDifference);
    $("body").css("cursor", "default");
    modeSelection = SELECTIONDEFAULT;
    pinta();
    $("#autoDetectFramesModal").hide();
    $("#loadBar").modal('hide');
    swal("AutoDetectar finalizado","Se han detectado las animaciones correctamente","success");
}
/**
 * funcion que compara frames segun el percentDifference y decide si son de un mismo Sprite o no
 * @param percentDifference
 */
function autoDetectAnimations(percentDifference){
    var frameInSprite = new Array;
    var listaSprites = new Array;
    var spritesIntroducidos = 0;
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
            if (frameImage.width && frameImage.height) ctxt.drawImage(frameImage,0,0);
            for (var j=i+1; j < listOfFrames.length; j++){
                if (frameInSprite[j] == -1) {
                    var dif = listOfFrames[j].frame.compareWithCanvas(canv, 0, 0);
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
        listaSprites[i].reorganizeByDiffAuto();
        if (sheet.addSprite(listaSprites[i],true)) {
            $("#spriteList").append('<option value="' + listaSprites[i].getName() + '">' + listaSprites[i].getName() + '</option>');
            $("#spriteName").val('');
        }
    }
}
var percentDifference;
/***
 * Logica de los botones de index.html
 */
/**
 * Funcion del boton auto detectar animaciones
 */
function detectFramesAnimationsBtn(){
    if (!img.src){
        swal("No hay Imagen cargada", "No se ha cargado ninguna imagen todavia. Importe una imagen desde el menu archivo importar archivo.", "error");
        $("#autoDetectFramesModal").hide();
    }else {
        percentDifference = $("#percentDifferenceText").val();
        if (!percentDifference || isNaN(percentDifference) || percentDifference < 0 || percentDifference >100){
            swal("Valor Incorrecto", "El valor debe ser un número entre 0 y 100", "error");
        }else{
            if (!transparentColor) {
                    swal("No hay transparencia", "No se ha detectado ningun pixel transparente en esta imagen, es necesario para poder utilizar esta funcionalidad." +
                    " Puede seleccionar los frames manualmente o importar una imagen con transparencias", "error");
            }else{
                $("#loadBar").modal('show');
                $("body").css("cursor", "wait");
                autoDetectFrames();
/* */
            }
        }
    }
}


/**
 * click de boton añadir al frame, añade la imagen seleccionada como frame de un sprite
 */
function addFrameBtn(){
    if (selectionTL.defined() && selectionBR.defined()) {
        if (spriteSelectedName == -1) {
            swal({
                title: "No hay ningun sprite seleccionado",
                text: "Para poder añadir un frame debes seleccionar un sprite antes. ¿Deseas crear un sprite nuevo ahora?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Si", cancelButtonText: "No"
            }, function () {
                bAddFrameOnReturn = true;
                $('#nameSpriteModal').modal('show');
            });
        } else {
            pinta();
            saveFrameToSprite(selectionTL, selectionBR);
            pinta();
            pintaSelection();
            swal("Frame añadido", "Se ha añadido el frame seleccionado al sprite " + spriteSelectedName + " correctamente", "success");
        }
    }else{
        swal("Seleccionar Frame", "Para añadir un frame al sprite has de seleccionar un area primero", "error");
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
            swal('Error',"El nombre del sprite ya existe y no se ha podido crear, debes elegir otro nombre","error");
        }else {
            if (sheet.createSprite(name)) {
                $("#spriteList").append('<option value="' + name + '">' + name + '</option>');
                $("#spriteName").val('');
                $("#spriteList").val(name);
                $("#nameSpriteModal").modal('hide');
               spriteSelectedName = name;
                swal('Sprite creado','Sprite ' + name + ' creado correctamente','success');
                if (bAddFrameOnReturn) addFrameBtn();
            } else {
                 swal('Error',"Ha ocurrido un error interno en la aplicación","error");
            }
        }
    }else{
        swal('Error',"Es obligatorio introducir un nombre","error");
    }
    bAddFrameOnReturn = false;
}

function cancelAddSprite(){
    bAddFrameOnReturn = false;
    $("#nameSpriteModal").modal('hide');
}

function checkNumberSpritesAndFramesToExport(){
    if (sheet.getNumberSprites() <= 0){
        swal("Alerta","Antes de exportar debes introducir un sprite");
    }else {
        if (sheet.getNumberTotalFrames() <= 0) {
           swal("Alerta","Antes de exportar debes introducir algun frame en algun sprite");
        } else {
            return true;
        }
    }
    return false;
}

function downloadThis(fileName, data){
    var link = document.createElement('a');
    link.setAttribute('download',fileName);
    link.setAttribute('href', data);
    link.click();
}

/**
 * click del boton que descarga el spritesheet
 */
function exportSheetBtn(){
    if (checkNumberSpritesAndFramesToExport()){
        //ToDo: barra de progreso
        var data = sheet.getSpriteSheet().toDataURL();
        downloadThis('spriteSheet.png',data);
    }
}

function downloadClanLibXMLbtn() {
    if (checkNumberSpritesAndFramesToExport()) {
        var data = sheet.getClanLibXML();
        downloadThis('resources.xml', data);
        var data = sheet.getSpriteSheet().toDataURL();
        downloadThis('spriteSheet.png', data);
    }
}

function exportAnimatedGifBtn(){
    if (checkNumberSpritesAndFramesToExport()) {
        var spr = sheet.getSpriteByName(spriteSelectedName);
        $("body").css("cursor", "wait");
        busy = true;
        spr.exportToGif();
        setTimeout(function () {
            exportAnimatedGifDelay(spr);
        }, 500);
    }
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

        link.setAttribute('download', spriteSelectedName + '.gif');
        link.setAttribute('href', resultData);
        link.click();
        pinta();
    }
}


function changePreview(){
    spriteSelectedName = $("#spriteList").val();
    sheet.stopOldAnimation();
    sheet.paintAnimation(spriteSelectedName, $("#previewSpriteCanvas").get(0));
}

function modeEditSprite(){
    putCanvasInModeSprite();
}

function transparencyBtn(){
    bTransparencyPreview = ($("#transparency").is(':checked'));
    pinta();
    pintaSelection();
}

function adjustFrameBtn(){
    putCanvasInModeFrame();
    if (spriteSelectedName != -1 || selectedFrame != -1) {
        posImage.x = 0;
        posImage.y = 0;
        modeCanvas = FRAMESELECTED;
        modeFrame = MODEADJUST;
        pinta();
        pintaSelection();
    }
}

function editFrameBtn(){
    putCanvasInModeFrame();
    if (spriteSelectedName != -1 || selectedFrame != -1) {
        posImage.x = 0;
        posImage.y = 0;
        modeCanvas = FRAMESELECTED;
        modeFrame = MODEEDIT;
        pinta();
        pintaSelection();
    }
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
    sheet.modifyFrameN(spriteSelectedName, selectedFrame, frameTmp);
    sheet.setPositionFrame(spriteSelectedName, selectedFrame, posFrame);
    imageSprAdj = sheet.getSelectionImage(spriteSelectedName,selectedFrame);
    posSprAdj.x = 0;
    posSprAdj.y = 0;
    bTransparencyPreview = ($("#transparency").is(':checked'));
    pinta();
    pintaSelection();
    changePreview();

}

function setMilisecondsBtn(){
    var numberMiliseconds = $("#miliSecondsOne").val();
    if ($.isNumeric(numberMiliseconds)){
        if (spriteSelectedName == -1 || selectedFrame == -1){
            swal("Alerta","Has de seleccionar un sprite y un frame","error");
        }else{
            sheet.stopOldAnimation();
            sheet.setMsToFrame(spriteSelectedName,selectedFrame,numberMiliseconds);
            sheet.paintAnimation(spriteSelectedName,$("#previewSpriteCanvas").get(0));
            swal('Numero de Ms cambiado','Se ha cambiado el numero de milisegundos entre todos los frames a ' + numberMiliseconds, "success");
            $("#milisecondsText").html("Numero de MS: "+numberMiliseconds);
            $("#changeMSFrameModal").modal('hide');
        }

    }else{
        swal("Parametros incorrectos","El numero de milisegundos tiene que ser un numero","error");
    }
}

function setMilisecondsToAllBtn(){
    var numberMiliseconds = $("#milisecondsTextInput").val();
    if ($.isNumeric(numberMiliseconds)){
        if (spriteSelectedName == -1){
            swal("Alerta","Has de seleccionar un sprite","error");
        }else{
            sheet.stopOldAnimation();
            sheet.setMsFixedToAll(spriteSelectedName,numberMiliseconds);
            sheet.paintAnimation(spriteSelectedName,$("#previewSpriteCanvas").get(0));
            swal('Numero de Ms cambiado','Se ha cambiado el numero de milisegundos entre todos los frames a ' + numberMiliseconds, "success");
            $("#changeMSAllModal").modal('hide');
        }

    }else{
        swal("Parametros incorrectos","El numero de milisegundos tiene que ser un numero","error");
    }
}

function deleteSpriteBtn(){
    if (spriteSelectedName == -1) {
        swal("Alerta","Has de seleccionar un sprite antes de poder eliminarlo","error");
    }else {
        swal({
            title: "¿Estas seguro?",
            text: "Se va a eliminar el sprite " + spriteSelectedName + ". ¿Estas seguro de querer eliminarlo?",
            type: "warning",
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Si",
                cancelButtonText: "No",
            showCancelButton: true,
            closeOnConfirm: false
            },
            function(){
                sheet.stopOldAnimation();
                sheet.deleteSprite(spriteSelectedName);
                $("#spriteList option[value='"+ spriteSelectedName +"']").remove();
                $("#spriteList").prop("selectedIndex",-1);
                var text = "El sprite " + spriteSelectedName + " ha sido eliminado."
                spriteSelectedName = -1;
                swal("Eliminado",text,"success");
            });
    }
}


function deleteFrameBtn(){
    if (spriteSelectedName == -1 || selectedFrame == -1){
        swal("Seleccionar Frame","Has de seleccionar un frame de un sprite antes de utilizar esta opción","error");
    }else{
        swal({
                title: "¿Estas seguro?",
                text: "Se va a eliminar el frame " + selectedFrame + " del sprite " + spriteSelectedName + ". ¿Estas seguro de querer eliminarlo?",
                type: "warning",
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Si",
                cancelButtonText: "No",
                showCancelButton: true,
                closeOnConfirm: false
            },
            function(){
                sheet.stopOldAnimation();
                sheet.delFrame(spriteSelectedName,selectedFrame);
                if (sheet.getNumberFrames(spriteSelectedName) > 0){
                    putCanvasInModeSprite();
                }else{
                    putCanvasInModeImport();
                }
                var text = "El frame " + selectedFrame + " del sprite " + spriteSelectedName + " se ha eliminado correcamente";
                selectedFrame = -1;
                sheet.setSelectedFrame(-1);
                changePreview();
                pinta();
                swal("Eliminado",text,"success");

            });
    }
}


function interpolateNextFrameBtn(){
    if (spriteSelectedName == -1 || selectedFrame == -1){
        swal("Seleccionar Frame","Has de seleccionar un frame de un sprite antes de utilizar esta opción","error");
    }else{
        sheet.stopOldAnimation();
        sheet.interpolateNextFrame(spriteSelectedName,selectedFrame);
        modeCanvas = FRAMETOSELECT;
        sheet.paintAnimation(spriteSelectedName,$("#previewSpriteCanvas").get(0));
        pinta();
        swal("Nuevo Frame creado","Se ha creado el nuevo frame correctamente","success")
    }
}

function calculateAutoMsFast(){
    var selectedSprite = spriteSelectedName;
    var spr = new Sprite(" ");
    sheet.autoTuneTimeMs(selectedSprite,spr.autoTuneCalcFastDiffFunc);
}

function calculateAutoMsSlow(){
    var selectedSprite = spriteSelectedName;
    var spr = new Sprite(" ");
    sheet.autoTuneTimeMs(selectedSprite,spr.autoTuneCalcSlowDiffFunc);
}

function putCanvasInModeImport(){
    currentScale = 1;
    modeCanvas = IMPORTEDIMAGE;
    posImage = new Point(0,0);
    // clear();
    selectionTL.x = undefined;
    selectionTL.y = undefined;
    selectionBR.x = undefined;
    selectionBR.y = undefined;
    pinta();
    $("#importMode").show();
    $("#editSpriteMode").hide();
    $("#listadoSprites").show();
    $("#editFrameMode").hide();
    $("#zoom").show();
    $("#info").html("MODO GENERAL");
}

function putCanvasInModeSprite(){
    if (spriteSelectedName != -1) {
        posImage.x = 0;
        posImage.y = 0;
        modeFrame = MODESELECT;
        currentScale = 1;
        modeCanvas = FRAMETOSELECT;
        selectionTL.x = undefined;
        selectionTL.y = undefined;
        selectionBR.x = undefined;
        selectionBR.y = undefined;
        pinta();
        $("#importMode").hide();
        $("#editSpriteMode").show();
        $("#listadoSprites").hide();
        $("#editFrameMode").hide();
        $("#zoom").hide();
        $("#info").html("MODO EDICIÓN DE SPRITE. Editando "+ spriteSelectedName);
    }else{
        swal("Seleccionar sprite","No puedes ir al modo editar sin haber seleccionado un sprite");
    }
}

function putCanvasInModeFrame() {
    if (spriteSelectedName == -1 || selectedFrame == -1) {
        swal("Seleccionar frame","No puedes ir al modo editar frame sin haber seleccionado un frame");
    }else{
        posFrame.x = 0;
        posFrame.y = 0;
        modeFrame = MODEEDIT;
        currentScale = 1;
        posSprAdj.x = 0;
        posSprAdj.y = 0;
        imageSprAdj = sheet.getSelectionImage(spriteSelectedName,selectedFrame);
        $("#milisecondsText").html("Numero de MS: " + sheet.getMs(spriteSelectedName,selectedFrame));
        //$("#milisecondsText").val(sheet.getMs(spriteSelectedName,selectedFrame));
        var p = sheet.getPositionFrame(spriteSelectedName,selectedFrame);
        posFrame.x = p.x;
        posFrame.y = p.y;
        modeCanvas = FRAMESELECTED;
        selectionTL.x = undefined;
        selectionTL.y = undefined;
        selectionBR.x = undefined;
        selectionBR.y = undefined;
        pinta();
        pintaSelection();
        $("#importMode").hide();
        $("#editSpriteMode").hide();
        $("#editFrameMode").show();
        $("#listadoSprites").hide();
        $("#zoom").hide();
        $("#info").html("MODO EDICIÓN DE FRAME. Editando frame "+ selectedFrame + ' de ' + spriteSelectedName);

    }
}

function detectTimeMs(){
    if (spriteSelectedName == -1){
        swal("Has de seleccionar un sprite para utilizar esta funcionalidad");
    }else {
        switch (modeDifference) {
            case SLOWDIF:
                calculateAutoMsSlow();
                swal("Calculado intervalo entre imagenes");
                $("#autoDetectMsModal").modal('hide');
                break;
            case FASTDIF:
                calculateAutoMsFast();
                swal("Calculado intervalo entre imagenes");
                $("#autoDetectMsModal").modal('hide');
                break;
            default:
                swal("Has de seleccionar uno de los modos disponibles");
                break;
        }
    }
}

function setModoTimeMsFastDiff(){
    modeDifference = FASTDIF;
}

function setModoTimeMsSlowDiff(){
    modeDifference = SLOWDIF;
}