/**
 *  Esta clase sprite contiene información sobre un sprite como los frames que tienen
 *  @author: Ignacio Soto Alsina
 *  @version: 27/11/2014
 */

/**
 *
 * @constructor
 */
var Sprite = function(name){
    this.frameList = new Array();
    this.pos = new Array();
    this.timeMs = new Array();
    this.name = name;
    this.maxWidth = 0;
    this.maxHeight = 0;

    /////manejo animacion canvas
    this.timeAnimationInterval = null;  // evento para la animación de la vista previa
    this.canvasAnimation = null;        // canvas de la vista previa
    this.nAnimation = 0;                // n de la animación de la vista previa

    //manejo animacion exportacion
    this.canvasTmpExportAnimation = null; //canvas para la exportación
    this.timeCanvasToExport = null;   //evento para la exportación
    this.nExport = 0;                     //n de la animación de la exportacion
    this.encoder = null;                  //objeto de jsgif
    this.encoderEnd = false;              // boleano que indica si la animación a terminado o no (para la exportacion)
    //"constante por defecto"
    this.defaultMs = 200;
};

/**
 * metodo que añade un frame al framelist
 * @param frame Frame a añadir al sprite
 */
Sprite.prototype.addFrame = function (frame){
    this.frameList[this.frameList.length] = frame;
    var point = new Point();
    point.x = 0;
    point.y = 0;
    this.pos[this.pos.length] = point;
    this.timeMs[this.timeMs.length] = this.defaultMs;
    if (this.maxWidth < frame.width) this.maxWidth = frame.width;
    if (this.maxHeight < frame.height) this.maxHeight = frame.height;
    this.nAnimation = 0;
};

/**
 * metodo que devuelve el nombre del sprite
 * @returns {String}
 */
Sprite.prototype.getName = function(){
    return this.name;
};

/**
 * Reemplaza el frame en la posicion n por el frame indicado
 * @param frame frame que sustituira al antiguo
 * @param n posicion del frame a sustituir
 */
Sprite.prototype.replaceFrame = function(frame, n){
    if (this.frameList.length <= n) throw "The sprite not contains frame number "+n;
    this.frameList[n] = frame;
    this.recalculateMaxWidthHeight();
    this.nAnimation = 0;
};

/**
 * Elimina un frame del sprite
 * @param n Entero que indica la posición del sprite a eliminar
 */
Sprite.prototype.delFrame = function(n){
    if (this.frameList.length <= n) throw "The sprite not contains frame number "+n;
    this.frameList.splice(n,1);
    this.pos.splice(n,1);
    this.timeMs.splice(n,1);
    this.recalculateMaxWidthHeight();
    this.selectedFrame = -1;
    this.nAnimation = 0;
};

/**
 * Recalcula cual es la maxima amplitud y altura dentro de la animación
 */
Sprite.prototype.recalculateMaxWidthHeight = function(){
    this.maxWidth = 0;
    this.maxHeight = 0;
    for (var i=0; i < this.frameList.length; i++){
        if (this.maxWidth < this.frameList[i].width + this.pos[i].x) this.maxWidth = this.frameList[i].width + this.pos[i].x;
        if (this.maxHeight < this.frameList[i].height + this.pos[i].y) this.maxHeight = this.frameList[i].height + this.pos[i].y;
    }
};

/**
 * metodo que devuelve el frame de la posición n
 * @param n entero que indica la posición del frame a recibir
 * @returns {Frame} frame en la posición n
 */
Sprite.prototype.getFrame = function(n){
    if (this.frameList.length <= n) throw "The sprite not contains frame number "+n;
    return this.frameList[n];
};

/**
 * Devuelve los milisegundos del frame en la posición n
 * @param n
 * @returns {*}
 */
Sprite.prototype.getMs = function(n){
    if (this.timeMs.length <= n) throw "The sprite not contains frame number "+n;
    return this.timeMs[n];
};

/**
 * Devuelve la posición durante la animación del frame n
 * @param n
 * @returns {*}
 */
Sprite.prototype.getPositionFrame = function(n){
    if (this.pos.length <= n) throw "The sprite not contains frame number "+n;
    return this.pos[n];
};

/**
 * sobreescribe el intervalo de tiempo que se mostrara el frame n con ms
 * @param n
 * @param ms
 */
Sprite.prototype.setMs = function(n, ms){
    if (this.timeMs.length <= n) throw "The sprite not contains frame number "+n;
    this.timeMs[n] = ms;
};

/**
 * Sustituye la posicion del frame n a pos
 * @param n
 * @param pos
 */
