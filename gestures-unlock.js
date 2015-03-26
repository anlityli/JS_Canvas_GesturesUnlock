/**
 * 手势解锁 v1.0
 * 作者：Anlity
 * 使用说明：
 * var gesturesUnlock = new GesturesUnlock(); // 声明一个手势解锁对象
 * gesturesUnlock.arcDidColor = 'blue'; // 设置系统参数，不设置的话，使用默认配置
 * //可设置的系统参数：
 * (radius,arcColor,arcDidColor,arcLineWidth,touchColor,touchLineWidth)
 * gesturesUnlock.init(func); // 初始化系统函数
 * var func = function () {}; // 声明回调函数，在回调函数中写您的逻辑代码
 */
var GesturesUnlock = function () {
	this.radius = 20; // 圆的半径
	this.arcColor = '#FFF'; // 圆的颜色
	this.arcDidColor = '#FF0000'; // 手指触摸圆的颜色
	this.arcLineWidth = 2; // 圆的粗细
	this.touchColor = '#FF0000'; // 手指触摸的线条颜色
	this.touchLineWidth = 2; // 手指触摸的线条粗细
	this.pwdResult = ''; // 密码结果
	
	// 以下是私有变量
	this._tempPoint = {}; // 临时点
	this._tempImageData = ''; // 临时绘制数据
	this._ninePointArcImageData = ''; // 9个初始点位圆的绘制数据 
	
	// 初始化方法
	this.init = function (callBack) {
		var thisObj = this;
		var canvas = document.getElementById('gesturesUnlock');
		// 获取画布宽高
		var _guaWidth = canvas.width;
		var _guaHeight = canvas.height;
		// 获取画布距离页面顶端和左端的距离
		var _leftSpace = canvas.offsetLeft;
		var _topSpace = canvas.offsetTop;
		
		if (canvas.getContext) {
			// 获取2D引擎
			var ctx = canvas.getContext('2d');
			// 初始化全部变量
			this.pwdResult = '';
			this._tempPoint = {};
			this._tempImageData = '';
			this._ninePointArcImageData = '';
			ctx.clearRect(0, 0, _guaWidth, _guaHeight);
			
			// 9个点的全部坐标
			var pointArr = thisObj.ninePoint();
			
			// 绘制9个点位圆
			thisObj.ninePointArc(ctx);
			// 把这个初始的9个点位圆存入9个点位圆数据
			thisObj._ninePointArcImageData = ctx.getImageData(0, 0, _guaWidth, _guaHeight);
			
			// 判断触摸点是否在点位之内
			canvas.addEventListener('touchstart', function (e) {
				// 取消页面的触摸移动默认动作
				e.preventDefault();
				var touchX = e.targetTouches[0].clientX - _leftSpace;
				var touchY = e.targetTouches[0].clientY - _topSpace;
				for (key in pointArr) {
					if (touchX > (pointArr[key].x - thisObj.radius) && touchX < (pointArr[key].x + thisObj.radius) && touchY > (pointArr[key].y - thisObj.radius) && touchY < (pointArr[key].y + thisObj.radius)) {
						// 如果在点位之内，那么绘制一个覆盖色的圆，再监听手指移动事件
						thisObj.pointArc(ctx, pointArr[key].x, pointArr[key].y, thisObj.radius, thisObj.arcDidColor, thisObj.arcLineWidth);
						// 把密码值加入密码结果
						thisObj.pwdResult = pointArr[key].pwd;
						thisObj._tempPoint = {x:pointArr[key].x, y:pointArr[key].y};
						thisObj.reNewLine(ctx);
					}
				}
				// 监听手指离开事件获取结果
				canvas.addEventListener('touchend', function () {
					if (thisObj.pwdResult) {
						// 执行回调函数
						callBack();
						thisObj.init(callBack);
					}
				});
				
			});
			
			
			
		}
	}

}

/**
 * 九个点的坐标位置
 */
