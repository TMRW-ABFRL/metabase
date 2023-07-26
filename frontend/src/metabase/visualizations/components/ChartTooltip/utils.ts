import { formatValue } from "metabase/lib/formatting";
import type { RemappingHydratedDatasetColumn } from "metabase/visualizations/shared/types/data";
import type { VisualizationSettings } from "./types";

export const formatValueForTooltip = ({
  value,
  column,
  settings,
}: {
  value?: unknown;
  column?: RemappingHydratedDatasetColumn;
  settings?: VisualizationSettings;
}) =>
  formatValue(value, {
    ...(settings && settings.column && column
      ? settings.column(column)
      : { column }),
    type: "tooltip",
    majorWidth: 0,
  });
