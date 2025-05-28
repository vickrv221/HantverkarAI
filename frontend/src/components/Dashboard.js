import React, { useState } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
 Chart as ChartJS,
 CategoryScale,
 LinearScale,
 PointElement,
 LineElement,
 ArcElement,
 Title,
 Tooltip,
 Legend
} from 'chart.js';

ChartJS.register(
 CategoryScale,
 LinearScale,
 PointElement,
 LineElement,
 ArcElement,
 Title,
 Tooltip,
 Legend
);

/**
 * Dashboard-komponent som visar statistik och grafer för offerter
 * @param {Array} offers - Array av offert-objekt från backend
 */
const Dashboard = ({ offers = [] }) => {
 const [period, setPeriod] = useState('all');

 // Mappning för arbetstyper från engelska till svenska
 const workTypeMapping = {
   'Renovering': 'Renovering',
   'VVS': 'VVS',
   'El': 'El',
   'renovation': 'Renovering',
   'plumbing': 'VVS',
   'electrical': 'El'
 };

 // Visa meddelande om ingen data finns
 if (!offers || offers.length === 0) {
   return (
     <div className="dashboard">
       <div className="no-data">
         <h3>Ingen data att visa</h3>
         <p>Skapa några offerter för att se statistik här.</p>
       </div>
     </div>
   );
 }

 // Filtrera offerter baserat på vald tidsperiod
 const filteredOffers = offers.filter(offer => {
   if (!offer.createdAt) return false;
   
   const date = new Date(offer.createdAt);
   if (isNaN(date.getTime())) return false;
   
   const now = new Date();
   
   switch(period) {
     case 'month':
       return date.getMonth() === now.getMonth() && 
              date.getFullYear() === now.getFullYear();
     case 'quarter':
       const quarter = Math.floor(date.getMonth() / 3);
       const currentQuarter = Math.floor(now.getMonth() / 3);
       return quarter === currentQuarter && 
              date.getFullYear() === now.getFullYear();
     case 'year':
       return date.getFullYear() === now.getFullYear();
     default:
       return true;
   }
 });

 const totalOffers = filteredOffers.length;
 
 // Beräkna total omsättning från filtrerade offerter
 const totalRevenue = filteredOffers.reduce((sum, offer) => {
   const total = offer.totalIncVat || 0;
   return sum + (typeof total === 'number' ? total : 0);
 }, 0);
 
 const averageValue = totalOffers > 0 ? totalRevenue / totalOffers : 0;

 // Beräkna fördelning av arbetstyper för pie chart
 const workTypeData = filteredOffers.reduce((acc, offer) => {
   const workType = workTypeMapping[offer.workType] || offer.workType || 'Övrigt';
   acc[workType] = (acc[workType] || 0) + 1;
   return acc;
 }, {});

 // Konfiguration för pie chart
 const pieData = {
   labels: Object.keys(workTypeData),
   datasets: [{
     data: Object.values(workTypeData),
     backgroundColor: [
       '#FF6384', 
       '#36A2EB', 
       '#FFCE56', 
       '#4BC0C0', 
       '#9966FF',
       '#FF9F40'
     ],
     borderWidth: 2,
     borderColor: '#fff'
   }]
 };

 // Beräkna månadsdata för tidslinje-graf
 const monthlyData = filteredOffers.reduce((acc, offer) => {
   const date = new Date(offer.createdAt);
   if (isNaN(date.getTime())) return acc;
   
   const monthKey = date.toLocaleDateString('sv-SE', { 
     year: 'numeric', 
     month: 'short' 
   });
   const total = offer.totalIncVat || 0;
   acc[monthKey] = (acc[monthKey] || 0) + (typeof total === 'number' ? total : 0);
   return acc;
 }, {});

 // Konfiguration för linje-graf
 const timelineData = {
   labels: Object.keys(monthlyData).sort(),
   datasets: [{
     label: 'Intäkter per månad',
     data: Object.keys(monthlyData).sort().map(month => monthlyData[month]),
     fill: false,
     borderColor: 'rgb(75, 192, 192)',
     backgroundColor: 'rgba(75, 192, 192, 0.2)',
     tension: 0.1,
     pointBackgroundColor: 'rgb(75, 192, 192)',
     pointBorderColor: '#fff',
     pointBorderWidth: 2,
     pointRadius: 6,
     pointHoverRadius: 8
   }]
 };

 // Grundläggande chart-optioner
 const chartOptions = {
   responsive: true,
   maintainAspectRatio: false,
   plugins: {
     legend: {
       position: 'top',
       onClick: null, // Inaktivera klick på legend
     },
     title: {
       display: false,
     },
   },
 };

 // Specifika optioner för linje-grafen
 const lineChartOptions = {
   responsive: true,
   maintainAspectRatio: false,
   plugins: {
     legend: {
       position: 'top',
       onClick: null, // Inaktivera klick på legend
     },
     title: {
       display: false,
     },
     tooltip: {
       callbacks: {
         label: function(context) {
           return context.dataset.label + ': ' + context.parsed.y.toLocaleString('sv-SE') + ' kr';
         }
       }
     }
   },
   scales: {
     y: {
       beginAtZero: true,
       ticks: {
         callback: function(value) {
           return value.toLocaleString('sv-SE') + ' kr';
         }
       }
     },
     x: {
       ticks: {
         maxRotation: 45,
         minRotation: 0
       }
     }
   }
 };

 return (
   <div className="dashboard">
     <div className="dashboard-header">
       <h2>Dashboard</h2>
       <div className="period-selector">
         <select value={period} onChange={(e) => setPeriod(e.target.value)}>
           <option value="all">Alla perioder</option>
           <option value="month">Denna månad</option>
           <option value="quarter">Detta kvartal</option>
           <option value="year">Detta år</option>
         </select>
       </div>
     </div>
     
     <div className="stats-overview">
       <div className="stat-card">
         <h3>Antal Offerter</h3>
         <p className="stat-number">{totalOffers}</p>
       </div>
       <div className="stat-card">
         <h3>Total Omsättning</h3>
         <p className="stat-number">{totalRevenue.toLocaleString('sv-SE')} kr</p>
       </div>
       <div className="stat-card">
         <h3>Genomsnittligt Värde</h3>
         <p className="stat-number">{Math.round(averageValue).toLocaleString('sv-SE')} kr</p>
       </div>
     </div>
     
     <div className="charts">
       <div className="chart-container">
         <h3>Fördelning av Arbetstyper</h3>
         <div className="chart-wrapper">
           {Object.keys(workTypeData).length > 0 ? (
             <Pie data={pieData} options={chartOptions} />
           ) : (
             <div className="no-chart-data">Ingen data för denna period</div>
           )}
         </div>
       </div>
       
       <div className="chart-container">
         <h3>Intäkter över tid</h3>
         <div className="chart-wrapper">
           {timelineData.labels.length > 0 ? (
             <Line data={timelineData} options={lineChartOptions} />
           ) : (
             <div className="no-chart-data">Ingen data för denna period</div>
           )}
         </div>
       </div>
     </div>
   </div>
 );
};

export default Dashboard;