GesturesUnlock.prototype.ninePoint = function () {
	var canvas = document.getElementById('gesturesUnlock');
	// 获取画布宽高
	var _guaWidth = canvas.width;
	var _guaHeight = canvas.height;
	// 获取画布中9个坐标点
	// 9个点的横坐标分别是
	point_1_X = (_guaWidth / 3) / 2;
	point_2_X = (_guaWidth / 3) + point_1_X;
	point_3_X = (_guaWidth / 3) + point_2_X;
	// 9个点的纵坐标分别是
	point_1_Y = (_guaHeight / 3) / 2;
	point_2_Y = (_guaHeight / 3) + point_1_Y;
	point_3_Y = (_guaHeight / 3) + point_2_Y;
	
	// 9个点的全部坐标
	return [
		{x : point_1_X, y : point_1_Y, pwd : '1'},
		{x : point_2_X, y : point_1_Y, pwd : '2'},
		{x : point_3_X, y : point_1_Y, pwd : '3'},
		{x : point_1_X, y : point_2_Y, pwd : '4'},
		{x : point_2_X, y : point_2_Y, pwd : '5'},
		{x : point_3_X, y : point_2_Y, pwd : '6'},
		{x : point_1_X, y : point_3_Y, pwd : '7'},
		{x : point_2_X, y : point_3_Y, pwd : '8'},
		{x : point_3_X, y : point_3_Y, pwd : '9'}
	];
}

/**
 * 画圆方法
 * 参数说明：
 * ctx : 画布引擎
 * x :	圆心坐标X轴
 * y : 圆心坐标Y轴
 * radius : 半径
 * color : 颜色
 * lineWidth : 线宽（如果存在该参数，则画空心圆，否则画实心圆）
 */
GesturesUnlock.prototype.drawArc = function(ctx, x, y, radius, color, lineWidth) {
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, (Math.PI)*2, false);
	if (!lineWidth) {
		ctx.fillStyle = color;
		ctx.fill();
	} else {
		ctx.lineWidth = lineWidth; 
		ctx.strokeStyle = color; 
		ctx.stroke();
	}
}

/**
 * 绘制完整的点位圆 (空心加实心圆)
 * 参数说明：
 * ctx : 画布引擎
 * x :	圆心坐标X轴
 * y : 圆心坐标Y轴
 * radius : 半径
 * color : 颜色
 * lineWidth : 外圆线宽
 */
GesturesUnlock.prototype.pointArc = function (ctx, x, y, radius, color, lineWidth) {
	this.drawArc(ctx, x, y, radius, color, lineWidth);
	this.drawArc(ctx, x, y, radius/3, color);
}

/**
 * 绘制9个点位圆
 * 参数说明：
 * ctx : 画布引擎
 */
GesturesUnlock.prototype.ninePointArc = function (ctx) {
	// 9个点的全部坐标
	var pointArr = this.ninePoint();
	
	// 对九个点画实心圆和空心圆
	for (key in pointArr) {
		// 画大空心圆
		this.pointArc(ctx, pointArr[key].x, pointArr[key].y, this.radius, this.arcColor, this.arcLineWidth);
	}
}

/** 
 * 画线方法
 * 参数说明：
 * ctx:画布引擎
 * x1: 起始坐标x
 * x2: 起始坐标y
 * x2: 终点坐标x
 * y2: 重点坐标y
 * color:线条颜色
 * lineWidth: 线条宽度
 */
GesturesUnlock.prototype.drawLine = function (ctx, x1, y1, x2, y2, color, lineWidth) {
	ctx.beginPath(); // 开始路径绘制
	ctx.moveTo(x1, y1); // 设置路径起点，坐标为(20,20)
	ctx.lineTo(x2, y2); // 绘制一条到(200,20)的直线
	ctx.lineWidth = lineWidth; // 设置线宽
	ctx.strokeStyle = color; // 设置线的颜色
	ctx.stroke();
}

/**
 * 监听手指移动事件如果覆盖到点位坐标，则把起始点重新放在覆盖到的点位坐标上
 * 参数说明：
 * ctx : 画布引擎
 */
