import './BrainActivityChart.css';
import React, { useState, useEffect } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function BrainActivityChart() {
  const [chartData, setChartData] = useState([
    { region: 'Left Visual Cortex', activity: 0 },
    { region: 'Right Visual Cortex', activity: 0 },
    { region: 'Frontal Lobe', activity: 0 },
    { region: 'Temporal Lobe', activity: 0 },
    { region: 'Occipital Lobe', activity: 0 },
  ]);

  const [axisFontSize, setAxisFontSize] = useState(12);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 480) {
        setAxisFontSize(5);
      } else if (window.innerWidth <= 768) {
        setAxisFontSize(10);
      } else {
        setAxisFontSize(12);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Trigger complex vibration pattern when chartData changes
  useEffect(() => {
    if (window.navigator && window.navigator.vibrate) {
      // Custom vibration pattern
      window.navigator.vibrate([100, 30, 100, 30, 100, 30, 200, 30, 200, 30, 200, 30, 100, 30, 100, 30, 100]);
    }
  }, [chartData]);

  const handleActivityChange = (action) => {
    switch (action) {
      case 'left':
        setChartData([
          { region: 'Left Visual Cortex', activity: 80 },
          { region: 'Right Visual Cortex', activity: 20 },
          { region: 'Frontal Lobe', activity: 40 },
          { region: 'Temporal Lobe', activity: 30 },
          { region: 'Occipital Lobe', activity: 50 },
        ]);
        break;
      case 'right':
        setChartData([
          { region: 'Left Visual Cortex', activity: 20 },
          { region: 'Right Visual Cortex', activity: 80 },
          { region: 'Frontal Lobe', activity: 40 },
          { region: 'Temporal Lobe', activity: 30 },
          { region: 'Occipital Lobe', activity: 50 },
        ]);
        break;
      case 'straight':
        setChartData([
          { region: 'Left Visual Cortex', activity: 50 },
          { region: 'Right Visual Cortex', activity: 50 },
          { region: 'Frontal Lobe', activity: 60 },
          { region: 'Temporal Lobe', activity: 50 },
          { region: 'Occipital Lobe', activity: 70 },
        ]);
        break;
      case 'thinking':
        setChartData([
          { region: 'Left Visual Cortex', activity: 20 },
          { region: 'Right Visual Cortex', activity: 20 },
          { region: 'Frontal Lobe', activity: 70 },
          { region: 'Temporal Lobe', activity: 60 },
          { region: 'Occipital Lobe', activity: 30 },
        ]);
        break;
      case 'visualProcessing':
        setChartData([
          { region: 'Left Visual Cortex', activity: 70 },
          { region: 'Right Visual Cortex', activity: 70 },
          { region: 'Frontal Lobe', activity: 30 },
          { region: 'Temporal Lobe', activity: 20 },
          { region: 'Occipital Lobe', activity: 80 },
        ]);
        break;
      default:
        break;
    }

    // Trigger simple haptic feedback when the buttons are clicked
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(200); // Vibrate for 200ms after button click
    }
  };

  return (
    <div className="brain-activity-chart">
      <header className="header">
        <h2 className="title">Brain Activity Radar Chart</h2>
      </header>

      <div className="content-row">
        <div className="chart-content">
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart
              data={chartData}
              margin={{ top: 20, right: 30, bottom: 10, left: 30 }}
              style={{ overflow: 'visible' }}
            >
              <PolarGrid stroke="#ccc" />
              <PolarAngleAxis 
                dataKey="region" 
                tick={{ fill: '#fff', fontSize: axisFontSize }} 
              />
              <Radar
                name="Activity"
                dataKey="activity"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.7}
              />
              <Tooltip
                formatter={(value, name, props) => {
                  let regionDescription = '';
                  switch (props.payload.region) {
                    case 'Left Visual Cortex':
                    case 'Right Visual Cortex':
                      regionDescription = 'Visual Processing';
                      break;
                    case 'Frontal Lobe':
                      regionDescription = 'Higher Cognitive Functions';
                      break;
                    case 'Temporal Lobe':
                      regionDescription = 'Auditory Processing';
                      break;
                    case 'Occipital Lobe':
                      regionDescription = 'Visual Interpretation';
                      break;
                    default:
                      regionDescription = '';
                  }
                  return [`${value}%`, `${regionDescription}`];
                }}
                labelFormatter={(label) => `Region: ${label}`}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="button-group">
          <button className="button" onClick={() => handleActivityChange('thinking')}>Thinking</button>
          <button className="button" onClick={() => handleActivityChange('visualProcessing')}>Visual Processing</button>
          <button className="button" onClick={() => handleActivityChange('left')}>Look Left</button>
          <button className="button" onClick={() => handleActivityChange('right')}>Look Right</button>
          <button className="button" onClick={() => handleActivityChange('straight')}>Look Straight</button>
        </div>
      </div>
    </div>
  );
}
