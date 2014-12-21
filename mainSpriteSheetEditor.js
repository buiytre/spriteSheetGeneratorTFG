    var MAX_WIDTH = 800,
        MAX_HEIGHT = 600;

    var URL = window.webkitURL || window.URL;
    var img = new Image;
    var scale = 1;
    var nullFunction = function(event){
        event.preventDefault();
    };
    var buttonLeft = nullFunction;
    var buttonRight = nullFunction;
    var canvas;
    var ctx;
    var mousePos = {x:0,y:0};   
    var posDibujo = {x:0, y:0};
    var zoomPos = {x:0, y:0};
    var sheet;
    var clickIzq = false;
    var clickDer = false;

window.onload= function(){
    canvas = document.getElementById('preview');
    ctx = canvas.getContext('2d');
    canvas.addEventListener('click', buttonLeft);
    canvas.addEventListener('contextmenu', doMouseRight, false);
    canvas.addEventListener('mousedown', doMouseDown, false);
    canvas.addEventListener('mouseup', doMouseUp, false);
    canvas.addEventListener('mousemove', function(e) {
        mousePos = getMousePos(canvas, e);
        var div = document.getElementById("coords");
        div.innerHTML = "x: " + mousePos.x + " y: "+ mousePos.y;
    }, false);    
    var inputFile = document.getElementById("imagen");
    inputFile.addEventListener('change', function (event) {
        var file = event.target.files[0];
        
        var url = URL.createObjectURL(file);
        img.onload = function(){
            scale = 1;
            pinta();
            posDibujo.x=0;
            posDibujo.y=0;
        };
        img.src = url;
    });
    sheet = new Spritesheet();
};

function doMouseDown(event){
  clickIzq = true;
}

function doMouseRight(event){
    clickDer = true;
}

function doMouseUp(event){
    clickIzq = false;
}

function getMousePos(cv, e) {
    var rect = cv.getBoundingClientRect();
    return {x: e.clientX - rect.left, y: e.clientY - rect.top};
}

function pinta(){
    canvas.width = MAX_WIDTH;
    canvas.height = MAX_HEIGHT;
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.drawImage(img,posDibujo.x,posDibujo.y,img.width/scale,img.height/scale,0,0,img.width,img.height);
}


function zoom(){
    canvas.removeEventListener('click', buttonLeft);
    canvas.removeEventListener('contextmenu', buttonRight, false); 
    buttonLeft = function(event){
        zoomPos.x = mousePos.x/2;
        zoomPos.y = mousePos.y/2;
        
        posDibujo.x = (posDibujo.x+(zoomPos.x/scale));
        posDibujo.y = (posDibujo.y+(zoomPos.y/scale));
        console.log('mousePos:' + mousePos.x + ' ' + mousePos.y +' zoomPos:' +zoomPos.x + ' ' + zoomPos.y + ' posDibujo:' +posDibujo.x+ ' ' + posDibujo.y+ ' imgTam:' + img.width + ' ' + img.height);
        scale = scale * 2;
    };
    buttonRight = function(event){
        zoomPos.x = mousePos.x/2;
        zoomPos.y = mousePos.y/2;
        
        posDibujo.x = (posDibujo.x-(zoomPos.x/scale));
        posDibujo.y = (posDibujo.y-(zoomPos.y/scale));
        console.log('mousePos:' + mousePos.x + ' ' + mousePos.y +' zoomPos:' +zoomPos.x + ' ' + zoomPos.y + ' posDibujo:' +posDibujo.x+ ' ' + posDibujo.y+ ' imgTam:' + img.width + ' ' + img.height);
        scale = scale / 2;
        event.preventDefault();
    };
    canvas.addEventListener("click", buttonLeft);
    canvas.addEventListener('contextmenu', buttonRight, false); 
}

