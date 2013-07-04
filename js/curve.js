/************************************************************************************
 * 说明：曲线对象，绘制曲线，及其属性、方法
 * 参数：
 * lane:在哪个道上画曲线
 *
 *
 ************************************************************************************/

define(function(require, exports, module) {

    var util = require('./util');
    var curveid = 1;


    var perValueX = 0;
    var perValueY = 0;


    function Curve(ruler) {

        this.ruler = ruler;
        //声明跟标尺一对一的关系，并在初始化时，将此曲线对应上ruler， 双向关联
        this.ruler.curve = this;

        this.id = "curve" + curveid++;
        this.name = this.ruler.name;
        this.width = 0;
        this.isLg = false; //是否求对数
        this.data = null; //曲线的数据

        this.depthScale = 1 / 200;
        this.startDepth = 0;
        this.endDepth = 0;
        //var dataStr = "井深,数据一,数据二;2050.000,-99999.000,50.000;2050.125,357.787,17.787;"
        //改造成这样 ：var dataStr = "2050.000,-99999.000;2050.125,357.787;{{depth:2050.000,dataname:-99999.000},{depth:2050.125,dataname:2050.125,357.787}}
        this.pxData = [];
        this.initCanvas();
    }

    module.exports = Curve;

    //成员方法--画曲线
    Curve.prototype.draw = function() {
        this.pxData = []; //画之前清空下，避免重复画时点累加
        //单位x坐标所占的像素
        var start = this.ruler.start;
        var end = this.ruler.end;
        if (this.isLg) {
            start = start == 0 ? 0 : Math.log(this.ruler.start) / Math.LN10;
            end = end == 0 ? 0 : Math.log(this.ruler.end) / Math.LN10;
            perValueX = Math.abs((this.ruler.width) / (end - start));
        } else {
            perValueX = Math.abs((this.ruler.width) / (end - start));
        }
        //y轴每米的所占像素
        perValueY = util.getCellPx(this.depthScale);
        var data = this.data.split(';');
        this.startDepth = this.startDepth == 0 ? data[0][0] : this.startDepth;
        this.endDepth = this.endDepth == 0 ? data[data.length - 1][0] : this.endDepth;

        this.initCanvas();
        with(this.canvas.getContext("2d")) {
            clearRect(0, 0, canvas.width, canvas.height);
            strokeStyle = this.ruler.color;
            lineWidth = this.ruler.lineWidth;
            beginPath();
            for (var i = 0; i <= data.length - 1; i++) {
                var dataArr = data[i].split(',');
                var x = dataArr[1];
                var y = (dataArr[0] - this.startDepth) * perValueY;
                //数据必须在设置的深度范围之类
                if (dataArr[0] < this.startDepth) {
                    continue;
                }
                if (dataArr[0] > this.endDepth) {
                    break;
                }
                //如果要求对数，则将数据求对数
                if (this.isLg) {
                    x = x < 0 ? 0 : Math.log(parseFloat(x)) / Math.LN10;
                }
                //将不在范围内的点放到边上
                if (x < Math.min(start, end)) {
                    x = Math.min(start, end);
                }
                if (x > Math.max(start, end)) {
                    x = Math.max(start, end);
                }
                x = Math.abs((x - start) * perValueX);
                //将像素点放到数组里，供外部调用
                this.pxData.push([x, y]);
                //起点
                if (i == 0) {
                    moveTo(x, y);
                    continue;
                }

                //画线
                lineTo(x, y);


                // beginPath();
                // moveTo(x, y + this.lane.laneHeadHeight);
            }
            stroke();
            this.initEvent();
        }
    }

    Curve.prototype.getPxData = function(isLg, rulerStart, rulerEnd) {
        this.pxData = [];
        if (isLg) {
            rulerStart = rulerStart == 0 ? 0 : Math.log(rulerStart) / Math.LN10;
            rulerEnd = rulerEnd == 0 ? 0 : Math.log(rulerEnd) / Math.LN10;
            perValueX = Math.abs((this.width) / (rulerEnd - rulerStart));
        } else {
            perValueX = Math.abs((this.width) / (rulerEnd - rulerStart));
        }

        var data = this.data.split(';');
        for (var i = 0; i <= data.length - 1; i++) {
            var dataArr = data[i].split(',');
            var x = dataArr[1];
            var y = (dataArr[0] - this.startDepth) * perValueY;
            //数据必须在设置的深度范围之类
            if (dataArr[0] < this.startDepth) {
                continue;
            }
            if (dataArr[0] > this.endDepth) {
                break;
            }
            //如果要求对数，则将数据求对数
            if (isLg) {
                x = x < 0 ? 0 : Math.log(parseFloat(x)) / Math.LN10;
            }
            //将不在范围内的点放到边上
            if (x < Math.min(rulerStart, rulerEnd)) {
                x = Math.min(rulerStart, rulerEnd);
            }
            if (x > Math.max(rulerStart, rulerEnd)) {
                x = Math.max(rulerStart, rulerEnd);
            }
            x = Math.abs((x - rulerStart) * perValueX);
            //将像素点放到数组里，供外部调用
            this.pxData.push([x, y]);
        }
        return this.pxData;
    }

    Curve.prototype.initCanvas = function() {
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
        this.canvas.width = this.ruler.width;
        //util.mouseTip(document.getElementById(this.canvas));
    }

    Curve.prototype.initEvent = function() {
        if (!this.isLg) {
            util.mouseTip(this.canvas, 1 / perValueX, 1 / perValueY, this.startDepth);
        }

    }
});