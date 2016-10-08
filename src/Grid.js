(function (w) {
    if (w.AbstractGrid == undefined) {
        throw "Grid requires AbstractGrid"
    }


    if (w.RectSet == undefined) {
        throw "Grid requires RectSet"
    }

    /**
     *
     * @param options
     * @constructor
     */
    var Grid = function (options) {
        console.log('initializing Grid...');
        var self = this;
        AbstractGrid.call(self, options);
        initialize(self);
        self.rects = [];
        self.checkedSets = [];
        self.drawCallback = null;
        self.sx = options.sx || 0;
        self.sy = options.sy || 0;
    };

    Grid.prototype = Object.create(AbstractGrid.prototype);
    Grid.prototype.constructor = Grid;


    /**
     *
     * @param callback
     */
    Grid.prototype.ondrawcallback = function (callback) {
        var self = this;
        self.drawCallback = callback;
    };

    /**
     *
     * @param options
     * @returns {{si: Number, sj: Number, ei: Number, ej: Number}}
     */
    Grid.prototype.getAreaInterval = function (options) {
        var self = this;
        var x = options.x || 0;
        var y = options.y || 0;
        var width = options.width || 0;
        var height = options.height || 0;
        var maxi = self.maxI;
        var maxj = self.maxJ;

        var si = parseInt(Math.floor(y / self.sh));
        var sj = parseInt(Math.floor(x / self.sw));
        var ei = parseInt(Math.floor((y + height) / self.sh));
        var ej = parseInt(Math.floor((x + width) / self.sw));
        si = Math.min(si, maxi);
        sj = Math.min(sj, maxj);
        ei = Math.min(ei, maxi);
        ej = Math.min(ej, maxj);

        return {si: si, sj: sj, ei: ei, ej: ej};

    };

    /**
     *
     * @param i
     * @param j
     * @returns {*}
     */
    Grid.prototype.get = function (i, j) {
        var self = this;
        if (i >= 0 && i <= self.maxI && j >= 0 && j <= self.maxJ) {
            if (self.rects[i] == undefined) {
                self.rects[i] = [];
            }

            if (!self.rects[i][j]) {
                self.rects[i][j] = new RectSet({
                    x: j * self.sw,
                    y: i * self.sh,
                    width: self.sw,
                    height: self.sh,
                    fillStyle: self.fillStyle,
                    strokeStyle: self.strokeStyle,
                    i: i,
                    j: j
                });
            }

            return self.rects[i][j];
        }


        return null;
    };

    /**
     *
     * @param options
     * @returns {Array}
     */
    Grid.prototype.getRectsFromArea = function (options) {
        var rects = [];
        var self = this;
        var interval = self.getAreaInterval(options);
        for (var i = interval.si; i <= interval.ei; i++) {
            for (var j = interval.sj; j <= interval.ej; j++) {
                var rect = self.get(i, j);
                if (rect != null) {
                    rects.push(rect);
                }
            }
        }

        return rects;
    };

    /**
     *
     * @param options
     * @param condition
     * @returns {Grid}
     */
    Grid.prototype.apply = function (options, condition) {
        var self = this;
        self.fillStyle = options.fillStyle || self.fillStyle;
        self.strokeStyle = options.strokeStyle || self.strokeStyle;
        for (var i = 0; i < self.maxI; i++) {
            for (var j = 0; j < self.maxJ; j++) {
                var rect = self.get(i, j);
                if (condition === undefined || condition.apply(rect)) {
                    rect.set(options);
                }
            }
        }
        return self;
    };


    Grid.prototype.draw = function (ctx, layer) {
        var self = this;
        var si = Math.floor(self.sy / self.sh);
        var sj = Math.floor(self.sx / self.sw);
        var ei = Math.floor((self.sy + self.height) / self.sh);
        var ej = Math.floor((self.sx + self.width) / self.sw);
        ei = Math.min(ei, self.maxI);
        ej = Math.min(ej, self.maxJ);
        var viewX = self.parent.canvas.viewX;
        var viewY = self.parent.canvas.viewY;
        for (var i = si; i < ei; i++) {
            for (var j = sj; j < ej; j++) {
                var rect = self.get(i, j);
                if (rect != null) {
                    var x = parseInt(rect.x+viewX);
                    var y = parseInt(rect.y+viewY);

                    if (rect.fillStyle !== 'transparent') {
                        ctx.fillStyle = rect.fillStyle;
                        ctx.fillRect(x, y, rect.width, rect.height);
                    }

                    if (rect.strokeStyle !== 'transparent') {
                        ctx.setLineDash(rect.lineDash);
                        ctx.lineWidth = rect.lineWidth;
                        ctx.strokeStyle = rect.strokeStyle;
                        ctx.strokeRect(x, y, rect.width, rect.height);
                        ctx.fillStyle = 'blue';
                        ctx.fontSize = '12px Arial';
                        ctx.fillText(i + ',' + j, x, y + 8);
                    }
                    if (self.drawCallback !== null) {
                        ctx.save();
                        self.drawCallback(rect, ctx);
                        ctx.restore();

                    }
                }
            }
        }

        return self;
    };

    function initialize(self){
        var sw = 0;
        var sh = 0;
        var width = 0;
        var height = 0;

        Object.defineProperty(self, 'sw', {
            get: function () {
                return sw;
            },
            set: function (s) {
                if (s != sw) {
                    sw = s;
                    self.rects = [];
                }
            }
        });

        Object.defineProperty(self, 'sh', {
            get: function () {
                return sh;
            },
            set: function (s) {
                if (s != sh) {
                    sh = s;
                    self.rects = [];
                }
            }
        });

        Object.defineProperty(self, 'width', {
            get: function () {
                return width;
            },
            set: function (w) {
                if (w != width) {
                    width = w;
                    self.rects = [];
                }
            }
        });

        Object.defineProperty(self, 'height', {
            get: function () {
                return height;
            },
            set: function (h) {
                if (h != height) {
                    height = h;
                    self.rects = [];
                }
            }
        });
    }


    w.Grid = Grid;
})(window);