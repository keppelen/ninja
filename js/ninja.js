
(function (window) {
	var constants = {
		CANVAS_WIDTH: 320,
		GRAVITY: 0.001,
		ROTATION_ANGLE: Math.PI/12,
		POSITIONS: [[20,   5,   7], [30,   4, 8], [40,    3,   9], [50,   1, 5],  [100,   2,  10], [140,   1,   9], [150, 3, 9],
					[65, 1.5, 8.3], [82, 7.5, 2], [155, 0.7, 9.4], [94, 4.3, 4],  [105, 3.8, 7.6], [  5, 2.7, 7.8], [ 12, 7, 7]] // x, speedX, speedY 
	};

	function Fruit(config, bomb) {
		this.x = config[0];
		this.y = 210;
		this.clockwise =  (this.x < constants.CANVAS_WIDTH/2) ? 1 : -1;
		this.speedX = config[1];
		this.speedY = config[2];

		this.bomb = bomb;
		this.rotation = 0;
		this.height = 30;
		this.width = 30;
		this.tick = 1;
	};

	Fruit.prototype.move = function() {
		this.x += this.speedX * this.clockwise;
		this.y -= this.speedY - (this.speedY * constants.GRAVITY * Math.pow(this.tick, 2));

		this.tick++;
	};

	Fruit.prototype.render = function() {
		var translateX = this.x + (this.width/2),
			translateY = this.y + (this.height/2);
		
		context.save();

		context.translate(translateX, translateY);
		context.rotate(this.rotation);
		context.translate((-1 * translateX), (-1 * translateY));

		var img = new Image();
  		img.src = 'images/apple.png';
		context.drawImage(img, this.x, this.y);

		context.restore();
	};

	Fruit.prototype.rotate = function() {
		this.rotation = this.rotation + (constants.ROTATION_ANGLE * this.clockwise);
	};

	var game = {
		drawSegments: [],
		fruits: [],
		context: null,
		score: 0,

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
			setInterval(instance.fruitWave, 5000);
		},

		checkCollision: function(fruit) {
			var instance = game,
				len = instance.drawSegments.length,
				x = instance.drawSegments[len - 3],
				y = instance.drawSegments[len - 2];

				if ((x > fruit.x) && (x < (fruit.x + fruit.width)) &&
					(y > fruit.y) && (y < (fruit.y + fruit.height))) {

					return true;
				}
				else {
					return false;
				}
		},

		renderFruits: function() {
			var instance = game,
				sliced = instance.fruits.slice(0);

			for (var i = 0, len = instance.fruits.length; i < len; i++) {
				var fruit = instance.fruits[i];

				if ((instance.drawSegments.length > 0) && instance.checkCollision(fruit)) {
					if (fruit.bomb && (instance.score > 0)) {
						instance.score--;
					}
					else {
						instance.score++;
					}

					sliced.splice(i, 1);

					continue;
				}

				fruit.render();
				fruit.rotate();
				fruit.move();
			}

			instance.fruits = sliced;
		},

		renderScore: function() {
			var instance = game;

			context.save();

			context.scale(-1, 1);
			context.fillStyle = "Red";
			context.font = "12pt Arial";
			context.fillText('Score: ' + game.score, -70, 230);

			context.restore();
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

		fruitWave: function() {
			var instance = game,
				availablePositions = constants.POSITIONS.slice(0);

			instance.fruits = [];
			
			for (var i = 0; i < 3; i++) {
				var index = Math.floor(Math.random() * availablePositions.length),
					position = availablePositions[index],
					direction = Math.round(Math.random()),
					x = position[0];

				if (direction) {
					x = constants.CANVAS_WIDTH - x;
				}

				var fruit = new Fruit([x, position[1], position[2]], false);

				instance.fruits.push(fruit);

				availablePositions.splice(index, 1);
			};
		},

		loop: function() {
			var instance = game;

			instance.renderTrail();
			instance.renderFruits();
			instance.renderScore();

			requestAnimationFrame(instance.loop);
		}
	};

	window.game = game;
}(window));