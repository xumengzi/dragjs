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
		};

		function move(e){
			that.elem.style.opacity = .6;

			var currentX = e.pageX;
			var currentY = e.pageY;

			var distanceX = currentX - that.startX;
			var distanceY = currentY - that.startY;
			
			var width = (that.sourceX + distanceX).toFixed(),
				maxWidth = document.body.offsetWidth,
				height = (that.sourceY + distanceY).toFixed(),
				maxHeigth = document.body.offsetHeight;

			that.setPosition({
				x: (width),
				y: (height)
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