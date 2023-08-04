import _ from "underscore";
import { t } from "ttag";
import type { RegularClickAction } from "metabase/modes/types";
import { ClickActionSection } from "metabase/modes/types";
import * as Lib from "metabase-lib";
import { isNotNull } from "metabase/core/utils/types";

type Section = {
  icon?: string;
  index?: number;

  drills: string[];
  additionalWidgets?: string[];
};

export const SECTIONS: Record<ClickActionSection, Section> = {
  records: {
    icon: "table2",
    drills: [],
  },
  zoom: {
    icon: "zoom_in",
    drills: [],
  },
  sort: {
    icon: "sort",

    drills: ["drill-thru/sort"],
    additionalWidgets: ["formatting"],
  },
  breakout: {
    icon: "breakout",
    drills: [],
  },
  "breakout-popover": {
    icon: "breakout",
    drills: [],
  },
  standalone_filter: {
    icon: "filter",
    drills: [],
  },
  // There is no such icon as "summarize." This is used to ID and select the actions that we,
  // want to make larger, like Distribution, Sum over Time, etc.
  summarize: {
    icon: "summarize",

    drills: ["drill-thru/column-filter"],
  },
  sum: {
    icon: "sum",
    drills: [],
  },
  auto: {
    icon: "bolt",
    drills: [],
  },
  "auto-popover": {
    icon: "bolt",
    drills: [],
  },
  info: {
    icon: "info",
    drills: [],
  },
  filter: {
    icon: "funnel_outline",
    drills: [],
  },
  details: {
    icon: "document",
    drills: [],
  },
};
Object.values(SECTIONS).map((section, index) => {
  section.index = index;
});

export const getGroupedAndSortedActions = (
  clickActions: Lib.DrillThruDisplayInfo[],
) => {
  const clickActionsMapByType = _.groupBy(clickActions, "type");

  // const groupedClickActions = _.groupBy(clickActions, "section") as {
  //   [key in ClickActionSection]?: RegularClickAction[];
  // };
  //
  // if (groupedClickActions["sum"]?.length === 1) {
  //   // if there's only one "sum" click action, merge it into "summarize" and change its button type and icon
  //   if (!groupedClickActions["summarize"]) {
  //     groupedClickActions["summarize"] = [];
  //   }
  //   groupedClickActions["summarize"].push({
  //     ...groupedClickActions["sum"][0],
  //     buttonType: "horizontal",
  //     icon: "number",
  //   });
  //   delete groupedClickActions["sum"];
  // }
  // if (groupedClickActions["sort"]?.length === 1) {
  //   // restyle the Formatting action when there is only one option
  //   groupedClickActions["sort"][0] = {
  //     ...groupedClickActions["sort"][0],
  //     buttonType: "horizontal",
  //   };
  // }
  //
  // return _.chain(groupedClickActions)
  //   .pairs()
  //   .sortBy(([key]) => (SECTIONS[key] ? SECTIONS[key].index : 99))
  //   .value();

  const data = Object.entries(SECTIONS)
    .map(([key, sectionConfig]) => {
      return {
        key,
        actions: sectionConfig.drills
          .map(drillKey => clickActionsMapByType[drillKey]?.[0])
          .filter(isNotNull),
        additionalWidgets: sectionConfig.additionalWidgets,
      };
    })
    .filter(({ actions }) => actions?.length);

  // console.log(data);

  return data;

  // return _.sortBy(clickActions, ({ type }) => DRILLS_ORDER_MAP[type] || 99);
};

export const getGALabelForAction = (action: RegularClickAction) =>
  action ? `${action.section || ""}:${action.name || ""}` : null;

const getFilterValueType = (
  actions: RegularClickAction[],
): string | undefined => {
  const value = actions[0]?.extra?.().valueType;
  return typeof value === "string" ? value : undefined;
};

const getFilterColumnName = (
  actions: RegularClickAction[],
): string | undefined => {
  const value = actions[0]?.extra?.().columnName;
  return typeof value === "string" ? value : undefined;
};

export const getFilterSectionTitle = (actions: RegularClickAction[]) => {
  const valueType = getFilterValueType(actions);
  const columnName = getFilterColumnName(actions);

  if (valueType === "date") {
    return t`Filter by this date`;
  }

  if (valueType === "text") {
    return t`Filter by ${columnName || t`this text`}`;
  }

  return t`Filter by this value`;
};

export const getSectionTitle = (
  sectionKey: string,
  actions: Lib.DrillThruDisplayInfo[],
): string | null => {
  switch (sectionKey) {
    // case "filter":
    //   return getFilterSectionTitle(actions);

    case "sum":
      return t`Summarize`;

    case "auto-popover":
      return t`Automatic insights…`;

    case "breakout-popover":
      return t`Break out by…`;
  }

  return null;
};

export type ContentDirectionType = "column" | "row";

export const getSectionContentDirection = (
  sectionKey: string,
  actions: Lib.DrillThruDisplayInfo[],
  additionalWidgets?: string[],
): ContentDirectionType => {
  switch (sectionKey) {
    case "sum":
      return "row";

    // case "filter": {
    //   const valueType = getFilterValueType(actions);
    //
    //   if (valueType && ["boolean", "numeric", "null"].includes(valueType)) {
    //     return "row";
    //   }
    //   break;
    // }

    case "sort": {
      if ([...actions, ...(additionalWidgets || [])].length > 1) {
        return "row";
      }
    }
  }

  return "column";
};

export type ExtraPopoverProps = object; // TODO: add proper typing
