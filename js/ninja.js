
(function (window) {
	function Fruit() {
		this.rotation = 0;
		this.clockwise = 1;
		this.speedX = 1;
		this.speedY = 1.8;
		this.x = 145;
		this.y = 210;
		this.height = 30;
		this.width = 30;
		this.moving = false;
		this.tick = 1;
	};

	Fruit.prototype.move = function() {
		this.x += this.speedX;
		this.y -= (this.speedY * this.tick) - (0.18 * Math.pow(this.tick, 2))/2;

		this.tick++;
	};

	Fruit.prototype.render = function() {
		var translateX = this.x + (this.width/2),
			translateY = this.y + (this.height/2);
		
		context.save();

		context.translate(translateX, translateY);
		context.rotate(this.rotation);
		context.translate((-1 * translateX), (-1 * translateY));
		context.fillStyle = "rgb(255,0,0)";
		context.fillRect(this.x, this.y, this.width, this.height);
		
		context.restore();

		this.rotate();
		
		if (this.moving) {
			this.move();
		}
	};

	Fruit.prototype.rotate = function() {
		this.rotation = this.rotation + (Math.PI/24 * this.clockwise);
	};

	var game = {
		drawSegments: [],
		fruits: [new Fruit()],
		context: null,

		init: function() {
			var instance = this,
				videoCamera = new tracking.VideoCamera().hide().render().renderVideoCanvas();

			context = videoCamera.canvas.context;

			videoCamera.track(
				{
					type: 'color',
					color: 'magenta',
					onFound: function(track) {
						instance.drawSegments.push(track.x, track.y, (new Date()).getTime());
					},
					onNotFound: function() {
					}
				}
			);

			instance.loop();
		},

		checkCollision: function(fruit) {
			var instance = game,
				len = instance.drawSegments.length,
				x = instance.drawSegments[len - 3],
				y = instance.drawSegments[len - 2];

				if ((x > fruit.x) && (x < (fruit.x + fruit.width)) &&
					(y > fruit.y) && (y < (fruit.y + fruit.height))) {

					fruit.move();
					fruit.moving = true;
					console.log('colidiu');
				}
		},

		renderFruits: function() {
			var instance = game;

			for (var i = 0, len = instance.fruits.length; i < len; i++) {
				var fruit = instance.fruits[i];

				fruit.render();

				if (instance.drawSegments.length > 0) {
					instance.checkCollision(fruit);
				}
			}
		},

		renderTrail: function() {
			var instance = game,
				now = (new Date()).getTime(),
				remove = 0;

			for (var i = 0, len = instance.drawSegments.length; i < len; i = i + 3) {
				var elapsedTime = now - instance.drawSegments[i + 2];
				
				var opacity = 1 - elapsedTime/1000;
				
				if (opacity > 0 && opacity <= 1) {
					context.save();
					context.fillStyle = "rgba(255,255,255," + opacity + ")";

					context.fillRect(instance.drawSegments[i], instance.drawSegments[i + 1], 4, 4);
					context.restore();
				}
				else {
					remove = remove + 3;
				}
			}

			if (remove > 0) {
				instance.drawSegments.splice(0, remove);
			}
		},

		loop: function() {
			var instance = game;

			instance.renderTrail();
			instance.renderFruits();

			requestAnimationFrame(instance.loop);
		}
	};

	window.game = game;
}(window));