import React from "react";
import * as Lib from "metabase-lib";
import { ClickObject } from "metabase-lib/queries/drills/types";
import { Container, Divider } from "./ChartClickActions.styled";
import {
  getGroupedAndSortedActions,
  // getSectionContentDirection,
  getSectionTitle,
} from "./utils";
import { ChartClickActionsSection } from "./ChartClickActionsSection";
import { ChartClickActionControl } from "./ChartClickActionControl";

const QUERY_STAGE_INDEX = -1;

interface Props {
  clickActions: Lib.DrillThru[];
  query: Lib.Query;
  clicked: ClickObject;

  onClick: (action: Lib.DrillThru) => void;
}

export const ChartClickActionsView = ({
  clickActions,
  query,
  clicked,

  onClick,
}: Props): JSX.Element => {
  const [mappedClickActionsMap, mappedClickActions] = React.useMemo(() => {
    const map = new Map();

    const mappedClickActions = clickActions.map(drill => {
      const drillDisplayInfo = Lib.displayInfo(query, QUERY_STAGE_INDEX, drill);
      map.set(drillDisplayInfo, drill);

      return drillDisplayInfo;
    });

    return [map, mappedClickActions];
  }, [clickActions, query]);

  const sections = getGroupedAndSortedActions(mappedClickActions);
  const hasOnlyOneSection = sections.length === 1;

  return (
    <Container>
      {sections.map(({ key, actions }) => {
        const sectionTitle = getSectionTitle(key /*, actions*/);
        // const contentDirection = getSectionContentDirection(key, actions);
        const withBottomDivider = key === "records" && !hasOnlyOneSection;
        const withTopDivider = key === "details" && !hasOnlyOneSection;

        return (
          <ChartClickActionsSection
            key={key}
            type={key}
            title={sectionTitle}
            contentDirection={"column"}
          >
            {withTopDivider && <Divider />}
            {actions?.map((action, index) => (
              <ChartClickActionControl
                key={action?.type}
                action={action}
                clicked={clicked}
                onClick={(action, ...args) => {
                  const initialAction = mappedClickActionsMap.get(action);

                  onClick(initialAction, ...args);
                }}
              />
            ))}
            {withBottomDivider && <Divider />}
          </ChartClickActionsSection>
        );
      })}
    </Container>
  );
};
