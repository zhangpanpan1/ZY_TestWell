define(function(require, exports, module) {
    //引入依赖
    var $ = require('jquery');
    require('jquery.contextMenu');
    require('XY_Dialog');
    var Lane = require('./lane');
    var Curve = require('./curve');
    var Ruler = require('./ruler');
    var Grid = require('./grid');
    var Fill = require('./fill');
    var FillHead = require('./fillHead');
    var Deep = require('./deep');
    var DeepHead = require('./DeepHead');
    var data = require('./data');

    /************************开始业务逻辑*****************************************/
    //定义整个大画布DIV
    var canvasDiv = document.getElementById('canvasDiv');
    /************************绘制第一个道*************************/
    //新建标尺控件ruler11
    var ruler11 = new Ruler();
    ruler11.color = "blue";
    ruler11.name = "孔隙度(POR)";
    ruler11.unit = "%";

    //新建标尺控件ruler12
    var ruler12 = new Ruler();
    ruler12.name = "自然伽马(GR)"
    ruler12.color = "red";
    ruler12.start = 100;
    ruler12.end = 1;

    //新建网格控件grid1
    var grid1 = new Grid();
    grid1.startDepth = 2050;
    grid1.endDepth = 2063;

    //根据标尺控件ruler11新建曲线控件curve1
    var curve11 = new Curve(ruler11);
    curve11.data = data.cureTestData2;

    //根据标尺控件ruler12新建曲线控件curve2
    var curve12 = new Curve(ruler12);
    curve12.data = data.cureTestData;
    curve12.isLg = true;
    //新建道容器控件
    var lane1 = new Lane(canvasDiv, {
        name: '道一', //名称
        width: 150, // 道的宽度
        depthRange: {
            start: 2050,
            end: 2063
        }, // 深度范围
        depthScale: 1 / 110, // 道的深度比例
        laneHeadHeight: 150 // 道头的高度
    });
    //向道的头部添加控件：如标尺控件
    lane1.headControls.add(ruler11.id,ruler11);
    lane1.headControls.add(ruler12.id,ruler12);
    //向道的body部分添加控件：如网格 曲线 填充等控件
    lane1.bodyControls.add(grid1.id,grid1);
    lane1.bodyControls.add(curve11.id,curve11);
    lane1.bodyControls.add(curve12.id,curve12);
    //绘制整个道
    lane1.draw();

    /************************绘制第二个道：添加填充(两曲线两边填充)*************************/
    //新建标尺控件ruler11
    var ruler21 = new Ruler();
    ruler21.color = "blue";
    ruler21.name = "孔隙度(POR)";
    ruler21.unit = "%";

    //新建标尺控件ruler12
    var ruler22 = new Ruler();
    ruler22.name = "自然伽马(GR)"
    ruler22.color = "red";
    ruler22.start = 100;
    ruler22.end = 1;

    //新建网格控件grid1
    var grid2 = new Grid();

    //根据标尺控件ruler21新建曲线控件curve1
    var curve21 = new Curve(ruler21);
    curve21.data = data.cureTestData2;

    //根据标尺控件ruler22新建曲线控件curve2
    var curve22 = new Curve(ruler22);
    curve22.data = data.cureTestData;
    curve22.isLg = true;

    //新建填充头控件
    var fillhead21 = new FillHead();
    fillhead21.name = "两边填充";
    fillhead21.fillStyle.imgSrc = "./image/fill_img/lith2.bmp";
    fillhead21.fillStyle.backgroundColor = "rgb(0,147,0)";

    //新建填充对象
    var fill21 = new Fill(fillhead21);
    //是否基于直线填充
    fill21.item1.isBaseLine = false;
    fill21.item2.isBaseLine = false;
    //项一、二的曲线
    fill21.item1.curve = curve21;
    fill21.item2.curve = curve22;

    var lane2 = new Lane(canvasDiv, {
        name: '道二', //名称
        width: 150, // 道的宽度
        depthRange: {
            start: 2050,
            end: 2063
        }, // 深度范围
        depthScale: 1 / 110, // 道的深度比例
        laneHeadHeight: 150 // 道头的高度
    });
    lane2.headControls.add(ruler21.id,ruler21);
    lane2.headControls.add(ruler22.id,ruler22);
    lane2.headControls.add(fillhead21.id,fillhead21);
    lane2.bodyControls.add(grid2.id,grid2);
    lane2.bodyControls.add(curve21.id,curve21);
    lane2.bodyControls.add(curve22.id,curve22);
    lane2.bodyControls.add(fill21.id,fill21);
    lane2.draw();

    /************************绘制第三个道(两曲线左边边填充)*************************/
    //新建标尺控件ruler11
    var ruler31 = new Ruler();
    ruler31.color = "blue";
    ruler31.name = "孔隙度(POR)";
    ruler31.unit = "%";

    //新建标尺控件ruler12
    var ruler32 = new Ruler();
    ruler32.name = "自然伽马(GR)"
    ruler32.color = "red";
    ruler32.start = 100;
    ruler32.end = 1;

    //新建网格控件grid1
    var grid3 = new Grid();

    //根据标尺控件ruler31新建曲线控件curve1
    var curve31 = new Curve(ruler31);
    curve31.data = data.cureTestData2;

    //根据标尺控件ruler32新建曲线控件curve2
    var curve32 = new Curve(ruler32);
    curve32.data = data.cureTestData;
    curve32.isLg = true;

    //新建填充头控件
    var fillhead31 = new FillHead();
    fillhead31.name = "右填充";
    fillhead31.fillStyle.imgSrc = "./image/fill_img/lith5.bmp";
    fillhead31.fillStyle.backgroundColor = "rgb(0,147,0)";
    //设置填充位置：right、left、both 默认：both
    fillhead31.fillPostion = "right";

    //新建填充对象
    var fill31 = new Fill(fillhead31);
    //是否基于直线填充
    fill31.item1.isBaseLine = false;
    fill31.item2.isBaseLine = false;
    //项一、二的曲线
    fill31.item1.curve = curve31;
    fill31.item2.curve = curve32;

    var lane3 = new Lane(canvasDiv, {
        name: '道三', //名称
        width: 150, // 道的宽度
        depthRange: {
            start: 2050,
            end: 2063
        }, // 深度范围
        depthScale: 1 / 110, // 道的深度比例
        laneHeadHeight: 150 // 道头的高度
    });
    lane3.headControls.add(ruler31.id,ruler31);
    lane3.headControls.add(ruler32.id,ruler32);
    lane3.headControls.add(fillhead31.id,fillhead31);
    lane3.bodyControls.add(grid3.id,grid3);
    lane3.bodyControls.add(curve31.id,curve31);
    lane3.bodyControls.add(curve32.id,curve32);
    lane3.bodyControls.add(fill31.id,fill31);
    lane3.draw();

    /************************绘制第四个道(项1直线 项二曲线填充)*************************/
    //新建标尺控件ruler11
    var ruler41 = new Ruler();
    ruler41.color = "blue";
    ruler41.name = "孔隙度(POR)";
    ruler41.unit = "%";

    //新建标尺控件ruler12
    var ruler42 = new Ruler();
    ruler42.name = "自然伽马(GR)"
    ruler42.color = "red";
    ruler42.start = 100;
    ruler42.end = 1;

    //新建网格控件grid1
    var grid4 = new Grid();

    //根据标尺控件ruler41新建曲线控件curve1
    var curve41 = new Curve(ruler41);
    curve41.data = data.cureTestData2;

    //根据标尺控件ruler42新建曲线控件curve2
    var curve42 = new Curve(ruler42);
    curve42.data = data.cureTestData;
    curve42.isLg = true;

    //新建填充头控件
    var fillhead41 = new FillHead();
    fillhead41.name = "直线跟曲线";
    fillhead41.fillStyle.imgSrc = "./image/fill_img/lith7.bmp";
    fillhead41.fillStyle.backgroundColor = "#ffcc00";
    //设置填充位置：right、left、both 默认：both
    fillhead41.fillPostion = "both";

    //新建填充对象
    var fill41 = new Fill(fillhead41);
    //是否基于直线填充
    fill41.item1.isBaseLine = true;
    fill41.item2.isBaseLine = false;
    //项一、二的曲线
    fill41.item1.line = 50;
    fill41.item1.rulerStart = 0;
    fill41.item1.rulerEnd = 100;
    fill41.item2.curve = curve42;

    var lane4 = new Lane(canvasDiv, {
        name: '道四', //名称
        width: 150, // 道的宽度
        depthRange: {
            start: 2050,
            end: 2063
        }, // 深度范围
        depthScale: 1 / 110, // 道的深度比例
        laneHeadHeight: 150 // 道头的高度
    });
    lane4.headControls.add(ruler41.id,ruler41);
    lane4.headControls.add(ruler42.id,ruler42);
    lane4.headControls.add(fillhead41.id,fillhead41);
    lane4.bodyControls.add(grid4.id,grid4);
    lane4.bodyControls.add(curve41.id,curve41);
    lane4.bodyControls.add(curve42.id,curve42);
    lane4.bodyControls.add(fill41.id,fill41);
    lane4.draw();


    /************************绘制深度道*************************/
    var deep = new Deep();
    deep.startDepth = 2050;
    deep.endDepth = 2063;
    deep.depthScale = 1/110;
    deep.interval = 1;
    var deephead = new DeepHead();
    var lane6 = new Lane(canvasDiv, {
        name: '深度', //名称
        width: 35, // 道的宽度
        depthRange: {
            start: 2050,
            end: 2063
        }, // 深度范围
        depthScale: 1 / 110, // 道的深度比例
        laneHeadHeight: 150 // 道头的高度
    });
    lane6.headControls.add(deephead.id,deephead);
    lane6.bodyControls.add(deep.id,deep);
    lane6.draw();

    

    /************************绘制第五个道(项1 、2直线填充)*************************/
    //新建标尺控件ruler11
    var ruler51 = new Ruler();
    ruler51.color = "blue";
    ruler51.name = "孔隙度(POR)";
    ruler51.unit = "%";

    //新建标尺控件ruler12
    var ruler52 = new Ruler();
    ruler52.name = "自然伽马(GR)"
    ruler52.color = "red";
    ruler52.start = 100;
    ruler52.end = 1;

    //新建网格控件grid1
    var grid5 = new Grid();

    //根据标尺控件ruler51新建曲线控件curve1
    var curve51 = new Curve(ruler51);
    curve51.data = data.cureTestData2;

    //根据标尺控件ruler52新建曲线控件curve2
    var curve52 = new Curve(ruler52);
    curve52.data = data.cureTestData;
    curve52.isLg = true;

    //新建填充头控件
    var fillhead51 = new FillHead();
    fillhead51.name = "两直线填充";
    fillhead51.fillStyle.imgSrc = "./image/fill_img/lith15.bmp";
    fillhead51.fillStyle.backgroundColor = "rgb(0,147,0)";
    //设置填充位置：right、left、both 默认：both
    fillhead51.fillPostion = "both";

    //新建填充对象
    var fill51 = new Fill(fillhead51);
    //是否基于直线填充
    fill51.item1.isBaseLine = true;
    fill51.item2.isBaseLine = true;
    //项一、二的直线
    fill51.item1.line = 30;
    fill51.item1.rulerStart = 0;
    fill51.item1.rulerEnd = 100;

    fill51.item2.line = 40;
    fill51.item2.rulerStart = 100;
    fill51.item2.rulerEnd = 0;

    var lane5 = new Lane(canvasDiv, {
        name: '道五', //名称
        width: 150, // 道的宽度
        depthRange: {
            start: 2050,
            end: 2063
        }, // 深度范围
        depthScale: 1 / 110, // 道的深度比例
        laneHeadHeight: 150 // 道头的高度
    });
    lane5.headControls.add(ruler51.id,ruler51);
    lane5.headControls.add(ruler52.id,ruler52);
    lane5.headControls.add(fillhead51.id,fillhead51);
    lane5.bodyControls.add(grid5.id,grid5);
    lane5.bodyControls.add(curve51.id,curve51);
    lane5.bodyControls.add(curve52.id,curve52);
    lane5.bodyControls.add(fill51.id,fill51);
    lane5.draw();

    
    

});