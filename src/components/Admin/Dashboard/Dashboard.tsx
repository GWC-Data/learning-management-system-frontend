import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

// Sample hierarchical data for sunburst chart
const sampleData = {
  name: "Root",
  children: [
    {
      name: "Category A",
      children: [
        { name: "Sub A1", value: 10 },
        { name: "Sub A2", value: 20 }
      ]
    },
    {
      name: "Category B",
      children: [
        { name: "Sub B1", value: 15 },
        { name: "Sub B2", value: 25 }
      ]
    }
  ]
};

// Type definition for CustomNode
type CustomNode = d3.HierarchyRectangularNode<any> & {
  current?: any;
  target?: any;
};

interface SunburstChartProps {
  data: any;
}

const SunburstChart: React.FC<SunburstChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!data) return;

    const width = 500;
    const radius = width / 6;

    // Clear previous SVG before rendering new one
    d3.select(chartRef.current).selectAll("*").remove();

    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

    const hierarchy = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0)); // Ensure value is not undefined

    const root = d3.partition<CustomNode>()
      .size([2 * Math.PI, hierarchy.height + 1])(hierarchy);

    // Type assertion to inform TypeScript that `current` exists
    (root as CustomNode).each(d => (d.current = { ...d }));

    const arc = d3.arc<d3.HierarchyRectangularNode<any>>() // Ensure TypeScript knows the type
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius(d => d.y0 * radius)
      .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("viewBox", [-width / 2, -width / 2, width, width])
      .style("font", "10px sans-serif")
      .style("display", "block") // Ensure it displays properly
      .style("margin", "0 auto"); // Center the chart

    const path = svg.append("g")
      .selectAll("path")
      .data(root.descendants().slice(1) as CustomNode[]) // Cast to CustomNode[]
      .join("path")
      .attr("fill", d => { while (d.depth > 1) d = d.parent!; return color(d.data.name); })
      .attr("fill-opacity", d => d.children ? 0.6 : 0.4)
      .attr("pointer-events", "auto")
      .attr("d", d => arc(d.current!)) // Ensure `current` exists

    path.append("title")
      .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${d.value}`);

  }, [data]);

  return <div ref={chartRef} style={{ width: '530px', height: '530px' }} />; // Set height to ensure it's visible
};

const Dashboard: React.FC = () => {
  return (
    <>
      <div className="dashboard m-10">
        <h2 className="text-2xl font-bold mb-12">
          Welcome to the LMS Dashboard!
        </h2>

        {/* Sunburst Chart */}
        <div className="mt-10 flex justify-center">
          <SunburstChart data={sampleData} />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
