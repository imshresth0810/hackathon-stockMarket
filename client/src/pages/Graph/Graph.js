import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const Graph = ({ydata, xdata}) => {

  const data = {
    labels: [...xdata],
    datasets: [
      {
        data: [...ydata],
        backgroundColor: "transparent",
        borderColor: "#f26c6d",
        pointBorderColor: "transparent",
        pointBorderWidth: 4,
        tension: 0.5,
      },
    ],
  };

  const options = {
    plugins: {
      legend: false,
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          stepSize: 2,
          callback: (value) => "$" + value,
        },
        grid: {
          borderDash: [10],
        },
      },
    },
  };

  return (
    <div style={{display: "flex", width:"100%", height:"800px", marginTop: "30px"}}>
      {/* // <div> */}
      <Line data={data} options={options}></Line>
      
    </div>
  );
};

export default Graph;
