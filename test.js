    var MAX_WIDTH = 800,
        MAX_HEIGHT = 600;

    var URL = window.webkitURL || window.URL;
    var img = new Image;
    var scale = 1;
    var nullFunction = function(event){
        pinta();
        event.preventDefault();
    };
    var buttonLeft = nullFunction;
    var buttonRight = nullFunction;
    var canvas;
    var ctx;
    var scaleSize = 1;
    
window.onload= function(){
    canvas = document.getElementById('preview');
    ctx = canvas.getContext('2d');
    canvas.addEventListener('click', buttonLeft);
    canvas.addEventListener('contextmenu', buttonRight, false); 
    var inputFile = document.getElementById("imagen");
    inputFile.addEventListener('change', function (event) {
        var file = event.target.files[0];
        
        var url = URL.createObjectURL(file);
        img.onload = function(){
            scale = 1;
            pinta();
        };
        img.src = url;
    });
};

function pinta(){
    var width = img.width, height = img.height;
    
    if (width > height) {
        if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
        }else{
            if (height > MAX_HEIGHT){
                widt *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
            }
        }
    }
    
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.save();
    ctx.scale(scale,scale);
    ctx.drawImage(img,0,0,canvas.width,canvas.height);
    ctx.restore();
}


function zoom(){
    canvas.removeEventListener('click', buttonLeft);
    canvas.removeEventListener('contextmenu', buttonRight, false); 
    buttonLeft = function(event){
        scale = scale * 2;
        pinta();
    };
    buttonRight = function(event){
        scale = scale * 0.5;
        pinta();
        event.preventDefault();
    };
    canvas.addEventListener("click", buttonLeft);
    canvas.addEventListener('contextmenu', buttonRight, false); 
}

function selection(){
    canvas.removeEventListener('click', buttonLeft);
    canvas.removeEventListener('contextmenu', buttonRight, false); 
    buttonLeft = function(event){
        pinta();
    };
    buttonRight = function(event){
        pinta();
        event.preventDefault();
    };
    canvas.addEventListener("click", buttonLeft);
    canvas.addEventListener('contextmenu', buttonRight, false); 
}