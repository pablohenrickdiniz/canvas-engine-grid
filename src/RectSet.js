(function(w){
    if(w.AppObject == undefined){
        throw "RectSet requires AppObject"
    }


    var RectSet = function (options) {
        var self = this;
        self.width = 32;
        self.height = 32;
        self.x = 0;
        self.y = 0;
        self.fillStyle = 'transparent';
        self.strokeStyle = '#000000';

        self.lineWidth = 1;
        self.lineDash = [];
        self.state = 0;
        self.i = 0;
        self.j = 0;
        AppObject.call(self);
        self.set(options);
    };

    RectSet.prototype = Object.create(AppObject.prototype);
    RectSet.prototype.constructor = RectSet;

    RectSet.prototype.getLine = function () {
        var self = this;
        return Math.floor(self.y / self.height);
    };

    RectSet.prototype.getColumn = function () {
        var self = this;
        return Math.floor(self.x / self.width);
    };

    RectSet.prototype.getCx = function(){
        var self = this;
        return self.x+(self.width/2);
    };

    RectSet.prototype.getCy = function(){
        var self = this;
        return self.y+(self.height/2);
    };

    w.RectSet = RectSet;
})(window);