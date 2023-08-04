import { t } from "ttag";
import * as React from "react";
import * as Lib from "metabase-lib";
import { DatasetColumn, RowValue } from "metabase-types/api";
import { ClickActionButtonType } from "metabase/modes/types";
import { TextIcon } from "metabase/modes/components/drill/QuickFilterDrill/QuickFilterDrill.styled";
import { color } from "metabase/lib/colors";
import { ClickObject } from "metabase-lib/queries/drills/types";
import { isBoolean, isDate, isNumeric } from "metabase-lib/types/utils/isa";
import {
  HorizontalClickActionButton,
  IconWrapper,
  TokenFilterActionButton,
} from "../components/ChartClickActionControl.styled";
import { ChartClickActionsSection } from "../components/ChartClickActionsSection";

type FilterOperator = "=" | "≠" | "<" | ">";
type DateQuickFilterOperatorType = "<" | ">" | "=" | "≠";
type FilterValueType = "null" | "numeric" | "date" | "boolean" | "text";

const COLUMN_VIEW_COLUMN_TYPES: FilterValueType[] = ["text", "date"];

interface Props {
  action: Lib.QuickFilterDrillThruInfo;
  clicked: ClickObject;
  onApplyDrill: (
    action: Lib.QuickFilterDrillThruInfo,
    operator: FilterOperator,
  ) => void;
}

export const QuickFilterDrillWidget = ({
  action,
  clicked,
  onApplyDrill,
}: Props) => {
  const { operators } = action;
  const { value, column } = clicked;

  // TODO: add support for contains / does not contain operators for long text

  if (!column) {
    return null;
  }

  const columnName = column.display_name;
  const columnValueType = getValueType(value, column);

  return (
    <ChartClickActionsSection
      type="filter"
      title={getFilterSectionTitle(columnValueType, columnName)}
      contentDirection={
        COLUMN_VIEW_COLUMN_TYPES.includes(columnValueType) ? "column" : "row"
      }
    >
      {operators.map(operator => {
        const overrides = getOperatorOverrides(
          operator,
          columnValueType,
          value,
        );

        if (overrides) {
          const { title, icon } = overrides;

          return (
            <HorizontalClickActionButton
              key={operator}
              small
              icon={<IconWrapper>{icon}</IconWrapper>}
              iconColor={color("brand")}
              onClick={() => onApplyDrill(action, operator)}
            >
              {title || operator}
            </HorizontalClickActionButton>
          );
        }

        return (
          <TokenFilterActionButton
            key={operator}
            small
            onClick={() => onApplyDrill(action, operator)}
          >
            {operator}
          </TokenFilterActionButton>
        );
      })}
    </ChartClickActionsSection>
  );
};

const getFilterSectionTitle = (valueType: string, columnName?: string) => {
  if (valueType === "date") {
    return t`Filter by this date`;
  }

  if (valueType === "text") {
    return t`Filter by ${columnName || t`this text`}`;
  }

  return t`Filter by this value`;
};

const getValueType = (
  value: unknown,
  column: DatasetColumn,
): FilterValueType => {
  if (value == null) {
    return "null";
  }

  if (isNumeric(column)) {
    return "numeric";
  }

  if (isDate(column)) {
    return "date";
  }

  if (isBoolean(column)) {
    return "boolean";
  }

  return "text";
};

const SPECIFIC_VALUE_TITLE_MAX_LENGTH = 20;

const getTextValueTitle = (value: string): string => {
  if (value.length === 0) {
    return t`empty`;
  }

  if (value.length > SPECIFIC_VALUE_TITLE_MAX_LENGTH) {
    return t`this`;
  }

  return value;
};

const DateButtonTitleMap: Record<DateQuickFilterOperatorType, string> = {
  ["<"]: t`Before`,
  [">"]: t`After`,
  ["="]: t`On`,
  ["≠"]: t`Not on`,
};

const getOperatorOverrides = (
  operator: FilterOperator,
  valueType: FilterValueType,
  value: RowValue | undefined,
): {
  title?: string;
  icon?: React.ReactNode;
  buttonType?: ClickActionButtonType;
} | null => {
  if (valueType === "text" && typeof value === "string") {
    const textValue = getTextValueTitle(value);

    if (operator === "=") {
      return {
        title: t`Is ${textValue}`,
        icon: <TextIcon>=</TextIcon>,
      };
    }
    if (operator === "≠") {
      return {
        title: t`Is not ${textValue}`,
        icon: <TextIcon>≠</TextIcon>,
      };
    }
    // if (operator === "contains") {
    //   return {
    //     title: t`Contains…`,
    //     icon: "filter",
    //   };
    // }
    // if (operator === "does-not-contain") {
    //   return {
    //     title: t`Does not contain…`,
    //     icon: <TextIcon>≠</TextIcon>,
    //   };
    // }
  }

  if (valueType === "date") {
    return {
      title: DateButtonTitleMap[operator],
    };
  }

  return null;
};