Sprite.prototype.setPositionFrame = function(n, pos){
    if (this.pos.length <= n) throw "The sprite not contains frame number "+n;
    this.pos[n].x = pos.x;
    this.pos[n].y = pos.y;
    this.recalculateMaxWidthHeight();
};

/**
 * devuelve true si existe el frame n
 * @param n
 * @returns {boolean}
 */
Sprite.prototype.existsFrame = function(n){
    return !(this.frameList.length <= n);
};

/**
 * metodo que inicializa la animacion en el canvas
 * @param canvas
 */
Sprite.prototype.paintAnimation = function(canvas){
    if (this.frameList.length != 0){
        this.canvasAnimation = canvas;
        this.doPaintAnimation();
    }else{
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,canvas.width,canvas.height);
    }
};

/**
 * llamada que se encarga de manejar que frame se va pintar en cada momento en un canvas inicializado por la llamada
 * paintAnimation
 */
Sprite.prototype.doPaintAnimation = function(){
    if(this.timeAnimationInterval != null) clearTimeout(this.timeAnimationInterval);
    var ctx = this.canvasAnimation.getContext('2d');
    if (this.frameList.length > 0) {
        if (this.nAnimation >= this.frameList.length) this.nAnimation = 0;
        this.paintNextFrame(ctx, this.nAnimation, null, this.canvasAnimation);
        var time = this.timeMs[this.nAnimation];
        this.nAnimation = this.nAnimation + 1;
        this.timeAnimationInterval = setTimeout(this.doPaintAnimation.bind(this), time);
    }
};

/**
 * pinta el frame nFrame en el canvas guardado en ctx
 * si transparency contiene un color pintara este color en lugar de el transparente cuando el pixel lo sea.
 * @param ctx
 * @param nFrame
 * @param transparency
 * @param canvas
 */
Sprite.prototype.paintNextFrame = function(ctx, nFrame, transparency, canvas){
    var fr = this.frameList[nFrame];
    var position = this.pos[nFrame];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    if (transparency == null){
        ctx.translate(position.x, position.y);
        ctx.drawImage(fr.getImageFrame(), 0, 0);
    }else{
        var canvas2 = document.createElement("canvas");
        canvas2.width = canvas.width;
        canvas2.height= canvas.height;
        var ctx2 = canvas2.getContext('2d');
        ctx2.drawImage(fr.getImageFrame(),0,0);
        var imageData = ctx2.getImageData(0,0,canvas2.width,canvas2.height);
        for (var i=0;i < imageData.data.length; i=i+4){
            if (imageData.data[i+3] < (255/2)){
                imageData.data[i+3] = 0;
            }else{
                imageData.data[i+3] = 255;
            }
        }
        ctx2.clearRect(0,0,canvas2.width,canvas2.height);
        ctx2.putImageData(imageData,0,0);
        ctx.fillStyle = transparency;
        ctx.fillRect(0,0,canvas.width, canvas.height);
        ctx.translate(position.x,position.y);
        ctx.drawImage(canvas2,0,0);
    }
    ctx.restore();
};

/**
 * para el intervalo que llama a pintar la animación para dejar de pintarla
 */
Sprite.prototype.stopAnimation = function(){
    if (this.timeAnimationInterval != null) clearInterval(this.timeAnimationInterval);
};

/**
 * devuelve el ancho maximo del sprite
 * @returns {number}
 */
Sprite.prototype.getMaxWidth = function(){
    return this.maxWidth;
};

/**
 * devuelve la altura maxima del sprite
 * @returns {number}
 */
Sprite.prototype.getMaxHeight = function(){
    return this.maxHeight;
};

/**
 * para el intervalo que llama a pintar la animación para dejar de pintarla en el canvas de exportación
 */
Sprite.prototype.stopExportToGif = function(){
    if (this.timeCanvasToExport != null) clearTimeout(this.timeCanvasToExport);
};

/**
 * llamada que se encarga de manejar que frame se va pintar en cada momento en un canvas inicializado por la llamada
 * exportToGif, ademas esta funcion parara cuando la animación se haya hecho una vez. (no entra en loop)
 */
Sprite.prototype.doPaintExportAnimation = function(){
    if (this.timeCanvasToExport != null) clearTimeout(this.timeCanvasToExport);
    if (this.nExport < this.frameList.length){
        var ctx = this.canvasTmpExportAnimation.getContext('2d');
        this.paintNextFrame(ctx, this.nExport,"#00FF00",this.canvasTmpExportAnimation );
        var time = this.timeMs[this.nExport];
        this.encoder.setDelay(time);
        this.encoder.addFrame(ctx);
        this.nExport = this.nExport + 1;
        this.timeCanvasToExport = setTimeout(this.doPaintExportAnimation.bind(this),time);
    }else{
        this.encoder.finish();
        this.encoderEnd = true;
        this.canvasTmpExportAnimation = null;
    }
};

