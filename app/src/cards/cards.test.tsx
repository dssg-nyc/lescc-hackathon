import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LoadedStory } from "../data/loadStoryData";
import { SCHEMAS, type DataFile } from "../data/schema";
import { CARDS } from "../story/config";
import { CardBody } from "./CardBody";

function realStory(): LoadedStory {
  const out: Record<string, unknown> = {};
  for (const name of Object.keys(SCHEMAS) as DataFile[]) {
    const raw = JSON.parse(readFileSync(resolve(__dirname, "../../public/data", name), "utf8"));
    out[name] = { ok: true, data: SCHEMAS[name].parse(raw) };
  }
  return out as LoadedStory;
}

function card(id: string) {
  const c = CARDS.find((x) => x.id === id);
  if (!c) throw new Error(id);
  return c;
}

const base = () => ({
  story: realStory(),
  vote: null,
  onVote: vi.fn(),
  onAnswered: vi.fn(),
  onStart: vi.fn(),
  tally: null,
});

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});

describe("cards with real data", () => {
  it("crowd shows the latest count and the station", () => {
    render(<CardBody card={card("crowd")} {...base()} />);
    expect(screen.getByTestId("countup-final")).toHaveTextContent("8,773");
    expect(screen.getByText(/Delancey Street between Orchard Street and Ludlow Street/i)).toBeInTheDocument();
  });

  it("quiz hides counts until a guess, then reveals both and reports the answer", () => {
    const props = base();
    render(<CardBody card={card("quiz")} {...props} />);
    expect(screen.queryByTestId("countup-final")).toBeNull();
    fireEvent.click(screen.getByRole("radio", { name: /art and cultural/i }));
    expect(screen.getAllByTestId("countup-final").map((n) => n.textContent)).toEqual(["622", "60"]);
    expect(screen.getByText(/not quite/i)).toBeInTheDocument();
    expect(props.onAnswered).toHaveBeenCalled();
  });

  it("residents leads with the largest group", () => {
    render(<CardBody card={card("residents")} {...base()} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Asian");
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("Asian");
  });

  it("address shows the big address, the lot facts, and marks unsourced history", () => {
    render(<CardBody card={card("address")} {...base()} />);
    expect(screen.getByText("76 DELANCEY ST")).toBeInTheDocument();
    expect(screen.getByText(/1926/)).toBeInTheDocument();
    expect(screen.getByText(/to research/i)).toBeInTheDocument();
  });

  it("history shows the archival Allen Street image and caption", () => {
    render(<CardBody card={card("history")} {...base()} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/assets/aistudio/image_ace336c1.png");
    expect(screen.getByText("The former public bathroom as part of the above ground train on Allen Street")).toBeInTheDocument();
  });

  it("demographics renders a table row per ring", () => {
    render(<CardBody card={card("demographics")} {...base()} />);
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(4); // header + 3 rings
    expect(rows[1]).toHaveTextContent("0.5 mi");
    expect(rows[1]).toHaveTextContent("69,971");
  });

  it("demographics shows the CD3 income trend and the labelled trend range", () => {
    render(<CardBody card={card("demographics")} {...base()} />);
    expect(screen.getByText(/\$42,656 in 2013 to \$59,411 in 2024/)).toBeInTheDocument();
    expect(screen.getByText(/trend range for 2029: \$69,067–\$78,230/i)).toBeInTheDocument();
  });

  it("value shows food-service vs arts jobs and labels missing revenue as awaiting data", () => {
    render(<CardBody card={card("value")} {...base()} />);
    expect(screen.getByText(/food service jobs/i)).toBeInTheDocument();
    expect(screen.getAllByText(/awaiting data/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/not food truck/i)).toBeInTheDocument();
  });

  it("summary asks for a vote and sends the choice", () => {
    const props = base();
    render(<CardBody card={card("summary")} {...props} />);
    fireEvent.click(screen.getByRole("radio", { name: /cultural center/i }));
    expect(props.onVote).toHaveBeenCalledWith("cultural_center");
  });

  it("results shows the visitor's pick and says when the tally is unavailable", () => {
    render(<CardBody card={card("results")} {...base()} vote="food_truck" />);
    expect(screen.getByText(/you voted/i)).toHaveTextContent(/food truck/i);
    expect(screen.getByText(/results unavailable/i)).toBeInTheDocument();
  });

  it("a card whose file failed shows the error state, not a number", () => {
    const story = realStory();
    const broken = { ...story, "foot.json": { ok: false as const, error: "foot.json: HTTP 500" } };
    render(<CardBody card={card("crowd")} {...base()} story={broken} />);
    expect(screen.getByText(/data unavailable/i)).toBeInTheDocument();
  });
});
