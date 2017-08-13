/*
create by xumeng 2017-07-20

采用构造函数模式+原型模式，并且包裹在自执行函数里，防止污染环境。

拖拽原理：
1.如果浏览器支持transform，那么就改变它的transform的x和y的值，否则就采用绝对定位改变x和y。
里面有一个函数就是专门来判断浏览器的transform兼容情况的。
2.拖拽的核心事件是捕捉鼠标的mousedown,mousemove,mouseup。
3.如果需要设置边界值，那么就获取到当前试图的宽和高，然后再判断x和y。

碰到的问题：
1.拖拽的时候选中文字，这是因为触发了浏览器的默认事件，所以return false就好了（在mousedown事件里）。


感受：
1.随着浏览器的兼容性越来越好，代码写的越来越少了。
2.像attachEvent,new ActiveXObject()对象啊都不写了。
*/
;(function(w){
	//这是一个私有属性，不需要被实例访问
	var transform = getTransform();

	function Drag(selector){
		//放在构造函数中的属性，都是每一个实例单独拥有

		//判断实例化的传值，比如id，class或者是document.getElementById()的对象
		this.elem = typeof selector == 'object' ? selector : 
						document.getElementById(selector) ?
						document.getElementById(selector) : 
						document.getElementsByClassName(selector)[0];

		this.startX = 0;
		this.startY = 0;
		this.sourceX = 0;
		this.sourceY = 0;

		this.init();
	};

	Drag.prototype.version = '1.0.1';

	//初始化
	Drag.prototype.init = function(){
		this.setDrag();
	};

	//获取样式
	Drag.prototype.getStyle = function(property){
		//ie下获取样式的代码与谷歌，火狐不一样，所以得处理一下
		return document.defaultView.getComputedStyle ?
				document.defaultView.getComputedStyle(this.elem, false)[property] :
				this.elem.currentStyle[property];
	};

	//获取当前元素的位置信息
	Drag.prototype.getPosition = function(){
		var pos = {
			x: 0,
			y: 0
		};

		if (transform) {
			var transformValue = this.getStyle(transform);
			if (transformValue == 'none') {
				this.elem.style[transform] = 'translate(0,0)';
			} else{
				var temp = transformValue.match(/-?\d+/g);
				pos = {
					x: parseInt(temp[4].trim()),
					y: parseInt(temp[5].trim())
				};
			};
		} else{
			if (this.getStyle('position') == 'static') {
				this.elem.style.position = 'relative';
			} else{
				pos = {
					x: parseInt(this.getStyle('left') ? this.getStyle('left') : 0),
					y: parseInt(this.getStyle('top') ? this.getStyle('top') : 0)
				};
			};
		};

		return pos;
	};

	//设置当前元素的位置
	Drag.prototype.setPosition = function(pos){
		if (transform) {
			this.elem.style[transform] = 'translate('+ pos.x +'px, '+ pos.y +'px)';
		} else{
			this.elem.style.left = pos.x + 'px';
			this.elem.style.top = pos.y + 'px';
		};
	};

	//绑定事件
	Drag.prototype.setDrag = function(){
		var that = this;
		that.elem.addEventListener('mousedown', start, false);

		function start(e){
			that.elem.style.opacity = .6;

			that.startX = e.pageX;
			that.startY = e.pageY;

			var pos = that.getPosition();

			that.sourceX = pos.x;
			that.sourceY = pos.y;

			document.addEventListener('mousemove', move, false);
			document.addEventListener('mouseup', end, false);

			return false;
		};

		function move(e){
			that.elem.style.opacity = .6;

			var currentX = e.pageX;
			var currentY = e.pageY;

			var distanceX = currentX - that.startX;
			var distanceY = currentY - that.startY;
			
			var disX = (that.sourceX + distanceX).toFixed(),
				maxWidth = document.documentElement.clientWidth - that.elem.offsetWidth,
				disY = (that.sourceY + distanceY).toFixed(),
				maxHeigth = document.documentElement.clientHeight;

			disX = disX < 0 ? 0 : disX;
			disX = disX > maxWidth ? maxWidth : disX;
			disY = disY < 0 ? 0 : disY;
			disY = disY > maxHeigth ? maxHeigth : disY;

			that.setPosition({
				x: (disX),
				y: (disY)
			});
		};

		function end(e){
			that.elem.style.opacity = 1;

			document.removeEventListener('mousemove', move);
			document.removeEventListener('mouseup', end);
		};
	};

	//私有方法，仅仅用来获取transform的兼容写法
	function getTransform(){
		var transform = '',
		divStyle = document.createElement('div').style,
		transformArr = ['transform','webkitTransform','MozTransform','msTransform','OTransform'];

		for(var i = 0; i < transformArr.length; i++){
			if (transformArr[i] in divStyle) {
				return transform = transformArr[i];
			};
		};

		return transform;
	};

	//对外暴露方法
	w.Drag = Drag;
})(window);
