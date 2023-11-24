import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import ParametersList from "metabase/parameters/components/ParametersList";
import { useSyncedQueryString } from "metabase/hooks/use-synced-query-string";
import { getParameterValuesBySlug } from "metabase-lib/parameters/utils/parameter-values";
import { getUser } from "../../../reference/selectors";

const propTypes = {
  parameters: PropTypes.array.isRequired,
  editingParameter: PropTypes.object,
  question: PropTypes.object,
  dashboard: PropTypes.object,
  user: PropTypes.object,

  className: PropTypes.string,
  hideParameters: PropTypes.string,

  isFullscreen: PropTypes.bool,
  isNightMode: PropTypes.bool,
  isEditing: PropTypes.bool,
  commitImmediately: PropTypes.bool,

  setParameterValue: PropTypes.func,
  setParameterIndex: PropTypes.func,
  setEditingParameter: PropTypes.func,
};

const mapStateToProps = (state, props) => ({
  user: getUser(state),
});

export function SyncedParametersList({
  parameters,
  editingParameter,
  question,
  dashboard,

  className,
  hideParameters,

  isFullscreen,
  isNightMode,
  isEditing,
  commitImmediately,

  setParameterValue,
  setParameterIndex,
  setEditingParameter,

  user,
}) {
  useSyncedQueryString(
    () =>
      getParameterValuesBySlug(
        parameters,
        undefined,
        dashboard && { preserveDefaultedParameters: true },
      ),
    [parameters, dashboard],
  );

  useEffect(() => {
    const brandParam = parameters.find(
      param => param.name.toLowerCase() === "brand",
    );
    if (brandParam && !brandParam.value && user?.brands) {
      setParameterValue(brandParam.id, user.brands);
    }
  }, [parameters, user, setParameterValue]);

  return (
    <ParametersList
      className={className}
      parameters={parameters}
      question={question}
      dashboard={dashboard}
      editingParameter={editingParameter}
      isFullscreen={isFullscreen}
      isNightMode={isNightMode}
      hideParameters={hideParameters}
      isEditing={isEditing}
      commitImmediately={commitImmediately}
      setParameterValue={setParameterValue}
      setParameterIndex={setParameterIndex}
      setEditingParameter={setEditingParameter}
    />
  );
}

SyncedParametersList.propTypes = propTypes;

export default connect(mapStateToProps)(SyncedParametersList);
