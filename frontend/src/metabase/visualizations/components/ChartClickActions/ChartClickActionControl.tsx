// import {
//   ClickAction,
//   ClickActionButtonType,
//   isRegularClickAction,
// } from "metabase/modes/types";
import Tooltip from "metabase/core/components/Tooltip";
import { color } from "metabase/lib/colors";
import { Icon, IconName } from "metabase/core/components/Icon";
import { SortDrillWidget } from "metabase/visualizations/components/ChartClickActions/SortDrillWidget";
import * as Lib from "metabase-lib";
import { ClickObject } from "metabase-lib/queries/drills/types";
import {
  ClickActionButtonIcon,
  FormattingControl,
  HorizontalClickActionButton,
  IconWrapper,
  InfoControl,
  SortControl,
  TokenActionButton,
  TokenFilterActionButton,
} from "./ChartClickActionControl.styled";

interface Props {
  action: Lib.DrillThruDisplayInfo;
  clicked: ClickObject;
  onClick: (action: Lib.DrillThruDisplayInfo) => void;
}

export const ChartClickActionControl = ({
  action,
  clicked,
  onClick,
}: Props): JSX.Element | null => {
  // if (!isRegularClickAction(action)) {
  //   return null;
  // }

  const { type } = action;

  switch (type) {
    case "token-filter":
      return (
        <TokenFilterActionButton
          small
          icon={
            typeof action.icon === "string" && (
              <ClickActionButtonIcon
                name={action.icon as unknown as IconName}
              />
            )
          }
          onClick={() => onClick(action)}
        >
          {action.title}
        </TokenFilterActionButton>
      );

    case "token":
      return (
        <TokenActionButton small onClick={() => onClick(action)}>
          {action.title}
        </TokenActionButton>
      );

    case "sort":
      return (
        <Tooltip tooltip={action.tooltip}>
          <SortControl onlyIcon onClick={() => onClick(action)}>
            {typeof action.icon === "string" && (
              <Icon size={12} name={action.icon as unknown as IconName} />
            )}
          </SortControl>
        </Tooltip>
      );

    case "formatting":
      return (
        <Tooltip tooltip={action.tooltip}>
          <FormattingControl onlyIcon onClick={() => onClick(action)}>
            {typeof action.icon === "string" && (
              <Icon size={16} name={action.icon as unknown as IconName} />
            )}
          </FormattingControl>
        </Tooltip>
      );

    case "horizontal":
      return (
        <HorizontalClickActionButton
          small
          icon={
            action.icon ? (
              typeof action.icon === "string" ? (
                <ClickActionButtonIcon
                  name={action.icon as unknown as IconName}
                />
              ) : (
                <IconWrapper>{action.icon}</IconWrapper>
              )
            ) : null
          }
          iconColor={color("brand")}
          onClick={() => onClick(action)}
        >
          {action.title}
        </HorizontalClickActionButton>
      );

    case "info":
      return <InfoControl>{action.title}</InfoControl>;

    case "drill-thru/sort":
      return (
        <SortDrillWidget action={action} clicked={clicked} onClick={onClick} />
      );
  }

  return null;
};
