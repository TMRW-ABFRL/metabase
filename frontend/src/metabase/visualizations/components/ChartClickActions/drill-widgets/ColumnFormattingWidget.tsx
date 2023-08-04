import React from "react";
import { t } from "ttag";
import { ClickActionPopoverProps } from "metabase/modes/types";
import { ExtraPopoverProps } from "metabase/visualizations/components/ChartClickActions/utils";
import { VisualizationSettings } from "metabase-types/api";
import { updateSettings } from "metabase/visualizations/lib/settings";
import { getSettingsWidgetsForSeries } from "metabase/visualizations/lib/settings/visualization";
import { PopoverRoot } from "metabase/modes/components/drill/FormatDrill/FormatDrill.styled";
import ChartSettingsWidget from "metabase/visualizations/components/ChartSettingsWidget";
import Tooltip from "metabase/core/components/Tooltip";
import { Icon } from "metabase/core/components/Icon";
import { getColumnKey } from "metabase-lib/queries/utils/get-column-key";
import Question from "metabase-lib/Question";
import { ClickObject } from "metabase-lib/queries/drills/types";
import { FormattingControl } from "../components/ChartClickActionControl.styled";

interface Props {
  clicked: ClickObject;
  question: Question;

  onShowPopover: (
    Popover: React.FC<ClickActionPopoverProps>,
    popoverProps?: ExtraPopoverProps,
  ) => void;
  onUpdateVisualizationSettings: (settings: VisualizationSettings) => void;
}

export const ColumnFormattingWidget = ({
  clicked,
  question,
  onShowPopover,
  onUpdateVisualizationSettings,
}: Props) => {
  if (
    !clicked ||
    clicked.value !== undefined ||
    !clicked.column ||
    !question.query().isEditable()
  ) {
    return null;
  }

  const { column } = clicked;

  const handleClick = () => {
    const FormatPopover = ({ series }: ClickActionPopoverProps) => {
      const handleChangeSettings = (settings: VisualizationSettings) => {
        onUpdateVisualizationSettings(
          updateSettings(series[0].card.visualization_settings, settings),
        );
      };

      const widgets = getSettingsWidgetsForSeries(
        series,
        handleChangeSettings,
        false,
      );

      const columnSettingsWidget = widgets.find(
        widget => widget.id === "column_settings",
      );

      const extraProps = {
        ...columnSettingsWidget,
        props: {
          ...columnSettingsWidget.props,
          initialKey: getColumnKey(column),
        },
      };

      return (
        <PopoverRoot>
          <ChartSettingsWidget
            {...extraProps}
            key={columnSettingsWidget.id}
            hidden={false}
          />
        </PopoverRoot>
      );
    };

    onShowPopover(FormatPopover);
  };

  return (
    <Tooltip tooltip={t`Column formatting`}>
      <FormattingControl onlyIcon onClick={handleClick}>
        <Icon size={16} name="gear" />
      </FormattingControl>
    </Tooltip>
  );
};

export const shouldDisplayFormatWidget = (
  clicked: ClickObject,
  question: Question,
) => {
  return !(
    !clicked ||
    clicked.value !== undefined ||
    !clicked.column ||
    !question.query().isEditable()
  );
};
