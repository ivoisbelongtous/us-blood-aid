import * as d3 from "d3";
import * as topojson from "topojson";
import world from "world-atlas/world/110m.json";

const width = 960;
const height = 600;

const canvas = d3
  .select("body")
  .append("canvas")
  .attr("width", width * window.devicePixelRatio)
  .attr("height", height * window.devicePixelRatio)
  .style("width", width + "px")
  .style("height", height + "px");
const context = canvas.node()!.getContext("2d")!;
context.scale(window.devicePixelRatio, window.devicePixelRatio);

const path = d3.geoPath(d3.geoEqualEarth()).context(context);

context.beginPath();
path(topojson.mesh(world as any));
context.stroke();
