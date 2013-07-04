/************************************************************************************
 * 说明：道容器对象 -- 采用 compsite 设计模式
 * 以下划线开头的表示私有
 * 使用示例：
 * var lane = new Lane("canvas",{startPositon:{0,0},name:"道一",width:150,height:500});
 *
 *
 *
 ************************************************************************************/
define(function(require, exports, module) {
    //引入所需要的js
    //var $ = require('jquery');
    var $ = require('jquery');
    var data = require('./data');
    require('jquery.contextMenu');
    require('XY_Dialog');
    require('colorpicker');
    var util = require('./util');
    var Fill = require('./fill');
    var FillHead = require('./fillHead');
    var Grid = require('./grid');
    var Deep = require('./deep');
    var DeepHead = require('./deepHead');

    //全局变量，而又没有对外暴露(所以私有)，且可以不根据对象实例变化(所以静态)，故可作为静态私有变量
    var laneid = 1;
    var laneArr = [];
    var laneHeadHeight = 150;

    var globalDeep = {
        isglobal : true,
        startDepth : 2050,
        endDepth : 2063,
        depthScale : 1/110
    }
    //定义泳道对象

    function Lane(containerDiv, options) {

        //将默认值和传过来的值合并
        var _options = util.extend(this.defaults, options);
        //申明属性并初始化
        //起始点--可以删除了
        this.startPosition = _options.startPosition;
        //模拟静态公有变量
        // Lane.counter = Lane.counter || 0;
        // Lane.counter++;
        //lane的id唯一标识
        this.id = "lane" + laneid++;
        //道名
        this.name = _options.name;
        //宽和高
        this.width = _options.width;
        //this.height = 0;
        //边框颜色
        this.borderColor = _options.borderColor;
        this.borderWidth = _options.borderWidth;
        this.laneTitleHeight = 28;
        this.bodyheight = 0;
        //道头高度
        //this.laneHeadHeight = _options.laneHeadHeight;
        //起始和结束深度
        this.startDepth = _options.depthRange.start;
        this.endDepth = _options.depthRange.end;
        //深度比例//道的高度--高度为根据depthScale动态算出来的
        //this.depthScale = 0;
        this.depthScale = _options.depthScale;
        //水平等分
        this.hirizDF = _options.hirizDF;
        //compsite模式，树枝对象
        this.headControls = new util.HashMap();
        this.bodyControls = new util.HashMap();

        this.container = containerDiv;

        laneArr.push(this);
    }

    //对外暴露接口
    module.exports = Lane;

    //Lane.prototype.id = 0 || ;

    //画道
    Lane.prototype.draw = function() {

        this.init();
        this.drawLane();


        //画道的头部控件
        var controls = this.headControls.values();
        for (var i = 0; i < controls.length; i++) {
            controls[i].width = this.width;
            controls[i].draw();
            this.lanehead.appendChild(controls[i].canvas);
        };

        //设置道head的高度，自动设置为其中最高的一个
        this.setHeadHeight();

        //画道的body控件
        controls = this.bodyControls.values();
        for (var i = 0; i < controls.length; i++) {
            //将容器内的控件的宽和高自适应容器
            controls[i].width = this.width;
            if (controls[i].depthScale) {
                controls[i].depthScale = this.depthScale;
                controls[i].startDepth = this.startDepth;
                controls[i].endDepth = this.endDepth;
            } else {
                controls[i].height = this.bodyheight;
            }

            var canvas = controls[i].canvas;
            controls[i].draw();
            this.lanebody.appendChild(canvas);
        };
        this.initEvent();
    }

    //重绘---先采用暴力添加事件
    Lane.prototype.reDraw = function() {

        this.drawLane();
        //重绘道的body控件
        //this.lanebody.innerHTML = "";
        var controls = this.bodyControls.values();
        for (var i = 0; i < controls.length; i++) {
            controls[i].width = this.width;
            if (controls[i].depthScale) {
                controls[i].startDepth = this.startDepth;
                controls[i].endDepth = this.endDepth;
                controls[i].depthScale = this.depthScale;
            } else {
                controls[i].height = this.bodyheight;
            }
            controls[i].draw();
            //this.lanebody.appendChild(control.canvas); -- 不用清空，直接修改对象后重绘即可
        };
    }

    //画道
    Lane.prototype.drawLane = function() {

        var canvasHeight = util.getCellPx(this.depthScale) * (this.endDepth - this.startDepth);
        
        var lanediv = null;
        if (!this.lanetitle) {
            lanediv = document.createElement("div");
            lanediv.id = this.id;
            lanediv.className = "lane";
            // lanediv.style.height = canvasHeight + "px";
            lanediv.style.border = "1px solid " + this.borderColor;
            this.laneDiv = lanediv;
            this.container.appendChild(lanediv);
        }
        this.laneDiv.style.width = this.width + "px";
        //画标题
        //var height = util.getCellPx(this.depthScale) * (this.endDepth - this.startDepth) + this.laneHeadHeight;
        var divTitle = null;
        if (!this.lanetitle) {
            divTitle = document.createElement("div");
            divTitle.className = "lanetitle";
            //innerText firefox不兼容
            this.laneDiv.appendChild(divTitle);
            this.lanetitle = divTitle;
            divTitle.onclick = function() {
                $(".lanetitle").css("backgroundColor","#FFF684");
                divTitle.style.backgroundColor = "#FE9200";
            }
        }
        this.lanetitle.innerHTML = this.name;
        this.lanetitle.style.height = this.laneTitleHeight + "px";


        //画head区
        var divHead = null;
        if (!this.lanehead) {
            divHead = document.createElement("div");
            divHead.className = "lanehead";
            divHead.style.height = laneHeadHeight + "px";
            this.laneDiv.appendChild(divHead);
            this.lanehead = divHead;
        }



        //画body区
        var divBody = null;
        if (!this.lanebody) {
            divBody = document.createElement("div");
            divBody.className = "lanebody";
            this.laneDiv.appendChild(divBody);
            this.lanebody = divBody;
        }
        this.bodyheight = canvasHeight;
        this.lanebody.style.height = this.bodyheight + "px";
    }


    Lane.prototype.init = function() {
        //canvasDiv -- IE兼容的做法，好像对于input 
        //IE6 , IE7 动态生成 input 元素法为其设置 name 属性
        // input 元素，为了兼容 IE，type 属性写在显示元素（insertBefore 或 appendChild）之前，其它属性写在其后
        //canvasDiv.innerHTML = "<canvas height=200 width=300 style='border:1px solid red;' ></canvas>";


    }

    //泳道默认的一些参数
    Lane.prototype.defaults = { // plugin defaults
        startPosition: { //将起始点的像素偏移0.5个像素以便画细线(canvas默认像素在两个像素点的中间)
            x: 0.5,
            y: 0.5
        },
        name: '', //名称
        width: 150, // 道的宽度
        //height: 500, // 道的高度--高度为根据depthScale动态算出来的
        borderColor: 'black', // 道的默认边框颜色
        borderWidth: 1,
        depthRange: {
            start: 1,
            end: 100
        }, // 深度范围
        depthScale: 1 / 200, // 道的深度比例
        laneTitleHeight: 28, // 道头的高度
        //水平等分
        hirizDF: 15
    };

    Lane.prototype.setHeadHeight = function() {
        //得到高度最大值
        var maxHeight = 0;
        for (var i = 0; i < laneArr.length; i++) {
            if (laneArr[i].headControls.size() > maxHeight) {
                maxHeight = laneArr[i].headControls.size();
            }
        };
        //重新设置头部所有控件的位置
        controls = this.headControls.values();
        for (var i = 0; i < controls.length; i++) {
            controls[i].canvas.style.bottom = i * 36 + 2 + "px";
        };

        laneHeadHeight = maxHeight * 36 + 10;
        $(".lanehead").height(laneHeadHeight);
    }
    //Lane对象的事件
    //道及道相关的事件事件
    Lane.prototype.initEvent = function() {
        var lane = this;
        //右键lane菜单事件
        var laneItem = "";
        if (lane.bodyControls.size() == 1 && lane.bodyControls.values()[0].id.indexOf("deep") != -1) {
            laneItem = data.deepContext;
        } else {
            laneItem = data.laneContext;
        }
        //右键菜单
        $.contextMenu({
            selector: '#' + this.laneDiv.id,
            zIndex: 100,
            callback: function(key, options) {
                if (key == "laneProperty") {
                    //深度道特殊属性
                    laneProperty();
                    window.console && console.log("道属性");
                }
                if (key == "docProperty") {
                    //深度道特殊属性
                    docProperty();
                    window.console && console.log("深度属性");
                }
                if (key == "deepProperty") {
                    //深度道特殊属性
                    deepProperty();
                    window.console && console.log("深度属性");
                }
                if (key == "addFill") {
                    var fillHead = new FillHead();
                    fillHead.name = "";
                    fillHead.draw();
                    lane.lanehead.appendChild(fillHead.canvas);
                    lane.headControls.add(fillHead.id, fillHead);
                    lane.setHeadHeight();
                    lane.initEvent();
                }
                if (key == "delete") {
                    lane.container.removeChild(document.getElementById(lane.id));
                    lane = null;
                }
                //新增道
                if (key == "addleftlane" || key == "addrightlane") {
                    var grid = new Grid();
                    grid.startDepth = lane.startDepth;
                    grid.endDepth = lane.endDepth;
                    var lane1 = new Lane(canvasDiv, {
                        name: '', //名称
                        width: 150, // 道的宽度
                        depthRange: {
                            start: lane.startDepth,
                            end: lane.endDepth
                        }, // 深度范围
                        depthScale: lane.depthScale // 道的深度比例
                    });
                    lane1.bodyControls.add(grid.id, grid);
                    lane1.draw();
                    if(key == "addleftlane"){
                        $(lane.laneDiv).before(lane1.laneDiv);
                    }else{
                        $(lane.laneDiv).after(lane1.laneDiv);
                    }
                    
                }
                if (key == "addleftdeep" || key == "addrightdeep") {
                    var deep = new Deep();
                    deep.startDepth = lane.startDepth;
                    deep.endDepth = lane.endDepth;
                    deep.interval = 1;

                    var deephead = new DeepHead();

                    var lane1 = new Lane(canvasDiv, {
                        name: '深度', //名称
                        width: 35, // 道的宽度
                        depthRange: {
                            start: lane.startDepth,
                            end: lane.endDepth
                        }, // 深度范围
                        depthScale: lane.depthScale, // 道的深度比例
                        lane1HeadHeight: 150 // 道头的高度
                    });
                    lane1.headControls.add(deephead.id, deephead);
                    lane1.bodyControls.add(deep.id, deep);
                    lane1.draw();
                    if(key == "addleftdeep"){
                        $(lane.laneDiv).before(lane1.laneDiv);
                    }else{
                        $(lane.laneDiv).after(lane1.laneDiv);
                    }
                    
                }
            },
            items: laneItem
        });
        //道控件的 右键菜单事件
        var headControls = this.headControls.values();
        var curves = new util.HashMap();
        for (var i = 0; i < headControls.length; i++) {
            var control = headControls[i];
            if (control.constructor.name == "Ruler") {
                //将曲线放到数组里，供填充属性绑定曲线使用
                if (control.curve)
                    curves.add(control.curve.id, control.curve);
                $.contextMenu({
                    selector: '#' + control.canvas.id,
                    callback: function(key, options) {
                        var id = options.$trigger.attr("id");
                        var ruler = lane.headControls.get(id);
                        if (key == "property") {
                            curveProperty(ruler);
                            window.console && console.log("标尺属性")
                        }
                        if (key == "delete") {
                            lane.headControls.remove(ruler.id);
                            lane.lanehead.removeChild(ruler.canvas);
                            lane.setHeadHeight();
                            if (ruler.curve != null) {
                                lane.bodyControls.remove(ruler.curve.id);
                                lane.lanebody.removeChild(ruler.curve.canvas);
                            }
                            window.console && console.log("删除")
                        }
                        //window.console && console.log(m) || alert(m); 
                    },
                    items: data.curveContext
                });
            }
            if (control.constructor.name == "FillHead") {
                $.contextMenu({
                    selector: '#' + control.canvas.id,
                    callback: function(key, options) {
                        var id = options.$trigger.attr("id");
                        var fillHead = lane.headControls.get(id);
                        if (key == "property") {
                            fillProperty(fillHead);
                            window.console && console.log("填充属性")
                        }
                        if (key == "delete") {
                            lane.headControls.remove(fillHead.id);
                            lane.lanehead.removeChild(fillHead.canvas);
                            lane.setHeadHeight();
                            if (fillHead.fill != null) {
                                lane.bodyControls.remove(fillHead.fill.id);
                                lane.lanebody.removeChild(fillHead.fill.canvas);
                            }
                            window.console && console.log("删除")
                        }
                        //window.console && console.log(m) || alert(m); 
                    },
                    items: data.fillContext
                });
            }
        };
        //曲线属性窗口
        var curveProperty = function(ruler) {
            Util.Dialog({
                title: "曲线属性",
                fixed: true,
                showbg: true,
                content: "text:" + data.curveProperty,
                ofns: function() {
                    $(".colorPicker-palette").remove();
                    //为曲线添加颜色选择器
                    $('#color').colorPicker();
                    $("#color").val(ruler.color);
                    $("#color").change();
                    //初始化值
                    $("#name").val(ruler.name);
                    $("#rulerStart").val(ruler.start);
                    $("#rulerEnd").val(ruler.end);
                    $("#rulerEnd").val(ruler.end);
                    if (ruler.curve.isLg) {
                        $("#log").attr("checked", "checked");
                    } else {
                        $("#line").attr("checked", "checked");
                    }
                },
                yesBtn: ["确定",
                    function() {
                        ruler.name = $("#name").val();
                        ruler.color = $("#color").val();
                        ruler.start = $("#rulerStart").val();
                        ruler.end = $("#rulerEnd").val();
                        ruler.curve.isLg = $(":checked").val() == "true" ? true : false;
                        ruler.draw();
                        ruler.curve.draw();
                    }
                ],
                noBtn: ["取消",
                    function() {
                        return true;
                    }
                ]
            });
            return false;
        }
        //填充属性窗口
        var fillProperty = function(fillHead) {
            Util.Dialog({
                title: "填充属性",
                fixed: true,
                showbg: true,
                content: "text:" + data.fillProperty,
                ofns: function() {
                    //绑定道里的所有曲线
                    var keys = curves.keys();
                    for (var i = 0; i < keys.length; i++) {
                        $("#item1_curves").append("<option value ='" + keys[i] + "'>" + curves.get(keys[i]).name + "</option>");
                        $("#item2_curves").append("<option value ='" + keys[i] + "'>" + curves.get(keys[i]).name + "</option>");
                        //$("<option value ='"+curves[i][1]+"'>"+curves[i][0]+"</option>").appendTo("#item1_curves").appendTo("#item2_curves");
                    };
                    var foreColor = "#000000",
                        backColor = "#FFFFFF",
                        fillImg = "./image/fill_img/lith2.bmp";
                    //如果是新增
                    if (fillHead.fill != null) {
                        foreColor = fillHead.fillStyle.foreColor;
                        backColor = fillHead.fillStyle.backgroundColor;
                        fillImg = fillHead.fillStyle.imgSrc;
                    }
                    //为曲线添加颜色选择器，并绑定填充样式
                    $(".colorPicker-palette").remove();
                    $('#forecolor').colorPicker({
                        pickerDefault: foreColor
                    });
                    $('#backcolor').colorPicker({
                        pickerDefault: backColor
                    });
                    $('#fillImg').colorPicker({
                        pickerDefault: "url(" + fillImg + ")",
                        colors: data.fillImg
                    });
                    if (fillHead.fill == null) {
                        //绑定新增填充时的默认值
                        $("#item1_curve").attr("checked", "checked");
                        $("#item2_curve").attr("checked", "checked");
                        $("#line1").val(50);
                        $("#line2").val(50);
                        $("#item1_rulerStart").val(1);
                        $("#item1_rulerEnd").val(100);
                        $("#item2_rulerStart").val(1);
                        $("#item2_rulerEnd").val(100);
                        $("#item1_isline").attr("checked", "checked");
                        $("#item2_isline").attr("checked", "checked");
                        $("#both").attr("checked", "checked");
                        $("#name").val("填充项");
                        return;
                    }


                    //绑定是否是直线还是曲线
                    if (fillHead.fill.item1.isBaseLine) {
                        $("#item1_line").attr("checked", "checked");
                        $("#line1").val(fillHead.fill.item1.line);
                        //$("#item1_curve").parent().children().attr("disabled","disabled");
                    } else {
                        $("#item1_curve").attr("checked", "checked");
                        var curveid = fillHead.fill.item1.curve.id;
                        if (curves.containsKey(curveid)) {
                            $("#item1_curves option[value=" + curveid + "]").attr("selected", "selected");
                        } else {
                            $("#item1_curves").append("<option selected value ='" + curveid + "'>" + fillHead.fill.item1.curve.name + "</option>");
                            curves.push(curveid, fillHead.fill.item1.curve);
                        }
                    }
                    if (fillHead.fill.item2.isBaseLine) {
                        $("#item2_line").attr("checked", "checked");
                        $("#line2").val(fillHead.fill.item2.line);
                    } else {
                        $("#item2_curve").attr("checked", "checked");
                        var curveid = fillHead.fill.item2.curve.id;
                        if (curves.containsKey(curveid)) {
                            $("#item2_curves option[value=" + curveid + "]").attr("selected", "selected");
                        } else {
                            $("#item2_curves").append("<option selected value ='" + curveid + "'>" + fillHead.fill.item2.curve.name + "</option>");
                            curves.push(curveid, fillHead.fill.item2.curve);
                        }
                    }

                    //绑定是否是对数
                    if (fillHead.fill.item1.isLg) {
                        $("#item1_islg").attr("checked", "checked");
                    } else {
                        $("#item1_isline").attr("checked", "checked");
                    }
                    if (fillHead.fill.item2.isLg) {
                        $("#item2_islg").attr("checked", "checked");
                    } else {
                        $("#item2_isline").attr("checked", "checked");
                    }

                    $("#item1_rulerStart").val(fillHead.fill.item1.rulerStart);
                    $("#item1_rulerEnd").val(fillHead.fill.item1.rulerEnd);
                    $("#item2_rulerStart").val(fillHead.fill.item2.rulerStart);
                    $("#item2_rulerEnd").val(fillHead.fill.item2.rulerEnd);

                    //绑定填充名称
                    $("#name").val(fillHead.name);
                    //绑定填充位置
                    $("#" + fillHead.fillPostion).attr("checked", "checked");
                    //绑定曲线
                },
                yesBtn: ["确定",
                    function() {
                        if (fillHead.fill == null) {
                            var fill = new Fill(fillHead);
                            fill.height = lane.bodyheight;
                            lane.lanebody.appendChild(fillHead.fill.canvas);
                            lane.bodyControls.add(fillHead.fill.id, fillHead.fill);
                        }

                        fillHead.name = $("#name").val();
                        fillHead.fillStyle.foreColor = $("#forecolor").val();
                        fillHead.fillStyle.backgroundColor = $('#backcolor').val();
                        fillHead.fillStyle.imgSrc = $('#fillImg').val().substring(4, $('#fillImg').val().length - 1);
                        fillHead.fillPostion = $('input[name="position"]:checked').val();

                        fillHead.fill.item1.isBaseLine = $('input[name="item1"]:checked').val() == "true" ? true : false;
                        fillHead.fill.item1.line = $("#line1").val();
                        fillHead.fill.item2.isBaseLine = $('input[name="item2"]:checked').val() == "true" ? true : false;
                        fillHead.fill.item2.line = $("#line2").val();

                        fillHead.fill.item1.curve = curves.get($("#item1_curves option:selected").val());
                        fillHead.fill.item2.curve = curves.get($("#item2_curves option:selected").val());

                        fillHead.fill.item1.rulerStart = $("#item1_rulerStart").val();
                        fillHead.fill.item1.rulerEnd = $("#item1_rulerEnd").val();
                        fillHead.fill.item2.rulerStart = $("#item2_rulerStart").val();
                        fillHead.fill.item2.rulerEnd = $("#item2_rulerEnd").val();

                        fillHead.fill.item1.isLg = $('input[name="item1_log"]:checked').val() == "lg" ? true : false;
                        fillHead.fill.item2.isLg = $('input[name="item2_log"]:checked').val() == "lg" ? true : false;

                        fillHead.draw();
                        fillHead.fill.draw();
                    }
                ],
                noBtn: ["取消",
                    function() {
                        return true;
                    }
                ]
            });
            return false;
        }
        //文档属性窗口
        var docProperty = function() {
            Util.Dialog({
                title: "文档属性",
                fixed: true,
                showbg: true,
                content: "text:" + data.docProperty,
                ofns: function() {
                    if(globalDeep.isglobal){
                        $("#isglobal").attr("checked","checked");
                    }else{
                        $("#isglobal").removeAttr("checked");
                    }
                    $("#startDepth").val(globalDeep.startDepth);
                    $("#endDepth").val(globalDeep.endDepth);
                    $("#depthScale").val(1 / globalDeep.depthScale);

                },
                yesBtn: ["确定",
                    function() {
                        globalDeep.isglobal = $("#isglobal:checked").length > 0 ? true : false;
                        if (globalDeep.isglobal) {
                            globalDeep.isglobal = true;
                            globalDeep.startDepth = parseInt($("#startDepth").val());
                            globalDeep.endDepth = parseInt($("#endDepth").val());
                            globalDeep.depthScale = 1 / $("#depthScale").val();

                            for (var i = 0; i < laneArr.length; i++) {
                                laneArr[i].startDepth = globalDeep.startDepth;
                                laneArr[i].endDepth = globalDeep.endDepth;
                                laneArr[i].depthScale = globalDeep.depthScale;
                                laneArr[i].reDraw();
                            };
                        }
                    }
                ],
                noBtn: ["取消",
                    function() {
                        return true;
                    }
                ]
            });
            return false;
        }
        //道属性窗口
        var laneProperty = function() {
            var grid = lane.bodyControls.get($(lane.lanebody).children(".grid").attr("id"));
            Util.Dialog({
                title: "道属性",
                fixed: true,
                showbg: true,
                content: "text:" + data.laneProperty,
                ofns: function() {
                    $("#laneName").val(lane.name);
                    $("#nameHeight").val(lane.laneTitleHeight);
                    $("#lanewidth").val(lane.width);

                    if(globalDeep.isglobal){
                        $("#startDepth").attr("disabled","disabled");
                        $("#endDepth").attr("disabled","disabled");
                        $("#depthScale").attr("disabled","disabled");
                    }else{
                        $("#startDepth").removeAttr("disabled");
                        $("#endDepth").removeAttr("disabled");
                        $("#depthScale").removeAttr("disabled");
                    }

                    $("#startDepth").val(lane.startDepth);
                    $("#endDepth").val(lane.endDepth);
                    $("#depthScale").val(1 / lane.depthScale);
                    $("#horNum").val(grid.horNum);
                    $("#horBSpace").val(grid.horBSpace);

                    $("#vSpace").val(grid.vSpace);
                    $("#vMSpace").val(grid.vMSpace);
                    $("#vBSpace").val(grid.vBSpace);
                },
                yesBtn: ["确定",
                    function() {


                        lane.name = $("#laneName").val();
                        lane.laneTitleHeight = $("#nameHeight").val();
                        lane.width = $("#lanewidth").val();

                        lane.startDepth = parseInt($("#startDepth").val());
                        lane.endDepth = parseInt($("#endDepth").val());
                        lane.depthScale = 1 / $("#depthScale").val();


                        grid.horNum = $("#horNum").val();
                        grid.horBSpace = $("#horBSpace").val();
                        grid.vSpace = $("#vSpace").val();
                        grid.vMSpace = $("#vMSpace").val();
                        grid.vBSpace = $("#vBSpace").val();

                        lane.reDraw();
                    }
                ],
                noBtn: ["取消",
                    function() {
                        return true;
                    }
                ]
            });
            return false;
        }
        //深度属性窗口
        var deepProperty = function() {
            var deep = lane.bodyControls.values()[0];
            var deepHead = lane.headControls.values()[0];
            Util.Dialog({
                title: "深度属性",
                fixed: true,
                showbg: true,
                content: "text:" + data.deepProperty,
                ofns: function() {

                    $("#name").val(lane.name);
                    $("#interval").val(deep.interval);
                    $("#text").val(deepHead.text.replace("<br>", "\n"));
                    if (deepHead.showDepthScale) {
                        $("#depthScale").attr("checked", "checked");
                    } else {
                        $("#depthScale").removeAttr("checked");
                    }
                },
                yesBtn: ["确定",
                    function() {
                        //repace只能替换第一个
                        deepHead.text = $("#text").val().replace("\n", "<br>");
                        deepHead.showDepthScale = $("input:checked").length > 0 ? true : false;
                        deepHead.draw();

                        deep.interval = $("#interval").val();
                        deep.draw();
                    }
                ],
                noBtn: ["取消",
                    function() {
                        return true;
                    }
                ]
            });
            return false;
        }

    }

});