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

const Dashboard = ({ offers }) => {
  const [period, setPeriod] = useState('all');

  const filteredOffers = offers.filter(offer => {
    const date = new Date(offer.createdAt);
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
  const totalRevenue = filteredOffers.reduce((sum, offer) => sum + (offer.pricing?.total || 0), 0);
  const averageValue = totalOffers > 0 ? totalRevenue / totalOffers : 0;

  const workTypeData = filteredOffers.reduce((acc, offer) => {
    acc[offer.workType] = (acc[offer.workType] || 0) + 1;
    return acc;
  }, {});

  const pieData = {
    labels: ['Renovering', 'VVS', 'El'],
    datasets: [{
      data: [
        workTypeData['renovation'] || 0,
        workTypeData['plumbing'] || 0,
        workTypeData['electrical'] || 0
      ],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
    }]
  };

  const timelineData = {
    labels: [],
    datasets: [{
      label: 'Intäkter per månad',
      data: [],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const monthlyData = filteredOffers.reduce((acc, offer) => {
    const date = new Date(offer.createdAt);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    acc[monthKey] = (acc[monthKey] || 0) + (offer.pricing?.total || 0);
    return acc;
  }, {});

  Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([month, total]) => {
      timelineData.labels.push(month);
      timelineData.datasets[0].data.push(total);
    });

  return (
    <div className="dashboard">
      <div className="period-selector">
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="all">Alla perioder</option>
          <option value="month">Denna månad</option>
          <option value="quarter">Detta kvartal</option>
          <option value="year">Detta år</option>
        </select>
      </div>
      
      <div className="stats-overview">
        <div className="stat-card">
          <h3>Antal Offerter</h3>
          <p>{totalOffers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Omsättning</h3>
          <p>{totalRevenue.toLocaleString()} kr</p>
        </div>
        <div className="stat-card">
          <h3>Genomsnittligt Värde</h3>
          <p>{Math.round(averageValue).toLocaleString()} kr</p>
        </div>
      </div>
      
      <div className="charts">
        <div className="chart-container">
          <h3>Fördelning av Arbetstyper</h3>
          <Pie data={pieData} />
        </div>
        <div className="chart-container">
          <h3>Intäkter över tid</h3>
          <Line data={timelineData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;