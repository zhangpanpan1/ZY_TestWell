/************************************************************************************
 * 说明：深度控件对象，绘制深度，及其属性、方法
 * 参数：
 * 
 *
 *
 ************************************************************************************/

define(function(require, exports, module) {

    var util = require('./util');
    var curveid = 1;


    var perValueX = 0;
    var perValueY = 0;


    function Deep() {

        this.id = "deep" + curveid++;
        //this.name = "深度";
        this.width = 15;

        this.depthScale = 1 / 200;
        this.startDepth = 0;
        this.endDepth = 0;
        this.interval = 5;

        this.initCanvas();
    }

    module.exports = Deep;

    //成员方法--画曲线
    Deep.prototype.draw = function() {

        this.initCanvas();

        //y轴每米的所占像素
        perValueY = util.getCellPx(this.depthScale);
        with(this.canvas.getContext("2d")) {
            clearRect(0, 0, canvas.width, canvas.height);
            var count = (this.endDepth - this.startDepth) / this.interval;
            var mark = 0;
            for (var i = 1; i < count ; i++) {
                mark =  this.startDepth+this.interval*i;
                fillText(mark, this.width - mark.toString().length*6, perValueY*this.interval*i+4);
            }
        }
    }

    Deep.prototype.initCanvas = function() {
        //canvasDiv.
        //canvasDiv.innerHTML = "<canvas height=200 width=300 style='border:1px solid red;' ></canvas>";
        var canvas = null;
        var canvasHeight = (this.endDepth - this.startDepth) * util.getCellPx(this.depthScale);
        if (!this.canvas) {
            var canvasid = this.id;
            if ($.browser.msie) {
                canvas = document.createElement("<canvas height=" + canvasHeight + " width=" + this.ruler.width + " id='" + canvasid + "' ></canvas>");
            } else {
                canvas = document.createElement("canvas");
                canvas.id = canvasid;
            }
            canvas.id = canvasid;
            this.canvas = canvas;
        }
        this.canvas.height = canvasHeight;
        this.canvas.width = this.width;
    }
});