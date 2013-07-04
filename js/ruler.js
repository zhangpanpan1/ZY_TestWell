/************************************************************************************
 * 说明：标尺对象，绘制标尺
 * 参数：
 *
 ************************************************************************************/

define(function(require, exports, module) {
    var $ = require('jquery');
    var data = require('./data');
    require('jquery.contextMenu');
    require('XY_Dialog');


    var rulerid = 1;

    function Ruler() {
        this.id = "ruler"+rulerid++;
        this.name = "伽马";
        this.start = 1;
        this.end = 100;
        this.unit = "API"; //单位名称

        this.color = "blue";
        this.lineWidth = 1; //曲线的宽度
        this.width = 150;
        this.initCanvas();
        //声明跟曲线一对一的关系
        this.curve = null;
    }

    module.exports = Ruler;

    //成员方法--画曲线
    Ruler.prototype.draw = function() {
        this.initEvent();
        with(this.canvas.getContext("2d")) {
            clearRect(0,0,canvas.width,canvas.height);
            beginPath();
            //设置颜色
            strokeStyle = this.color;
            lineWidth = this.lineWidth;
            //font = "10px sans-serif";这是canvas字体默认值
            //画标尺
            var lineY = this.canvas.height / 2;
            moveTo(1, lineY);
            lineTo(this.width - 1, lineY);
            stroke();
            //画刻度线的起始值和结束值,根据字体计算一个整数单字节5px +1
            fillText(this.start, 1, lineY + 11);
            fillText(this.end, this.width - this.end.toString().length*6, lineY + 11);
            //画刻度线的名称 ，根据字体计算一个英文单字节5px一个中文双字节10px;
            fillText(this.name, (this.width - this.name.length*10) / 2, lineY - 5);
            //画刻度线的单位
            fillText(this.unit, (this.width - this.unit.length*5) / 2, lineY + 10);
        }
    }
    Ruler.prototype.initCanvas = function() {
        //canvasDiv.
        //canvasDiv.innerHTML = "<canvas height=200 width=300 style='border:1px solid red;' ></canvas>";
        var canvas = null;
        if (!this.canvas) {
            var canvasid = this.id;
            canvas = document.createElement("canvas");
            canvas.id = canvasid;
            this.canvas = canvas;
        }
        this.canvas.height = 32;
        this.canvas.width = this.width;
    }

    Ruler.prototype.initEvent = function() {
        var ruler = this;
        ruler.canvas.onclick = function(){
            this.style.border = "1px dotted red";
        }
    }
});