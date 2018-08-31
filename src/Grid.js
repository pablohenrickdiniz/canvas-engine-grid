'use strict';
(function (w) {
    if (w.AbstractGrid === undefined) {
        throw "Grid requires AbstractGrid"
    }


    if (w.RectSet === undefined) {
        throw "Grid requires RectSet"
    }

    /**
     *
     * @param options
     * @constructor
     */
    let Grid = function (options) {
        console.log('initializing Grid...');
        let self = this;
        AbstractGrid.call(self, options);
        initialize(self);
        self.rects = [];
        self.checkedSets = [];
        self.sx = options.sx || 0;
        self.sy = options.sy || 0;
    };

    Grid.prototype = Object.create(AbstractGrid.prototype);
    Grid.prototype.constructor = Grid;

    /**
     *
     * @param options
     * @returns {{si: Number, sj: Number, ei: Number, ej: Number}}
     */
    Grid.prototype.getAreaInterval = function (options) {
        let self = this;
        let x = options.x || 0;
        let y = options.y || 0;
        let width = options.width || 0;
        let height = options.height || 0;
        let maxi = self.maxI;
        let maxj = self.maxJ;

        let si = parseInt(Math.floor(y / self.sh));
        let sj = parseInt(Math.floor(x / self.sw));
        let ei = parseInt(Math.floor((y + height) / self.sh));
        let ej = parseInt(Math.floor((x + width) / self.sw));
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
        let self = this;
        if (i >= 0 && i <= self.maxI && j >= 0 && j <= self.maxJ) {
            if (self.rects[i] === undefined) {
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
        let self = this;
        let rects = [];
        let interval = self.getAreaInterval(options);
        for (let i = interval.si; i <= interval.ei; i++) {
            for (let j = interval.sj; j <= interval.ej; j++) {
                let rect = self.get(i, j);
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
        let self = this;
        self.fillStyle = options.fillStyle || self.fillStyle;
        self.strokeStyle = options.strokeStyle || self.strokeStyle;
        for (let i = 0; i < self.maxI; i++) {
            for (let j = 0; j < self.maxJ; j++) {
                let rect = self.get(i, j);
                if (condition === undefined || condition.apply(rect)) {
                    rect.set(options);
                }
            }
        }
        return self;
    };


    Grid.prototype.draw = function (ctx, layer) {
        let self = this;
        let si = Math.floor(self.sy / self.sh);
        let sj = Math.floor(self.sx / self.sw);
        let ei = Math.floor((self.sy + self.height) / self.sh);
        let ej = Math.floor((self.sx + self.width) / self.sw);
        ei = Math.min(ei, self.maxI);
        ej = Math.min(ej, self.maxJ);
        let viewX = self.parent.canvas.viewX;
        let viewY = self.parent.canvas.viewY;
        for (let i = si; i < ei; i++) {
            for (let j = sj; j < ej; j++) {
                let rect = self.get(i, j);
                if (rect != null) {
                    let x = parseInt(rect.x+viewX);
                    let y = parseInt(rect.y+viewY);

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
                    ctx.save();
                    self.trigger('draw',[rect,ctx]);
                    ctx.restore();
                }
            }
        }

        return self;
    };

    /**
     *
     * @param self
     */
    function initialize(self){
        let sw = 0;
        let sh = 0;
        let width = 0;
        let height = 0;

        Object.defineProperty(self, 'sw', {
            /**
             *
             * @returns {number}
             */
            get: function () {
                return sw;
            },
            /**
             *
             * @param s
             */
            set: function (s) {
                if (s !== sw) {
                    sw = s;
                    self.rects = [];
                }
            }
        });

        Object.defineProperty(self, 'sh', {
            /**
             *
             * @returns {number}
             */
            get: function () {
                return sh;
            },
            /**
             *
             * @param s
             */
            set: function (s) {
                if (s !== sh) {
                    sh = s;
                    self.rects = [];
                }
            }
        });

        Object.defineProperty(self, 'width', {
            /**
             *
             * @returns {number}
             */
            get: function () {
                return width;
            },
            /**
             *
             * @param w
             */
            set: function (w) {
                if (w !== width) {
                    width = w;
                    self.rects = [];
                }
            }
        });

        Object.defineProperty(self, 'height', {
            /**
             *
             * @returns {number}
             */
            get: function () {
                return height;
            },
            /**
             *
             * @param h
             */
            set: function (h) {
                if (h !== height) {
                    height = h;
                    self.rects = [];
                }
            }
        });
    }

    w.Grid = Grid;
})(window);