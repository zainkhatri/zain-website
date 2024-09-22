// BrainActivityChart.js
import './BrainActivityChart.css';  // Import the CSS file

import React, { useState } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const description = 'Brain Activity Radar Chart';

const initialChartData = [
  { region: 'Left Visual Cortex', activity: 0 },
  { region: 'Right Visual Cortex', activity: 0 },
  { region: 'Frontal Lobe', activity: 0 },
  { region: 'Temporal Lobe', activity: 0 },
  { region: 'Occipital Lobe', activity: 0 },
];

export default function BrainActivityChart() {
  const [chartData, setChartData] = useState(initialChartData);

  const handleLookLeft = () => {
    setChartData([
      { region: 'Left Visual Cortex', activity: 80 },
      { region: 'Right Visual Cortex', activity: 20 },
      { region: 'Frontal Lobe', activity: 40 },
      { region: 'Temporal Lobe', activity: 30 },
      { region: 'Occipital Lobe', activity: 50 },
    ]);
  };

  const handleLookRight = () => {
    setChartData([
      { region: 'Left Visual Cortex', activity: 20 },
      { region: 'Right Visual Cortex', activity: 80 },
      { region: 'Frontal Lobe', activity: 40 },
      { region: 'Temporal Lobe', activity: 30 },
      { region: 'Occipital Lobe', activity: 50 },
    ]);
  };

  const handleLookStraight = () => {
    setChartData([
      { region: 'Left Visual Cortex', activity: 50 },
      { region: 'Right Visual Cortex', activity: 50 },
      { region: 'Frontal Lobe', activity: 60 },
      { region: 'Temporal Lobe', activity: 50 },
      { region: 'Occipital Lobe', activity: 70 },
    ]);
  };

  return (
    <div className="brain-activity-chart">
      <header className="header">
        <h2 className="title">Brain Activity Radar Chart</h2>
      </header>

      <div className="contentRow">
        {/* Radar chart content */}
        <div className="chartContent">
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart
              data={chartData}
              margin={{ top: 20, right: 40, bottom: 0, left: 40 }}
            >
              <defs>
                <linearGradient id="colorActivity" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ff7f50" />
                  <stop offset="100%" stopColor="#1e90ff" />
                </linearGradient>
              </defs>
              <PolarGrid stroke="#ccc" />
              <PolarAngleAxis dataKey="region" tick={{ fill: '#fff', fontSize: 12 }} />
              <Radar
                name="Activity"
                dataKey="activity"
                stroke="url(#colorActivity)"
                fill="url(#colorActivity)"
                fillOpacity={0.7}
                isAnimationActive={true}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Buttons aligned to the right */}
        <div className="buttonGroup">
          <button className="button" onClick={handleLookLeft}>
            Look Left
          </button>
          <button className="button" onClick={handleLookRight}>
            Look Right
          </button>
          <button className="button" onClick={handleLookStraight}>
            Look Straight
          </button>
        </div>
      </div>
    </div>
  );
}
