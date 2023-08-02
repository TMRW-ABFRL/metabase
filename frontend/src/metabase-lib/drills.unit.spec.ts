// eslint-disable-next-line no-restricted-imports
import { checkNotNull } from "metabase/core/utils/types";
import { displayInfo } from "metabase-lib/metadata";
import { orderableColumns } from "metabase-lib/order_by";
import { toLegacyQuery } from "metabase-lib/query";
import { availableDrillThrus, drillThru } from "./drills";
import { columnFinder, createQuery } from "./test-helpers";

describe("availableDrillThrus", () => {
  it("should return list of available drills", () => {
    const query = createQuery();
    const stageIndex = -1;
    const columns = orderableColumns(query, stageIndex);
    const column = columnFinder(query, columns)("ORDERS", "SUBTOTAL");

    expect(
      availableDrillThrus(
        query,
        stageIndex,
        column,
        /* value */ undefined,
        /* row */ null,
        /* dimensions */ null,
      ).map(drill => displayInfo(query, stageIndex, drill)),
    ).toEqual([
      { type: "drill-thru/distribution" },
      {
        type: "drill-thru/column-filter",
        initialOp: expect.objectContaining({ short: "=" }),
      },
      {
        type: "drill-thru/sort",
        directions: ["asc", "desc"],
      },
      {
        type: "drill-thru/summarize-column",
        aggregations: ["distinct", "sum", "avg"],
      },
      { type: "drill-thru/summarize-column-by-time" },
    ]);
  });
});

describe("drillThru", () => {
  it("should apply sort drill", () => {
    const query = createQuery();
    const stageIndex = -1;
    const columns = orderableColumns(query, stageIndex);
    const column = columnFinder(query, columns)("ORDERS", "SUBTOTAL");

    const drills = availableDrillThrus(
      query,
      stageIndex,
      column,
      undefined,
      null,
      null,
    );

    const sortDrill = checkNotNull(
      drills.find(
        drill =>
          displayInfo(query, stageIndex, drill)?.type === "drill-thru/sort",
      ),
    );

    const updatedQuery = drillThru(query, stageIndex, sortDrill, "asc");

    expect(toLegacyQuery(updatedQuery)).toEqual({});
  });
});
