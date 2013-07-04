/************************************************************************************
 * 说明：网格对象，绘制网格
 * 参数：
 *
 ************************************************************************************/

define(function(require, exports, module) {

    var util = require('./util');

    var gridid = 1;

    function Grid() {
        this.id = "grid" + gridid++;
        this.color = "#C0C0C0";
        this.linewidth = 1; //曲线的宽度

        this.width = 150;
        
        this.depthScale = 1 / 200;
        this.startDepth = 0;
        this.endDepth = 0;
        //水平刻度细线数
        this.horNum = 10;
        //水平刻度粗线间隔
        this.horBSpace = 5;
        //垂直深度刻度细线
        this.vSpace = 1;
        //中线
        this.vMSpace = 5;
        this.vBSpace = 10;

        this.initCanvas();
    }

    module.exports = Grid;

    //成员方法--画曲线
    Grid.prototype.draw = function() {
        this.initCanvas();
        with(this.canvas.getContext("2d")) {
            //画竖线--刻度线
            var x_cellvalue = this.width / this.horNum;
            for (var i = 1; i < this.horNum; i++) {
                linewidth = 1;
                strokeStyle = "#DDDDDD";
                if(i%this.horBSpace == 0){
                    linewidth = 1;
                    strokeStyle = "#999999";
                }
                beginPath();
                moveTo(Math.floor(x_cellvalue * i) + 0.5 , 0);
                lineTo(Math.floor(x_cellvalue * i) + 0.5, this.canvas.height);
                stroke();
            }
            //画横线--深度线
            var y_cellvalue = util.getCellPx(this.depthScale)*this.vSpace;
            var y_count = (this.endDepth - this.startDepth)/this.vSpace;
            for (var i = 1; i < y_count; i++) {
                strokeStyle = "#DDDDDD";
                lineWidth = 1;
                if(i*this.vSpace%this.vMSpace == 0){
                    strokeStyle = "#999999";
                }
                if(i*this.vSpace%this.vBSpace == 0){
                    strokeStyle = "#000000";
                }
                beginPath();
                moveTo(0.5, Math.floor(y_cellvalue * i) + 0.5);
                lineTo(0.5 + this.width, Math.floor(y_cellvalue * i) + 0.5);
                stroke();
            }
            
        }
    }

    Grid.prototype.initCanvas = function() {
        var canvas = null;
        var canvasHeight = (this.endDepth - this.startDepth) * util.getCellPx(this.depthScale);
        if (!this.canvas) {
            var canvasid = this.id;
            if ($.browser.msie) {
                canvas = document.createElement("<canvas height=" + canvasHeight + " width=" + this.ruler.length + " id='" + canvasid + "' ></canvas>");
            } else {
                canvas = document.createElement("canvas");
                canvas.id = canvasid;
            } 
            canvas.id = canvasid;
            canvas.className = "grid";
            canvas.style.zIndex = -2;
            this.canvas = canvas;
        }
        this.canvas.height = canvasHeight;
        this.canvas.width = this.width;
    }
});