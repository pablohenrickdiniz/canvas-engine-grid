'use strict';
(function(w){
    let AbstractGrid = function (options) {
        console.log('initializing Abstract Grid...');
        let self = this;
        initialize(self);
        options = options || {};
        self.x = options.x || 0;
        self.y = options.y || 0;
        self.width = options.width || 0;
        self.height = options.height || 0;
        self.sw = options.sw || 0;
        self.sh = options.sh || 0;
        self.parent = options.parent || 0;
        self.fillStyle = options.fillStyle || 'transparent';
        self.strokeStyle = options.strokeStyle || '#000000';
        self.checkedArea = null;
        self.listeners = [];
    };

    AbstractGrid.prototype.isDrawable = function () {

    };

    /**
     *
     * @param event
     * @param callback
     */
    AbstractGrid.prototype.addEventListener = function (event, callback) {
        let self = this;
        if (self.listeners[event] === undefined) {
            self.listeners[event] = [];
        }

        if (self.listeners[event].indexOf(callback) === -1) {
            self.listeners[event].push(callback);
        }
    };

    /**
     *
     * @param event
     * @param callback
     */
    AbstractGrid.prototype.removeEventListener = function (event, callback) {
        let self = this;
        if (self.listeners[event] !==  undefined) {
            let index = self.listeners[event].indexOf(callback);
            if (index !==  -1) {
                self.listeners[event].splice(index, 1);
            }
        }
    };

    /**
     *
     * @param event
     * @param args
     */
    AbstractGrid.prototype.trigger = function (event, args) {
        let self = this;
        if (self.listeners[event] !== undefined) {
            let length = self.listeners[event].length;
            for (let i = 0; i < length; i++) {
                self.listeners[event][i].apply(self, args);
            }
        }
    };

    AbstractGrid.prototype.draw = function(context,layer){
        let viewX = layer.canvas.viewX;
        let viewY = layer.canvas.viewY;
        let width = layer.canvas.width;
        let height = layer.canvas.height;

        let visibleArea = {
            x:-viewX,
            y:-viewY,
            width:width,
            height:height
        };
        let self = this;
        let sj = Math.floor(visibleArea.x/self.sw);
        let si =  Math.floor(visibleArea.y/self.sh);
        let ej = Math.ceil((visibleArea.x+visibleArea.width)/self.sw);
        let ei = Math.ceil((visibleArea.y+visibleArea.height)/self.sh);
        let maxi = self.maxI;
        let maxj = self.maxJ;

        si = Math.min(si,maxi);
        sj = Math.min(sj,maxj);
        ei = Math.min(ei,maxi);
        ej = Math.min(ej,maxj);

        for(let i = si; i < ei;i++){
            for(let j = sj; j < ej;j++){
               context.strokeRect(j*self.sw+viewX,i*self.sh+viewY,self.sw,self.sh);
            }
        }
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


        Object.defineProperty(self, 'maxI', {
            /**
             *
             * @returns {number}
             */
            get: function () {
                return Math.floor(self.height / self.sh);
            }
        });

        Object.defineProperty(self, 'maxJ', {
            /**
             *
             * @returns {number}
             */
            get: function () {
                return Math.floor(self.width / self.sw);
            }
        });

        Object.defineProperty(self, 'sw', {
            configurable:true,
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
                }
            }
        });

        Object.defineProperty(self, 'sh', {
            configurable:true,
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
                }
            }
        });

        Object.defineProperty(self, 'width', {
            configurable:true,
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
                }
            }
        });

        Object.defineProperty(self, 'height', {
            configurable:true,
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
                }
            }
        });
    }

    w.AbstractGrid = AbstractGrid;
})(window);