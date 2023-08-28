import styled from "@emotion/styled";

export const ImageGridCardRoot = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 5%;
  padding-right: 5%;
  border-width: 2px;
  border-style: solid;
  border-color: #eeecec;
  border-radius: 20px;
  background-color: #f9fbfc;
`;

export const PrimaryImage = styled.img`
  width: 90%;
  object-fit: contain;
  max-width: 225px;
`;

export const TitleText = styled.h3`
  padding-bottom: 2.5%;
  padding-top: 2.5%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 90%;
`;
