/* eslint-disable react/prop-types */
import React from "react";
import {
  ImageGridCardRoot,
  PrimaryImage,
  TitleText,
  StyledTable,
} from "./ImageGridCard.styled";

const ImageGridCard = props => {
  const { row, columnState } = props;

  return (
    <ImageGridCardRoot>
      <PrimaryImage src={row.image_url} alt="image" />
      <TitleText>{row.product_title}</TitleText>
      <StyledTable>
        {Object.entries(columnState)
          .filter(([_, value]) => value)
          .map(([key], index) => (
            <tr key={`grid-card-row-${index}`}>
              <td style={{ fontWeight: "bold" }}>{key}</td>
              <td>{row[key]}</td>
            </tr>
          ))}
      </StyledTable>
    </ImageGridCardRoot>
  );
};

export default ImageGridCard;
