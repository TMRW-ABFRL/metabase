/* eslint-disable react/prop-types */
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  useRef,
  useEffect,
  createRef,
} from "react";
import { getIn } from "icepick";
import _ from "underscore";

import ExplicitSize from "metabase/components/ExplicitSize";
import Ellipsified from "metabase/core/components/Ellipsified";

import { isPositiveInteger } from "metabase/lib/number";
import { isColumnRightAligned } from "metabase/visualizations/lib/table";
import { isID } from "metabase-lib/types/utils/isa";
import TableCell from "./TableCell";
import TableFooter from "./TableFooter";
import {
  Root,
  ContentContainer,
  Table,
  TableContainer,
  TableHeaderCellContent,
  SortIcon,
  TableHeaderRoot,
  TableHead,
} from "./TableSimple.styled";

const ROW_HEIGHT = 36;
const SCREEN_HEIGHT = Math.max(
  document.documentElement.clientHeight,
  window.innerHeight || 0,
); // get the height of the screen
const OFFSET = SCREEN_HEIGHT; // We want to render more than we see, or else we will see nothing when scrolling fast
const ROWS_TO_RENDER = Math.floor((SCREEN_HEIGHT + OFFSET) / ROW_HEIGHT);

function getBoundingClientRectSafe(ref) {
  return ref.current?.getBoundingClientRect?.() ?? {};
}

function formatCellValueForSorting(value, column) {
  if (typeof value === "string") {
    if (isID(column) && isPositiveInteger(value)) {
      return parseInt(value, 10);
    }
    // for strings we should be case insensitive
    return value.toLowerCase();
  }
  if (value === null) {
    return undefined;
  }
  return value;
}

