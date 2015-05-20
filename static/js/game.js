var Board = require('./board');
var d3 = require('d3');

var boardSize = 8;
var dotSize = 13;
var lineSize = dotSize / 2.5;
var space = 4 * dotSize;

var width = (boardSize + 1) * space;
var height = (boardSize + 1) * space;

var svg = d3.select('body')
    .style('width', width + 'px')
  .append('svg')
    .attr({
      'width': width,
      'height': height
    })
  .append('g')
    .attr('transform', 'translate(' + space + ',' + space + ')');

var haloGroup = svg.append('g')
  .attr('class', 'halo-group');

var lineGroup = svg.append('g')
  .attr('class', 'line-group');

var dotGroup = svg.append('g')
  .attr('class', 'dot-group');

function draw(data) {
  var dots = dotGroup.selectAll('circle')
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
        r: dotSize,
        fill: function(d) { return d.color }
      })
    .transition()
      .duration(650)
      .attr('cy', function(d) { return d.row * space });

  dots
    .exit()
    .transition()
      .duration(350)
      .attr('r', 0)
    .remove();
}

var b = new Board(boardSize, boardSize);
draw(b.data());

var line = d3.svg
  .line()
  .interpolate('linear')
  .x(function(d) { return parseInt(d.col) * space; })
  .y(function(d) { return parseInt(d.row) * space; });

var drawing = false;
var pathDots = [];

function drawLine() {
  lineGroup.select('path').attr('d', function(d) { return line(d); });
}

function removeLine() {
  drawing = false;
  pathDots = [];
  lineGroup.select('path').remove();
}

function animateHalo(el) {
  el.setAttribute('data-animating', true);
  haloGroup.append('circle')
    .attr({
      r: dotSize,
      cx: el.dataset.col * space,
      cy: el.dataset.row * space,
      fill: el.dataset.color
    })
    .style('opacity', .4)
    .transition()
      .duration(800)
      .ease('easeOutCirc')
      .attr('r', dotSize * 3)
      .style('opacity', 0)
      .each('end', function() {
        el.removeAttribute('data-animating');
      })
    .remove();
}

document.addEventListener('mouseover', function(e) {
  var t = e.target;
  if (!drawing && t.matches('.dot') && !t.dataset.animating) {
    animateHalo(t);
  }

  if (drawing && t.matches('circle')) {
    var dot = t.dataset;
    var current = pathDots[pathDots.length - 1];

    if (!connects(current, dot)) return;

    // animate after we know this is a valid connection
    animateHalo(t);
    if (pathDots.length > 1) {
      var previous = pathDots[pathDots.length - 2];
      if (dot === previous) {
        pathDots.pop();
        drawLine();
        return;
      }
    }

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

  lineGroup.append('path')
    .data([pathDots])
    .attr('class', 'line')
    .attr('d', line)
    .style({
      fill: 'none',
      stroke: e.target.dataset.color,
      'stroke-width': lineSize
    });
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

  var path = lineGroup.select('path');
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
