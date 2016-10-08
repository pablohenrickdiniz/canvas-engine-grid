(function(w){
    /**
     *
     * @param options
     * @constructor
     */
    var RectSet = function (options) {
        var self = this;
        options = options || {};
        self.width = options.width || 32;
        self.height = options.height || 32;
        self.x = options.x || 0;
        self.y = options.y || 0;
        self.fillStyle = 'transparent';
        self.strokeStyle = options.strokeStyle || '#000000';
        self.lineWidth = options.lineWidth || 1;
        self.lineDash = options.lineDash || [];
        self.state = options.state || 0;
        self.i = options.i || 0;
        self.j = options.j || 0;
    };

    /**
     *
     * @param options
     */
    RectSet.prototype.set = function(options){
        options = options || {};
        var self =this;
        for(var prop in options){
            self[prop] = options[prop];
        }
    };

    /**
     *
     * @returns {number}
     */
    RectSet.prototype.getLine = function () {
        var self = this;
        return Math.floor(self.y / self.height);
    };

    /**
     *
     * @returns {number}
     */
    RectSet.prototype.getColumn = function () {
        var self = this;
        return Math.floor(self.x / self.width);
    };

    /**
     *
     * @returns {number}
     */
    RectSet.prototype.getCx = function(){
        var self = this;
        return self.x+(self.width/2);
    };

    /**
     *
     * @returns {number}
     */
    RectSet.prototype.getCy = function(){
        var self = this;
        return self.y+(self.height/2);
    };

    w.RectSet = RectSet;
})(window);