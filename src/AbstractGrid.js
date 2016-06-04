(function(w){
    if(w.Color == undefined){
        throw "AbstractGrid requires Color";
    }
    else if(w.AppObject == undefined){
        throw "AbstractGrid requires AppObject";
    }

    var AbstractGrid = function (options) {
        console.log('initializing Abstract Grid...');
        var self = this;
        self.x = 0;
        self.y = 0;
        self.width = 0;
        self.height = 0;
        self.sw = 0;
        self.sh = 0;
        self.parent = null;
        self.fillStyle = 'transparent';
        self.strokeStyle = '#000000';
        AppObject.call(self);
        self.set(options);
    };

    AbstractGrid.prototype = Object.create(AppObject.prototype);
    AbstractGrid.prototype.constructor = AbstractGrid;

    AbstractGrid.prototype.isDrawable = function () {
        var self = this;
        return self.sw > 0 && self.sh > 0 && self.width > 0 && self.height > 0;
    };

    AbstractGrid.prototype.draw = function(context,layer){
        //console.log('Grid layer draw grid...');
        var self = this;
        if (self.isDrawable()) {
            context.fillStyle = 'transparent';
            context.strokeStyle = (new Color({alpha: 0.2})).toRGBA();
            context.lineWidth = 1;
            context.lineDash = [];
            var visibleArea = layer.getVisibleArea();
            var vsi = visibleArea.x !== 0 ? Math.floor(visibleArea.x / self.sw) : 0;
            var vsj = visibleArea.y !== 0 ? Math.floor(visibleArea.y / self.sh) : 0;
            var vei = Math.ceil((visibleArea.x + visibleArea.width) / self.sw);
            var vej = Math.ceil((visibleArea.y + visibleArea.height) / self.sh);


            for (var i = vsi; i < vei; i++) {
                for (var j = vsj; j < vej; j++) {
                    context.strokeRect((i * self.sw) + self.x, (j * self.sh) + self.y, self.sw, self.sh);
                }
            }
        }
        return self;
    };

    w.AbstractGrid = AbstractGrid;
})(window);