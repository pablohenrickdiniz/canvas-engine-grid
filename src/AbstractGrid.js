(function(w){
    var AbstractGrid = function (options) {
        console.log('initializing Abstract Grid...');
        var self = this;
        initialize(self);
        options = options || {};
        self.x = options.x || 0;
        self.y = options.y || 0;
        self.width = options.width || 0;
        self.height = options.height || 0;
        self.sw = options.sw || 0;
        self.sh = options.sh || 0;
        self.parent = options.parent || 0;
        self.fillStyle = options.fillStyle || 'transarent';
        self.strokeStyle = options.strokeStyle || '#000000';
        self.checkedArea = null;
    };

    AbstractGrid.prototype.isDrawable = function () {

    };

    AbstractGrid.prototype.draw = function(context,layer){
        var viewX = layer.canvas.viewX;
        var viewY = layer.canvas.viewY;
        var width = layer.canvas.width;
        var height = layer.canvas.height;

        var visibleArea = {
            x:-viewX,
            y:-viewY,
            width:width,
            height:height
        };
        var self = this;
        var sj = Math.floor(visibleArea.x/self.sw);
        var si =  Math.floor(visibleArea.y/self.sh);
        var ej = Math.ceil((visibleArea.x+visibleArea.width)/self.sw);
        var ei = Math.ceil((visibleArea.y+visibleArea.height)/self.sh);
        var maxi = self.maxI;
        var maxj = self.maxJ;

        si = Math.min(si,maxi);
        sj = Math.min(sj,maxj);
        ei = Math.min(ei,maxi);
        ej = Math.min(ej,maxj);

        for(var i = si; i < ei;i++){
            for(var j = sj; j < ej;j++){
               context.strokeRect(j*self.sw+viewX,i*self.sh+viewY,self.sw,self.sh);
            }
        }
    };

    function initialize(self){
        var sw = 0;
        var sh = 0;
        var width = 0;
        var height = 0;


        Object.defineProperty(self, 'maxI', {
            get: function () {
                return Math.floor(self.height / self.sh);
            }
        });

        Object.defineProperty(self, 'maxJ', {
            get: function () {
                return Math.floor(self.width / self.sw);
            }
        });

        Object.defineProperty(self, 'sw', {
            configurable:true,
            get: function () {
                return sw;
            },
            set: function (s) {
                if (s != sw) {
                    sw = s;
                }
            }
        });

        Object.defineProperty(self, 'sh', {
            configurable:true,
            get: function () {
                return sh;
            },
            set: function (s) {
                if (s != sh) {
                    sh = s;
                }
            }
        });

        Object.defineProperty(self, 'width', {
            configurable:true,
            get: function () {
                return width;
            },
            set: function (w) {
                if (w != width) {
                    width = w;
                }
            }
        });

        Object.defineProperty(self, 'height', {
            configurable:true,
            get: function () {
                return height;
            },
            set: function (h) {
                if (h != height) {
                    height = h;
                }
            }
        });
    }

    w.AbstractGrid = AbstractGrid;
})(window);