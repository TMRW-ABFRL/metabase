/* eslint-disable react/prop-types */
import React, { Component, useRef, useEffect, useState } from "react";
import d3 from "d3";
import { t } from "ttag";
import { hierarchy, treemap as createTreeMap } from "d3-hierarchy";
import { getOptionFromColumn } from "metabase/visualizations/lib/settings/utils";
import { isMetric } from "metabase-lib/types/utils/isa";
import { TreeMapRoot } from "./TreeMap.styled";
import "./Tooltip.css";

const COLOR_RANGE = [
  "#FF0000",
  "#FF1000",
  "#FF2000",
  "#FF3000",
  "#FF4000",
  "#FF5000",
  "#FF6000",
  "#FF7000",
  "#FF8000",
  "#FF9000",
  "#FFA000",
  "#FFB000",
  "#FFC000",
  "#FFD000",
  "#FFE000",
  "#FFF000",
  "#FFFF00",
  "#F0FF00",
  "#E0FF00",
  "#D0FF00",
  "#C0FF00",
  "#B0FF00",
  "#A0FF00",
  "#90FF00",
  "#80FF00",
  "#70FF00",
  "#60FF00",
  "#50FF00",
  "#40FF00",
  "#30FF00",
  "#20FF00",
  "#10FF00",
];

