var URL = window.webkitURL || window.URL;
var nullFunction = function(event){
    event.preventDefault();
};

//*******MODES PROGRAMA
var modeCanvas = 0;     //indica en que modo esta trabajando el canvas
const IMPORTEDIMAGE = 1;
const FRAMETOSELECT = 2;
const FRAMESELECTED = 3;

var modeFrame = 0;      // indica si el canvas esta trabajando para ajustar los frames a la animación o para editarlos
const MODEADJUST = 1;
const MODEEDIT = 2;
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
            switch (modeCanvas){
                case FRAMETOSELECT:
                    selectFrame();
                    break;
            }
            break;
        case 3:
//            endClickRight = getMousePos(canvas,event);
            isDownRight = false;
            break;
        default:
            break;
    }
}

function selectFrame(){
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
            var frameSelected = sheet.paintSelection($("#spriteList").val(), mousePos, canvas);
            if (isDownLeft) {
                selectedFrame = frameSelected;
            }
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
            if (selectionTL.defined() && selectionBR.defined()) {
                ctx.fillStyle = 'rgba(255,0,0,0.1)';
                ctx.strokeStyle = '#000000';
                ctx.strokeRect(selectionTL.x, selectionTL.y, selectionBR.x - selectionTL.x, selectionBR.y - selectionTL.y);
                ctx.fillRect(selectionTL.x, selectionTL.y, selectionBR.x - selectionTL.x, selectionBR.y - selectionTL.y);
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
            ctx.drawImage(img,-img.width/2,-img.height/2);
            break;
        case FRAMETOSELECT:
            var spriteName =  $("#spriteList").val();
            sheet.paintSpritePreview(spriteName,canvas);
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
    var frameTmp = getSelectedFrame(ori,dest);
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
function getSelectedFrame(ori, dest){
    var width = dest.x - ori.x;
    var height = dest.y - ori.y;
    var imgData = ctx.getImageData(ori.x,ori.y,width,height);

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
    canvas.addEventListener('click',nullFunction,false);
    canvas.addEventListener('contextmenu',nullFunction,false);
    canvas.addEventListener('mousedown', nullFunction, false);
    canvas.addEventListener('mouseup', nullFunction, false);
    canvas.addEventListener('mousemove', nullFunction, false);

    canvas.addEventListener('mousedown', doMouseDown, false);
    canvas.addEventListener('mouseup', doMouseUp, false);
    canvas.addEventListener('mousemove', doMouseMove, false);

    var inputFile = document.getElementById("imagen");
    inputFile.addEventListener('change', function (event) {
        var file = event.target.files[0];

        var url = URL.createObjectURL(file);
        img.onload = function(){
            loadImage();
            modeCanvas = IMPORTEDIMAGE;
            pinta();
            pintaSelection();
        };
        img.src = url;
    });
    $(window).resize(function(){
        canvas.with = $('#preview').width();
        canvas.height = $('#preview').height();
    });
    sheet = new Spritesheet();
};


/**
 * Funcion que se ejecuta an cuanto se carga la imagen
 */
function loadImage(){
    currentScale = 1;
    mouseMode = MOUSEMOVEMODE;
    modeCanvas = IMPORTEDIMAGE;
    posImage = new Point(0,0);
   // clear();
    pinta();
}

/**
 * click en el boton de seleccion inicializa el modo seleccion
 */
function selectionModeBtn() {
    selectionTL.reset();
    selectionBR.reset();
    mouseMode = MOUSESELECTIONMODE;
    pinta();
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
    if (sheet.createSprite(name)){
        $("#spriteList").append('<option value="' + name + '">'+ name + '</option>');
    }else{
        alert("el nombre del sprite ya existe y no se ha podido crear");
    }
}

/**
 * click del boton que descarga el spritesheet
 */
function exportSheetBtn(){
    var dataURL = sheet.getSpriteSheet().toDataURL();
    window.open(dataURL);
}

function downloadFile(text){
    var link = document.createElement('a');
    mimeType = 'text/plain';

    link.setAttribute('download', 'test.csv');
    link.setAttribute('href', 'data:' + mimeType  +  ';charset=utf-8,' + encodeURIComponent(text));
    link.click();

}

function changePreview(){
    var spriteName = $("#spriteList").val();
//    sheet.paintSpritePreview(spriteName,$("#previewSpriteCanvas").get(0));
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
    var frameTmp = getSelectedFrame(ini,fin);
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
        sheet.setMs($("#spriteList").val(),selectedFrame,numberMiliseconds);
        sheet.stopOldAnimation();
        sheet.paintAnimation($("#spriteList").val(),$("#previewSpriteCanvas").get(0));
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