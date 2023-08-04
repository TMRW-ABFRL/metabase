import { t } from "ttag";
import { Icon, IconName } from "metabase/core/components/Icon";
import Tooltip from "metabase/core/components/Tooltip";
import * as Lib from "metabase-lib";
import { ClickObject } from "metabase-lib/queries/drills/types";
import { SortControl } from "../components/ChartClickActionControl.styled";

const SORT_ACTIONS = {
  asc: {
    name: "sort-ascending",
    icon: "arrow_up" as IconName,
    tooltip: t`Sort ascending`,
  },
  desc: {
    name: "sort-descending",
    icon: "arrow_down" as IconName,
    tooltip: t`Sort descending`,
  },
};

interface Props {
  action: Lib.SortDrillThruInfo;
  clicked: ClickObject;
  onApplyDrill: (
    action: Lib.DrillThruDisplayInfo,
    direction: "asc" | "desc",
  ) => void;
}

export const SortDrillWidget = ({
  action,
  onApplyDrill,
}: Props): JSX.Element => {
  const { directions } = action;

  return (
    <>
      {directions.map(direction => {
        const config = SORT_ACTIONS[direction];

        return (
          <Tooltip key={direction} tooltip={config.tooltip}>
            <SortControl
              onlyIcon
              onClick={() => onApplyDrill(action, direction)}
            >
              <Icon size={12} name={config.icon} />
            </SortControl>
          </Tooltip>
        );
      })}
    </>
  );
};
