/************************************************************************************
 * 说明：填充对象，绘制填充，及其属性、方法、事件
         20130621初步完成 填充控件及其所有基本属性和方法 ， 交点算法和左右填充位置算法需改进
         对数还没完善
 * 参数：
 *  需要fillHead填充头作为参数进行构造
 *
 ************************************************************************************/
define(function(require, exports, module) {

    var util = require('./util');

    var fillid = 1;

    function Fill(fillHead) {
        this.id = "fill" + fillid++;
        this.name = "填充" + this.id;
        this.width = 150;
        this.height = 390;

        //项1曲线
        this.item1 = {
            isBaseLine: true,
            curve: null,
            line: 0,
            rulerStart: -1,
            rulerEnd: -1,
            isLg: null
        };
        //项1曲线
        this.item2 = {
            isBaseLine: true,
            curve: null,
            line: 0,
            rulerStart: -1,
            rulerEnd: -1,
            isLg: null
        };
        //填充样式
        this.fillHead = fillHead;
        this.fillHead.fill = this;

        this.initCanvas();
        //初始化的时候就将图片预加载
    }

    module.exports = Fill;

    Fill.prototype.draw = function() {
        var fill = this;
        util.loadImages(this.fillHead.fillStyle.imgSrc, function(image) {
            var canvas = util.setImgBgAndForColor(image, fill.fillHead.fillStyle.backgroundColor, fill.fillHead.fillStyle.foreColor);
            fill.drawFill(canvas);
        });
    }

    Fill.prototype.drawFill = function(image) {
        this.initCanvas();
        with(this.canvas.getContext("2d")) {
            clearRect(0, 0, canvas.width, canvas.height);
            //img.src = "./image/fill_img/lith16.bmp";
            var pat = createPattern(image, "repeat");
            fillStyle = pat;
            //fillStyle = this.style;
            if (this.item1.isBaseLine && this.item2.isBaseLine) {
                var x1 = 0,
                    x2 = 0;
                var lineVal = 0,
                    rulerStart = 0,
                    rulerEnd = 0;
                if (this.item1.isLg) {
                    rulerStart = rulerStart == 0 ? 0 : Math.log(this.item1.rulerStart) / Math.LN10;
                    rulerEnd = rulerEnd == 0 ? 0 : Math.log(this.item1.rulerEnd) / Math.LN10;
                    x1 = (Math.log(this.item1.line) / Math.LN10) * this.width / (rulerEnd - rulerStart);
                } else {
                    x1 = this.item1.line * this.width / (this.item1.rulerEnd - this.item1.rulerStart);
                }
                x1 = x1 > 0 || (x1 == 0 && this.item1.rulerEnd > this.item1.rulerStart) ? x1 : this.width + x1;
                if (this.item2.isLg) {
                    rulerStart = rulerStart == 0 ? 0 : Math.log(this.item2.rulerStart) / Math.LN10;
                    rulerEnd = rulerEnd == 0 ? 0 : Math.log(this.item2.rulerEnd) / Math.LN10;

                    x2 = (Math.log(this.item2.line) / Math.LN10) * this.width / (rulerEnd - rulerStart);
                    x2 = x2 > 0 || (x2 == 0 && this.item2.rulerEnd > this.item2.rulerStart) ? x2 : this.width + x2;
                } else {
                    x2 = this.item2.line * this.width / (this.item2.rulerEnd - this.item2.rulerStart);
                }
                x2 = x2 > 0 || (x2 == 0 && this.item2.rulerEnd > this.item2.rulerStart) ? x2 : this.width + x2;

                //项1基线和项2基线间填充
                if (this.fillHead.fillPostion == "both" || this.fillHead.fillPostion == "left" && x1 < x2 || this.fillHead.fillPostion == "right" && x1 > x2) {
                    fillRect(x1 < x2 ? x1 : x2, 0, Math.abs(x2 - x1), this.height);
                }

                return;
            }

            //画项中有曲线的填充
            var data = getLineData(this.item1, this.item2, this.width);
            drawFillPart(this.canvas, data.data1, data.data2, this.fillHead.fillPostion);
        }
    }


    Fill.prototype.initCanvas = function() {
        var canvas = null;
        if (!this.canvas) {
            var canvasid = this.id;
            canvas = document.createElement("canvas");
            canvas.id = canvasid;
            canvas.style.zIndex = -1;
            this.canvas = canvas;
        }

        this.canvas.height = this.height;
        this.canvas.width = this.width;
        //canvasDiv.appendChild(this.canvas);
    }

    //处理项一和项二的数据

    function getLineData(item1, item2, width) {
        var perY = 0;
        var data1, data2;
        if (item1.isBaseLine && !item2.isBaseLine) {
            item2.isLg = item2.isLg == null ? item2.curve.isLg : item2.isLg;
            item1.rulerStart = item1.rulerStart == -1 ? 0 : item1.rulerStart;
            item2.rulerStart = item2.rulerStart == -1 ? 100 : item2.rulerStart;
            item1.rulerEnd = item1.rulerEnd == -1 ? item1.curve.ruler.end : item1.rulerEnd;
            item2.rulerEnd = item2.rulerEnd == -1 ? item2.curve.ruler.end : item2.rulerEnd;
            data1 = [];
            data2 = item2.curve.getPxData(item2.isLg, item2.rulerStart, item2.rulerEnd);
            var x = item1.line * width / (item1.rulerEnd - item1.rulerStart);
            x = x > 0 || (x == 0 && item1.rulerEnd > item1.rulerStart) ? x : width + x;
            perY = data2[1][1] - data2[0][1];
            for (i = 0; i < data2.length; i++) {
                data1.push([x, perY * i + data2[0][1]]);
            };
        }
        if (!item1.isBaseLine && item2.isBaseLine) {
            item1.isLg = item1.isLg == null ? item1.curve.isLg : item1.isLg;
            item2.rulerStart = item2.rulerStart == -1 ? 0 : item2.rulerStart;
            item1.rulerStart = item1.rulerStart == -1 ? 100 : item1.rulerStart;
            item2.rulerEnd = item2.rulerEnd == -1 ? item2.curve.ruler.end : item2.rulerEnd;
            item1.rulerEnd = item1.rulerEnd == -1 ? item1.curve.ruler.end : item1.rulerEnd;

            data2 = [];
            data1 = item1.curve.getPxData(item1.isLg, item1.rulerStart, item1.rulerEnd);
            var x = item2.line * width / (item2.rulerEnd - item2.rulerStart);
            x = x > 0 || (x == 0 && item2.rulerEnd > item2.rulerStart) ? x : width + x;
            perY = data1[1][1] - data1[0][1];
            for (i = 0; i < data1.length; i++) {
                data2.push([x, perY * i + data1[0][1]]);
            };
        }
        if (!item1.isBaseLine && !item2.isBaseLine) {
            item1.isLg = item1.isLg == null ? item1.curve.isLg : item1.isLg;
            item2.isLg = item2.isLg == null ? item2.curve.isLg : item2.isLg;
            item1.rulerStart = item1.rulerStart == -1 ? item1.curve.ruler.start : item1.rulerStart;
            item2.rulerStart = item2.rulerStart == -1 ? item2.curve.ruler.start : item2.rulerStart;
            item1.rulerEnd = item1.rulerEnd == -1 ? item1.curve.ruler.end : item1.rulerEnd;
            item2.rulerEnd = item2.rulerEnd == -1 ? item2.curve.ruler.end : item2.rulerEnd;

            data1 = item1.curve.getPxData(item1.isLg, item1.rulerStart, item1.rulerEnd);
            data2 = item2.curve.getPxData(item2.isLg, item2.rulerStart, item2.rulerEnd);
            filterData(data1, data2, width);

        }
        return {
            data1: data1,
            data2: data2
        }
    }
    //对采样间隔不一致的曲线数据进行拆分，成深度一直的数据，以算交点

    function filterData(data1, data2, width) {
        var space1 = data1[1][1] - data1[0][1];
        var space2 = data2[1][1] - data2[0][1];
        //var maxGcd = util.getMaxGcd(space1, space2);


        var fillStart = Math.max(data1[0][1], data2[0][1]);
        var fillEnd = Math.min(data1[data1.length - 1][1], data2[data2.length - 1][1]);

        var preData = null;
        var preDeep = 0;
        var pre = 0,
            tmp = 0,
            jg = 0;
        //过滤处理data1
        for (var i = 0; i < data1.length; i++) {
            //先删除不再填充范围内的元素
            if (data1[i][1] < fillStart || data1[i][1] > fillEnd) {
                preData = data1.splice(i, 1);
                i--;
                continue;
            }

            if (space1 == space2) {
                return;
            }
            if (i == 0) {
                data1.push(preData);
            }

            var data = data1[i][1] - data1[0][1];
            tmp = data / space2;
            jg = data % space2;
            if (jg < space1 && i != 0) {
                var j = 0;
                while (tmp - pre != 1) {
                    if (j == 0 && jg != 0) {
                        var line1 = util.CalParam(data1[i - 1], data1[i]);
                        var line2 = util.CalParam([0, data1[i][1] - jg], [width, data1[i][1] - jg]);
                        var jd = util.getIntersectPoint(line1, line2);
                        data1.splice(i, 0, jd.split(","));
                        i++;
                        return;
                    }
                    var line1 = util.CalParam(data1[i - 1], data1[i]);
                    var line2 = util.CalParam([0, (tmp - 1) * space2 + data1[0][1]], [width, (tmp - 1) * space1 + data1[0][1]]);
                    var jd = util.getIntersectPoint(line1, line2);
                    data1.splice(i, 0, jd.split(","));
                    i++;
                    pre++;
                }
                if (jg != 0) {
                    var line1 = util.CalParam(data1[i - 1], data1[i]);
                    var line2 = util.CalParam([0, data1[i][1] - jg], [width, data1[i][1] - jg]);
                    var jd = util.getIntersectPoint(line1, line2);
                    data1.splice(i, 0, jd.split(","));
                    i++;
                }
                pre = tmp;
            }
        };
        //开始过滤处理data2
        pre = 0;
        for (var i = 0; i < data2.length; i++) {
            //先删除不再填充范围内的元素
            if (data2[i][1] < fillStart || data2[i][1] > fillEnd) {
                preData = data2.splice(i, 1);
                i--;
                continue;
            }

            if (space1 == space2) {
                return;
            }

            if (i == 0) {
                data2.push(preData);
            }
            var data = data2[i][1] - data2[0][1];

            tmp = data / space1;
            jg = data % space1;
            if (jg < space2 && i != 0) {
                var j = 0;
                while (tmp - pre != 1) {
                    if (j == 0 && jg != 0) {
                        var line1 = util.CalParam(data2[i - 1], data2[i]);
                        var line2 = util.CalParam([0, data2[i][1] - jg], [width, data2[i][1] - jg]);
                        var jd = util.getIntersectPoint(line1, line2);
                        data2.splice(i, 0, jd.split(","));
                        i++;
                        return;
                    }
                    var line1 = util.CalParam(data2[i - 1], data2[i]);
                    var line2 = util.CalParam([0, (tmp - 1) * space1 + data2[0][1]], [width, (tmp - 1) * space1 + data2[0][1]]);
                    var jd = util.getIntersectPoint(line1, line2);
                    data2.splice(i, 0, jd.split(","));
                    i++;
                    pre++;
                }
                if (jg != 0) {
                    var line1 = util.CalParam(data2[i - 1], data2[i]);
                    var line2 = util.CalParam([0, data2[i][1] - jg], [width, data2[i][1] - jg]);
                    var jd = util.getIntersectPoint(line1, line2);
                    data2.splice(i, 0, jd.split(","));
                    i++;
                }
                pre = tmp;
            }
        };

    }

    //得到项一和项二的交点

    function getJD(data1, data2) {
        //项1基线和项2曲线间填充
        //求交点
        //采样间隔px
        var arr = [];
        var preflag = 0,
            jdflag = 0,
            curFlag = 0,
            position = "none";
        for (var i = 0; i < data2.length; i++) {
            jdflag = 0;
            curFlag = data1[i][0] - data2[i][0];
            var line1, line2;
            if (curFlag == 0) {
                //记录连续交点中最后一个交点
                if (i > 0 && preflag == 0) {
                    arr.pop();
                }
                arr.push(i, position, data1[i]);
            }

            if (curFlag > 0 && preflag < 0) {
                position = "left";
                jdflag = 1;
            }
            if (curFlag < 0 && preflag > 0) {
                position = "right";
                jdflag = 1;
            }
            if (jdflag == 1) {
                line1 = util.CalParam(data1[i - 1], data1[i]);
                line2 = util.CalParam(data2[i - 1], data2[i]);
                var jd = util.getIntersectPoint(line1, line2);
                arr.push([i, position, jd]);

            }
            preflag = curFlag;
        }
        return arr;
    }
    //根据交点来绘制路径 并填充

    function drawFillPart(canvas, data1, data2, fillPostion) {

        var currentPostion = "";
        var arr = [];
        //两边填充不需要求交点
        if (fillPostion != "both") {
            arr = getJD(data1, data2);
        }
        var k = 0;
        with(canvas.getContext("2d")) {
            beginPath();
            for (var i = 0; i < data1.length; i++) {

                if (i == 0) {
                    moveTo(data1[i][0], data1[i][1]);
                    continue;
                }
                //到达交点时往回画line2 并闭合路径进行填充
                if (k < arr.length && i == arr[k][0]) {

                    var jd = arr[k][2].split(',');
                    currentPostion = arr[k][1];
                    if (!(currentPostion == fillPostion) && fillPostion != "both") {
                        k++;
                        currentPostion = currentPostion == "left" ? "right" : "left";
                        beginPath();
                        moveTo(jd[0], jd[1]);
                        lineTo(data1[i][0], data1[i][1]);
                        continue;
                    }

                    for (var j = i - 1; j >= 0; j--) {
                        if (j == i - 1) {
                            lineTo(jd[0], jd[1]);
                        }
                        if (k > 0 && j < arr[k - 1][0]) {
                            var jdPre = arr[k - 1][2].split(',');
                            lineTo(jdPre[0], jdPre[1]);
                            break;
                        }
                        lineTo(data2[j][0], data2[j][1]);
                    };
                    k++;
                    currentPostion = currentPostion == "left" ? "right" : "left";
                    closePath();
                    lineWidth = 0;
                    fill();
                    //回到交点
                    beginPath();
                    moveTo(jd[0], jd[1]);
                }
                lineTo(data1[i][0], data1[i][1]);


                //处理画到最后一片区域(最后一个交点道最后一个点)的处理

                if (i == data1.length - 1) {
                    if (currentPostion == "") {
                        currentPostion = data1[0][0] - data2[0][0] > 0 ? "right" : "left";
                    }
                    if (!(currentPostion == fillPostion) && fillPostion != "both") {
                        break;
                    }
                    lineTo(data2[i][0], data2[i][1]);

                    for (var j = i - 1; j >= 0; j--) {

                        if (arr.length > 0 && j == arr[k - 1][0]) {
                            var jdPre = arr[k - 1][2].split(',');
                            lineTo(jdPre[0], jdPre[1]);
                            break;
                        }
                        lineTo(data2[j][0], data2[j][1]);
                    };
                    closePath();
                    fill();
                }
            }
        }
    }

});