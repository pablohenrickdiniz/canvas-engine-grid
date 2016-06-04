(function(w){
    if(w.AbstractGrid == undefined){
        throw "Grid requires AbstractGrid";
    }
    else if(w.Color == undefined){
        throw "Grid requires Color";
    }


    var Grid = function (options) {
        console.log('initializing Grid...');
        var self = this;
        self.rectSets = [];
        self.checkedSets = [];
        AbstractGrid.call(self, options);
        Grid.bindProperties.apply(self);
    };

    Grid.prototype = Object.create(AbstractGrid.prototype);
    Grid.prototype.constructor = Grid;


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
     dada uma determinada, obt�m todos os objetos
     RectSets que est�o presentes nessa �rea
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
     que satisfazem a fun�ao conditions, que deve retorna
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
     Atualiza as dimens�es da grade
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
                    self.rectSets[i][j] = new CE.EXT.RectSet({
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
                    self.rectSets[i][j] = new CE.EXT.RectSet({
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
        self.rectSets.forEach(function (row) {
            row.forEach(function (rectSet) {
                context.fillStyle = rectSet.fillStyle;
                context.strokeStyle = rectSet.strokeStyle;
                context.setLineDash(rectSet.lineDash);
                context.lineWidth = rectSet.lineWidth;
                context.fillRect(rectSet.x, rectSet.y, rectSet.width, rectSet.height);
                context.strokeRect(rectSet.x, rectSet.y, rectSet.width, rectSet.height);
            });
        });
        return self;
    };
    w.Grid = Grid;
})(window);