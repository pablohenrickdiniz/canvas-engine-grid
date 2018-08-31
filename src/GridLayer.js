'use strict';
(function(w){
    if(w.CE === undefined){
        throw "GridLayer requires CanvasEngine"
    }

    if(CE.CanvasLayer === undefined){
        throw "GridLayer requires CanvasLayer"
    }

    if(w.Grid === undefined){
        throw "GridLayer requires Grid"
    }

    let CanvasLayer = CE.CanvasLayer;

    /**
     *
     * @param options
     * @param canvas
     * @constructor
     */
    let GridLayer = function (canvas, options) {
        let self = this;
        options = options || [];
        CanvasLayer.call(self, canvas,options);
        initialize(self);
        self.grid = options.grid || null;
    };

    GridLayer.prototype = Object.create(CanvasLayer.prototype);
    GridLayer.prototype.constructor = GridLayer;

    GridLayer.prototype.refresh = function(){
        let self = this;
        self.clear();
        self.grid.draw(self.context,self);
    };

    /**
     *
     * @returns {{x: number, y: number, width: number, height: number}}
     */
    GridLayer.prototype.visibleArea = function(){
        let self = this;
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
        let grid = null;

        Object.defineProperty(self,'grid',{
            get:function(){
                if(grid == null){
                    let width = self.width;
                    let height = self.height;
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
                if(grid !== g){
                    grid = g;
                }
            }
        })
    }

    w.GridLayer = GridLayer;
})(window);