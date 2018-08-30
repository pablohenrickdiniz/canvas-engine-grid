(function (w) {
    if (w.CE === undefined) {
        throw "CanvasEngineGrid requires CanvasEngine"
    }

    if (Math.version === undefined) {
        throw "CanvasEngineGrid requires Math Lib"
    }

    if (w.CE.CanvasLayer === undefined) {
        throw "CanvasEngineGrid requires CanvasLayer"
    }

    if (w.GridLayer === undefined) {
        throw "CanvasEngineGrid requires GridLayer"
    }

    var CE = w.CE,
        CanvasLayer = CE.CanvasLayer;

    /**
     *
     * @param container
     * @param options
     * @constructor
     */
    var CanvasEngineGrid = function (container, options) {
        var self = this;
        options = options || {};
        CE.call(self, container, options);
        self.selectable = options.selectable || false;
        self.multiSelect = options.multiSelect || false;
        self.gridLayer = null;
        self.mouseReader = null;
        self.lastViewX = 0;
        self.lastViewX = 0;
        self.viewX = 0;
        self.viewY = 0;
        initialize(self);
    };

    CanvasEngineGrid.prototype = Object.create(CE.prototype);
    CanvasEngineGrid.prototype.constructor = CanvasEngineGrid;

    CanvasEngineGrid.prototype.getMouseReader = function () {
        var self = this;
        if (self.mouseReader == null) {
            self.mouseReader = new Mouse(self.container);
        }
        return self.mouseReader;
    };

    /**
     *
     * @param self
     */
    function initialize(self) {
        var mouseReader = self.getMouseReader();
        mouseReader.addEventListener('mousedown', function (x, y, e) {
            if (e.which === 3) {
                self.lastViewX = self.viewX;
                self.lastViewY = self.viewY;
            }
        });


        mouseReader.addEventListener('mousemove', function (x, y) {
            if (mouseReader.right) {
                var pa = {
                    x: mouseReader.lastDownX,
                    y: mouseReader.lastDownY
                };

                var pb = {
                    x: x,
                    y: y
                };

                var d = Math.vmv(pa, pb);

                var viewX = Math.min(self.lastViewX - d.x, 0);
                var viewY = Math.min(self.lastViewY - d.y, 0);
                viewX = Math.max(viewX, self.minViewX);
                viewY = Math.max(viewY, self.minViewY);
                var changed = false;

                if (self.viewX !== viewX) {
                    self.viewX = viewX;
                    changed = true;
                }

                if (self.viewY !== viewY) {
                    self.viewY = viewY;
                    changed = true;
                }

                if (changed) {
                    self.trigger('viewChange', [self.viewX, self.viewY]);
                }
            }
        });

        mouseReader.addEventListener('mousedown', function (x, y, e) {
            if (e.which === 1) {
                if (self.selectable && self.eventListeners['areaselect'] !== undefined && self.eventListeners['areaselect'].length > 0) {
                    var area = Math.vpv(Math.sdv(self.scale, {x: x, y: y}), {
                        x: -self.viewX / self.scale,
                        y: -self.viewY / self.scale
                    });
                    var grid = self.getGridLayer().grid;
                    self.trigger('areaselect', [area, grid]);
                }
            }
        });


        mouseReader.addEventListener('mousemove', function (x, y) {
            if (self.multiSelect && self.selectable && self.listeners['areaselect'] !== undefined && self.listeners['areaselect'].length > 0) {
                var reader = this;
                var grid = self.getGridLayer().grid;
                var area = null;
                if (reader.left) {
                    area = self.getDrawedArea();
                }
                else {
                    area = Math.vpv(Math.sdv(self.scale, {x: x, y: y}), {
                        x: -self.viewX / self.scale,
                        y: -self.viewY / self.scale
                    });
                }
                self.trigger('areaselect', [area, grid]);
            }
        });

        var minViewX = -Infinity;
        var minViewY = -Infinity;

        Object.defineProperty(self,'minViewX',{
            get:function(){
                return minViewX;
            },
            set:function(mvx){
                if(mvx !== minViewX){
                    minViewX = mvx;
                    if(self.viewX < minViewX){
                        self.viewX =  minViewX;
                        self.trigger('viewChange',[self.viewX,self.viewY]);
                    }
                }
            }
        });

        Object.defineProperty(self,'minViewY',{
            get:function(){
                return minViewY;
            },
            set:function(mvy){
                if(mvy !== minViewY){
                    minViewY = mvy;
                    if(self.viewY < minViewY){
                        self.viewY = minViewY;
                        self.trigger('viewChange',[self.viewX,self.viewY]);
                    }
                }
            }
        });
    }

    /**
     *
     * @returns {{x: (*|pa.x), y: (*|pa.y), width: number, height: number}}
     */
    CanvasEngineGrid.prototype.getDrawedArea = function () {
        var self = this;
        var reader = self.getMouseReader();
        var translate = {x: -self.viewX / self.scale, y: -self.viewY / self.scale};
        var pa = Math.vpv(Math.sdv(self.scale, {x: reader.lastDownX, y: reader.lastDownY}), translate);
        var pb = Math.vpv(Math.sdv(self.scale, {x: reader.lastX, y: reader.lastY}), translate);
        var width = Math.abs(pb.x - pa.x);
        var height = Math.abs(pb.y - pa.y);

        var area = {
            x: pa.x,
            y: pa.y,
            width: width,
            height: height
        };

        area.x = pa.x > pb.x ? area.x - width : area.x;
        area.y = pa.y > pb.y ? area.y - height : area.y;
        return area;
    };
    /**
     *
     * @param options
     * @returns {null|*}
     */
    CanvasEngineGrid.prototype.getGridLayer = function (options) {
        options = options || {};
        var self = this;
        if (self.gridLayer === null) {
            self.gridLayer = self.createLayer(options, GridLayer);
        }
        return self.gridLayer;
    };

    /**
     *
     * @returns {CanvasEngineGrid}
     */
    CanvasEngineGrid.prototype.destroyGridLayer = function () {
        var self = this;
        if (self.gridLayer !== null) {
            self.gridLayer.destroy();
            self.gridLayer = null;
        }
        return self;
    };

    /**
     *
     * @param options
     * @param ClassName
     * @returns {*}
     */
    CanvasEngineGrid.prototype.createLayer = function (options, ClassName) {
        options = options === undefined ? {} : options;
        var layer = null;
        var self = this;
        options.zIndex = self.layers.length;
        options.width = options.width || self.width;
        options.height = options.height || self.height;

        if (ClassName !== undefined) {
            layer = new ClassName(self, options);
        }
        else {
            layer = new CanvasLayer(self, options);
        }

        self.layers.push(layer);

        if (self.gridLayer !== null) {
            var newLayer = self.layers[self.layers.length - 1];
            self.layers[self.layers.length - 1] = self.gridLayer;
            self.layers[self.gridLayer.zIndex] = newLayer;

            newLayer.zIndex = self.gridLayer.zIndex;
            self.gridLayer.zIndex = self.layers.length - 1;
        }

        self.container.appendChild(layer.element);

        return layer;
    };

    /**
     *
     * @param layer
     * @returns {CanvasEngineGrid}
     */
    CanvasEngineGrid.prototype.removeLayer = function (layer) {
        var self = this;

        var index = -1;
        if (!(layer instanceof GridLayer) && layer instanceof CanvasLayer) {
            index = self.layers.indexOf(layer);
        }
        else if (/^[0-9]+$/.test(layer) && self.layers[layer] !== undefined) {
            index = layer;
        }

        if (index !== -1) {
            self.layers[index].destroy();
            self.layers.splice(index, 1);
            for (var i = index; i < self.layers.length; i++) {
                self.layers[i].set({
                    zIndex: i
                });
            }
        }
        return self;
    };
    w.CanvasEngineGrid = CanvasEngineGrid;
})(window);
