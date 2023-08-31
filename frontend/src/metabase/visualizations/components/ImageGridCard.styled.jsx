import styled from "@emotion/styled";

export const ImageGridCardRoot = styled.div`
  width: 100%;
  height: 97.5%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid #eeecec;
  border-radius: 20px;
  background-color: #f9fbfc;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const PrimaryImage = styled.img`
  width: 300px;
  height: 300px;
  object-fit: contain;
`;

export const TitleText = styled.h3`
  font-size: 1.1em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  margin-top: 10px;
  margin-bottom: 10px; // Some space after the title
  text-align: center;
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse; // Removes any spacing between table cells
  text-overflow: ellipsis;

  td {
    padding: 5px 15px; // Vertical padding for the cells
    &:first-child {
      font-weight: bold;
    }
  }

  tr:nth-child(odd) {
    background-color: #f5f5f5; // Zebra striping for readability
  }
`;
