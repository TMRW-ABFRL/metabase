import styled from "@emotion/styled";

export const ImageGridRoot = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

export const EditColumnsContainer = styled.div`
  width: 100%;
  position: relative;
  padding-left: 0.5rem;
  padding-right: 2%;
  display: flex;
  justify-content: flex-start;
`;

export const EditColumnsButton = styled.button`
  cursor: pointer;
  background-color: #509ee3;
  display: flex;
  align-items: center;
  height: 2.25rem;
  padding: 0.5rem;
  color: #ffffff;
  border-radius: 6px;
`;

export const FooterContainer = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  background-color: white;
  width: 100%;
  padding-right: 2%;
`;

export const EditColumnsRoot = styled.div<{
  isOpen: boolean;
}>`
  position: absolute;
  top: 0;
  height: 110%;
  width: 400px;
  z-index: ${props => (props.isOpen ? 10 : -1)};
  background-color: white;
  border-width: 2px;
  border-style: solid;
  border-color: #eeecec;
  border-radius: 20px;
  overflow-y: scroll;
  left: ${props => (props.isOpen ? "-50px" : "-500px")};
`;

export const EditColumnsCloseIcon = styled.div`
  display: flex;
  justify-content: flex-end;
  cursor: pointer;
  padding-right: 20px;
  margin-top: 5%;
`;

export const ColumnsContainer = styled.div`
  width: 100%;
  margin-top: 1%;
  padding-right: 50px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-end;
`;

export const ColumnCategory = styled.h3`
  width: 250px;
  margin-top: 2%;
  margin-bottom: 2%;
`;

export const ColumnRoot = styled.div`
  width: 250px;
  border-width: 2px;
  border-style: solid;
  border-color: #eeecec;
  border-radius: 5px;
  padding: 2.5%;
  margin-top: 2%;
  margin-bottom: 2%;
`;
