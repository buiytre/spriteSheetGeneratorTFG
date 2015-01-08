var Point = function(x, y){
    this.x = x;
    this.y = y;
};

var Point = function(){
    this.x = 0;
    this.y = 0;
};

Point.prototype.x = function(x){
    this.x = x;
};

Point.prototype.y = function(y){
    this.y = y;
};

Point.prototype.reset = function(){
    this.x = "undefined";
    this.y = "undefined";
};


Point.prototype.defined = function(){
    if (this.x == "undefined" || this.y == "undefined") return false;
    return true;
};

Point.prototype.dist= function(d){
    return Math.sqrt((this.x - d.x)*(this.x - d.x)+(this.y - d.y)*(this.y - d.y));
};
