/************************************************************************************
 * 说明：深度控件对象，绘制深度，及其属性、方法
 * 参数：
 * 
 *
 *
 ************************************************************************************/

define(function(require, exports, module) {

    var util = require('./util');
    var deepHeadId = 1;
    function DeepHead() {

        this.id = "deephead" + deepHeadId++;
        this.width = 15;
        //this.name = "深度";
        this.text = "深度<br>(米)";
        this.showDepthScale = true;
        this.depthScale = 1/110;
    }

    module.exports = DeepHead;

    //成员方法--画曲线
    DeepHead.prototype.draw = function() {
        
        if (!this.canvas) {
            var canvasDiv = document.createElement("div");
            canvasDiv.id = this.id;
            this.canvas = canvasDiv;
            this.canvas.className = "deephead";
        }
        var headHtml =  "<div class='text'>"+this.text+"</div> <div class='depthScale' style='{0}'>1:"+1/this.depthScale +"</div>";
        if(!this.showDepthScale){
            headHtml = headHtml.replace("{0}","display:none");
        }
        this.canvas.innerHTML = headHtml;
    }
});