function TableSimple({
  card,
  data,
  series,
  settings,
  height,
  isPivoted,
  className,
  onVisualizationClick,
  visualizationIsClickable,
  getColumnTitle,
  getExtraDataForClick,
}) {
  const { rows, cols } = data;

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [stickyColumnOffsets, setStickyColumnOffsets] = useState(
    new Array(cols.length).fill(0),
  );
  const [displayStart, setDisplayStart] = useState(0);
  const [displayEnd, setDisplayEnd] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);

  const tableRef = useRef(null);
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  const firstRowRef = useRef(null);
  const columnRefs = cols.map(() => createRef());

  useLayoutEffect(() => {
    const { height: headerHeight } = getBoundingClientRectSafe(headerRef);
    const { height: footerHeight = 0 } = getBoundingClientRectSafe(footerRef);
    const { height: rowHeight = 0 } = getBoundingClientRectSafe(firstRowRef);
    const currentPageSize = Math.floor(
      (height - headerHeight - footerHeight) / (rowHeight + 1),
    );
    const normalizedPageSize = Math.max(1, currentPageSize);
    if (pageSize !== normalizedPageSize) {
      setPageSize(normalizedPageSize);
    }
  }, [height, pageSize]);

  const setSort = useCallback(
    colIndex => {
      if (sortColumn === colIndex) {
        setSortDirection(direction => (direction === "asc" ? "desc" : "asc"));
      } else {
        setSortColumn(colIndex);
      }
    },
    [sortColumn],
  );

  const checkIsVisualizationClickable = useCallback(
    clickedItem => {
      return (
        onVisualizationClick &&
        visualizationIsClickable &&
        visualizationIsClickable(clickedItem)
      );
    },
    [onVisualizationClick, visualizationIsClickable],
  );

  const limit = getIn(card, ["dataset_query", "query", "limit"]) || undefined;
  const getCellBackgroundColor = settings["table._cell_background_getter"];
  const stickyColumnsCount = parseInt(settings["table.sticky_columns"] || 0);
  const infiniteScroll = settings["table.infinite_scroll"] || false;

  const start = pageSize * page;
  const end = Math.min(rows.length - 1, pageSize * (page + 1) - 1);

  const handlePreviousPage = useCallback(() => {
    setPage(p => p - 1);
  }, []);

  const handleNextPage = useCallback(() => {
    setPage(p => p + 1);
  }, []);

  const rowIndexes = useMemo(() => {
    let indexes = _.range(0, rows.length);

    if (sortColumn != null) {
      indexes = _.sortBy(indexes, rowIndex => {
        const value = rows[rowIndex][sortColumn];
        const column = cols[sortColumn];
        return formatCellValueForSorting(value, column);
      });
    }

    if (sortDirection === "desc") {
      indexes.reverse();
    }

    return indexes;
  }, [cols, rows, sortColumn, sortDirection]);

  const setDisplayPositions = useCallback(
    scroll => {
      // we want to start rendering a bit above the visible screen
      const scrollWithOffset = Math.floor(scroll - ROWS_TO_RENDER - OFFSET / 2);
      // start position should never be less than 0
      const displayStartPosition = Math.round(
        Math.max(0, Math.floor(scrollWithOffset / ROW_HEIGHT)),
      );

      // end position should never be larger than our data array
      const displayEndPosition = Math.round(
        Math.min(displayStartPosition + ROWS_TO_RENDER, rowIndexes.length),
      );

      setDisplayStart(displayStartPosition);
      setDisplayEnd(displayEndPosition);
    },
    [rowIndexes.length],
  );

  useEffect(() => {
    if (tableRef && tableRef.current) {
      const table = tableRef.current;
      const onScroll = _.throttle(() => {
        const scrollTop = table.scrollTop;
        if (rowIndexes.length !== 0) {
          setScrollPosition(scrollTop);
          setDisplayPositions(scrollTop);
        }
      }, 100);

      table.addEventListener("scroll", onScroll);

      return () => {
        table.removeEventListener("scroll", onScroll);
      };
    }
  }, [setDisplayPositions, setScrollPosition, rowIndexes.length]);

  useEffect(() => {
    setDisplayPositions(scrollPosition);
  }, [scrollPosition, setDisplayPositions]);

  const paginatedRowIndexes = useMemo(
    () => rowIndexes.slice(start, end + 1),
    [rowIndexes, start, end],
  );

  const indexesToRender = useMemo(() => {
    if (infiniteScroll) {
      return rowIndexes.slice(displayStart, displayEnd);
    }
    return paginatedRowIndexes;
  }, [
    infiniteScroll,
    rowIndexes,
    paginatedRowIndexes,
    displayStart,
    displayEnd,
  ]);

  useEffect(() => {
    const tableHeaders = columnRefs.map(ref => ref.current);

    const handleResize = entries => {
      for (const entry of entries) {
        if (entry.target === tableHeaders[0]) {
          let initialOffset = 0;
          const updatedOffsets = [];
          tableHeaders.forEach(header => {
            const boundingRect = header.getBoundingClientRect();
            const { width } = boundingRect;
            updatedOffsets.push(initialOffset);
            initialOffset += width;
          });

          setStickyColumnOffsets(currentOffsets => {
            if (
              currentOffsets.some(
                (currentOffset, index) =>
                  currentOffset !== updatedOffsets[index],
              )
            ) {
              return updatedOffsets;
            }
            return currentOffsets;
          });
        }
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(tableHeaders[0]);

    return () => {
      resizeObserver.unobserve(tableHeaders[0]);
    };
  }, [columnRefs]);

  const renderColumnHeader = useCallback(
    (col, colIndex) => {
      const iconName = sortDirection === "desc" ? "chevrondown" : "chevronup";
      const onClick = () => setSort(colIndex);
      return (
        <TableHeaderRoot
          key={colIndex}
          data-testid="column-header"
          ref={columnRefs[colIndex]}
          isSticky={colIndex < stickyColumnsCount}
          leftOffset={stickyColumnOffsets[colIndex]}
        >
          <TableHeaderCellContent
            isSorted={colIndex === sortColumn}
            onClick={onClick}
            isRightAligned={isColumnRightAligned(col)}
          >
            <SortIcon name={iconName} />
            <Ellipsified>{getColumnTitle(colIndex)}</Ellipsified>
          </TableHeaderCellContent>
        </TableHeaderRoot>
      );
    },
    [
      sortColumn,
      sortDirection,
      stickyColumnOffsets,
      stickyColumnsCount,
      columnRefs,
      getColumnTitle,
      setSort,
    ],
  );

  const renderRow = useCallback(
    (rowIndex, index) => {
      const ref = index === 0 ? firstRowRef : null;
      return (
        <tr
          key={rowIndex}
          ref={ref}
          data-testid="table-row"
          style={{ position: "relative" }}
        >
          {data.rows[rowIndex].map((value, columnIndex) => (
            <TableCell
              key={`${rowIndex}-${columnIndex}`}
              value={value}
              data={data}
              series={series}
              settings={settings}
              rowIndex={rowIndex}
              isSticky={columnIndex < stickyColumnsCount}
              leftOffset={stickyColumnOffsets[columnIndex]}
              columnIndex={columnIndex}
              isPivoted={isPivoted}
              getCellBackgroundColor={getCellBackgroundColor}
              getExtraDataForClick={getExtraDataForClick}
              checkIsVisualizationClickable={checkIsVisualizationClickable}
              onVisualizationClick={onVisualizationClick}
            />
          ))}
        </tr>
      );
    },
    [
      data,
      series,
      settings,
      isPivoted,
      stickyColumnOffsets,
      stickyColumnsCount,
      checkIsVisualizationClickable,
      getCellBackgroundColor,
      getExtraDataForClick,
      onVisualizationClick,
    ],
  );

  return (
    <Root className={className}>
      <ContentContainer>
        <TableContainer className="scroll-show scroll-show--hover">
          <Table
            className="fullscreen-normal-text fullscreen-night-text"
            infiniteScroll={infiniteScroll}
            ref={tableRef}
          >
            <TableHead ref={headerRef} infiniteScroll={infiniteScroll}>
              <tr style={{ position: "relative" }}>
                {cols.map(renderColumnHeader)}
              </tr>
            </TableHead>
            <tbody>
              {infiniteScroll && (
                <tr
                  key="startRowFiller"
                  style={{ height: displayStart * ROW_HEIGHT }}
                ></tr>
              )}
              {indexesToRender.map(renderRow)}
              {infiniteScroll && (
                <tr
                  key="endRowFiller"
                  style={{
                    height: (rowIndexes.length - displayEnd) * ROW_HEIGHT,
                  }}
                ></tr>
              )}
            </tbody>
          </Table>
        </TableContainer>
      </ContentContainer>
      {pageSize < rows.length && (
        <TableFooter
          start={infiniteScroll ? 0 : start}
          end={infiniteScroll ? rowIndexes.length - 1 : end}
          limit={limit}
          total={rows.length}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          ref={footerRef}
        />
      )}
    </Root>
  );
}

export default ExplicitSize({
  refreshMode: props =>
    props.isDashboard && !props.isEditing ? "debounce" : "throttle",
})(TableSimple);
