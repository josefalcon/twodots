var Board = require('./board');
var d3 = require('d3');

var width = 400;
var height = 400;
var space = 30;

var svg = d3.select('body')
  .append('svg')
    .attr({
      'width': width,
      'height': height
    })
  .append('g')
    .attr('transform', 'translate(' + space + ',' + space + ')');

function draw(data) {
  var dots = svg.selectAll('circle')
    .data(data, function(d) { return d.id });

  dots
    .attr('data-row', function(d) { return d.row })
    .transition()
      .duration(650)
      .attr('cy', function(d) { return d.row * space });

  dots
    .enter()
    .append('circle')
      .attr({
        class: 'dot',
        cx: function(d) { return d.col * space },
        cy: -space,
        'data-col': function(d) { return d.col },
        'data-row': function(d) { return d.row },
        'data-color': function(d) { return d.color },
        r: 8,
        fill: function(d) { return d.color }
      })
    .transition()
      .duration(650)
      .attr('cy', function(d) { return d.row * space });

  dots
    .exit()
    .transition()
      .duration(350)
      .style("fill-opacity", 1e-6)
    .remove();
}

var b = new Board(10, 10);
draw(b.data());

var line = d3.svg
  .line()
  .interpolate('linear')
  .x(function(d) { return parseInt(d.col) * space; })
  .y(function(d) { return parseInt(d.row) * space; });

var drawing = false;
var pathDots = [];

function drawLine() {
  svg.select('path').attr('d', function(d) { return line(d); });
}

function removeLine() {
  drawing = false;
  pathDots = [];
  svg.select('path').remove();
}

document.addEventListener('mouseover', function(e) {
  if (drawing && e.target.matches('circle')) {
    var dot = e.target.dataset;
    var current = pathDots[pathDots.length - 1];
    if (pathDots.length > 1) {
      var previous = pathDots[pathDots.length - 2];
      if (dot === previous) {
        pathDots.pop();
        drawLine();
        return;
      }
    }

    if (!connects(current, dot)) return;

    if (pathDots.indexOf(dot) > -1) {
      b.remove(b.findAll(dot.color));
      draw(b.data());
      removeLine();
      return;
    }

    pathDots.push(dot);
    drawLine();
  }
});

document.addEventListener('mousedown', function(e) {
  if (!e.target.matches('circle')) return;
  drawing = true;
  pathDots = [e.target.dataset];

  svg.append('path')
    .data([pathDots])
    .attr('class', 'line')
    .attr('d', line)
    .style('stroke', e.target.dataset.color)
    .style('stroke-width', 4);
});

document.addEventListener('mouseup', function(e) {
  if (pathDots.length > 1) {
    b.remove(pathDots);
    draw(b.data());
  }
  removeLine();
});

// TODO: remove dependence on d3 here..
d3.select('svg').on('mousemove', function() {
  if (!drawing) return;
  var pt = d3.mouse(this);
  pt[0] -= space;
  pt[1] -= space;

  var path = svg.select('path');
  path.attr('d', function(d) { return line(d) + 'L' + pt[0] + ',' + pt[1] });
});

var deltas = [
  [-1, 0],// up
  [0, 1], // right
  [1, 0], // down
  [0, -1] // left
];

function connects(dot1, dot2) {
  return dot1.color === dot2.color && deltas.some(function(d) {
    return (parseInt(dot1.col) + d[0] === parseInt(dot2.col))
      && (parseInt(dot1.row) + d[1] === parseInt(dot2.row));
  });
}
