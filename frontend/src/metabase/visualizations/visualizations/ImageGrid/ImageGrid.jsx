/* eslint-disable react/prop-types */
import React, {
  Component,
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import { t } from "ttag";
import ReactGridLayout from "react-grid-layout";
import { columnSettings } from "metabase/visualizations/lib/settings/column";
import ImageGridCard from "../../../visualizations/components/ImageGridCard";
import TableFooter from "../../components/TableSimple/TableFooter";
import EditColumns from "./EditColumns";
import {
  EditColumnsContainer,
  ImageGridRoot,
  EditColumnsButton,
  FooterContainer,
} from "./ImageGrid.styled";

const MIN_CARD_HEIGHT = 2.45;
const ROW_HEIGHT = 0.15;
const INITIAL_NO_OF_COLUMNS = 4;
const NO_OF_ROWS = 20;

const ImageGridComponent = props => {
  const { data: gridData, columns } = props;

  const [columnCount, setColumnCount] = useState(INITIAL_NO_OF_COLUMNS);
  const [cardHeight, setCardHeight] = useState(MIN_CARD_HEIGHT);
  const [containerWidth, setContainerWidth] = useState(0);
  const [gridLayout, setGridLayout] = useState([]);
  const [columnState, setColumnState] = useState(
    columns.reduce((obj, element, index) => {
      obj[element] = index < 5;
      return obj;
    }, {}),
  );
  const [editColumns, setEditColumns] = useState(false);
  const [page, setPage] = useState(0);

  const start = columnCount * NO_OF_ROWS * page;
  const end = Math.min(
    gridData.length - 1,
    columnCount * NO_OF_ROWS * (page + 1) - 1,
  );

  const handlePreviousPage = useCallback(() => {
    setPage(p => p - 1);
  }, []);

  const handleNextPage = useCallback(() => {
    setPage(p => p + 1);
  }, []);

  const containerRef = useRef();
  const footerRef = useRef();

  const generateCard = useCallback(
    (row, index) => {
      return (
        <div key={index}>
          <ImageGridCard row={row} columnState={columnState} />
        </div>
      );
    },
    [columnState],
  );

  const generateLayout = useCallback((cardCount, noOfColumns, cardHeight) => {
    return new Array(cardCount).fill(null).map((_, index) => ({
      x: index % noOfColumns,
      y: Math.floor(index / noOfColumns),
      w: 1,
      h: cardHeight,
      i: index.toString(),
    }));
  }, []);

  const recomputeColumnCount = useCallback(currentWidth => {
    const updatedNoOfColumns = Math.floor(currentWidth / 320);
    setColumnCount(updatedNoOfColumns);
  }, []);

  const recomputeCardHeight = useCallback(columnState => {
    const updatedCardHeight =
      MIN_CARD_HEIGHT +
      Object.values(columnState).filter(value => value).length * ROW_HEIGHT;

    setCardHeight(updatedCardHeight);
  }, []);

  useEffect(() => {
    const container = containerRef.current;

    const handleResize = entries => {
      for (const entry of entries) {
        if (entry.target === container) {
          const { current } = containerRef;
          const boundingRect = current.getBoundingClientRect();
          const { width } = boundingRect;
          setContainerWidth(width);
        }
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.unobserve(container);
    };
  }, []);

  useEffect(() => {
    recomputeColumnCount(containerWidth);
  }, [containerWidth, recomputeColumnCount]);

  useEffect(() => {
    recomputeCardHeight(columnState);
  }, [columnState, recomputeCardHeight]);

  useEffect(() => {
    setGridLayout(generateLayout(gridData.length, columnCount, cardHeight));
  }, [columnCount, cardHeight, gridData, generateLayout]);

  const gridStyle = useMemo(
    () => ({
      overflowY: "scroll",
      height: "90%",
      width: "100%",
      overflowX: "hidden",
      marginTop: "0.5%",
      marginBottom: "1%",
    }),
    [],
  );

  return (
    <ImageGridRoot ref={containerRef}>
      <EditColumnsContainer>
        <EditColumnsButton onClick={() => setEditColumns(true)}>
          <div>Edit Columns</div>
        </EditColumnsButton>
      </EditColumnsContainer>
      <EditColumns
        columnState={columnState}
        editColumns={editColumns}
        setEditColumns={setEditColumns}
        setColumnState={setColumnState}
      />
      {containerWidth > 0 && (
        <ReactGridLayout
          layout={gridLayout}
          measureBeforeMount={false}
          cols={columnCount}
          isDraggable={false}
          autoSize={false}
          width={containerWidth}
          style={gridStyle}
          isResizable={false}
        >
          {gridData.slice(start, end + 1).map(generateCard)}
        </ReactGridLayout>
      )}
      {containerWidth > 0 && (
        <FooterContainer>
          <TableFooter
            start={start}
            end={end}
            limit={undefined}
            total={gridData.length}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
            ref={footerRef}
          />
        </FooterContainer>
      )}
    </ImageGridRoot>
  );
};

class ImageGrid extends Component {
  static uiName = t`Image Grid`;
  static identifier = "image_grid";

  static settings = {
    ...columnSettings({ hidden: true }),
  };

  constructor(props) {
    super(props);

    this.state = {
      data: [],
      columns: {},
    };
  }

  UNSAFE_componentWillMount() {
    this._updateData(this.props);
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.series !== this.props.series) {
      this._updateData(newProps);
    }
  }

  _updateData({ series }) {
    const [{ data }] = series;

    this.setState({
      data: data.rows.map(row => {
        const rowDict = {};
        row.forEach((item, index) => {
          rowDict[data.cols[index].display_name] = item;
        });
        return rowDict;
      }),
      columns: data.cols.map(({ display_name }) => display_name),
    });
  }

  render() {
    return (
      <ImageGridComponent
        data={this.state.data}
        columns={this.state.columns.filter(
          column => !["product_title", "image_url"].includes(column),
        )}
      />
    );
  }
}

export default ImageGrid;
