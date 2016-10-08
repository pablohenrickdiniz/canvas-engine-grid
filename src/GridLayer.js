(function(w){
    if(w.CE == undefined){
        throw "GridLayer requires CanvasEngine"
    }

    if(CE.CanvasLayer == undefined){
        throw "GridLayer requires CanvasLayer"
    }

    if(w.Grid == undefined){
        throw "GridLayer requires Grid"
    }

    var CanvasLayer = CE.CanvasLayer;

    /**
     *
     * @param options
     * @param canvas
     * @constructor
     */
    var GridLayer = function (canvas, options) {
        var self = this;
        options = options || [];
        CanvasLayer.call(self, canvas,options);
        initialize(self);
        self.grid = options.grid || null;
    };

    GridLayer.prototype = Object.create(CanvasLayer.prototype);
    GridLayer.prototype.constructor = GridLayer;

    GridLayer.prototype.refresh = function(){
        var self = this;
        self.clear();
        self.grid.draw(self.context,self);
    };

    GridLayer.prototype.visibleArea = function(){
        var self = this;
        return {
            x:self.canvas.viewX,
            y:self.canvas.viewY,
            width:self.width,
            height:self.height
        };
    };


    /**
     *
     * @param self
     */
    function initialize(self){
        var grid = null;

        Object.defineProperty(self,'grid',{
            get:function(){
                if(grid == null){
                    var width = self.width;
                    var height = self.height;
                    grid = new Grid({
                        sw: width,
                        sh: height,
                        width: width,
                        height: height,
                        parent:self
                    });
                }
                return grid;
            },
            set:function(g){
                if(grid != g){
                    grid = g;
                }
            }
        })
    }

    w.GridLayer = GridLayer;
})(window);