import React from "react"; import WeeklySalesChart from "./WeeklySalesChart"; import BestSellingProductsChart from "./BestSellingProductsChart";
export default function DashboardCharts({ sales }) { return ( <div className="liquid-card grid grid-cols-1 gap-6 p-6 min-[1440px]:grid-cols-2"> <WeeklySalesChart /> <BestSellingProductsChart /> </div> ); } 
