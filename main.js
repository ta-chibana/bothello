window.onload = function() {
  var Game = function() {
    this.turn = 1;
  };

  Game.prototype = {
    changeTurn: function() {
      this.turn *= -1;
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
        stone.toNone();
      });

      this.stones[3][3].toWhite();
      this.stones[3][4].toBlack();
      this.stones[4][3].toBlack();
      this.stones[4][4].toWhite();
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
        if ((!firstTarget || firstTarget.isNone() || !firstTarget.isDifferentColor(stone))) {
          return;
        }

        tmpTargetStones.push(firstTarget);
        distance++;

        var targetStone;
        while (targetStone = this.findStoneByRelative(stone, relativePosition(distance))) {
          if (targetStone.isNone()) {
            return;
          } else if (targetStone.isDifferentColor(stone)) {
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
    canReverse: function() {
      return this.stones.reduce(function(previous, current) {
        return previous.concat(current);
      }).filter(function(stone) {
        return stone.isNone();
      }).some(function(stone) {
        var testTargetStone = new Stone(stone.row, stone.column, game.turn);
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
    }
  };

  var Stone = function(row, column, state) {
    this.row = row;
    this.column = column;
    this.state = state || 0;
  };

  Stone.prototype = {
    toNone: function() {
      this.state = 0;
    },
    toBlack: function() {
      this.state = 1;
    },
    toWhite: function() {
      this.state = -1;
    },
    toTurnsColor: function(game) {
      this.state = game.turn;
      return this;
    },
    reverse: function() {
      this.state *= -1;
    },
    isNone: function() {
      return this.state == 0;
    },
    isDifferentColor: function(other) {
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
          console.log('すでに置かれているよ');
          return;
        }

        var tmpStone = new Stone(selectedStone.row, selectedStone.column, game.turn);
        var targets = board.scanAllLine(tmpStone);
        if (targets.length > 0) {
          selectedStone.toTurnsColor(game);
          targets.forEach(function(s) {
            s.reverse();
          });
          board.update();
        } else {
          console.log('no changed..')
          return;
        }

        game.changeTurn();

        if (!board.canReverse()) {
          game.changeTurn();
        }
      });
    });
  })();
};

