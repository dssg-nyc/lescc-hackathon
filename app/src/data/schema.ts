// Zod contract for public/data/*.json (written by scripts/build_data.py).
// Numbers may be null: the card shows "awaiting data". Strings never stand in for numbers.
import { z } from "zod";

const num = z.number().nullable();
const count = z.number().int().nonnegative().nullable();

const Source = z.object({
  name: z.string().min(1),
  url: z.string().url().nullable(),
  pulled: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
});

const Envelope = z.object({
  generated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["ok", "partial", "awaiting"]),
  caveat: z.string().min(1),
  sources: z.array(Source).min(1),
});

const Period = z.object({
  period: z.string(),
  year: z.number().int(),
  am: count,
  md: count,
  pm: count,
  total: count,
});

export const FootSchema = Envelope.extend({
  station: z.object({
    loc: z.number().int(),
    street: z.string(),
    from: z.string(),
    to: z.string(),
    miles_from_site: z.number(),
  }),
  latest: Period,
  series: z.array(Period).min(1),
});

export const QuizSchema = Envelope.extend({
  question: z.string(),
  options: z.array(z.object({ id: z.enum(["restaurants", "cultural"]), label: z.string(), count })).length(2),
  answer: z.enum(["restaurants", "cultural"]).nullable(),
  ratio: num,
});

export const AcsSchema = Envelope.extend({
  geography: z.string(),
  release: z.string(),
  population: count,
  median_household_income: num,
  groups: z.array(z.object({ label: z.string(), count, share: z.number().min(0).max(1) })).min(1),
});

const TimelinePoint = z.object({
  year: z.number().int().nullable(),
  text: z.string(),
  status: z.enum(["sourced", "to_research"]),
  source: z.string().nullable(),
});

const Lot = z.object({
  year: z.number().int(),
  found: z.boolean(),
  bldgclass: z.string().nullable().optional(),
  landuse: num.optional(),
  yearbuilt: num.optional(),
  bldgarea: num.optional(),
  assesstot: num.optional(),
});

export const SiteSchema = Envelope.extend({
  address: z.string(),
  lat: z.number(),
  lon: z.number(),
  bbl: z.string(),
  lot: Lot.nullable(),
  lot_history: z.array(Lot),
  timeline: z.array(TimelinePoint).min(1),
});

const Jobs = z.object({ total: count, arts: count, food: count });
const RingStat = z.object({ population: count, median_income_est: num, tracts: z.number().int() });
const RingKey = z.enum(["0.5", "1.0", "2.0"]);

export const RingsSchema = Envelope.extend({
  release: z.string(),
  rings: z.array(RingStat.extend({ miles: z.number(), jobs: Jobs.nullable().optional() })).length(3),
  income_trend: z.array(z.object({ release: z.string(), rings: z.record(RingKey, RingStat) })).nullable(),
  projection: z
    .object({ year: z.number().int(), low: z.number(), high: z.number(), method: z.string() })
    .nullable(),
});

export const ValueSchema = Envelope.extend({
  jobs_trend: z.array(Jobs.extend({ year: z.number().int() })).min(1),
  food_supply: z.object({
    restaurants: z.record(RingKey, count),
    cultural_orgs: z.record(RingKey, count),
  }),
  concession_comparables: z.array(
    z.object({ name: z.string(), period: z.string(), gross: z.number(), fee: z.number() }),
  ),
  proposal: z.record(z.string(), z.number()),
  food_truck_revenue: z.object({ low: z.number(), high: z.number(), basis: z.string() }).nullable(),
  arts_center_revenue: z.object({ low: z.number(), high: z.number(), basis: z.string() }).nullable(),
});

/** Response of the vote API (Phase 4b). */
export const VotesSchema = z.object({
  food_truck: z.number().int().nonnegative(),
  cultural_center: z.number().int().nonnegative(),
});

export const SCHEMAS = {
  "foot.json": FootSchema,
  "quiz.json": QuizSchema,
  "acs.json": AcsSchema,
  "site.json": SiteSchema,
  "rings.json": RingsSchema,
  "value.json": ValueSchema,
} as const;

export type DataFile = keyof typeof SCHEMAS;
export type StoryData = { [K in DataFile]: z.infer<(typeof SCHEMAS)[K]> };
export type Votes = z.infer<typeof VotesSchema>;
