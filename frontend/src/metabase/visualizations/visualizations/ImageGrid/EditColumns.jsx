/* eslint-disable react/prop-types */
import React from "react";
import Icon from "metabase/components/Icon";
import CheckBox from "metabase/core/components/CheckBox";
import {
  EditColumnsRoot,
  EditColumnsCloseIcon,
  ColumnsContainer,
  ColumnRoot,
  ColumnCategory,
} from "./ImageGrid.styled";

const EditColumns = props => {
  const { columnState, editColumns, setEditColumns, setColumnState } = props;

  return (
    <EditColumnsRoot isOpen={editColumns}>
      <EditColumnsCloseIcon>
        <Icon
          name="close"
          onClick={e => {
            e.stopPropagation();
            setEditColumns(false);
          }}
        />
      </EditColumnsCloseIcon>
      <ColumnsContainer>
        <ColumnCategory>Active Columns</ColumnCategory>
        {Object.entries(columnState)
          .filter(([_, value]) => value)
          .map(([column], index) => (
            <ColumnRoot key={`active-column-${index}`}>
              <CheckBox
                label={column}
                checked={true}
                onClick={() =>
                  setColumnState(current => {
                    const updated = { ...current };
                    updated[column] = false;
                    return updated;
                  })
                }
              />
            </ColumnRoot>
          ))}
        <ColumnCategory>Disabled Columns</ColumnCategory>
        {Object.entries(columnState)
          .filter(([_, value]) => !value)
          .map(([column], index) => (
            <ColumnRoot key={`disabled-column-${index}`}>
              <CheckBox
                label={column}
                checked={false}
                onClick={() =>
                  setColumnState(current => {
                    const updated = { ...current };
                    updated[column] = true;
                    return updated;
                  })
                }
              />
            </ColumnRoot>
          ))}
      </ColumnsContainer>
    </EditColumnsRoot>
  );
};

export default EditColumns;
