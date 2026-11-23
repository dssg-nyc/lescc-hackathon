import { useMemo } from "react";
import { StreetMap } from "../components/StreetMap";
import { TrendChart } from "../components/TrendChart";
import type { StoryData } from "../data/schema";
import { fmtInt, fmtUsd } from "./format";

interface DemographicsCardProps {
  data: StoryData["rings.json"];
  points: StoryData["points.json"] | null;
}

export function DemographicsCard({ data, points }: DemographicsCardProps) {
  const rings = useMemo(() => data.rings.map((r) => r.miles), [data.rings]);
  const dots = useMemo(
    () => (points ? { restaurants: points.restaurants, cultural: points.cultural_orgs } : undefined),
    [points],
  );
  const [main, ref] = data.area_trend;
  const first = main?.series[0];
  const latest = main?.series[main.series.length - 1];
  return (
    <div className="map-card">
      {points && (
        <StreetMap center={points.site} rings={rings} points={dots}
          title="Map: rings at 0.5, 1, and 2 miles around the site, with restaurants and cultural organizations" />
      )}
      <div>
        <table className="ring-table">
          <thead>
            <tr><th scope="col">Ring</th><th scope="col">Residents</th><th scope="col">Income*</th><th scope="col">Jobs</th></tr>
          </thead>
          <tbody>
            {data.rings.map((r) => (
              <tr key={r.miles}>
                <th scope="row">{r.miles} mi</th>
                <td>{fmtInt(r.population)}</td>
                <td>{fmtUsd(r.median_income_est)}</td>
                <td>{fmtInt(r.jobs?.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="card-meta">*Average of tract median household incomes, {data.release}.</p>
        {main && (
          <>
            <h2 className="card-h3 trend-h">Median household income, {main.geography}</h2>
            <TrendChart
              title={`Median household income in ${main.geography}, ${first?.year} to ${latest?.year}, with a ${data.projection?.year ?? ""} trend range`}
              main={{ label: main.geography, points: main.series.map((p) => ({ year: p.year, value: p.median })) }}
              reference={ref && { label: ref.geography, points: ref.series.map((p) => ({ year: p.year, value: p.median })) }}
              projection={data.projection}
            />
            <p className="card-sub">
              {fmtUsd(first?.median)} in {first?.year} to {fmtUsd(latest?.median)} in {latest?.year}.
              {data.projection && <> Trend range for {data.projection.year}: {fmtUsd(data.projection.low)}–{fmtUsd(data.projection.high)}.</>}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
