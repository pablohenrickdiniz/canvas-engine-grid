(function(w){
    if(w.AppObject == undefined){
        throw "RectSet requires AppObject"
    }
    else if(w.Color == undefined){
        throw "RectSet requires Color"
    }

    var RectSet = function (options) {
        var self = this;
        self.width = 32;
        self.height = 32;
        self.x = 0;
        self.y = 0;
        self.fillStyle = (new Color({alpha: 0})).toRGBA();
        self.strokeStyle = (new Color({alpha: 1})).toRGBA();

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

    w.RectSet = RectSet;
})(window);