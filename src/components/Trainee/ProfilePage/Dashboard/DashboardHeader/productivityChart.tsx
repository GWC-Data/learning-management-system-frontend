import React from "react";
import { PolarArea } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, RadialLinearScale } from "chart.js";

// Register necessary components for chart
ChartJS.register(ArcElement, Tooltip, Legend, RadialLinearScale);

const WaterFlowChart: React.FC = () => {
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], // Days of the week
    datasets: [
      {
        label: "Productivity",
        data: [0, 0, 4, 3, 5, 2, 1], // Simulate the water flow data for each day
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)", // Mon
          "rgba(255, 159, 64, 0.6)", // Tue
          "rgba(75, 192, 192, 0.6)", // Wed
          "rgba(153, 102, 255, 0.6)", // Thu
          "rgba(255, 99, 132, 0.6)", // Fri
          "rgba(255, 159, 64, 0.6)", // Sat
          "rgba(54, 162, 235, 0.6)", // Sun
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)", // Mon
          "rgba(255, 159, 64, 1)", // Tue
          "rgba(75, 192, 192, 1)", // Wed
          "rgba(153, 102, 255, 1)", // Thu
          "rgba(255, 99, 132, 1)", // Fri
          "rgba(255, 159, 64, 1)", // Sat
          "rgba(54, 162, 235, 1)", // Sun
        ],
        borderWidth: 1,
        hoverBackgroundColor: "rgba(0, 123, 255, 0.8)", // On hover
        hoverBorderColor: "rgba(0, 123, 255, 1)", // On hover border color
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Weekly Productivity (Water Flow Effect)",
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          display: false, // Hides the scale ticks
        },
      },
    },
    animation: {
      animateScale: true, // Animate the scaling
      animateRotate: true, // Animate the rotation
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow" style={{ width: "280px", height: "280px" }}>
      <PolarArea data={data} options={options} />
    </div>
  );
};

export default WaterFlowChart;
