import React from "react";
import { t } from "ttag";
import * as Lib from "metabase-lib";
import { color } from "metabase/lib/colors";
import FilterPopover from "metabase/query_builder/components/filters/FilterPopover";
import { ClickActionPopoverProps } from "metabase/modes/types";
import { ExtraPopoverProps } from "metabase/visualizations/components/ChartClickActions/utils";
import { ClickObject } from "metabase-lib/queries/drills/types";
import Question from "metabase-lib/Question";
import StructuredQuery from "metabase-lib/queries/StructuredQuery";
import {
  ClickActionButtonIcon,
  HorizontalClickActionButton,
} from "../ChartClickActionControl.styled";

interface Props {
  action: Lib.ColumnFilterDrillThruInfo;
  clicked: ClickObject;
  query: Lib.Query;
  question: Question;

  onShowPopover: (
    Popover: React.FC<ClickActionPopoverProps>,
    popoverProps?: ExtraPopoverProps,
  ) => void;
  onApplyDrill: (action: Lib.ColumnFilterDrillThruInfo) => void;
}

export const ColumnFilterDrillWidget = ({
  action,
  clicked,
  query,
  question,

  onShowPopover,
  onApplyDrill,
}: Props) => {
  const handleClick = () => {
    // TODO: initial filter should be derived from drill itself. But how?
    const initialFilter = clicked.dimension?.defaultFilterForDimension();

    const legacyQuery = question.query() as StructuredQuery;

    const getPopover = ({
      onChangeCardAndRun,
      onResize,
      onClose,
    }: ClickActionPopoverProps) => {
      return (
        <FilterPopover
          isNew
          query={legacyQuery}
          filter={initialFilter}
          showFieldPicker={false}
          onClose={onClose}
          onResize={onResize}
          onChangeFilter={filter => {
            // TODO: this should be applied through "drillThru" method
            const nextCard = filter.add().rootQuery().question().card();
            onChangeCardAndRun({ nextCard });
            onClose();
          }}
        />
      );
    };

    onShowPopover(getPopover);
  };

  return (
    <HorizontalClickActionButton
      small
      icon={<ClickActionButtonIcon name="filter" />}
      iconColor={color("brand")}
      onClick={handleClick}
    >{t`Filter by this column`}</HorizontalClickActionButton>
  );
};