/**
 * Se encarga de inicializar el proceso de pintar en el canvas que se utilizara para exportar a gif
 */
Sprite.prototype.exportToGif = function(){
    this.canvasTmpExportAnimation = document.createElement("canvas");
    this.canvasTmpExportAnimation.width = this.maxWidth;
    this.canvasTmpExportAnimation.height = this.maxHeight;
    this.encoderEnd = false;
    this.stopExportToGif();
    this.nExport = 0;
    this.encoder = new GIFEncoder();
    this.encoder.setRepeat(0);
    this.encoder.setTransparent(0x00FF00);
    this.encoder.setSize(this.maxWidth,this.maxHeight);
    this.encoder.start();
    this.doPaintExportAnimation();
};

/**
 * devuelve -1 si todavia se esta realizando la exportación o los datos que corresponden con el gif de la animación del sprite
 * @returns {*}
 */
Sprite.prototype.getResultGif = function(){
    if (!this.encoderEnd) return -1;
    var binary_gif = this.encoder.stream().getData();
    return  'data:image/gif;base64,'+encode64(binary_gif);
};

/**
 * devuelve el numero de frames que tiene la animación
 * @returns {Number}
 */
Sprite.prototype.getNumberFrames = function(){
    return this.frameList.length;
};

/**
 * interpola el frame que va despues de no
 * @param no
 */
Sprite.prototype.interpolateNextFrame = function(no){
    var nf = no+1;
    if (this.frameList.length <= no || this.frameList.length <= nf) return;
    var canv = document.createElement("canvas");
    var ctxt = canv.getContext('2d');
    // el tiempo origen sera 0, y el final timeMs. El frame lo pondremos justo entre medio de los dos
    var timeOrigen = 0;
    var timeFinal = this.timeMs[no];
    var timeDest = ((timeFinal-timeOrigen)/2)+timeOrigen;
    var imageOri = this.frameList[no].getImageFrame();
    var imageFin = this.frameList[nf].getImageFrame();
    //busco el tamaño del frame intermedio calculando el tamaño del frame maximo entre los dos
    var maxWidth = 0;
    var maxHeight = 0;
    if (imageOri.width+this.pos[no].x > imageFin.width+this.pos[nf].x){
        maxWidth = imageOri.width+this.pos[no].x;
    }else{
        maxWidth = imageFin.width+this.pos[nf].x;
    }
    if (imageOri.height+this.pos[no].y > imageFin.height+this.pos[nf].y){
        maxHeight = imageOri.height+this.pos[no].y;
    }else{
        maxHeight = imageFin.height+this.pos[nf].y;
    }

    //creo el canvas para comparar las imagenes con el maximo tamaño de los dos
    canv.height = maxHeight;
    canv.width = maxWidth;

    //coloco el frame origen + su desplazamiento en el canvas para conseguir la data del frame

    ctxt.clearRect(0,0,canv.width,canv.height);
    ctxt.drawImage(imageOri,this.pos[no].x,this.pos[no].y);
    var imageDataOri = ctxt.getImageData(0,0,canv.width,canv.height);

    //coloco el frame final + su desplazamiento en el canvas para conseguir la data del frame
    ctxt.clearRect(0,0,canv.width,canv.height);
    ctxt.drawImage(imageFin,this.pos[nf].x,this.pos[nf].y);
    var imageDataFin = ctxt.getImageData(0,0,canv.width,canv.height);


    var imageDataInterpolation = ctx.createImageData(canv.width,canv.height);
    for (var i=0;i < imageDataInterpolation.data.length; i=i+4){
        imageDataInterpolation.data[i] = imageDataOri.data[i]+((imageDataFin.data[i]-imageDataOri.data[i])/(timeFinal-timeOrigen))*(timeDest-timeOrigen);
        imageDataInterpolation.data[i+1] = imageDataOri.data[i+1]+((imageDataFin.data[i+1]-imageDataOri.data[i+1])/(timeFinal-timeOrigen))*(timeDest-timeOrigen);
        imageDataInterpolation.data[i+2] = imageDataOri.data[i+2]+((imageDataFin.data[i+2]-imageDataOri.data[i+2])/(timeFinal-timeOrigen))*(timeDest-timeOrigen);
        imageDataInterpolation.data[i+3] = imageDataOri.data[i+3]+((imageDataFin.data[i+3]-imageDataOri.data[i+3])/(timeFinal-timeOrigen))*(timeDest-timeOrigen);
    }

    //coger imagen en el canvas y crear nuevo frame
    ctxt.clearRect(0,0,canv.width,canv.height);
    ctxt.putImageData(imageDataInterpolation,0,0);
    var dataImage = canv.toDataURL("image/png");
    var newFrame = new Frame(dataImage);

    this.insertFrameNextTo(newFrame,no);

    //modificar transicion entre frames (timeMs)
    this.timeMs[no] = this.timeMs[no]/2; //el frame origen tardara la mitad de antes en llegar al siguiente frame (el nuevo frame)
    this.timeMs[no+1] = this.timeMs[no]; //el nuevo frame sera el sigiuente a no
};


