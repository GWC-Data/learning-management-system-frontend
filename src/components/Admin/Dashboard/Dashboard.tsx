// // import React, { useEffect, useRef } from "react";
// // import * as d3 from "d3";

// // // Sample hierarchical data for sunburst chart
// // const sampleData = {
// //   name: "Root",
// //   children: [
// //     {
// //       name: "Category A",
// //       children: [
// //         { name: "Sub A1", value: 10 },
// //         { name: "Sub A2", value: 20 }
// //       ]
// //     },
// //     {
// //       name: "Category B",
// //       children: [
// //         { name: "Sub B1", value: 15 },
// //         { name: "Sub B2", value: 25 }
// //       ]
// //     }
// //   ]
// // };

// // // Type definition for CustomNode
// // type CustomNode = d3.HierarchyRectangularNode<any> & {
// //   current?: any;
// //   target?: any;
// // };

// // interface SunburstChartProps {
// //   data: any;
// // }

// // const SunburstChart: React.FC<SunburstChartProps> = ({ data }) => {
// //   const chartRef = useRef<HTMLDivElement | null>(null);

// //   useEffect(() => {
// //     if (!data) return;

// //     const width = 500;
// //     const radius = width / 6;

// //     // Clear previous SVG before rendering new one
// //     d3.select(chartRef.current).selectAll("*").remove();

// //     const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

// //     const hierarchy = d3.hierarchy(data)
// //       .sum(d => d.value)
// //       .sort((a, b) => (b.value || 0) - (a.value || 0)); // Ensure value is not undefined

// //     const root = d3.partition<CustomNode>()
// //       .size([2 * Math.PI, hierarchy.height + 1])(hierarchy);

// //     // Type assertion to inform TypeScript that `current` exists
// //     (root as CustomNode).each(d => (d.current = { ...d }));

// //     const arc = d3.arc<d3.HierarchyRectangularNode<any>>() // Ensure TypeScript knows the type
// //       .startAngle(d => d.x0)
// //       .endAngle(d => d.x1)
// //       .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
// //       .padRadius(radius * 1.5)
// //       .innerRadius(d => d.y0 * radius)
// //       .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

// //     const svg = d3.select(chartRef.current)
// //       .append("svg")
// //       .attr("viewBox", [-width / 2, -width / 2, width, width])
// //       .style("font", "10px sans-serif")
// //       .style("display", "block") // Ensure it displays properly
// //       .style("margin", "0 auto"); // Center the chart

// //     const path = svg.append("g")
// //       .selectAll("path")
// //       .data(root.descendants().slice(1) as CustomNode[]) // Cast to CustomNode[]
// //       .join("path")
// //       .attr("fill", d => { while (d.depth > 1) d = d.parent!; return color(d.data.name); })
// //       .attr("fill-opacity", d => d.children ? 0.6 : 0.4)
// //       .attr("pointer-events", "auto")
// //       .attr("d", d => arc(d.current!)) // Ensure `current` exists

// //     path.append("title")
// //       .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${d.value}`);

// //   }, [data]);

// //   return <div ref={chartRef} style={{ width: '530px', height: '530px' }} />; // Set height to ensure it's visible
// // };

// // const Dashboard: React.FC = () => {
// //   return (
// //     <>
// //       <div className="dashboard m-10">
// //         <h2 className="text-2xl font-bold mb-12">
// //           Welcome to the LMS Dashboard!
// //         </h2>

// //         {/* Sunburst Chart */}
// //         <div className="mt-10 flex justify-center">
// //           <SunburstChart data={sampleData} />
// //         </div>
// //       </div>
// //     </>
// //   );
// // };

// // export default Dashboard;


// import React, { useState, useEffect } from "react";
// import SunburstChart from "./sunburstChart";
// import { fetchCourseApi } from "../../../helpers/api/courseApi";
// import { fetchBatchApi } from '../../../helpers/api/batchApi';
// import { fetchCourseModuleApi } from '../../../helpers/api/courseModuleApi';

// const Dashboard: React.FC = () => {
//   const [chartData, setChartData] = useState<{ name: string; children: any[] }>({
//     name: "Root",
//     children: [],
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const batches = await fetchBatchApi();
//         console.log("batches", batches);
//         const courses = await fetchCourseApi();
//         console.log("courses", courses);
//         const modules = await fetchCourseModuleApi();
//         console.log("module", modules);

//         // Convert API data into Sunburst-compatible format
//         const transformedData = {
//           name: "Root",
//           children: [
//             {
//               name: "Batches",
//               children: batches.batch?.map((batch: { batchName: any }) => ({
//                 name: batch.batchName,
//                 value: 1,
//               })),
//             },
//             {
//               name: "Courses",
//               children: courses.map((course: { courseName: any; id: any; }) => ({
//                 name: course.courseName, // Ensure course API has a name field
//                 value: 1,
//               })),
//             },
//             {
//               name: "Modules",
//               children: modules.map((module: { moduleName: any; id: any; }) => ({
//                 name: module.moduleName, // Ensure module API has a name field
//                 value: 1,
//               })),
//             }
//           ],
//         };

//         setChartData(transformedData);
//       } catch (error) {
//         console.error("Error fetching dashboard data", error);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <div className="dashboard m-10">
//       <h2 className="text-2xl font-bold mb-12">Welcome to the LMS Dashboard!</h2>

//       {/* Sunburst Chart */}
//       <div className="mt-10 flex justify-center">
//         {chartData ? <SunburstChart data={chartData} /> : <p>Loading chart...</p>}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import React from "react";
import { FiUsers, FiBookOpen, FiBarChart2, FiBell } from "react-icons/fi";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Students", value: 500, color: "#4CAF50" },
  { name: "Instructors", value: 50, color: "#FF9800" },
  { name: "Admins", value: 10, color: "#E91E63" },
];

const Dashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">


      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
            <FiUsers className="text-blue-500 text-3xl" />
            <div>
              <h3 className="text-lg font-semibold">Total Users</h3>
              <p className="text-gray-600 text-xl">560</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
            <FiBookOpen className="text-green-500 text-3xl" />
            <div>
              <h3 className="text-lg font-semibold">Total Courses</h3>
              <p className="text-gray-600 text-xl">45</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
            <FiBarChart2 className="text-purple-500 text-3xl" />
            <div>
              <h3 className="text-lg font-semibold">Active Batches</h3>
              <p className="text-gray-600 text-xl">12</p>
            </div>
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">User Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

