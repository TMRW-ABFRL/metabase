import { t } from "ttag";
import * as Lib from "metabase-lib";
import { color } from "metabase/lib/colors";
import {
  ClickActionButtonIcon,
  HorizontalClickActionButton,
  TokenActionButton,
} from "../components/ChartClickActionControl.styled";
import { ChartClickActionsSection } from "../components/ChartClickActionsSection";

const ACTIONS_TITLE = {
  sum: t`Sum`,
  avg: t`Avg`,
  distinct: t`Distinct values`,
};

interface Props {
  action: Lib.SummarizeColumnDrillThruInfo;
  onApplyDrill: (
    action: Lib.SummarizeColumnDrillThruInfo,
    aggregation: "sum" | "avg" | "distinct",
  ) => void;
}

export const SummarizeColumnDrillWidget = ({ action, onApplyDrill }: Props) => {
  const { aggregations } = action;

  if (aggregations.length > 1) {
    return (
      <ChartClickActionsSection
        type="sum"
        title={t`Summarize`}
        contentDirection="row"
      >
        {aggregations.map(aggregation => (
          <TokenActionButton
            key={aggregation}
            small
            onClick={() => onApplyDrill(action, aggregation)}
          >
            {ACTIONS_TITLE[aggregation]}
          </TokenActionButton>
        ))}
      </ChartClickActionsSection>
    );
  }

  const aggregation = aggregations[0];

  return (
    <HorizontalClickActionButton
      small
      icon={<ClickActionButtonIcon name="number" />}
      iconColor={color("brand")}
      onClick={() => onApplyDrill(action, aggregation)}
    >
      {ACTIONS_TITLE[aggregation]}
    </HorizontalClickActionButton>
  );
};
