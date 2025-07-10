import React, { useState, useEffect, memo, useMemo } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import './BrainActivityChart.css';

const BrainActivityChart = memo(() => {
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
        setAxisFontSize(8);
      } else if (window.innerWidth <= 768) {
        setAxisFontSize(10);
      } else {
        setAxisFontSize(12);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleActivityChange = (action) => {
    let newData = [];
    switch (action) {
      case 'left':
        newData = [
          { region: 'Left Visual Cortex', activity: 80 },
          { region: 'Right Visual Cortex', activity: 20 },
          { region: 'Frontal Lobe', activity: 40 },
          { region: 'Temporal Lobe', activity: 30 },
          { region: 'Occipital Lobe', activity: 50 },
        ];
        break;
      case 'right':
        newData = [
          { region: 'Left Visual Cortex', activity: 20 },
          { region: 'Right Visual Cortex', activity: 80 },
          { region: 'Frontal Lobe', activity: 40 },
          { region: 'Temporal Lobe', activity: 30 },
          { region: 'Occipital Lobe', activity: 50 },
        ];
        break;
      case 'straight':
        newData = [
          { region: 'Left Visual Cortex', activity: 50 },
          { region: 'Right Visual Cortex', activity: 50 },
          { region: 'Frontal Lobe', activity: 60 },
          { region: 'Temporal Lobe', activity: 50 },
          { region: 'Occipital Lobe', activity: 70 },
        ];
        break;
      case 'thinking':
        newData = [
          { region: 'Left Visual Cortex', activity: 20 },
          { region: 'Right Visual Cortex', activity: 20 },
          { region: 'Frontal Lobe', activity: 70 },
          { region: 'Temporal Lobe', activity: 60 },
          { region: 'Occipital Lobe', activity: 30 },
        ];
        break;
      case 'visualProcessing':
        newData = [
          { region: 'Left Visual Cortex', activity: 70 },
          { region: 'Right Visual Cortex', activity: 70 },
          { region: 'Frontal Lobe', activity: 30 },
          { region: 'Temporal Lobe', activity: 20 },
          { region: 'Occipital Lobe', activity: 80 },
        ];
        break;
      default:
        break;
    }
    setChartData(newData);
  };

  return (
    <div className="brain-activity-chart">
      <header className="header">
        <h2 className="title">Brain Activity Radar Chart</h2>
      </header>

      <div className="content-row">
        <div className="chart-content">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={chartData}
              margin={{ top: 20, right: 30, bottom: 10, left: 30 }}
            >
              <PolarGrid stroke="#ccc" />
              <PolarAngleAxis
                dataKey="region"
                tick={{
                  fill: '#fff',
                  fontSize: axisFontSize,
                  fontFamily: 'Play, sans-serif', // Enforce the font here
                }}
              />
              <Radar
                name="Activity"
                dataKey="activity"
                stroke="#ff6ec4"
                fill="#7873f5"
                fillOpacity={0.8}
                animationDuration={800}
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
                contentStyle={{
                  backgroundColor: '#222',
                  color: '#fff',
                  borderRadius: '8px',
                  fontFamily: 'Play, sans-serif', // Enforce the font in tooltips
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="button-group">
          <button 
            className="button" 
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleActivityChange('thinking');
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleActivityChange('thinking');
            }}
          >
            Thinking
          </button>
          <button 
            className="button" 
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleActivityChange('visualProcessing');
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleActivityChange('visualProcessing');
            }}
          >
            Visual Processing
          </button>
          <button 
            className="button" 
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleActivityChange('left');
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleActivityChange('left');
            }}
          >
            Look Left
          </button>
          <button 
            className="button" 
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleActivityChange('right');
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleActivityChange('right');
            }}
          >
            Look Right
          </button>
          <button 
            className="button" 
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleActivityChange('straight');
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleActivityChange('straight');
            }}
          >
            Look Straight
          </button>
        </div>
      </div>
    </div>
  );
});

export default BrainActivityChart;
