(function(w){
    if(w.CE == undefined){
        throw "CanvasEngineGrid requires CanvasEngine";
    }
    else if(w.Math.version == undefined){
        throw "CanvasEngineGrid requires Math Lib";
    }
    else if(w.Validator == undefined){
        throw "CanvasEngineGrid requires Validator";
    }

    var has_class = function(element, className){
        return element.className.indexOf(className) != -1;
    };

    var add_class = function(element,className){
        var original = element.className;
        original = original.trim();
        className = className.split(" ");
        for(var i =0; i < className.length;i++){
            if(!has_class(element,className[i])){
                original += " "+className[i];
            }
        }
        element.className = original;
    };

    var CanvasEngineGrid = function(options){
        var self = this;
        self.selectable = false;
        self.multiSelect = false;
        self.areaSelect = null;
        self.gridLayer = null;
        CanvasEngineGrid.bindProperties.apply(self);
        CE.call(self,options);
        CanvasEngineGrid.initialize.apply(self);
    };

    CanvasEngineGrid.prototype = Object.create(CE.prototype);
    CanvasEngineGrid.prototype.constructor = CanvasEngineGrid;

    CanvasEngineGrid.bindProperties = function(){
        var self = this;
        self._onChange('container', function (container) {
            container.style.position = 'relative';
            container.style.overflow = 'hidden';
            container.style.width = self.width+'px';
            container.style.height = self.height+'px';
            add_class(container,'transparent-background canvas-engine');
            container.addEventListener("contextmenu",function(e){
                e.preventDefault();
            });
            self.getMouseReader().setElement(container);
            self.keyReader = null;
        });
    };

    CanvasEngineGrid.initialize = function(){
        var self = this;
        var mouseReader = self.getMouseReader();

        /*
         Calcula e redesenha um retângulo selecionado no tileset
         */
        mouseReader.onmousedown(function () {
            if (self.selectable && typeof self.areaSelect === 'function') {
                var reader = this;
                var translate = {x: Math.abs(self.viewX / self.scale), y: Math.abs(self.viewY / self.scale)};
                var pa = Math.vpv(Math.sdv(self.scale, reader.lastdown.left), translate);
                var area = {
                    x: pa.x,
                    y: pa.y
                };
                var grid = self.getGridLayer().getGrid();
                self.areaSelect.apply(self, [area, grid]);
                self.getGridLayer().refresh();
            }
        },'left');

        /*
         Calcula e redesenha uma área selecionada no tileset
         */
        mouseReader.onmousemove(function () {
            if (self.multiSelect && self.selectable && typeof self.areaSelect === 'function') {
                var reader = this;
                var grid = self.getGridLayer().getGrid();
                var area = null;
                if (reader.left) {
                    area = self.getDrawedArea();
                }
                else {
                    area = Math.vpv(Math.sdv(self.scale, reader.lastmove), {
                        x: -self.viewX / self.scale,
                        y: -self.viewY / self.scale
                    });
                }
                self.areaSelect.apply(self, [area, grid]);
                self.getGridLayer().refresh();
            }
        });
    };

    /*
     Object : getDrawedArea()
     obter a área selecionada
     */
    CanvasEngineGrid.prototype.getDrawedArea = function () {
        var self = this;
        var reader = self.getMouseReader();
        var translate = {x: -self.viewX / self.scale, y: -self.viewY / self.scale};
        var pa = Math.vpv(Math.sdv(self.scale, reader.lastdown.left), translate);
        var pb = Math.vpv(Math.sdv(self.scale, reader.lastmove), translate);
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


    /*
     CE : onAreaSelect(function callback)
     chama callback quando uma área for selecionada
     */
    CanvasEngineGrid.prototype.onAreaSelect = function (callback) {
        var self = this;
        self.areaSelect = callback;
        return self;
    };

    /*
     CanvasLayer : getGridLayer()
     obtém camada de desenho da grade
     */
    CanvasEngineGrid.prototype.getGridLayer = function (options) {
        options = options === undefined?{}:options;
        var self = this;
        if (self.gridLayer === null) {
            self.gridLayer = self.createLayer({
                type: 'grid',
                append:options.append,
                width:options.width,
                height:options.height
            }, GridLayer);
        }
        return self.gridLayer;
    };


    /*
     CanvasEngine : destroyGridLayer
     destroy a camadad de grid
     */
    CanvasEngineGrid.prototype.destroyGridLayer = function(){
        var self = this;
        if(self.gridLayer !== null){
            self.gridLayer.destroy();
            self.gridLayer = null;
        }
        return self;
    };


    CanvasEngineGrid.prototype.createLayer = function (options, ClassName) {
        options = options == undefined?{}:options;
        var layer = null;
        var self = this;
        options.zIndex = self.layers.length;
        var width = parseFloat(options.width);
        var height = parseFloat(options.height);
        width =isNaN(width)?self.getWidth():width;
        height = isNaN(height)?self.getHeight():height;

        options.width = width;
        options.height = height;
        options.append = options.append === undefined?true:options.append;

        if (ClassName !== undefined) {
            layer = new ClassName(options, self);
        }
        else {
            layer = new CanvasLayer(options, self);
        }

        self.layers.push(layer);

        if (self.gridLayer !== null) {
            var newLayer = self.layers[self.layers.length - 1];
            self.layers[self.layers.length - 1] = self.gridLayer;
            self.layers[self.gridLayer.zIndex] = newLayer;
            newLayer.set({
                zIndex: self.gridLayer.zIndex
            });
            self.gridLayer.set({
                zIndex: self.layers.length - 1
            });
        }

        if(options.append){
            var element = layer.getElement();
            if (self.container !== null && !self.container.contains(element)) {
                self.container.appendChild(element);
            }
        }

        return layer;
    };



    /*
     CE: removeLayer(int zIndex | CanvasLayer)
     Remove uma camada de canvas pelo zIndex
     */
    CanvasEngineGrid.prototype.removeLayer = function (layer) {
        var self = this;

        var index = -1;
        if (!(layer instanceof GridLayer) && layer instanceof CanvasLayer) {
            index = self.layers.indexOf(layer);
        }
        else if (Validator.isInt(layer) && self.layers[layer] !== undefined) {
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