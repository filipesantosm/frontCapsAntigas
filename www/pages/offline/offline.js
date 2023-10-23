jQuery(function ($) {

  // Se tiver na tela inicial, sem logar, voltar para welcome
  var rota = localStorage.getItem("rotaAtual");
  //console.log('Page Offline: rota', rota);
  //console.log('Page Offline rotaURL', app.views.main.router.url);
  //console.log('Page Offline history', app.views[0].history);
  if ((rota == '/index/') || (rota == '/welcome/') || (rota == '/login/') || (rota.substring(0, 11) == '/cadastro_p')) {
    //$("#voltarOnline").hide();
    //$("#voltarOnline").attr("href", "/welcome_webapp/")
    $("#voltarOnline").attr("href", "/index/");
  }
  else if ((rota == null) || (rota == 'null') || (rota == '')) {
    $("#voltarOnline").attr("href", "/index/");
  }
  else {
    $("#voltarOnline").attr("href", "/home/");
  }

  // Bloquear rotação da tela
  //window.screen.orientation.lock('portrait');
  if (Framework7.device.ios) {
    $("#card-android").hide();
    $("#msg-android").hide();
    $("#card-ios").show();
    $("#msg-ios").show();
  }
  else {
    $("#card-ios").hide();
    $("#msg-ios").hide();
    $("#card-android").show();
    $("#msg-android").show();
  }


  var canvas = document.getElementById('game');
  var context = canvas.getContext('2d');

  var grid = 16;
  var snake = {
    x: 160,
    y: 160,
    // snake velocity. moves one grid length every frame in either the x or y direction
    dx: grid,
    dy: 0,

    // keep track of all grids the snake body occupies
    cells: [],
    // length of the snake. grows when eating an apple
    maxCells: 4
  };
  var count = 0;
  var apple = {
    x: 320,
    y: 320
  };

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  // game loop
  function loop() {
    requestAnimationFrame(loop);

    // slow game loop to 15 fps instead of 60 - 60/15 = 4
    if (++count < 4) {
      return;
    }

    count = 0;
    context.clearRect(0, 0, canvas.width, canvas.height);

    // move snake by it's velocity
    snake.x += snake.dx;
    snake.y += snake.dy;

    // wrap snake position on edge of screen
    if (snake.x < 0) {
      snake.x = canvas.width - grid;
    }
    else if (snake.x >= canvas.width) {
      snake.x = 0;
    }
    // wrap snake position vertically on edge of screen
    if (snake.y < 0) {
      snake.y = canvas.height - grid;
    }
    else if (snake.y >= canvas.height) {
      snake.y = 0;
    }

    // keep track of where snake has been. front of the array is always the head
    snake.cells.unshift({ x: snake.x, y: snake.y });

    // remove cells as we move away from them
    if (snake.cells.length > snake.maxCells) {
      snake.cells.pop();
    }

    // draw apple
    context.fillStyle = 'red';
    context.fillRect(apple.x, apple.y, grid - 1, grid - 1);

    // draw snake
    context.fillStyle = 'green';
    snake.cells.forEach(function (cell, index) {
      context.fillRect(cell.x, cell.y, grid - 1, grid - 1);

      // snake ate apple
      if (cell.x === apple.x && cell.y === apple.y) {
        snake.maxCells++;

        apple.x = getRandomInt(0, 25) * grid;
        apple.y = getRandomInt(0, 25) * grid;
      }

      // check collision with all cells after this one (modified bubble sort)
      for (var i = index + 1; i < snake.cells.length; i++) {

        // collision. reset game
        if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
          snake.x = 160;
          snake.y = 160;
          snake.cells = [];
          snake.maxCells = 4;
          snake.dx = grid;
          snake.dy = 0;

          apple.x = getRandomInt(0, 25) * grid;
          apple.y = getRandomInt(0, 25) * grid;
        }
      }
    });
  }

  var allowedTime = 200;
  var startX = 0;
  var startY = 0;
  /*
    document.addEventListener('touchstart', function (e) {
      var touch = e.changedTouches[0]
      startX = touch.pageX
      startY = touch.pageY
      startTime = new Date().getTime()
      e.preventDefault()
    }, false)
  
    document.addEventListener('touchmove', function (e) {
      e.preventDefault()
    }, false)
  
    document.addEventListener('touchend', function (e) {
      var touch = e.changedTouches[0]
      distX = touch.pageX - startX
      distY = touch.pageY - startY
      console.log(touch.target.id);
      if (touch.target.id=="voltar"){
        console.log('sim');
        app.views.main.router.navigate('/index/');
        exit;
      }
  
      if (Math.abs(distX) > Math.abs(distY)) {
        if (distX > 0 && snake.dx === 0) {
          snake.dx = grid;
          snake.dy = 0;
        }
        else if (distX < 0 && snake.dx === 0) {
          snake.dx = -grid;
          snake.dy = 0;
        }
      } else {
        if (distY > 0 && snake.dy === 0) {
          snake.dy = grid;
          snake.dx = 0;
        }
        else if (distY < 0 && snake.dy === 0) {
          snake.dy = -grid;
          snake.dx = 0;
        }
      }
      e.preventDefault();
    }, false)
  */
  $("#btn-left").click(function () {
    if (snake.dy != 0) {
      snake.dx = -grid;
      snake.dy = 0;
    }
  });
  $("#btn-right").click(function () {
    if (snake.dy != 0) {
      snake.dx = grid;
      snake.dy = 0;
    }
  });
  $("#btn-up").click(function () {
    if ((snake.dy != 16) && (snake.dy != -16)) {
      snake.dy = -grid;
      snake.dx = 0;
    }
  });
  $("#btn-down").click(function () {
    if ((snake.dy != 16) && (snake.dy != -16)) {
      snake.dy = grid;
      snake.dx = 0;
    }
  });
  document.addEventListener('keydown', function (e) {

    // prevent snake from backtracking on itself
    if (e.which === 37 && snake.dx === 0) {
      snake.dx = -grid;
      snake.dy = 0;
    }
    else if (e.which === 38 && snake.dy === 0) {
      snake.dy = -grid;
      snake.dx = 0;
    }
    else if (e.which === 39 && snake.dx === 0) {
      snake.dx = grid;
      snake.dy = 0;
    }
    else if (e.which === 40 && snake.dy === 0) {
      snake.dy = grid;
      snake.dx = 0;
    }
  });
  requestAnimationFrame(loop);

});