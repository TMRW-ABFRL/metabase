import React, { Component } from "react";
import { connect } from "react-redux";
import * as tippy from "tippy.js";
import * as MetabaseAnalytics from "metabase/lib/analytics";
import { getEventTarget } from "metabase/lib/dom";
import { performActionLib2 } from "metabase/visualizations/lib/action";
import { OnChangeCardAndRun } from "metabase/visualizations/types";
import { Dispatch } from "metabase-types/store";
import { Series } from "metabase-types/api";
import { ClickActionPopoverProps, ClickObject } from "metabase/modes/types";
import * as Lib from "metabase-lib";
import { toLegacyQuery } from "metabase-lib";
import Question from "metabase-lib/Question";
import { getModeType } from "metabase-lib/Mode";
import { ChartClickActionsView } from "./ChartClickActionsView";
import { ExtraPopoverProps } from "./utils";
import { FlexTippyPopover } from "./ChartClickActions.styled";

interface ChartClickActionsProps {
  clicked: ClickObject;
  clickActions: Lib.DrillThru[];
  series: Series;
  dispatch: Dispatch;
  question: Question;
  onChangeCardAndRun: OnChangeCardAndRun;
  onUpdateVisualizationSettings: () => void;
  onClose?: () => void;
}

interface State {
  popoverContent: React.FC<ClickActionPopoverProps> | null;
  popoverProps: ExtraPopoverProps | undefined;
}

class ChartClickActions extends Component<ChartClickActionsProps, State> {
  state: State = {
    popoverContent: null,
    popoverProps: undefined,
  };

  instance: tippy.Instance | null = null;

  close = () => {
    this.setState({ popoverContent: null, popoverProps: undefined });
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  handleApplyDrill = (action: Lib.DrillThru, ...args: any[]) => {
    // const { dispatch, onChangeCardAndRun } = this.props;
    // if (isPopoverClickAction(action)) {
    //   // MetabaseAnalytics.trackStructEvent(
    //   //   "Actions",
    //   //   "Open Click Action Popover",
    //   //   getGALabelForAction(action),
    //   // );
    //   this.setState({ popoverAction: action });
    // } else {
    //   const didPerform = performAction(action, {
    //     dispatch,
    //     onChangeCardAndRun,
    //   });
    //   if (didPerform) {
    //     if (isRegularClickAction(action)) {
    //       // MetabaseAnalytics.trackStructEvent(
    //       //   "Actions",
    //       //   "Executed Click Action",
    //       //   getGALabelForAction(action),
    //       // );
    //     }
    //
    //     this.close();
    //   } else {
    //     console.warn("No action performed", action);
    //   }
    // }

    const { question, onChangeCardAndRun } = this.props;

    const query = question._getMLv2Query();
    const updatedQuery = performActionLib2(query, action, ...args);

    const nextCard = question
      .setDatasetQuery(toLegacyQuery(updatedQuery))
      .card();

    onChangeCardAndRun({
      nextCard,
    });
  };

  handleShowPopover = (
    Popover: React.FC<ClickActionPopoverProps>,
    popoverProps?: ExtraPopoverProps,
  ) => {
    this.setState({
      popoverContent: Popover,
      popoverProps: popoverProps || undefined,
    });
  };

  getPopoverReference = (clicked: ClickObject): HTMLElement | null => {
    if (clicked.element) {
      if (clicked.element.firstChild instanceof HTMLElement) {
        return clicked.element.firstChild;
      } else {
        return clicked.element;
      }
    } else if (clicked.event) {
      return getEventTarget(clicked.event);
    }

    return null;
  };

  getPopoverContent = () => {
    const { onChangeCardAndRun, series } = this.props;
    const { popoverContent: PopoverContent } = this.state;

    if (!PopoverContent) {
      return null;
    }

    return (
      <PopoverContent
        onApplyDrill={this.handleApplyDrill}
        onResize={() => {
          this.instance?.popperInstance?.update();
        }}
        onChangeCardAndRun={({ nextCard }) => {
          /*if (popoverAction) {
            MetabaseAnalytics.trackStructEvent(
              "Action",
              "Executed Click Action",
              getGALabelForAction(popoverAction),
            );
          }*/
          onChangeCardAndRun({ nextCard });
        }}
        onClose={() => {
          /*MetabaseAnalytics.trackStructEvent(
            "Action",
            "Dismissed Click Action Menu",
            getGALabelForAction(popoverAction),
          );*/
          this.close();
        }}
        series={series}
      />
    );
  };

  render() {
    const { clicked, clickActions, question, onUpdateVisualizationSettings } =
      this.props;
    const { popoverProps } = this.state;

    if (!clicked || !clickActions || clickActions.length === 0) {
      return null;
    }

    const query = question._getMLv2Query();
    const popoverAnchor = this.getPopoverReference(clicked);

    const popover = this.getPopoverContent();

    const mode = getModeType(question);

    return (
      <FlexTippyPopover
        reference={popoverAnchor}
        visible={!!popoverAnchor}
        onShow={instance => {
          this.instance = instance;
        }}
        onClose={() => {
          MetabaseAnalytics.trackStructEvent(
            "Action",
            "Dismissed Click Action Menu",
          );
          this.close();
        }}
        placement="bottom-start"
        maxWidth={500}
        offset={[0, 8]}
        popperOptions={{
          modifiers: [
            {
              name: "preventOverflow",
              options: {
                padding: 16,
              },
            },
          ],
        }}
        content={
          popover ? (
            popover
          ) : (
            <ChartClickActionsView
              mode={mode}
              clickActions={clickActions}
              question={question}
              query={query}
              clicked={clicked}
              onApplyDrill={this.handleApplyDrill}
              onShowPopover={this.handleShowPopover}
              onUpdateVisualizationSettings={onUpdateVisualizationSettings}
            />
          )
        }
        {...popoverProps}
      />
    );
  }
}

export const ConnectedChartClickActions = connect()(ChartClickActions);
