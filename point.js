var Point = function(x, y){
    this.x = x;
    this.y = y;
};

Point.prototype.dist= function(d){
    return Math.sqrt((this.x - d.x)*(this.x - d.x)+(this.y - d.y)*(this.y - d.y));
};
