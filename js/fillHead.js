/************************************************************************************
 * 说明：事件对象 -- 用来处理lane容器及其子控件的事件
 * 参数：
 *
 ************************************************************************************/

define(function(require, exports, module) {
    var util = require('./util');

    var fillHeadId = 1;

    function FillHead() {
        this.id = "fillHead" + fillHeadId++;
        this.name = "伽马";
        this.color = "blue";
        this.width = 150;
        this.fillStyle = {
            imgSrc : "./image/fill_img/lith2.bmp",
            foreColor: "rgb(0,0,0)",
            backgroundColor: "rgb(255,255,255)"
        }
        
        this.fillPostion = "both";
        //声明跟填充对象一对一的关系
        this.fill = null;

        this.initCanvas();
    }

    module.exports = FillHead;


    FillHead.prototype.draw = function() {
        var fillHead = this;
        util.loadImages(this.fillStyle.imgSrc, function(image) {
            fillHead.drawFillHead(util.setImgBgAndForColor(image,fillHead.fillStyle.backgroundColor,fillHead.fillStyle.foreColor));
        });
    }
    //成员方法--画曲线
    FillHead.prototype.drawFillHead = function(image) {
        this.initCanvas();
        //画填充块
        with(this.canvas.getContext("2d")) {
            clearRect(0, 0, canvas.width, canvas.height);
            beginPath();
            var pat = createPattern(image, "repeat");
            fillStyle = pat;
            rect(0, 0, this.width, 32);
            fill();

            //画填充名称
            fillStyle = "#ffffff";
            fillRect((this.width - this.name.length * 12) / 2, 9, this.name.length * 12, 15);


            beginPath();
            fillStyle = "#000000"
            font = "10px sans-serif bold";
            fillText(this.name, (this.width - this.name.length * 12) / 2, 20);
        }
    }

    FillHead.prototype.initCanvas = function() {
        var canvas = null;
        if (!this.canvas) {
            var canvasid = this.id;
            canvas = document.createElement("canvas");
            canvas.id = canvasid;
            canvas.style.borderTop = "1px solid black";
            canvas.style.borderBottom = "1px solid black";
            this.canvas = canvas;
        }
        this.canvas.height = 32;
        this.canvas.width = this.width;
    }


});