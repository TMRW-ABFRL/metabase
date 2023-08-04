import type { RegularClickAction } from "metabase/modes/types";

export const getGALabelForAction = (action: RegularClickAction) =>
  action ? `${action.section || ""}:${action.name || ""}` : null;

export type ContentDirectionType = "column" | "row";

export type ExtraPopoverProps = object; // TODO: add proper typing
