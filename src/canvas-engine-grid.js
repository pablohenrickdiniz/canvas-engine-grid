(function(window){
    var CE = window.CE,
        AppObject = CE.AppObject,
        CanvasEngine = CE.CE,
        math = CE.Math,
        Validator = CE.Validator,
        CanvasLayer = CE.CanvasLayer,
        Color = CE.Color;

    var CanvasEngineGrid = function(options){
        var self = this;
        self.selectable = false;
        self.multiSelect = false;
        self.areaSelect = null;
        self.gridLayer = null;
        CanvasEngine.call(self,options);
        CanvasEngineGrid.initialize.apply(self);
    };

    CanvasEngineGrid.prototype = Object.create(CanvasEngine.prototype);
    CanvasEngineGrid.prototype.constructor = CanvasEngine;


    CanvasEngineGrid.initialize = function(){
        var self = this;
        var mouseReader = self.getMouseReader();

        /*
         Calcula e redesenha um retângulo selecionado no tileset
         */
        mouseReader.onmousedown(1, function () {
            if (self.selectable && typeof self.areaSelect === 'function') {
                var reader = this;
                var translate = {x: Math.abs(self.viewX / self.scale), y: Math.abs(self.viewY / self.scale)};
                var pa = math.vpv(math.sdv(self.scale, reader.lastDown.left), translate);
                var area = {
                    x: pa.x,
                    y: pa.y
                };
                var grid = self.getGridLayer().getGrid();
                self.areaSelect.apply(self, [area, grid]);
                self.getGridLayer().refresh();
            }
        });

        /*
         Calcula e redesenha uma área selecionada no tileset
         */
        mouseReader.onmousemove(function (e) {
            if (self.multiSelect && self.selectable && typeof self.areaSelect === 'function') {
                var reader = this;
                var grid = self.getGridLayer().getGrid();
                var area = null;
                if (reader.left) {
                    area = self.getDrawedArea();
                }
                else {
                    area = math.vpv(math.sdv(self.scale, reader.lastMove), {
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
        var pa = math.vpv(math.sdv(self.scale, reader.lastDown.left), translate);
        var pb = math.vpv(math.sdv(self.scale, reader.lastMove), translate);
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
        options = options === undefined?{}:options;
        var layer = null;
        var self = this;
        options.zIndex = self.layers.length;



        var width = parseFloat(options.width);
        var height = parseFloat(options.height);
        options.width = isNaN(width)?self.getWidth():width;
        options.height = isNaN(height)?self.getHeight():height;

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

        if (self.container !== null && $(self.container).length > 0) {
            $(self.container).append(layer.getElement());
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
        self.checkedArea = null;
        AppObject.call(self);
        self.set(options);
    };

    AbstractGrid.prototype = Object.create(AppObject.prototype);
    AbstractGrid.prototype.constructor = AbstractGrid;

    AbstractGrid.prototype.setCheckedArea = function(area){
        var self = this;
        self.checkedArea = area;
    };

    AbstractGrid.prototype.isDrawable = function () {
        var self = this;
        return self.sw > 0 && self.sh > 0 && self.width > 0 && self.height > 0;
    };

    AbstractGrid.prototype.draw = function(context,layer){
        //console.log('Grid layer draw grid...');
        var self = this;
        if (self.isDrawable()) {
            context.fillStyle = 'transparent';
            context.strokeStyle = (new Color({alpha: 0.1})).toRGBA();
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

            if(self.checkedArea !== null){
                var area = self.checkedArea;
                context.strokeStyle = '#151515';
                context.strokeRect(area.x,area.y,area.width,area.height);
            }

        }

        return self;
    };

    var Grid = function (options) {
        console.log('initializing Grid...');
        var self = this;
        self.rectSets = [];
        self.checkedSets = [];
        self.drawCallback = null;
        AbstractGrid.call(self, options);
        Grid.bindProperties.apply(self);
    };


    Grid.prototype = Object.create(AbstractGrid.prototype);
    Grid.prototype.constructor = Grid;


    Grid.prototype.drawCallback = function(callback){
        var self = this;
        self.drawCallback = callback;
    };

    Grid.bindProperties = function () {
        var self = this;
        self._afterChange(function () {
            var update = false;
            if (self._isChanged('sw') || self._isChanged('sh')) {
                update = true;
                self.rectSets = [];
            }
            if (self._isChanged('width') || self._isChanged('height')) {
                update = true;
            }
            if (update) {
                self.update();
            }
        });
    };

    Grid.prototype.getAreaInterval = function (options) {
        var self = this;
        var x = _.isNumber(options.x) ? options.x : 0;
        var y = _.isNumber(options.y) ? options.y : 0;
        var width = _.isNumber(options.width) ? options.width : 0;
        var height = _.isNumber(options.height) ? options.height : 0;

        var si = parseInt(Math.floor(y / self.sh));
        var sj = parseInt(Math.floor(x / self.sw));
        var ei = parseInt(Math.floor((y + height) / self.sh));
        var ej = parseInt(Math.floor((x + width) / self.sw));
        return {si: si, sj: sj, ei: ei, ej: ej};

    };

    /*
     Array<RectSets> : getRectsFromArea(Object object);
     dada uma determinada, obtém todos os objetos
     RectSets que estão presentes nessa área
     */
    Grid.prototype.getRectsFromArea = function (options) {
        var rects = [];
        var self = this;
        var interval = self.getAreaInterval(options);
        for (var i = interval.si; i <= interval.ei; i++) {
            if (self.rectSets[i] !== undefined) {
                for (var j = interval.sj; j <= interval.ej; j++) {
                    if (self.rectSets[i][j] !== undefined) {
                        rects.push(self.rectSets[i][j]);
                    }
                }
            }
        }

        return rects;
    };

    /*
     Grid: apply(Object options, Function conditions)
     Aplica as propriedades options em todos os RectSets
     que satisfazem a funçao conditions, que deve retorna
     true ou false
     */
    Grid.prototype.apply = function (options, condition) {
        var self = this;
        self.fillStyle = Color.isColor(options.fillStyle) ? options.fillStyle : self.fillStyle;
        self.strokeStyle = Color.isColor(options.strokeStyle) ? options.strokeStyle : self.strokeStyle;
        self.rectSets.forEach(function (row) {
            row.forEach(function (rectSet) {
                if (condition === undefined || condition.apply(rectSet)) {
                    rectSet.set(options);
                }
            });
        });
        return self;
    };

    /*
     Grid : update()
     Atualiza as dimensões da grade
     */
    Grid.prototype.update = function () {
        var self = this;
        var sw = self.sw;
        var sh = self.sh;
        var w = self.width;
        var h = self.height;
        var i;
        var j;


        if (w > 0 && h > 0) {
            var cols = Math.floor(w / sw);
            var rows = Math.floor(h / sh);
            var count = 0;


            for (i = self.rectSets.length; i < rows; i++) {
                if (self.rectSets[i] === undefined) {
                    self.rectSets[i] = [];
                }
                for (j = self.rectSets[i].length; j < cols; j++) {
                    count++;
                    self.rectSets[i][j] = new RectSet({
                        x: j * self.sw,
                        y: i * self.sh,
                        width: sw,
                        height: sh,
                        fillStyle: self.fillStyle,
                        strokeStyle: self.strokeStyle,
                        i: i,
                        j: j
                    });
                }
            }

            for (j = self.rectSets[0].length; j < cols; j++) {
                for (i = 0; i < self.rectSets.length; i++) {
                    count++;
                    self.rectSets[i][j] = new RectSet({
                        x: j * self.sw,
                        y: i * self.sh,
                        width: sw,
                        height: sh,
                        fillStyle: self.fillStyle,
                        strokeStyle: self.strokeStyle,
                        i: i,
                        j: j
                    });
                }
            }

            for (i = 0; i < self.rectSets.length; i++) {
                self.rectSets[i].length = cols;
            }
            self.rectSets.length = Math.min(rows, self.rectSets.length);
        }
        else {
            self.rectSets = [];
        }


        return self;
    };

    Grid.prototype.draw = function(context){
        var self = this;
        var size1 = self.rectSets.length;
        for(var i = 0; i < size1;i++){
            var size2 = self.rectSets[i].length;
            for(var j = 0; j < size2;j++){
                var rectSet = self.rectSets[i][j];
                if(rectSet.fillStyle !== 'transparent'){
                    context.fillStyle = rectSet.fillStyle;
                    context.fillRect(rectSet.x, rectSet.y, rectSet.width, rectSet.height);
                }

                if(rectSet.strokeStyle !== 'transparent'){
                    context.setLineDash(rectSet.lineDash);
                    context.lineWidth = rectSet.lineWidth;
                    context.strokeStyle = rectSet.strokeStyle;
                    context.strokeRect(rectSet.x, rectSet.y, rectSet.width, rectSet.height);
                }
                if(self.drawCallback !== null){
                    self.drawCallback(rectSet,context);
                }
            }
        }

        return self;
    };

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

    CE.CanvasEngineGrid = CanvasEngineGrid;
    CE.AbstractGrid = AbstractGrid;
    CE.GridLayer = GridLayer;
    CE.Grid = Grid;
    CE.RectSet = RectSet;
})(window);
