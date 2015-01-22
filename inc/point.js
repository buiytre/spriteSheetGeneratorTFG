/**
 * Creadora del elemento Point
 * @param x
 * @param y
 * @constructor
 */
var Point = function(x, y){
    this.x = x;
    this.y = y;
};

/**
 * Resetea las coordenadas para que no guarden ningun valor
 */
Point.prototype.reset = function(){
    this.x = "undefined";
    this.y = "undefined";
};

/**
 * Indica si las coordenadas guardan algun valor o no
 * @returns {boolean}
 */
Point.prototype.defined = function(){
    return !(this.x == "undefined" || this.y == "undefined");
};