// useEffect(() => {
//     if (!data) return;
  
//     const width = 500;
//     const radius = width / 6;
  
//     d3.select(chartRef.current).selectAll("*").remove(); // Clear old SVG
  
//     const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));
  
//     const hierarchy = d3.hierarchy(data)
//       .sum(d => d.value || 1)
//       .sort((a, b) => (b.value || 0) - (a.value || 0));
  
//     const root = d3.partition<CustomNode>()
//       .size([2 * Math.PI, hierarchy.height + 1])(hierarchy) as CustomNode;
  
//     let focus: CustomNode = root; // ✅ Always start at root
  
//     root.each(d => (d.current = { x0: d.x0, x1: d.x1, y0: d.y0, y1: d.y1 }));
  
//     const arc = d3.arc<CustomNode>()
//       .startAngle(d => d.current!.x0)
//       .endAngle(d => d.current!.x1)
//       .padAngle(d => Math.min((d.current!.x1 - d.current!.x0) / 2, 0.005))
//       .padRadius(radius * 1.5)
//       .innerRadius(d => d.current!.y0 * radius)
//       .outerRadius(d => Math.max(d.current!.y0 * radius, d.current!.y1 * radius - 1));
  
//     const svg = d3.select(chartRef.current)
//       .append("svg")
//       .attr("viewBox", [-width / 2, -width / 2, width, width])
//       .style("font", "10px sans-serif")
//       .style("display", "block")
//       .style("margin", "0 auto");
  
//     const path = svg.append("g")
//       .selectAll("path")
//       .data(root.descendants().slice(1) as CustomNode[])
//       .join("path")
//       .attr("fill", d => { while (d.depth > 1) d = d.parent!; return color(d.data.name); })
//       .attr("fill-opacity", d => d.children ? 0.6 : 0.4)
//       .attr("pointer-events", "auto")
//       .attr("d", arc)
//       .style("cursor", "pointer")
//       .on("click", (event, d) => zoomToNode(d));
  
//     const labels = svg.append("g")
//       .selectAll("text")
//       .data(root.descendants())
//       .join("text")
//       .attr("pointer-events", "none")
//       .attr("text-anchor", "middle")
//       .attr("fill", "#000")
//       .attr("font-size", "12px")
//       .attr("dy", "0.35em")
//       .text(d => d.data.name)
//       .style("opacity", 1); // ✅ Show names initially
  
//     function zoomToNode(target: CustomNode) {
//       if (!target || !target.current) return;
//       focus = focus === target ? root : target; // ✅ Zoom out if same node clicked
  
//       const t = svg.transition().duration(750);
  
//       path.transition(t)
//         .attrTween("d", d => {
//           if (!d.current || !focus.current) return () => arc(d) || "";
//           const i = d3.interpolateObject(d.current, focus.current);
//           return t => {
//             d.current = i(t);
//             return arc(d) || "";
//           };
//         });
  
//       labels.transition(t)
//         .attr("transform", d => `translate(${arc.centroid(d)})`) // Move labels
//         .style("opacity", d => focus === root || focus === d ? 1 : 0); // ✅ Hide non-focused labels
//     }
//   }, [data]);
  