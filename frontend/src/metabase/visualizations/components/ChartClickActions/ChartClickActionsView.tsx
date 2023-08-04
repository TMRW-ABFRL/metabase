import React from "react";
import { t } from "ttag";
import * as Lib from "metabase-lib";
import { ClickActionPopoverProps } from "metabase/modes/types";
import { VisualizationSettings } from "metabase-types/api";
import { color } from "metabase/lib/colors";
import { ClickObject } from "metabase-lib/queries/drills/types";
import Question from "metabase-lib/Question";
import { ModeType } from "metabase-lib/Mode/types";
import {
  ClickActionButtonIcon,
  HorizontalClickActionButton,
} from "./ChartClickActionControl.styled";
import { ColumnFilterDrillWidget } from "./drill-widgets/ColumnFilterDrillWidget";
import { SortDrillWidget } from "./drill-widgets/SortDrillWidget";
import {
  ColumnFormattingWidget,
  shouldDisplayFormatWidget,
} from "./drill-widgets/ColumnFormattingWidget";
import { Container /*, Divider*/ } from "./ChartClickActions.styled";
import {
  ExtraPopoverProps,
  // getGroupedAndSortedActions,
  // getSectionContentDirection,
  // getSectionTitle,
} from "./utils";
import { ChartClickActionsSection } from "./ChartClickActionsSection";

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
  const sortAction = typeToDisplayMap.get("drill-thru/sort");
  const columnFilterAction = typeToDisplayMap.get("drill-thru/column-filter");
  const columnDistributionDrill = typeToDisplayMap.get(
    "drill-thru/distribution",
  );

  return (
    <Container>
      {(displayFormatWidget || sortAction) && (
        <ChartClickActionsSection
          type="sort"
          contentDirection={sortAction ? "row" : "column"}
        >
          {sortAction && (
            <SortDrillWidget
              action={sortAction}
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

      {columnFilterAction && (
        <ColumnFilterDrillWidget
          action={columnFilterAction}
          clicked={clicked}
          query={query}
          question={question}
          onApplyDrill={handleApplyDrill}
          onShowPopover={onShowPopover}
        />
      )}

      {columnDistributionDrill && (
        <HorizontalClickActionButton
          small
          icon={<ClickActionButtonIcon name="bar" />}
          iconColor={color("brand")}
          onClick={() => handleApplyDrill(columnDistributionDrill)}
        >{t`Distribution`}</HorizontalClickActionButton>
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
