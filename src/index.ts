import * as ISOCountries from "i18n-iso-countries";
import i18nCountry from "i18n-iso-countries/langs/en.json";
import * as d3 from "d3";
import * as topojson from "topojson";
import { GeometryCollection } from "topojson-specification";
import world from "world-atlas/world/110m.json";

import { parseAidRecord, parseTradeRecord } from "parse";

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

  const aidRows = await d3.csv(
    require("us_foreign_aid_country_deduped.csv"),
    parseAidRecord
  );
  const tradeRows = await d3.csv(
    require("us_trade_by_country.csv"),
    parseTradeRecord
  );

  const year = 2017;

  const aidYear = aidRows.filter(
    row =>
      row.fiscalYear.getFullYear() === year &&
      row.countryName !== "World" &&
      row.transactionTypeName === "Obligations"
  );
  const tradeYear = tradeRows.filter(row => row.year.getFullYear() === year);

  const aidExtent = d3.extent(aidYear, row =>
    row.currentAmount >= 1 ? row.currentAmount : undefined
  );
  const aidColourScale = d3
    // @ts-ignore
    .scaleSequentialLog(d3.interpolatePuBuGn)
    .domain(aidExtent as [number, number]);

  const getSpendingInRegion = (countryId: number): number | undefined => {
    const region = aidYear.find(
      row => Number(ISOCountries.alpha3ToNumeric(row.countryCode)) === countryId
    );
    return region && region.currentAmount;
  };

  const getTradingInRegion = (
    countryId: number
  ): [number, number] | undefined => {
    const region = tradeYear.find(
      row =>
        Number(ISOCountries.alpha2ToNumeric(row.countryISOCode)) === countryId
    );
    return region && [region.imports.total, region.exports.total];
  };

  svg
    .append("g")
    .selectAll("path")
    .data(features)
    .join("path")
    .attr("fill", d => {
      const spending = getSpendingInRegion(Number(d.id));
      return spending ? aidColourScale(spending) : "Silver";
    })
    .attr("d", path)
    .append("title")
    .text(d => {
      const countryID = Number(d.id);

      const country = ISOCountries.getName(countryID, "en");
      const countryString = country ? `${country} - ` : "";

      const spending = getSpendingInRegion(countryID);
      const spendingString = spending ? `$${spending.toLocaleString()}` : "N/A";

      const trading = getTradingInRegion(countryID);
      const tradingString = trading
        ? `\n$${trading[0].toLocaleString()}/$${trading[1].toLocaleString()}`
        : "";

      return countryString + spendingString + tradingString;
    });

  svg
    .append("path")
    .datum(topojson.mesh(world as any)!)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-linejoin", "round")
    .attr("d", path);
})();