GesturesUnlock.prototype.reNewLine = function (ctx) {
	var thisObj = this;
	var canvas = document.getElementById('gesturesUnlock');
	// 获取画布宽高
	var _guaWidth = canvas.width;
	var _guaHeight = canvas.height;
	// 获取画布距离页面顶端和左端的距离
	var _leftSpace = canvas.offsetLeft;
	var _topSpace = canvas.offsetTop;
	// 9个点的全部坐标
	var pointArr = thisObj.ninePoint();
	canvas.addEventListener('touchmove', function (eve) {
		// 取消页面的触摸移动默认动作
		eve.preventDefault();
		// 触点位置坐标减去偏移量
		var touchX = eve.targetTouches[0].clientX - _leftSpace;
		var touchY = eve.targetTouches[0].clientY - _topSpace;
		// 清空画布
		ctx.clearRect(0, 0, _guaWidth, _guaHeight);
		// 因为被擦除，重新绘制9个点位圆和覆盖圆
		// 把存住的9个白色点位圆放到画布上
		ctx.putImageData(thisObj._ninePointArcImageData, 0, 0);
		// 绘制刚被选中的圆
		thisObj.pointArc(ctx, thisObj._tempPoint.x, thisObj._tempPoint.y, thisObj.radius, thisObj.arcDidColor, thisObj.arcLineWidth);
		// 如果临时绘制数据存在值则把他放到画布上
		if (thisObj._tempImageData) {
			ctx.putImageData(thisObj._tempImageData, 0, 0);
		}
		
		for (key in pointArr) {
			// 如果是点位圆的坐标
			if (touchX > (pointArr[key].x - thisObj.radius) && touchX < (pointArr[key].x + thisObj.radius) && touchY > (pointArr[key].y - thisObj.radius) && touchY < (pointArr[key].y + thisObj.radius)) {
				// 如果选中的是当前点则跳过
				if (thisObj._tempPoint.x == pointArr[key].x && thisObj._tempPoint.y == pointArr[key].y) {
					//console.log(123);
					continue;
				} 
				// 如果选中的是已经选过得点，跳过
				else if (thisObj.pwdResult.indexOf(pointArr[key].pwd) >= 0) {
					continue;
				}
				// 绘制区域
				else {
					// 清除画布区域 (防止第一次绘制时保存绘制数据时出现多余的线条)
					ctx.clearRect(0, 0, _guaWidth, _guaHeight);
					// 把存住的9个白色点位圆放到画布上 (因为上一步清空画布了)
					ctx.putImageData(thisObj._ninePointArcImageData, 0, 0);
					// 绘制上一个圆 （把刚刚选中的圆绘制一遍）
					thisObj.pointArc(ctx, thisObj._tempPoint.x, thisObj._tempPoint.y, thisObj.radius, thisObj.arcDidColor, thisObj.arcLineWidth);
					// 如果临时绘制数据存在值则把他放到画布上
					if (thisObj._tempImageData) {
						ctx.putImageData(thisObj._tempImageData, 0, 0);
					}
					// 绘制上一个点位圆和这个点位圆之间的连线
					thisObj.drawLine(ctx, thisObj._tempPoint.x, thisObj._tempPoint.y, pointArr[key].x, pointArr[key].y, thisObj.touchColor, thisObj.touchLineWidth);
					// 再绘制第二个圆
					thisObj.pointArc(ctx, pointArr[key].x, pointArr[key].y, thisObj.radius, thisObj.arcDidColor, thisObj.arcLineWidth);
					// 把这张图的效果保存住
					thisObj._tempImageData = ctx.getImageData(0, 0, _guaWidth, _guaHeight);
					// 设置临时点
					thisObj._tempPoint = {x:pointArr[key].x, y:pointArr[key].y};
					thisObj.pwdResult += pointArr[key].pwd;
					//console.log(456);
				}
			} 
			// 如果不是点位圆的坐标,则线段跟着手指移动
			else {
				thisObj.drawLine(ctx, thisObj._tempPoint.x, thisObj._tempPoint.y, touchX, touchY, thisObj.touchColor, thisObj.touchLineWidth);
			}
		}

		
	});
}
