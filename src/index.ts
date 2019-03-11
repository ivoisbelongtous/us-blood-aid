import * as ISOCountries from "i18n-iso-countries";
import i18nCountry from "i18n-iso-countries/langs/en.json";
import * as d3 from "d3";
import { Feature } from "geojson";
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

  const drawTradingArrows = (targetFeature: Feature) => {
    const g = svg
      .selectAll("g.trading-arrows")
      .data([targetFeature.id], d => String(d))
      .join("g")
      .attr("class", "trading-arrows")
      .attr("fill", "none");

    g.append("path")
      .attr("stroke", "red")
      .attr("stroke-width", d => {
        const trading = getTradingInRegion(Number(d));
        if (trading) {
          return widthScale.domain([0, d3.sum(trading)])(trading[1]);
        } else {
          return null;
        }
      })
      .attr("d", d => {
        const targetCountry = features.find(feature => feature.id === d);
        if (targetCountry) {
          const targetCentroid = path.centroid(targetCountry);
          return line([
            usCentroid,
            [
              (usCentroid[0] + targetCentroid[0]) * 0.56,
              (usCentroid[1] + targetCentroid[1]) * 0.44
            ],
            targetCentroid
          ]);
        } else {
          return null;
        }
      });
    g.append("path")
      .attr("stroke", "blue")
      .attr("stroke-width", d => {
        const trading = getTradingInRegion(Number(d));
        if (trading) {
          return widthScale.domain([0, d3.sum(trading)])(trading[0]);
        } else {
          return null;
        }
      })
      .attr("d", d => {
        const targetCountry = features.find(feature => feature.id === d);
        if (targetCountry) {
          const targetCentroid = path.centroid(targetCountry);
          return line([
            targetCentroid,
            [
              (usCentroid[0] + targetCentroid[0]) * 0.44,
              (usCentroid[1] + targetCentroid[1]) * 0.56
            ],
            usCentroid
          ]);
        } else {
          return null;
        }
      });
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
    .on("mouseover", drawTradingArrows)
    .append("title")
    .text(d => {
      const countryID = Number(d.id);

      const country = ISOCountries.getName(countryID, "en");
      const countryString = country ? `${country} - ` : "";

      const spending = getSpendingInRegion(countryID);
      const spendingString = spending ? `$${spending.toLocaleString()}` : "N/A";

      const trading = getTradingInRegion(countryID);
      const tradingStrings =
        trading && trading.map(t => (t * 1000000).toLocaleString());
      const tradingString = tradingStrings
        ? `\n$${tradingStrings[0]}/$${tradingStrings[1]}`
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

  const line = d3.line().curve(d3.curveBasis);
  const usCentroid = path.centroid(
    features.find(feature => feature.id === "840")!
  );
  const widthScale = d3.scaleLinear().range([1, 5]);
})();