const drawTreeMap = (chartData, width, height, chartRef) => {
  const svg = d3.select(chartRef.current);

  svg.selectAll("rect").remove();
  svg.selectAll("text").remove();
  svg.selectAll("clipPath").remove();
  svg.selectAll("g").remove();
  d3.selectAll(".treemap-tooltip").remove();

  // Give the data to this cluster layout:
  const root = hierarchy(chartData).sum(d => d.value);

  // initialize treemap
  createTreeMap().size([width, height]).paddingInner(1)(root);

  const color = d3.scale
    .quantize()
    .domain([
      Math.min(...chartData.children.map(({ color }) => color)),
      Math.max(...chartData.children.map(({ color }) => color)),
    ])
    .range(COLOR_RANGE);

  const groups = svg.selectAll("g").data(root.leaves());

  groups.enter().append("g");

  groups
    .append("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .style("fill", d => color(d.data.color))
    .style("opacity", () => 0.65);

  const texts = groups
    .append("text")
    .attr("x", d => d.x0 + 5)
    .attr("y", d => d.y0 + 20)
    .text(d => d.data.name)
    .attr("font-size", "15px")
    .attr("fill", "black");

  texts.text(d => d.data.name);

  // Apply ellipsis for overflowing text
  texts.each(function (d) {
    const textElement = d3.select(this);
    const textWidth = textElement.node().getComputedTextLength(); // Get text width

    const rectWidth = d.x1 - d.x0 - 5; // Width of the container rect
    if (textWidth > rectWidth) {
      // If text overflows the container, add ellipsis
      const allowedWidth = rectWidth - 10; // Adjust as needed
      let truncatedText = d.data.name;
      while (
        textElement.node().getComputedTextLength() > allowedWidth &&
        truncatedText.length > 0
      ) {
        truncatedText = truncatedText.slice(0, -1);
        textElement.text(truncatedText + "...");
      }
    }
  });

  const tooltip = d3
    .select("#treemap-root")
    .append("div")
    .attr("class", "treemap-tooltip")
    .style("opacity", "0");

  tooltip.append("span").attr("id", "tooltip-title");
  tooltip.append("span").attr("id", "tooltip-size-value");
  tooltip.append("span").attr("id", "tooltip-color-value");

  // Add mouseover event to <g> elements to display the tooltip
  groups.on("mouseover", function (d) {
    const rect = d3.select(this).select("rect");
    const rectX = parseFloat(rect.attr("x"));
    const rectWidth = parseFloat(rect.attr("width"));
    const rectY = parseFloat(rect.attr("y"));

    // Position the tooltip
    tooltip.transition().duration(200).style("opacity", 1);

    if (rectX + 10 + rectWidth >= width) {
      tooltip.style("left", null);
      tooltip.style("right", 0 + "px");
    } else {
      tooltip.style("right", null);
      tooltip.style("left", rectX + 10 + "px");
    }

    tooltip.style("top", Math.max(rectY - 30, 0) + "px");

    d3.select("#tooltip-title").html(d.data.name);
    d3.select("#tooltip-size-value").html(
      `${d.data.valueColumn}: ${d.data.value}`,
    );
    d3.select("#tooltip-color-value").html(
      `${d.data.colorColumn}: ${d.data.color}`,
    );
  });

  // Add mouseout event to hide the tooltip
  groups.on("mouseout", () => {
    tooltip.transition().duration(200).style("opacity", 0);
  });
};

const TreemapComponent = ({ data, settings }) => {
  const [chartData, setChartData] = useState({
    name: "Root",
    children: [],
  });
  const [rootWidth, setRootWidth] = useState(0);
  const [rootHeight, setRootHeight] = useState(0);
  const chartRef = useRef();

  useEffect(() => {
    const container = chartRef.current;

    const handleResize = entries => {
      for (const entry of entries) {
        if (entry.target === container) {
          const { current } = chartRef;
          const boundingRect = current.getBoundingClientRect();
          const { width, height } = boundingRect;
          setRootWidth(width);
          setRootHeight(height);
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
    const { rows, cols } = data;
    const updatedChartData = {
      name: "Root",
      children: [],
    };

    rows.forEach((row, rowIndex) => {
      if (rowIndex < 100) {
        const currentChild = { name: row[0] };
        cols.forEach((col, index) => {
          if (col.name === settings["treemap.cell_size"]) {
            currentChild["value"] = row[index];
            currentChild["valueColumn"] = col.display_name;
          } else if (col.name === settings["treemap.cell_color"]) {
            currentChild["color"] = row[index];
            currentChild["colorColumn"] = col.display_name;
          }
        });
        if (!currentChild["color"]) {
          currentChild["color"] = currentChild["value"];
          currentChild["colorColumn"] = currentChild["valueColumn"];
        }
        updatedChartData.children.push(currentChild);
      }
    });
    setChartData(updatedChartData);
  }, [data, settings]);

  useEffect(() => {
    drawTreeMap(chartData, rootWidth, rootHeight, chartRef);
  }, [chartData, rootWidth, rootHeight]);

  return (
    <TreeMapRoot id="treemap-root">
      <svg
        style={{ width: "99%", height: "99%", border: "1px solid" }}
        ref={chartRef}
      ></svg>
    </TreeMapRoot>
  );
};

class TreeMap extends Component {
  static uiName = t`Tree Map`;
  static identifier = "tree_map";

  constructor(props) {
    super(props);

    this.state = {
      data: [],
      columns: {},
    };
  }

  static settings = {
    "treemap.cell_size": {
      section: t`Columns`,
      title: t`Cell Size`,
      widget: "field",
      getDefault: ([{ data }]) => {
        const { name } = data.cols.find(isMetric);
        return name;
      },
      getProps: (
        [
          {
            data: { cols },
          },
        ],
        settings,
      ) => ({
        options: cols.filter(isMetric).map(getOptionFromColumn),
      }),
      persistDefault: true,
    },
    "treemap.cell_color": {
      section: t`Columns`,
      title: t`Cell Color`,
      widget: "field",
      getDefault: ([{ data }]) => {
        const { name } = data.cols.find(isMetric);
        return name;
      },
      getProps: (
        [
          {
            data: { cols },
          },
        ],
        settings,
      ) => ({
        options: cols.filter(isMetric).map(getOptionFromColumn),
      }),
      persistDefault: true,
    },
  };

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
      data,
    });
  }

  render() {
    const { settings } = this.props;
    return <TreemapComponent data={this.state.data} settings={settings} />;
  }
}

export default TreeMap;