var pointOri = null;
var pointDest = null;
var intervalSelection = null;
function selection(){
    clearInterval(intervalSelection);
    pinta();
    if (document.getElementById("spriteList").selectedIndex == -1) {
        alert("Has de seleccionar un sprite antes");
    }else {
        canvas.removeEventListener('click', buttonLeft);
        canvas.removeEventListener('contextmenu', buttonRight, false);
        buttonLeft = function (event) {
            if (pointOri == null) {
                pointOri = new Point(mousePos.x, mousePos.y);

                intervalSelection = setInterval(function () {
                    pinta();
                    ctx.strokeStyle = "#f00";
                    ctx.strokeRect(pointOri.x, pointOri.y, mousePos.x - pointOri.x, mousePos.y - pointOri.y);
                }, 100);
            }
            else {
                clearInterval(intervalSelection);
                pinta();
                pointDest = pointDest = new Point(mousePos.x, mousePos.y);
                saveFrameToSprite(pointOri, pointDest);
                pointOri = null;
                pointDest = null;
                intervalSelection = null;
            }
        };
        buttonRight = function (event) {
            event.preventDefault();
        };
        canvas.addEventListener("click", buttonLeft);
        canvas.addEventListener('contextmenu', buttonRight, false);
    }
}

function writeMessage(canvas, message, pos) {
    var context = canvas.getContext('2d');
    context.font = '18pt Calibri';
    context.fillStyle = 'black';
    context.fillText(message, pos.x, pos.y);
}

function saveFrameToSprite(ori, dest){
    //guardar el frame al sprite
    var widthtest = dest.x -ori.x;
    var heighttest = dest.y - ori.y;
    var context = canvas.getContext('2d');
    var imgdata = context.getImageData(ori.x,ori.y,widthtest,heighttest);

    var newCanvas = document.createElement("canvas");
    newCanvas.width = widthtest;
    newCanvas.height = heighttest;

    newCanvas.getContext("2d").putImageData(imgdata,0,0);
    var spriteSelectedMenu = document.getElementById("spriteList");
    var spriteName = spriteSelectedMenu.options[spriteSelectedMenu.selectedIndex].value;
    var dataURL = newCanvas.toDataURL("image/png");
    var frametest = new Frame(dataURL);
    sheet.addFrameToSprite(spriteName,frametest);
    console.log(ori.x +' '+ ori.y + ' ' + dest.x + ' '+ dest.y+ ' Añadido ');


    var previewSpriteCanvas = document.getElementById('previewSpriteCanvas');
    sheet.paintSpritePreview(spriteName,previewSpriteCanvas);
    //var cnvSpriteSheet = sheet.getSpriteSheet();
    //var ctx2 = cnvSpriteSheet.getContext('2d');
    //var imgdata2 = ctx2.getImageData(0,0,cnvSpriteSheet.width,cnvSpriteSheet.height);
    //canvastest.getContext("2d").putImageData(imgdata2,0,0);

}

function saveFrame(){
    var dataURL = canvas.toDataURL();
    var fr = new Frame(dataURL);
    fr.downloadFrame();
}


function saveSpriteSheet(){
    var dataURL = sheet.getSpriteSheet().toDataURL();
    window.open(dataURL);
}


function addSprite(){
    var name = document.getElementById("spriteName").value;
    sheet.createSprite(name);
    var sel = document.getElementById("spriteList");
    var option = document.createElement("option");
    option.text = name;
    sel.add(option);
}


function downloadFile(text){
    var link = document.createElement('a');
    mimeType = 'text/plain';

    link.setAttribute('download', 'test.csv');
    link.setAttribute('href', 'data:' + mimeType  +  ';charset=utf-8,' + encodeURIComponent(text));
    link.click();

}

function changePreview(element){
    var spriteName = element.options[element.selectedIndex].value;
    var previewSpriteCanvas = document.getElementById('previewSpriteCanvas');
    sheet.paintSpritePreview(spriteName,previewSpriteCanvas);
}


function resizeCanvas(canvas, width, height){
    var newCanvas = document.createElement("canvas");
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;
    newCanvas.getContext("2d").drawImage(canvas,0,0);

    canvas.width = width;
    canvas.height = height;

    canvas.getContext("2d").drawImage(newCanvas,0,0);
}

function adjustMode(){
    clearInterval(intervalSelection);
    var spriteSelectedMenu = document.getElementById("spriteList");
    if (spriteSelectedMenu.selectedIndex == -1) {
        alert("Has de seleccionar un sprite antes");
    }else{
        ctx.clearRect(0,0,canvas.width,canvas.height);
        canvas.removeEventListener('click', buttonLeft);
        canvas.removeEventListener('contextmenu', buttonRight, false);
        var spriteName = spriteSelectedMenu.options[spriteSelectedMenu.selectedIndex].value;
        sheet.paintSpritePreview(spriteName,canvas);
        intervalSelection = setInterval(function () {
            sheet.paintSelection(spriteName, mousePos,canvas);
        }, 100);

    }
}