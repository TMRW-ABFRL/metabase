import React from "react";
import * as Lib from "metabase-lib";
import { ClickActionPopoverProps } from "metabase/modes/types";
import { VisualizationSettings } from "metabase-types/api";
import { ColumnValuesDistributionDrillWidget } from "metabase/visualizations/components/ChartClickActions/drill-widgets/ColumnValuesDistributionDrillWidget";
import { SummarizeColumnDrillWidget } from "metabase/visualizations/components/ChartClickActions/drill-widgets/SummarizeColumnDrillWidget";
import { SummarizeColumnByTimeDrillWidget } from "metabase/visualizations/components/ChartClickActions/drill-widgets/SummarizeColumnByTimeDrillWidget";
import { QuickFilterDrillWidget } from "metabase/visualizations/components/ChartClickActions/drill-widgets/QuickFilterDrillWidget";
import { ClickObject } from "metabase-lib/queries/drills/types";
import Question from "metabase-lib/Question";
import { ModeType } from "metabase-lib/Mode/types";
import { ColumnFilterDrillWidget } from "./drill-widgets/ColumnFilterDrillWidget";
import { SortDrillWidget } from "./drill-widgets/SortDrillWidget";
import {
  ColumnFormattingWidget,
  shouldDisplayFormatWidget,
} from "./drill-widgets/ColumnFormattingWidget";
import { Container /*, Divider*/ } from "./ChartClickActions.styled";
import { ExtraPopoverProps } from "./utils";
import { ChartClickActionsSection } from "./components/ChartClickActionsSection";

const QUERY_STAGE_INDEX = -1;

interface Props {
  mode: ModeType | null;
  clickActions: Lib.DrillThru[];
  query: Lib.Query;
  question: Question;
  clicked: ClickObject;

  onApplyDrill: (action: Lib.DrillThru, ...args: any[]) => void;
  onShowPopover: (
    Popover: React.FC<ClickActionPopoverProps>,
    popoverProps?: ExtraPopoverProps,
  ) => void;
  onUpdateVisualizationSettings: (settings: VisualizationSettings) => void;
}

export const ChartClickActionsView = ({
  mode,
  clickActions,
  query,
  clicked,
  question,

  onApplyDrill,
  onShowPopover,
  onUpdateVisualizationSettings,
}: Props): JSX.Element => {
  const [displayToOpaqueMap, typeToDisplayMap] = React.useMemo(() => {
    const displayToOpaqueMap = new Map();
    const typeToDisplayMap = new Map();

    clickActions.forEach(drill => {
      const drillDisplayInfo = Lib.displayInfo(query, QUERY_STAGE_INDEX, drill);
      displayToOpaqueMap.set(drillDisplayInfo, drill);

      typeToDisplayMap.set(drillDisplayInfo.type, drillDisplayInfo);
    });

    return [displayToOpaqueMap, typeToDisplayMap];
  }, [clickActions, query]);

  const handleApplyDrill = (
    action: Lib.DrillThruDisplayInfo,
    ...args: any[]
  ) => {
    const initialOpaqueAction = displayToOpaqueMap.get(action);

    onApplyDrill(initialOpaqueAction, ...args);
  };

  // const sections = getGroupedAndSortedActions(mappedClickActions);
  // const hasOnlyOneSection = sections.length === 1;

  const displayFormatWidget = shouldDisplayFormatWidget(clicked, question);
  const sortDrill = typeToDisplayMap.get("drill-thru/sort");
  const columnFilterDrill = typeToDisplayMap.get("drill-thru/column-filter");
  const columnValuesDistributionDrill = typeToDisplayMap.get(
    "drill-thru/distribution",
  );
  const summarizeColumnByTimeDrill = typeToDisplayMap.get(
    "drill-thru/summarize-column-by-time",
  );
  const summarizeColumnDrill = typeToDisplayMap.get(
    "drill-thru/summarize-column",
  );
  const quickFilterDrill = typeToDisplayMap.get("drill-thru/quick-filter");

  return (
    <Container>
      {(displayFormatWidget || sortDrill) && (
        <ChartClickActionsSection
          type="sort"
          contentDirection={sortDrill ? "row" : "column"}
        >
          {sortDrill && (
            <SortDrillWidget
              action={sortDrill}
              clicked={clicked}
              onApplyDrill={handleApplyDrill}
            />
          )}
          {displayFormatWidget && (
            <ColumnFormattingWidget
              clicked={clicked}
              question={question}
              onShowPopover={onShowPopover}
              onUpdateVisualizationSettings={onUpdateVisualizationSettings}
            />
          )}
        </ChartClickActionsSection>
      )}

      {columnFilterDrill && (
        <ColumnFilterDrillWidget
          action={columnFilterDrill}
          clicked={clicked}
          query={query}
          question={question}
          onApplyDrill={handleApplyDrill}
          onShowPopover={onShowPopover}
        />
      )}

      {summarizeColumnByTimeDrill && (
        <SummarizeColumnByTimeDrillWidget
          action={summarizeColumnByTimeDrill}
          onApplyDrill={handleApplyDrill}
        />
      )}

      {columnValuesDistributionDrill && (
        <ColumnValuesDistributionDrillWidget
          action={columnValuesDistributionDrill}
          onApplyDrill={handleApplyDrill}
        />
      )}

      {summarizeColumnDrill && (
        <SummarizeColumnDrillWidget
          action={summarizeColumnDrill}
          onApplyDrill={handleApplyDrill}
        />
      )}

      {quickFilterDrill && (
        <QuickFilterDrillWidget
          action={quickFilterDrill}
          clicked={clicked}
          onApplyDrill={handleApplyDrill}
        />
      )}

      {/*{sections.map(({ key, actions, additionalWidgets }) => {
        const sectionTitle = getSectionTitle(key, actions);
        const contentDirection = getSectionContentDirection(
          key,
          actions,
          additionalWidgets,
        );
        const withBottomDivider = key === "records" && !hasOnlyOneSection;
        const withTopDivider = key === "details" && !hasOnlyOneSection;

        const withFormattingWidget = additionalWidgets?.includes("formatting");

        return (
          <ChartClickActionsSection
            key={key}
            type={key}
            title={sectionTitle}
            contentDirection={contentDirection}
          >
            {withTopDivider && <Divider />}
            {actions?.map((action, index) => (
              <ChartClickActionControl
                key={action?.type}
                action={action}
                clicked={clicked}
                query={query}
                question={question}
                onClick={(action, ...args) => {
                  const initialOpaqueAction = displayToOpaqueMap.get(action);

                  onApplyDrill(initialOpaqueAction, ...args);
                }}
                onShowPopover={onShowPopover}
              />
            ))}

            {withBottomDivider && <Divider />}
          </ChartClickActionsSection>
        );
      })}*/}
    </Container>
  );
};
