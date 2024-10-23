window.addEventListener("load", canvasApp, false);

function canvasApp() {
	loadGame();
}

function loadGame() {
	const cvs = document.querySelector("canvas");
	const ctx = cvs.getContext("2d");
	const scoreHtml = document.querySelector("#score");
	let score = 0;
	
	const width = cvs.width = 240;
	const height = cvs.height = 400;

	//timer variables
	let lastTime = 0;
	let dropCounter = 0;
	let dropInterval = 1000;

	//touch variables
	let startX, startY, threshold = 24;
	let moveX, moveY, moveCounter = 0;
	let trigger = -20;
	let rotateCounter = 0;

	//variable
	let arena = createArena(12, 20);
	const colors = [
		null,
		'red',
		'blue',
		'yellow',
		'purple',
		'orange',
		'cyan',
		'tomato'
	];
	const size = 20;
	let player = {
		matrix: undefined,
		pos: {
			x: 0,
			y: 0
		}
	};
	
	
	//function calls
	reset();
	update();

	//function definition
	function draw() {
		cvs.width = width;
		cvs.height = height;
		drawMatrix(player.matrix, player.pos);
		drawMatrix(arena, {x: 0, y: 0});
		lines("white");
	}

	function update(time = 0) {
		draw();
		arenaSweep();
		updateScore();
		window.requestAnimationFrame(update, cvs);

		let deltaTime = time - lastTime;
		lastTime = time;

		dropCounter += deltaTime;

		if(dropCounter > dropInterval) {
			playerDrop();
		}
	}

	function drawMatrix(player, pos) {
		player.forEach((row, y) => {
			row.forEach((value, x) => {
				if(value) {
					ctx.fillStyle = colors[value];
					ctx.fillRect((x + pos.x) * size, (y + pos.y) * size, size, size);
				}
			});
		});
	}

	function updateScore() {
		scoreHtml.innerHTML = score;
	}

	function playerDrop() {
		player.pos.y++;

		if(collide(arena, player)) {
			player.pos.y--;
			merge(arena, player);
			reset();
		}
		dropCounter = 0;
	}

	function playerMove(dir) {
		player.pos.x += dir;

		if(collide(arena, player)) {
			player.pos.x -= dir;
		}
	}

	function arenaSweep() {
		here: for(let y = arena.length - 1; y > 0; --y) {
			for(let x = 0; x < arena[y].length; ++x) {
				if(arena[y][x] == 0) {
					continue here;
				}
			}

			const row = arena.splice(y, 1)[0].fill(0);
			arena.unshift(row);
			++y;
			score += 2;
		}
	}

	function playerSkipDrop() {
		while(true) {
			player.pos.y++;

			if(collide(arena, player)) {
				player.pos.y--;
				break;
			}
		}
	}

	function playerRotate(dir) {
		let pos = player.pos.x;
		let offset = 1;
		rotate(player.matrix, dir);

		while(collide(arena, player)) {
			player.pos.x += offset;

			offset = -(offset + (offset > 0 ? 1 : -1));

			if(offset > player.matrix.length) {
				player.pos.x = pos;
				rotate(player.matrix, -dir);
			}
		}
	}

	function reset() {
		player.pos.y = 0;
		const pieceLetters = "IOJLSZT";
		let index = Math.floor(Math.random() * pieceLetters.length);
		player.matrix = getType(pieceLetters[index]);

		player.pos.x = Math.floor(width / size) / 2  - Math.ceil(player.matrix[0].length / 2);

		if(collide(arena, player)) {
			for(let y = 0; y < arena.length; ++y) {
				arena[y].fill(0);
			}
			score = 0;
		}
	}

	function collide(arena, player) {
		for(let y = 0; y < player.matrix.length; ++y) {
			for(let x = 0; x < player.matrix[y].length; ++x) {
				if(player.matrix[y][x] != 0 && (arena[y + player.pos.y] && arena[y + player.pos.y][x + player.pos.x]) != 0) {
					return true;
				}
			}
		}
		return false
	}

	function rotate(matrix, dir) {
		for(let y = 0; y < matrix.length; ++y) {
			for(let x = 0; x < y; ++x) {
				[
					matrix[y][x],
					matrix[x][y]
				] = [
					matrix[x][y],
					matrix[y][x]
				];
			}
		}

		if(dir > 0) {
			for(let i = 0; i < matrix.length; ++i) {
				matrix[i].reverse();
			}
		}else {
			matrix.reverse();
		}
	}

	function merge(arena, player) {
		let [m, o] = [player.matrix, player.pos];

		for(let y = 0; y < m.length; ++y) {
			for(let x = 0; x < m[y].length; ++x) {
				if(m[y][x]) {
					arena[y + o.y][x + o.x] = m[y][x];
				}
			}
		}
	}

	function createArena(w, h) {
		let m = [];

		while(h--) {
			m.push(new Array(w).fill(0));
		}

		return m;
	}

	function getType(type) {
		switch (type) {
			case 'T':
				return [
					[1, 1, 1],
					[0, 1, 0],
					[0, 0, 0]
				];
				break;
			case 'O':
				return [
					[2, 2],
					[2, 2]
				];
				break;
			case 'L':
				return [
					[0, 3, 0],
					[0, 3, 0],
					[0, 3, 3]
				];
				break;
			case 'J':
				return [
					[0, 4, 0],
					[0, 4, 0],
					[4, 4, 0]
				];
				break;
			case 'S':
				return [
					[0, 5, 5],
					[5, 5, 0],
					[0, 0, 0]
				];
				break;
			case 'Z':
				return [
					[6, 6, 0],
					[0, 6, 6],
					[0, 0, 0]
				];
				break;
			case 'I':
				return [
					[0, 7, 0, 0],
					[0, 7, 0, 0],
					[0, 7, 0, 0],
					[0, 7, 0, 0]
				];
				break;
		}
	}

	function lines(color) {
		ctx.strokeStyle = color;
		for(let y = 0; y < height / size; ++y) {
			for(let x = 0; x < width / size; ++x) {
				ctx.strokeRect(x * size, y * size, size, size);
			}
		}
	}

	window.addEventListener("touchstart", function(e) {
		moveCounter = 0;
		rotateCounter = 0;
		let touchMade = e.changedTouches[0];

		startX = Math.floor(touchMade.pageX);
		startY = Math.floor(touchMade.pageY);
	}, false);
	window.addEventListener("touchmove", function(e) {
		moveX = 0;
		moveY = 0;
		let touchMade = e.changedTouches[0];

		moveX = Math.floor(touchMade.pageX);
		moveY = Math.floor(touchMade.pageY);

		moveCounter += moveX - startX;
		startX = moveX;

		rotateCounter += moveY - startY;
		startY = moveY;

		if(moveCounter >= threshold || moveCounter <= -threshold) {
			let decide = Math.floor(moveCounter / threshold);
			if(decide > 0) {
				playerMove(1);
			}else if(decide < 0) {
				playerMove(-1);
			}
			moveCounter = 0;
			rotateCounter = 0;
			moveX = 0;
			start = 0;
		}
		if(rotateCounter <= trigger) {
			playerRotate(1);
			rotateCounter = 0;
			moveY = 0;
			startY = 0;
		}
	}, false);
	window.addEventListener("touchend", function(e) {
		moveCounter = 0;
		rotateCounter = 0;
	}, false);
	window.addEventListener("dblclick", function() {
		playerSkipDrop();
	}, false);
}
