(function(w){
    if(w.CanvasLayer == undefined){
        throw "GridLayer requires CanvasLayer";
    }
    else if(w.Grid == undefined){
        throw "GridLayer requires Grid";
    }

    var GridLayer = function (options, canvas) {
        var self = this;
        self.grid = null;
        CanvasLayer.call(self, options, canvas);
    };

    GridLayer.prototype = Object.create(CanvasLayer.prototype);
    GridLayer.prototype.constructor = GridLayer;

    /*
     GridLayer : drawRectSet(RectSet set)
     Desenha um retângulo da grade
     */
    GridLayer.prototype.drawRectSet = function (rectSet) {
        //console.log('Canvas layer draw rect set...');
        var self = this;
        var context = self.getContext();
        context.fillStyle = rectSet.fillStyle;
        context.strokeStyle = rectSet.strokeStyle;
        context.fillRect(rectSet.x, rectSet.y, rectSet.width, rectSet.height);
        context.strokeRect(rectSet.x, rectSet.y, rectSet.width, rectSet.height);
        return self;
    };

    GridLayer.prototype.getGrid = function(){
        var self = this;
        if(self.grid === null){
            var width = self.width;
            var height = self.height;
            self.grid = new Grid({
                sw: width,
                sh: height,
                width: width,
                height: height
            });
        }
        return self.grid;
    };

    GridLayer.prototype.setGrid = function(grid){
        var self = this;
        self.grid = grid;
    };

    GridLayer.prototype.refresh = function(){
        var self = this;
        self.clear();
        self.getGrid().draw(self.getContext(),self);
        return self;
    };

    w.GridLayer = GridLayer;
})(window);