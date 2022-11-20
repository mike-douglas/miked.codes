// Populate a grid of n×m values where -2 ≤ x ≤ 2 and -2 ≤ y ≤ 1.
const n = 256, m = 256, values = new Array(n * m);
for (let j = 0.5, k = 0; j < m; ++j) {
  for (let i = 0.5; i < n; ++i, ++k) {
    values[k] = goldsteinPrice(i / n * 4 - 2, 1 - j / m * 3);
  }
}

// Compute the contour polygons at log-spaced intervals; returns an array of MultiPolygon.
const contours = d3.contours()
    .size([n, m])
    .thresholds(Array.from({ length: 19 }, (_, i) => Math.pow(2, i + 2)))
    (values);

// See https://en.wikipedia.org/wiki/Test_functions_for_optimization
function goldsteinPrice(x, y) {
  return (1 + Math.pow(x + y + 1, 2) * (19 - 14 * x + 3 * x * x - 14 * y + 6 * x * x + 3 * y * y))
      * (30 + Math.pow(2 * x - 3 * y, 2) * (18 - 32 * x + 12 * x * x + 48 * y - 36 * x * y + 27 * y * y));
}

console.log(contours);

d3.selectAll("#background-vis").enter().append()
  .data(contours)
  .enter()
  .append('path')
    .attr('d', d3.geoPath())