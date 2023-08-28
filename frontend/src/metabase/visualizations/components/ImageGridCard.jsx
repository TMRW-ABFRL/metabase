/* eslint-disable react/prop-types */
import {
  ImageGridCardRoot,
  PrimaryImage,
  TitleText,
} from "./ImageGridCard.styled";

const ImageGridCard = props => {
  const { row, columnState } = props;

  return (
    <ImageGridCardRoot>
      <PrimaryImage src={row.image_url} alt="image" />
      <TitleText>{row.product_title}</TitleText>
      <div style={{ width: "80%" }}>
        <table style={{ width: "100%" }}>
          {Object.entries(columnState)
            .filter(([_, value]) => value)
            .map(([key], index) => (
              <tr key={`grid-card-row-${index}`}>
                <td>{key}</td>
                <td>{row[key]}</td>
              </tr>
            ))}
        </table>
      </div>
    </ImageGridCardRoot>
  );
};

export default ImageGridCard;
