var Board = function(rows, columns) {
  this.rows = rows;
  this.columns = columns;
  this.board = [];
  this.ids = 0;

  this.init();
}

var colors = ['#DC5639', '#823957', '#436475', '#5FA34C', '#FBBD4E'];

Board.prototype.dot = function() {
  return {
    id: this.ids++,
    color: colors[Math.floor(Math.random() * colors.length)]
  }
};

Board.prototype.init = function() {
  for (var c = 0; c < this.columns; c++) {
    var column = [];
    for (var r = 0; r < this.rows; r++) {
      column.push(this.dot());
    }
    this.board.push(column);
  }
};

Board.prototype.data = function() {
  var data = [];
  this.board.forEach(function(column, c) {
    column.forEach(function(dot, r) {
      dot.row = r;
      dot.col = c;
      data.push(dot);
    });
  });
  return data;
};

Board.prototype.findAll = function(color) {
  var positions = [];
  this.board.forEach(function(column, c) {
    column.forEach(function(dot, r) {
      if (dot.color === color) {
        positions.push(dot);
      }
    });
  });
  return positions;
};

Board.prototype.remove = function(positions) {
  var self = this;
  // we have to remove back to front, because of indexing...
  positions.sort(function(p, q) {
    return q.row - p.row;
  });

  positions.forEach(function(pos) {
    var column = self.board[pos.col];
    column.splice(pos.row, 1);
  });

  this.board.forEach(function(column) {
    while (column.length < self.columns)
      column.unshift(self.dot());
  });
};

module.exports = Board;
