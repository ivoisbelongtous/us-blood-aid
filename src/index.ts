import * as ISOCountries from "i18n-iso-countries";
import i18nCountry from "i18n-iso-countries/langs/en.json";
import * as d3 from "d3";
import * as topojson from "topojson";
import { GeometryCollection } from "topojson-specification";
import world from "world-atlas/world/110m.json";

import { parseAidRecord } from "parse";

(async () => {
  ISOCountries.registerLocale(i18nCountry);

  const width = 960;
  const height = 600;

  const svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const features = topojson.feature(
    world as any,
    world.objects.countries as GeometryCollection
  ).features;

  const path = d3.geoPath(d3.geoEqualEarth());

  const rows = await d3.csv(
    require("us_foreign_aid_country_deduped.csv"),
    parseAidRecord
  );

  const latestYear = rows.filter(
    row =>
      row.fiscalYear.getFullYear() === 2017 &&
      row.countryName !== "World" &&
      row.transactionTypeName === "Obligations"
  );
  const extent = d3.extent(latestYear, row =>
    row.currentAmount >= 1 ? row.currentAmount : undefined
  );
  const colourScale = d3
    // @ts-ignore
    .scaleSequentialLog(d3.interpolatePuBuGn)
    .domain(extent as [number, number]);

  const getSpendingInRegion = (countryId: number): number | undefined => {
    const region = latestYear.find(
      row => Number(ISOCountries.alpha3ToNumeric(row.countryCode)) === countryId
    );
    return region && region.currentAmount;
  };

  svg
    .append("g")
    .selectAll("path")
    .data(features)
    .join("path")
    .attr("fill", d => {
      const spending = getSpendingInRegion(Number(d.id));
      return spending ? colourScale(spending) : "Silver";
    })
    .attr("d", path)
    .append("title")
    .text(d => {
      const countryID = Number(d.id);
      const country = ISOCountries.getName(countryID, "en");
      const countryString = country ? `${country} - ` : "";
      const spending = getSpendingInRegion(countryID);
      const spendingString = spending ? `$${spending.toLocaleString()}` : "N/A";

      return countryString + spendingString;
    });

  svg
    .append("path")
    .datum(topojson.mesh(world as any)!)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-linejoin", "round")
    .attr("d", path);
})();
