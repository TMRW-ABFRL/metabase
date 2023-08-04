import { t } from "ttag";
import * as Lib from "metabase-lib";
import { color } from "metabase/lib/colors";
import {
  ClickActionButtonIcon,
  HorizontalClickActionButton,
} from "../components/ChartClickActionControl.styled";

interface Props {
  action: Lib.SummarizeColumnByTimeDrillThruInfo;
  onApplyDrill: (action: Lib.SummarizeColumnByTimeDrillThruInfo) => void;
}

export const SummarizeColumnByTimeDrillWidget = ({
  action,
  onApplyDrill,
}: Props) => {
  return (
    <HorizontalClickActionButton
      small
      icon={<ClickActionButtonIcon name="line" />}
      iconColor={color("brand")}
      onClick={() => onApplyDrill(action)}
    >{t`Sum over time`}</HorizontalClickActionButton>
  );
};
