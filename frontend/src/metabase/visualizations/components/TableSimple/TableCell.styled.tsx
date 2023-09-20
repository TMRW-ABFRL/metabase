import styled from "@emotion/styled";
import { css } from "@emotion/react";

import { color } from "metabase/lib/colors";

export const CellRoot = styled.td<{
  isRightAligned: boolean;
  backgroundColor?: string;
  sticky?: boolean;
  leftOffset?: number;
}>`
  padding-left: 0.5rem;
  padding-right: 0.5rem;

  color: ${color("text-dark")};
  font-weight: bold;
  text-align: ${props => (props.isRightAligned ? "right" : "unset")};
  white-space: nowrap;

  border-bottom: 1px solid ${color("border")};

  background-color: ${props => props.backgroundColor ?? "unset"};

  ${props =>
    props.sticky &&
    css`
      position: sticky;
      left: ${props.leftOffset}px;
    `}
`;

export const CellWhiteBackground = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: white;
  z-index: 5;
`;

export const CellFormattedBackground = styled.div<{ backgroundColor: string }>`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: ${props => props.backgroundColor ?? "unset"};
  z-index: 10;
`;

export const CellContent = styled.span<{
  isClickable: boolean;
  sticky: boolean;
}>`
  ${props =>
    props.sticky &&
    css`
      position: relative;
      z-index: 10;
    `}

  display: inline-block;

  ${props =>
    props.isClickable &&
    css`
      cursor: pointer;
      &:hover {
        color: ${color("brand")};
      }
    `}
`;
