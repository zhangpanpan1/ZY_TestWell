/************************************************************************************
 * 说明：NealLee扩展帮助工具类
 * 参数：
 *
 ************************************************************************************/

define(function(require, exports, module) {

    var Util = {};

    module.exports = Util;

    //静态方法--画曲线
    //获取屏幕DPI
    // 常用的1024x768或800x600等标准的分辨率计算出来的dpi是一个常数：96，因此计算出来的毫米与像素的关系也约等于一个常数： 
    // 基本上 1毫米 约等于 3.78像素 
    Util.getScreeDPI = function(id) {
        var arrDPI = new Array();
        if (window.screen.deviceXDPI != undefined) {
            //IE专有方法
            arrDPI[0] = window.screen.deviceXDPI;
            arrDPI[1] = window.screen.deviceYDPI;
        } else {
            var tmpNode = document.createElement("DIV");
            tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
            document.body.appendChild(tmpNode);
            arrDPI[0] = parseInt(tmpNode.offsetWidth);
            arrDPI[1] = parseInt(tmpNode.offsetHeight);
            tmpNode.parentNode.removeChild(tmpNode);
        }
        return arrDPI;
    };

    //获取每一小格对应的px

    Util.getCellPx = function(depthScale) {

        var DPI = this.getScreeDPI();
        //var x = Math.ceil(depthScale * 1000 * DPI[0] * 10 / 254);只需要算垂直方向的
        return Math.ceil(depthScale * 1000 * DPI[1] * 10 / 254);
        //return {cell_x: x, cell_y: y }; 
    }

    Util.extend = function(destination, source) {
        for (var property in source) {
            destination[property] = source[property];
        }
        return destination;
    }

    Util.initCanvas = function(width, height) {
        // var canvas = null;
        // var canvasHeight = (control.endDepth - control.startDepth) * util.getCellPx(control.depthScale);
        // if (!control.canvas) {
        //     var canvasid = Math.ceil(Math.random() * 100);
        //     if ($.browser.msie) {
        //         canvas = document.createElement("<canvas height=" + canvasHeight + " width=" + control.ruler.length + " id='" + canvasid + "' ></canvas>");
        //     } else {
        //         canvas = document.createElement("canvas");
        //         canvas.id = canvasid;
        //     }
        //     canvas.id = canvasid;
        //     control.canvas = canvas;
        // }
        // control.canvas.height = canvasHeight;
        // control.canvas.width = control.width;
    }

    Util.HashMap = function() {
        /** Map 大小 **/
        var size = 0;
        /** 对象 **/
        var entry = new Object();

        /** 存 **/
        this.add = function(key, value) {
            if (!this.containsKey(key)) {
                size++;
            }
            entry[key] = value;
        }

        /** 取 **/
        this.get = function(key) {
            if (this.containsKey(key)) {
                return entry[key];
            } else {
                return null;
            }
        }

        /** 删除 **/
        this.remove = function(key) {
            if (delete entry[key]) {
                size--;
            }
        }

        /** 是否包含 Key **/
        this.containsKey = function(key) {
            return (key in entry);
        }

        /** 是否包含 Value **/
        this.containsValue = function(value) {
            for (var prop in entry) {
                if (entry[prop] == value) {
                    return true;
                }
            }
            return false;
        }

        /** 所有 Value **/
        this.values = function() {
            var values = new Array();
            for (var prop in entry) {
                values.push(entry[prop]);
            }
            return values;
        }

        /** 所有 Key **/
        this.keys = function() {
            var keys = new Array();
            for (var prop in entry) {
                keys.push(prop);
            }
            return keys;
        }

        /** Map Size **/
        this.size = function() {
            return size;
        }
    }

    /**
     * 获取鼠标在页面上的位置
     * @param ev        触发的事件
     * @return          x:鼠标在页面上的横向位置, y:鼠标在页面上的纵向位置
     */
    Util.getMousePoint = function(ev) {
        var point = {
            x: 0,
            y: 0
        };

        if (typeof window.pageYOffset != 'undefined') {
            point.x = window.pageXOffset;
            point.y = window.pageYOffset;
        } else if (typeof document.compatMode != 'undefined' && document.compatMode != 'BackCompat') {
            point.x = document.documentElement.scrollLeft;
            point.y = document.documentElement.scrollTop;
        } else if (typeof document.body != 'undefined') {
            point.x = document.body.scrollLeft;
            point.y = document.body.scrollTop;
        }

        point.x += ev.clientX;
        point.y += ev.clientY;

        return point;
    }
    /**
     * 添加事件
     * @param node      监听对象
     * @param type      监听类型
     * @param listener  触发事件
     * @return          事件是否添加成功
     */
    Util.addEvent = function(node, type, listener) {
        if (node.addEventListener) {
            node.addEventListener(type, listener, false);
            return true;
        } else if (node.attachEvent) {
            node['e' + type + listener] = listener;
            node[type + listener] = function() {
                node['e' + type + listener](window.event);
            };
            node.attachEvent('on' + type, node[type + listener]);
            return true;
        }
        return false;
    }

    Util.mouseTip = function(container, cell_x, cell_y, startDepth) {
        var viewport = document.createElement("div");
        viewport.id = "viewport";
        viewport.style.position = "absolute";
        document.body.appendChild(viewport);

        Util.addEvent(container, 'mousemove', function(ev) {
            var cursorPos = Util.getMousePoint(ev);
            viewport.style.display = "block";
            viewport.style.left = cursorPos.x + 20 + 'px';
            viewport.style.top = cursorPos.y + 10 + 'px';
            viewport.innerHTML =
                (cursorPos.x - container.parentElement.offsetLeft) + "px ," + (cursorPos.y - container.parentElement.offsetTop) + "px<br/>" + Math.round((cursorPos.x - container.parentElement.offsetLeft) * cell_x * 100) / 100 + " , " + Math.round(((cursorPos.y - container.parentElement.offsetTop) * cell_y + startDepth) * 100) / 100 + "m";

        });

        Util.addEvent(container, 'mouseout', function(ev) {
            viewport.style.display = "none";
        });
    }

    /**
     * 计算两点的直线方程的参数a,b,c
     * @param p1
     * @param p2
     * @return
     */
    Util.CalParam = function(p1, p2) {
        var a, b, c;
        var x1 = p1[0],
            y1 = p1[1],
            x2 = p2[0],
            y2 = p2[1];
        a = y2 - y1;
        b = x1 - x2;
        c = (x2 - x1) * y1 - (y2 - y1) * x1;
        if (b < 0) {
            a *= -1;
            b *= -1;
            c *= -1;
        } else if (b == 0 && a < 0) {
            a *= -1;
            c *= -1;
        }
        var param = {
            a: a,
            b: b,
            c: c
        };
        return param;
    }

    /**
     * 计算两条直线的交点
     * @param pm1
     * @param pm2
     * @return
     */
    Util.getIntersectPoint = function(pm1, pm2) {
        return getIntersectPoint(pm1.a, pm1.b, pm1.c, pm2.a, pm2.b, pm2.c);
    }

    function getIntersectPoint(a1, b1, c1, a2, b2, c2) {
        var p = null;
        var m = a1 * b2 - a2 * b1;
        if (m == 0) {
            return null;
        }
        var x = (c2 * b1 - c1 * b2) / m;
        var y = (c1 * a2 - c2 * a1) / m;
        return x + "," + y;
    }

    /**
     * 功能：图片加载器
     */
    Util.loadImages = function(sources, callback) {
        var images = new Image();
        images.onload = function() {
            callback(images);
        };
        images.src = sources;
    }

    //为黑白图片添加前景色和背景色  当canvas的域和img的域不同时会报错
    //直接打开html文件就会报错，需放到服务器里
    Util.setImgBgAndForColor = function(img, backGroundColor, beforColor) {
        backGroundColor = parseHexColor(backGroundColor);
        beforColor = parseHexColor(beforColor);
        var bgRed = backGroundColor.substring(backGroundColor.indexOf("(") + 1, backGroundColor.indexOf(","));
        var bgGreen = backGroundColor.substring(backGroundColor.indexOf(",") + 1, backGroundColor.lastIndexOf(","));
        var bgBlue = backGroundColor.substring(backGroundColor.lastIndexOf(",") + 1, backGroundColor.indexOf(")"));

        var beforRed = beforColor.substring(beforColor.indexOf("(") + 1, beforColor.indexOf(","));
        var beforGreen = beforColor.substring(beforColor.indexOf(",") + 1, beforColor.lastIndexOf(","));
        var beforBlue = beforColor.substring(beforColor.lastIndexOf(",") + 1, beforColor.indexOf(")"));
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0);
        var myData = context.getImageData(0, 0, img.width, img.height);
        for (var i = 0; i < myData.height; i++) {
            for (var j = 0; j < myData.width; j++) {
                offset = j * 4 + i * 4 * myData.width;
                if (myData.data[offset] == 0 && myData.data[offset + 1] == 0 && myData.data[offset + 2] == 0) {
                    myData.data[offset] = beforRed;
                    myData.data[offset + 1] = beforGreen;
                    myData.data[offset + 2] = beforBlue;
                }
                if (myData.data[offset] == 255 && myData.data[offset + 1] == 255 && myData.data[offset + 2] == 255) {
                    myData.data[offset] = bgRed;
                    myData.data[offset + 1] = bgGreen;
                    myData.data[offset + 2] = bgBlue;
                }
            }
        }
        context.putImageData(myData, 0, 0);
        /*  var image = new Image(); 
            image.src = canvas.toDataURL("image/bmp");
            return image; */
        return canvas;
    }

    function parseHexColor(hexColor) {
        if(hexColor.indexOf("#") == 0){
           return "rgb("+parseInt(hexColor.slice(1, 3), 16) + ","
           + parseInt(hexColor.slice(3, 5), 16) + ","+parseInt(hexColor.slice(5, 7), 16) +")";
        }else if(hexColor.indexOf("rgb") == 0){
            return hexColor;
        }else{
            alert("填充颜色值填写不正确，请用16进制或者rgb格式");
        }
        
    }

    Util.getMaxGcd = function(num1, num2){
        var max = Math.max(num1,num2);
        var min = Math.min(num1,num2);
        var residue = max % min;
        
        if(residue != 0){
            return getMaxGcd (min, residue);
        }else{
            return min;
        }
    }

});