/**
 * inserta el frame del parametro en la posicion n
 * @param frame
 * @param n
 */
Sprite.prototype.insertFrameNextTo = function(frame,n){
    var i = 0;
    for (i = this.frameList.length; i>n+1; i--){
        this.frameList[i] = this.frameList[i-1];
        this.pos[i] = this.pos[i-1];
        this.timeMs[i] = this.timeMs[i-1];
    }
    this.frameList[i] = frame;
    this.pos[i] = new Point(0,0);
    this.timeMs[i] = 100;
};

/**
 * Funcion para calcular la diferencia en modo SlowDiff
 * @param dif
 * @param count
 * @returns {number}
 */
Sprite.prototype.autoTuneCalcSlowDiffFunc = function(dif, count){
    return dif*200 + 200*count;
};

/**
 * Funcion para calcular la diferencia en modo FastDiff
 * @param dif
 * @param count
 * @returns {number}
 */
Sprite.prototype.autoTuneCalcFastDiffFunc = function(dif, count){
    return (200 - dif*200) + 200*count;
};

/**
 * Funcion que calcula el tiempo entre frame y frame de manera automatica segun las diferencias que haya entre frames (utilizando la funcion pasada por parametro)
 * @param usedFunc
 */
Sprite.prototype.autoTuneTimeMs = function(usedFunc){
    for (var i=0; i < this.frameList.length - 1; i++){
        var frame  = this.frameList[i];

        var canv = document.createElement("canvas");
        canv.width =  this.maxWidth;
        canv.height =  this.maxHeight;
        var ctxt = canv.getContext('2d');
        var imageNext = this.frameList[i+1].getImageFrame();
        ctxt.clearRect(0,0,canv.width,canv.height);
        ctxt.drawImage(imageNext,this.pos[i+1].x,this.pos[i+1].y);
        var dif = frame.compareWithCanvas(canv, this.pos[i].x,this.pos[i].y)*100;
        //si son iguales contamos el numero de frames iguales y los quitamos de la animación, haremos que el frame actual dure mas
        var count = 0;
        var end = false;
        while (!end){
            if (dif == 0) {
                //eliminamos el frame siguiente
                for (var j = i + 1; j < this.frameList.length - 1; j++) {
                    this.frameList[j] = this.frameList[j + 1];
                    this.pos[j] = this.pos[j + 1];
                    this.timeMs[j] = this.timeMs[j + 1];
                }
                this.frameList.length--;
                this.pos.length--;
                this.timeMs.length--;

                //aumentamos en 1 el numero de frames iguales contados y comprobamos q el siguiente no sea igual
                count++;
                if (i + 1 < this.frameList.length) {
                    ctxt.clearRect(0, 0, canv.width, canv.height);
                    imageNext = this.frameList[i + 1].getImageFrame();
                    ctxt.drawImage(imageNext, this.pos[i + 1].x, this.pos[i + 1].y);
                    dif = frame.compareWithCanvas(canv, this.pos[i].x, this.pos[i].y);
                } else {
                    ctxt.clearRect(0, 0, canv.width, canv.height);
                    imageNext = this.frameList[0].getImageFrame();
                    ctxt.drawImage(imageNext, this.pos[0].x, this.pos[0].y);
                    dif = frame.compareWithCanvas(canv, this.pos[i].x, this.pos[i].y);
                    end = true;
                }
            }else{
                end = true;
            }
            
        }

        this.timeMs[i] = usedFunc(dif,count);
    }
};

/**
 * funcion que ordena la animacion de los sprites segun la diferencia que haya entre ellos
 */
Sprite.prototype.reorganizeByDiffAuto = function(){
    this.frameList.sort(this.frameList[0].compareWithFrame)
};