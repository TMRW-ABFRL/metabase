import { t } from "ttag";
import * as Lib from "metabase-lib";
import { color } from "metabase/lib/colors";
import {
  ClickActionButtonIcon,
  HorizontalClickActionButton,
} from "../components/ChartClickActionControl.styled";

interface Props {
  action: Lib.DistributionDrillThruInfo;
  onApplyDrill: (action: Lib.DistributionDrillThruInfo) => void;
}

export const ColumnValuesDistributionDrillWidget = ({
  action,
  onApplyDrill,
}: Props) => {
  return (
    <HorizontalClickActionButton
      small
      icon={<ClickActionButtonIcon name="bar" />}
      iconColor={color("brand")}
      onClick={() => onApplyDrill(action)}
    >{t`Distribution`}</HorizontalClickActionButton>
  );
};
