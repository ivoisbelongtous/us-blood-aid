// @ts-ignore
import { whereAlpha3 } from "iso-3166-1";
import * as d3 from "d3";
import * as topojson from "topojson";
import { GeometryCollection } from "topojson-specification";
import world from "world-atlas/world/110m.json";

interface AidRecord {
  countryCode: string;
  countryName: string;
  regionID: number;
  regionName: string;
  incomeGroupAcronym: string;
  incomeGroupName: string;
  transactionTypeID: number;
  transactionTypeName: string;
  fiscalYear: Date;
  currentAmount: number;
  constantAmount: number;
}
type AidRecordColumns =
  | "country_code"
  | "country_name"
  | "region_id"
  | "region_name"
  | "income_group_acronym"
  | "income_group_name"
  | "transaction_type_id"
  | "transaction_type_name"
  | "fiscal_year"
  | "current_amount"
  | "constant_amount";

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

const features = topojson.feature(
  world as any,
  world.objects.countries as GeometryCollection
).features;

const path = d3.geoPath(d3.geoEqualEarth()).context(context);

d3.csv<AidRecord, AidRecordColumns>(
  require("us_foreign_aid_country_deduped.csv"),
  ({
    country_code,
    country_name,
    region_id,
    region_name,
    income_group_acronym,
    income_group_name,
    transaction_type_id,
    transaction_type_name,
    fiscal_year,
    current_amount,
    constant_amount
  }) => ({
    countryCode: country_code!,
    countryName: country_name!,
    regionID: +region_id!,
    regionName: region_name!,
    incomeGroupAcronym: income_group_acronym!,
    incomeGroupName: income_group_name!,
    transactionTypeID: +transaction_type_id!,
    transactionTypeName: transaction_type_name!,
    fiscalYear: new Date(fiscal_year!),
    currentAmount: +current_amount!,
    constantAmount: +constant_amount!
  })
).then(rows => {
  const latestYear = rows.filter(
    row =>
      row.fiscalYear.getFullYear() === 2017 &&
      row.countryName !== "World" &&
      row.transactionTypeName === "Obligations"
  );
  const extent = d3.extent(latestYear, row => row.currentAmount);
  const colourScale = d3
    .scaleSequential(d3.interpolatePuBuGn)
    .domain(extent as [number, number]);

  features.forEach(feature => {
    const region = latestYear.find(row => {
      const country = whereAlpha3(row.countryCode);
      return country ? country.numeric === feature.id! : false;
    });
    context.beginPath();
    path(feature);
    context.fillStyle = region ? colourScale(region.currentAmount) : "Silver";
    context.fill();
  });

  context.beginPath();
  path(topojson.mesh(world as any));
  context.stroke();
});
