window.onload = function() {
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
        cell.className = 'cell';
        cell.id = 'cell' + row + column;

        var stone = new Stone(row, column);
        var text = document.createTextNode(stone.display());

        cell.appendChild(text);
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
      this.stones.map(function(row) {
        row.map(function(stone) {
          stone.toNone();
        });
      });

      this.stones[3][3].toWhite();
      this.stones[3][4].toBlack();
      this.stones[4][3].toBlack();
      this.stones[4][4].toWhite();
      this.change();
      return this;
    },
    // scanAllLine: function() {
    // },
    // scanLine: function() {
    // },
    change: function() {
      this.stones.map(function(row) {
        row.map(function(stone) {
          var id = 'cell' + stone.row + stone.column;
          var cell = document.getElementById(id);
          cell.innerHTML = stone.display();
        });
      });
    }
  };

  var Stone = function(row, column) {
    this.state = 0;
    this.row = row;
    this.column = column;
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
    reverse: function() {
      this.state *= -1;
    },
    display: function() {
      var states = {
        '0': 'N',
        '1': 'B',
        '-1': 'W'
      };
      return states[this.state.toString()];
    }
  };

  var board = new Board().init();

  (function() {
    var cells = document.getElementsByClassName('cell');
    Array.prototype.forEach.call(cells, function(cell) {
      cell.addEventListener('click', function() {
        console.log('success!!');
      });
    });
  })();
};

