###JS_Canvas_GesturesUnlock 手势解锁 v1.0
=======================================
###利用HTML5的Canvas开发的类似于支付宝钱包的手势解锁功能
-----------------------------------------------------
    作者：Anlity
    使用说明：
    var gesturesUnlock = new GesturesUnlock(); // 声明一个手势解锁对象
    gesturesUnlock.arcDidColor = 'blue'; // 设置系统参数，不设置的话，使用默认配置
    //可设置的系统参数：
    (radius,arcColor,arcDidColor,arcLineWidth,touchColor,touchLineWidth)
    gesturesUnlock.init(func); // 初始化系统函数
    var func = function () {
        ... // 声明回调函数，在回调函数中写您的逻辑
    }; 
