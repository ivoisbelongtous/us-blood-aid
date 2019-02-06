import * as d3 from "d3";
import * as topojson from "topojson";
import world from "world-atlas/world/110m.json";

const context = d3
  .select<HTMLCanvasElement, {}>("canvas")
  .node()!
  .getContext("2d")!;
const path = d3.geoPath().context(context);

context.beginPath();
path(topojson.mesh(world as any));
context.stroke();
