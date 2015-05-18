var Board = require('./board');
var d3 = require('d3');

var width = 400;
var height = 400;
var space = 25;

var svg = d3.select('body')
  .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
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
      .attr('class', 'dot')
      .attr('cx', function(d) { return d.col * space })
      .attr('cy', -space)
      .attr('data-col', function(d) { return d.col })
      .attr('data-row', function(d) { return d.row })
      .attr('data-color', function(d) { return d.color })
      .attr('r', 8)
      .attr('fill', function(d) { return d.color })
      // .style('fill-opacity', 1e-6)
    .transition()
      .duration(650)
      // .style('fill-opacity', 1)
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

document.addEventListener('mouseover', function(e) {
  if (drawing && e.target.matches('circle')) {
    var dot = e.target.dataset;
    var current = pathDots[pathDots.length - 1];
    if (pathDots.length > 1) {
      var previous = pathDots[pathDots.length - 2];
      // TODO:
      // if we do this we can't back track!
      // if (dot === previous) return;
      if (dot === previous) {
        pathDots.pop();
        svg.select('path').attr('d', function(d) { return line(d); });
        return;
      }
    }

    if (!connects(current, dot)) return;

    if (pathDots.indexOf(dot) > -1) {
      drawing = false;

      b.remove(b.findAll(dot.color));
      draw(b.data());
      svg.select('path').remove();
      pathDots = [];
      return;
    }

    var path = svg.select('path');
    pathDots.push(dot);
    path.attr('d', function(d) { return line(d); });
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
    .style('stroke-width', 2);
});

// TODO: should just use document here...
d3.select('svg').on('mouseup', function() {
  drawing = false;
  if (pathDots.length > 1) {
    b.remove(pathDots);
    draw(b.data());
  }
  pathDots = [];
  svg.select('path').remove();
})
.on('mousemove', function() {
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
