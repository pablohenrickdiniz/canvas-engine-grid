(function(w){
    if(w.AbstractGrid == undefined){
        throw "Grid requires AbstractGrid"
    }

    if(w.Color == undefined){
        throw "Grid requires Color"
    }

    if(w.RectSet == undefined){
        throw "Grid requires RectSet"
    }

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


    Grid.prototype.ondrawcallback = function(callback){
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
        var x = parseFloat(options.x);
        var y = parseFloat(options.y);
        var width = parseFloat(options.width);
        var height = parseFloat(options.height);

        x = isNaN(x) ? 0 : x;
        y = isNaN(y) ?  0: y;
        width = isNaN(width)?0:width;
        height = isNaN(height)?0:height;

        var si = parseInt(Math.floor(y / self.sh));
        var sj = parseInt(Math.floor(x / self.sw));
        var ei = parseInt(Math.floor((y + height) / self.sh));
        var ej = parseInt(Math.floor((x + width) / self.sw));
        return {si: si, sj: sj, ei: ei, ej: ej};

    };


    Grid.prototype.get = function(i,j){
        var self = this;
        if(self.rectSets[i] !== undefined && self.rectSets[i][j] !== undefined){
            return self.rectSets[i][j];
        }

        return null;
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
                var rect = self.rectSets[i][j];
                if(rect.fillStyle !== 'transparent'){
                    context.fillStyle = rect.fillStyle;
                    context.fillRect(rect.x, rect.y, rect.width, rect.height);
                }

                if(rect.strokeStyle !== 'transparent'){
                    context.setLineDash(rect.lineDash);
                    context.lineWidth = rect.lineWidth;
                    context.strokeStyle = rect.strokeStyle;
                    context.strokeRect(rect.x, rect.y, rect.width, rect.height);
                    context.fontSize = '12px Arial';
                    context.fillText(i+','+j,rect.x+5,rect.y+5);
                }
                if(self.drawCallback !== null){
                    context.save();
                    self.drawCallback(rect,context);
                    context.restore();

                }
            }
        }

        return self;
    };

    w.Grid = Grid;
})(window);