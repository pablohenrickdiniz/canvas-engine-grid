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

    let CE = w.CE,
        CanvasLayer = CE.CanvasLayer;

    /**
     *
     * @param container
     * @param options
     * @constructor
     */
    let CanvasEngineGrid = function (container, options) {
        let self = this;
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
        let self = this;
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
        let mouseReader = self.getMouseReader();
        mouseReader.addEventListener('mousedown', function (x, y, e) {
            if (e.which === 3) {
                self.lastViewX = self.viewX;
                self.lastViewY = self.viewY;
            }
        });

        mouseReader.addEventListener('mousemove', function (x, y) {
            if (mouseReader.right) {
                let pa = {
                    x: mouseReader.lastDownX,
                    y: mouseReader.lastDownY
                };

                let pb = {
                    x: x,
                    y: y
                };

                let d = Math.vmv(pa, pb);

                let viewX = Math.min(self.lastViewX - d.x, 0);
                let viewY = Math.min(self.lastViewY - d.y, 0);
                viewX = Math.max(viewX, self.minViewX);
                viewY = Math.max(viewY, self.minViewY);
                let changed = false;

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
                if (self.selectable && self.listeners['areaselect'] !== undefined && self.listeners['areaselect'].length > 0) {
                    let area = Math.vpv(Math.sdv(self.scale, {x: x, y: y}), {
                        x: -self.viewX / self.scale,
                        y: -self.viewY / self.scale
                    });
                    let grid = self.getGridLayer().grid;
                    self.trigger('areaselect', [area, grid]);
                }
            }
        });

        mouseReader.addEventListener('mousemove', function (x, y) {
            if (self.multiSelect && self.selectable && self.listeners['areaselect'] !== undefined && self.listeners['areaselect'].length > 0) {
                let reader = this;
                let grid = self.getGridLayer().grid;
                let area = null;
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

        let minViewX = -Infinity;
        let minViewY = -Infinity;

        Object.defineProperty(self,'minViewX',{
            /**
             *
             * @returns {number}
             */
            get:function(){
                return minViewX;
            },
            /**
             *
             * @param mvx
             */
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
            /**
             *
             * @returns {number}
             */
            get:function(){
                return minViewY;
            },
            /**
             *
             * @param mvy
             */
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
     * @returns {{x: number, y: number, width: number, height: number}}
     */
    CanvasEngineGrid.prototype.getDrawedArea = function () {
        let self = this;
        let reader = self.getMouseReader();
        let translate = {x: -self.viewX / self.scale, y: -self.viewY / self.scale};
        let pa = Math.vpv(Math.sdv(self.scale, {x: reader.lastDownX, y: reader.lastDownY}), translate);
        let pb = Math.vpv(Math.sdv(self.scale, {x: reader.lastX, y: reader.lastY}), translate);
        let width = Math.abs(pb.x - pa.x);
        let height = Math.abs(pb.y - pa.y);

        let area = {
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
        let self = this;
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
        let self = this;
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
        let layer = null;
        let self = this;
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
            let newLayer = self.layers[self.layers.length - 1];
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
        let self = this;

        let index = -1;
        if (!(layer instanceof GridLayer) && layer instanceof CanvasLayer) {
            index = self.layers.indexOf(layer);
        }
        else if (/^[0-9]+$/.test(layer) && self.layers[layer] !== undefined) {
            index = layer;
        }

        if (index !== -1) {
            self.layers[index].destroy();
            self.layers.splice(index, 1);
            for (let i = index; i < self.layers.length; i++) {
                self.layers[i].set({
                    zIndex: i
                });
            }
        }
        return self;
    };
    w.CanvasEngineGrid = CanvasEngineGrid;
})(window);
