window.onload = function() {
  var Game = function() {
    this.turn = 1;
  };

  Game.prototype = {
    currentTurn: function() {
      return this.turn;
    },
    enemyTurn: function() {
      return this.turn * -1;
    },
    changeTurn: function() {
      this.turn *= -1;
    },
    finish: function(board) {
      var blackCount = board.stonesCountBy(Stone.states.black);
      var whiteCount = board.stonesCountBy(Stone.states.white);
      var message;
      if (blackCount > whiteCount) {
        message = '黒の勝ちです！';
      } else if (blackCount < whiteCount) {
        message = '白の勝ちです！';
      } else {
        message = '引き分けです！';
      }
      this.displayMessage(message);
    },
    displayMessage: function(message) {
      var messageArea = document.getElementById('message');
      messageArea.innerHTML = message;
    }
  }

  var Board = function() {
    this.stones = Board.create();
  };

  Board.edgeLength = 8;

  Board.create = function() {
    var table = document.getElementById('board');
    var stones = [];

    for (var row = 0; row < Board.edgeLength; row++) {
      var stonesRow = [];
      var tr = document.createElement('tr');
      tr.className = 'row' + row;

      for (var column = 0; column < Board.edgeLength; column++) {
        var td = document.createElement('td');
        td.className = 'column' + column;

        var cell = document.createElement('div');
        cell.dataset.row = row;
        cell.dataset.column = column;
        cell.className = 'cell';
        cell.id = 'cell' + row + column;

        var stone = new Stone(row, column);
        var image = document.createElement('img');
        image.src = stone.display();

        cell.appendChild(image);
        td.appendChild(cell);
        tr.appendChild(td);

        stonesRow.push(stone);
      }

      table.appendChild(tr);
      stones.push(stonesRow);
    }

    return stones;
  };

  Board.prototype = {
    init: function() {
      this.scanAll(function(stone) {
        stone.toState(Stone.states.none);
      });

      this.stones[3][3].toState(Stone.states.white);
      this.stones[3][4].toState(Stone.states.black);
      this.stones[4][3].toState(Stone.states.black);
      this.stones[4][4].toState(Stone.states.white);
      this.update();
      return this;
    },
    update: function() {
      this.scanAll(function(stone) {
        var id = 'cell' + stone.row + stone.column;
        var cell = document.getElementById(id);
        cell.childNodes[0].src = stone.display();
      });
    },
    scanAll: function(callback) {
      this.stones.forEach(function(row) {
        row.forEach(function(stone) {
          callback(stone);
        });
      });
    },
    scanAllLine: function(stone) {
      var directions = [
        { vertical: -1, horizontal: 0 },
        { vertical: -1, horizontal: 1 },
        { vertical:  0, horizontal: 1 },
        { vertical:  1, horizontal: 1 },
        { vertical:  1, horizontal: 0 },
        { vertical:  1, horizontal: -1 },
        { vertical:  0, horizontal: -1 },
        { vertical: -1, horizontal: -1 }
      ];

      var targetStones = [];
      directions.forEach(function(direction) {
        var distance = 1;

        // 行毎の処理は切り出したい
        var tmpTargetStones = [];

        var relativeRow = direction.vertical;
        var relativeColumn = direction.horizontal;
        function relativePosition(distance) {
          relativeRow = direction.vertical * distance;
          relativeColumn = direction.horizontal * distance;
          return { row: relativeRow, column: relativeColumn };
        }

        var firstTarget = this.findStoneByRelative(stone, relativePosition(distance));

        // 長い
        if ((!firstTarget || firstTarget.isNone() || !firstTarget.isDifferentState(stone))) {
          return;
        }

        tmpTargetStones.push(firstTarget);
        distance++;

        var targetStone;
        while (targetStone = this.findStoneByRelative(stone, relativePosition(distance))) {
          if (targetStone.isNone()) {
            return;
          } else if (targetStone.isDifferentState(stone)) {
            tmpTargetStones.push(targetStone);
            distance++;
          } else {
            targetStones = targetStones.concat(tmpTargetStones);
            return;
          }
        }
      }, this);
      return targetStones;
    },
    canReverse: function(state) {
      return this.stones.reduce(function(previous, current) {
        return previous.concat(current);
      }).filter(function(stone) {
        return stone.isNone();
      }).some(function(stone) {
        var testTargetStone = new Stone(stone.row, stone.column, state);
        var reversibleStones = this.scanAllLine(testTargetStone);
        return reversibleStones.length > 0;
      }, this);
    },
    findStoneByRelative: function(stone, relative) {
      var row = stone.row + relative.row;
      var column = stone.column + relative.column;
      if (this.stones[row]) {
        return this.stones[row][column];
      } else {
        return null;
      }
    },
    stonesCountBy: function(state) {
      return this.stones.reduce(function(previous, current) {
        return previous.concat(current);
      }).filter(function(stone) {
        return stone.state == state;
      }).length;
    }
  };

  var Stone = function(row, column, state) {
    this.row = row;
    this.column = column;
    this.state = state || Stone.states.none;
  };

  Stone.states = {
    none: 0,
    black: 1,
    white: -1
  };

  Stone.prototype = {
    toState: function(state) {
      this.state = state;
    },
    reverse: function() {
      this.state *= -1;
    },
    isNone: function() {
      return this.state == Stone.states.none;
    },
    isDifferentState: function(other) {
      return this.state == other.state * -1;
    },
    display: function() {
      var base = './images/';
      var images = {
        '0': base + 'none.gif',
        '1': base + 'black.gif',
        '-1': base + 'white.gif'
      };
      return images[this.state.toString()];
    }
  };

  var game = new Game();
  var board = new Board().init();

  (function() {
    var cells = document.getElementsByClassName('cell');
    Array.prototype.forEach.call(cells, function(cell) {
      cell.addEventListener('click', function() {
        var row = this.dataset.row;
        var column = this.dataset.column;
        var selectedStone = board.stones[row][column];
        if (!selectedStone.isNone()) {
          return;
        }

        var tmpStone = new Stone(selectedStone.row, selectedStone.column, game.currentTurn());
        var targets = board.scanAllLine(tmpStone);
        if (targets.length > 0) {
          selectedStone.toState(game.currentTurn());
          targets.forEach(function(s) {
            s.reverse();
          });
          board.update();
        } else {
          game.displayMessage('そこには置けません。');
          return;
        }

        if (board.canReverse(game.enemyTurn())) {
          game.changeTurn();
          game.displayMessage('');
          return;
        }

        if (board.canReverse(game.currentTurn())) {
          game.displayMessage('相手の置ける場所がないのでパスされました。');
          return;
        }
        game.finish(board);
      });
    });
  })();
};

