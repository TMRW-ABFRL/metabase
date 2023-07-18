import "__support__/ui-mocks";

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { createMockMetadata } from "__support__/metadata";
import { renderWithProviders } from "__support__/ui";
import type { DatetimeUnit } from "metabase-types/api/query";
import {
  createSampleDatabase,
  SAMPLE_DB_ID,
  ORDERS_ID,
  ORDERS,
  PRODUCTS,
} from "metabase-types/api/mocks/presets";
import Question from "metabase-lib/Question";
import Filter from "metabase-lib/queries/structured/Filter";
import StructuredQuery from "metabase-lib/queries/StructuredQuery";
import { FilterPopover } from "./FilterPopover";

const QUERY = Question.create({
  databaseId: SAMPLE_DB_ID,
  tableId: ORDERS_ID,
  metadata: createMockMetadata({
    databases: [createSampleDatabase()],
  }),
}).query() as StructuredQuery;

const RELATIVE_DAY_FILTER = new Filter(
  ["time-interval", ["field", ORDERS.CREATED_AT, null], -30, "day"],
  null,
  QUERY,
);

const NUMERIC_FILTER = new Filter(
  ["=", ["field", ORDERS.TOTAL, null], 1234],
  null,
  QUERY,
);

const STRING_CONTAINS_FILTER = new Filter(
  [
    "contains",
    ["field", PRODUCTS.TITLE, { "source-field": ORDERS.PRODUCT_ID }],
    "asdf",
  ],
  null,
  QUERY,
);

const dummyFunction = jest.fn();

const setup = ({
  filter,
  onChange = dummyFunction,
  onChangeFilter = dummyFunction,
  showFieldPicker = true,
}: {
  filter: Filter;
  query?: StructuredQuery;
  onChange?: (filter: Filter) => void;
  onChangeFilter?: (filter: Filter) => void;
  showFieldPicker?: boolean;
}) => {
  renderWithProviders(
    <FilterPopover
      query={QUERY}
      filter={filter}
      onChange={onChange}
      onChangeFilter={onChangeFilter}
      showFieldPicker={showFieldPicker}
    />,
  );
};

const dateType = (temporalUnit: DatetimeUnit) => ({
  "base-type": "type/DateTime",
  "temporal-unit": temporalUnit,
});

describe("FilterPopover", () => {
  describe("existing filter", () => {
    describe("DatePicker", () => {
      it("should render a date picker for a date filter", () => {
        setup({ filter: RELATIVE_DAY_FILTER });
        expect(screen.getByTestId("date-picker")).toBeInTheDocument();
      });
      it.each([
        {
          dateTypeLabel: "single day",
          mbql: ["=", ["field", ORDERS.CREATED_AT, null], "2018-01-23"],
          values: ["01/23/2018"],
        },
        {
          dateTypeLabel: "day range",
          mbql: [
            "between",
            ["field", ORDERS.CREATED_AT, null],
            "2018-01-23",
            "2018-02-10",
          ],
          values: ["01/23/2018", "02/10/2018"],
        },
        {
          dateTypeLabel: "single time",
          mbql: ["=", ["field", ORDERS.CREATED_AT, null], "2018-01-23T10:23"],
          values: ["01/23/2018", "10", "23"],
        },
        {
          dateTypeLabel: "time range",
          mbql: [
            "between",
            ["field", ORDERS.CREATED_AT, null],
            "2018-01-23T10:23",
            "2018-01-25T16:45",
          ],
          values: ["01/23/2018", "10", "23", "01/25/2018", "4", "45"],
        },
        {
          dateTypeLabel: "single month",
          mbql: [
            "=",
            ["field", ORDERS.CREATED_AT, dateType("month")],
            "2018-01-01",
          ],
          values: ["01/01/2018", "01/31/2018"],
        },
      ])(
        "should render a correctly initialized date picker for a $dateTypeLabel",
        ({ mbql, values }) => {
          setup({ filter: new Filter(mbql, null, QUERY) });
          const textboxes = screen.getAllByRole("textbox");
          expect(textboxes).toHaveLength(values.length);
          for (let i = 0; i < values.length; i++) {
            expect(textboxes[i]).toHaveValue(values[i]);
          }
        },
      );
    });
    describe("filter operator selection", () => {
      it("should have an operator selector", () => {
        setup({ filter: NUMERIC_FILTER });
        expect(screen.getByText("Equal to")).toBeInTheDocument();
        expect(screen.getByText("1,234")).toBeInTheDocument();
      });
    });
    describe("filter options", () => {
      it("should not show a control to the user if the filter has no options", () => {
        setup({ filter: RELATIVE_DAY_FILTER });
        expect(screen.queryByText("Include")).not.toBeInTheDocument();
        expect(screen.queryByText("today")).not.toBeInTheDocument();
      });

      it('should show "case-sensitive" option to the user for "contains" filters', () => {
        setup({ filter: STRING_CONTAINS_FILTER });
        expect(screen.getByText("Case sensitive")).toBeInTheDocument();
      });

      // Note: couldn't get it to work with React Testing library no matter what!
      // Tried to click on checkbox, label, their parent - nothing seems to be working, while it works fine in UI
      // eslint-disable-next-line jest/no-disabled-tests, jest/expect-expect
      it.skip("should let the user toggle an option", async () => {
        setup({ filter: RELATIVE_DAY_FILTER });
        const ellipsis = screen.getByLabelText("ellipsis icon");
        userEvent.click(ellipsis);
        const includeToday = await screen.findByText("Include today");
        userEvent.click(includeToday);
      });

      // eslint-disable-next-line jest/no-disabled-tests
      it.skip("should let the user toggle a date filter type", async () => {
        setup({ filter: RELATIVE_DAY_FILTER });
        const back = screen.getByLabelText("chevronleft icon");
        userEvent.click(back);
        expect(
          await screen.findByTestId("date-picker-shortcuts"),
        ).toBeInTheDocument();
      });

      // eslint-disable-next-line jest/no-disabled-tests
      it.skip("should let the user toggle a text filter type", async () => {
        setup({ filter: STRING_CONTAINS_FILTER });
        userEvent.click(await screen.findByText("Contains"));
        userEvent.click(await screen.findByText("Is"));

        expect(
          await screen.findByTestId("date-picker-shortcuts"),
        ).toBeInTheDocument();
      });
    });
  });
  describe("filter rendering", () => {
    describe("no-value filters", () => {
      it.each(["is-null", "not-null", "is-empty", "not-empty"])(
        "should not render picker or separator when selecting '%s' filter from the column dropdown",
        async operator => {
          setup({
            filter: new Filter(
              [operator, ["field", PRODUCTS.TITLE, null], null],
              null,
              QUERY,
            ),
            showFieldPicker: false,
          });

          expect(
            screen.getByTestId("empty-picker-placeholder"),
          ).toBeInTheDocument();
        },
      );
    });

    describe("non datetime filters", () => {
      it.each([
        { filter: STRING_CONTAINS_FILTER, label: "contains" },
        { filter: NUMERIC_FILTER, label: "equals" },
      ])(
        "should render the default filter picker and separator if the $label filter has arguments",
        async ({ filter }) => {
          setup({ filter });

          expect(
            screen.getByTestId("filter-popover-separator"),
          ).toBeInTheDocument();

          expect(
            screen.queryByTestId("default-filter-picker"),
          ).not.toBeInTheDocument();
        },
      );
    });
  });
});
