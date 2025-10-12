import React, { useEffect, useRef, useState } from 'react';
import './BrainwaveAnimation.css';

const BrainwaveAnimation = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [brainState, setBrainState] = useState('processing');
  const timeRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dotPosition, setDotPosition] = useState({ x: 50, y: 50 });
  const gridRef = useRef(null);

  // Wave configurations for different frequency bands
  const waveConfigs = {
    delta: {
      frequency: 2,
      amplitude: 60,
      color: '#7873f5',
      phase: 0,
      speed: 0.5
    },
    theta: {
      frequency: 6,
      amplitude: 45,
      color: '#6b9bd1',
      phase: 1,
      speed: 0.7
    },
    alpha: {
      frequency: 10,
      amplitude: 50,
      color: '#5dbea3',
      phase: 2,
      speed: 1
    },
    beta: {
      frequency: 20,
      amplitude: 35,
      color: '#ff6ec4',
      phase: 3,
      speed: 1.5
    },
    gamma: {
      frequency: 40,
      amplitude: 20,
      color: '#ff8fd8',
      phase: 4,
      speed: 2
    }
  };

  // Brain state configurations
  const stateConfigs = {
    resting: {
      delta: 0.2,
      theta: 0.6,
      alpha: 1.0,
      beta: 0.3,
      gamma: 0.1
    },
    focused: {
      delta: 0.1,
      theta: 0.2,
      alpha: 0.4,
      beta: 1.0,
      gamma: 0.8
    },
    deepSleep: {
      delta: 1.0,
      theta: 0.5,
      alpha: 0.1,
      beta: 0.0,
      gamma: 0.0
    },
    meditation: {
      delta: 0.2,
      theta: 0.5,
      alpha: 1.0,
      beta: 0.2,
      gamma: 0.1
    },
    processing: {
      delta: 0.5,
      theta: 0.7,
      alpha: 0.8,
      beta: 0.9,
      gamma: 0.6
    }
  };

  const [currentAmplitudes, setCurrentAmplitudes] = useState(stateConfigs.processing);
  const [targetAmplitudes, setTargetAmplitudes] = useState(stateConfigs.processing);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const drawWave = (wave, amplitude, time, canvasWidth, canvasHeight) => {
      const { frequency, color, phase, speed } = wave;
      const midY = canvasHeight / 2;
      const wavelength = canvasWidth / (frequency / 2);

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;

      for (let x = 0; x < canvasWidth; x += 2) {
        const y = midY +
          Math.sin((x / wavelength + time * speed + phase) * Math.PI * 2) *
          amplitude * (canvasHeight / 400);

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const canvasWidth = rect.width;
      const canvasHeight = rect.height;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Smooth amplitude transitions
      const smoothingFactor = 0.05;
      const newAmplitudes = {};
      let needsUpdate = false;

      Object.keys(currentAmplitudes).forEach(wave => {
        const current = currentAmplitudes[wave];
        const target = targetAmplitudes[wave];
        const diff = Math.abs(current - target);

        if (diff > 0.01) {
          needsUpdate = true;
          newAmplitudes[wave] = current + (target - current) * smoothingFactor;
        } else {
          newAmplitudes[wave] = target;
        }
      });

      if (needsUpdate) {
        setCurrentAmplitudes(newAmplitudes);
      }

      // Draw each wave with current amplitude
      timeRef.current += 0.01;
      Object.keys(waveConfigs).forEach(waveKey => {
        const wave = waveConfigs[waveKey];
        const amplitudeMultiplier = currentAmplitudes[waveKey] || 0;
        if (amplitudeMultiplier > 0.05) {
          drawWave(wave, wave.amplitude * amplitudeMultiplier, timeRef.current, canvasWidth, canvasHeight);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentAmplitudes, targetAmplitudes]);

  const handleStateChange = (state) => {
    setBrainState(state);
    setTargetAmplitudes(stateConfigs[state]);
  };

  // Handle mouse/touch events for dragging
  const handleDragStart = (e) => {
    setIsDragging(true);
    updateDotPosition(e);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    updateDotPosition(e);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const updateDotPosition = (e) => {
    if (!gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    setDotPosition({
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y))
    });
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove);
      document.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  // Calculate brain state based on dot position
  useEffect(() => {
    const xOffset = (dotPosition.x - 50) / 50; // -1 to 1
    const yOffset = (dotPosition.y - 50) / 50; // -1 to 1

    // Adjust wave amplitudes based on position - more dramatic changes
    const newAmplitudes = {
      delta: Math.max(0.1, 0.4 + yOffset * 0.8), // Strong increase backward
      theta: Math.max(0.1, 0.5 + xOffset * 0.6), // Increase when leaning right
      alpha: Math.max(0.1, 1.0 - Math.abs(xOffset) * 0.7 - Math.abs(yOffset) * 0.7), // Strong decrease when unstable
      beta: Math.max(0.1, 0.4 + Math.abs(xOffset) * 0.9), // Strong increase on sides
      gamma: Math.max(0.1, 0.3 - yOffset * 0.7 + Math.abs(xOffset) * 0.5) // Increase forward and on sides
    };

    setTargetAmplitudes(newAmplitudes);
  }, [dotPosition]);

  const isUnstable = Math.abs(dotPosition.x - 50) > 22 || Math.abs(dotPosition.y - 50) > 22;

  // Determine lean direction
  const getLeanDirection = () => {
    const xDiff = dotPosition.x - 50;
    const yDiff = dotPosition.y - 50;

    if (Math.abs(xDiff) < 20 && Math.abs(yDiff) < 20) {
      return 'BALANCED';
    }

    const absX = Math.abs(xDiff);
    const absY = Math.abs(yDiff);

    if (absY > absX) {
      return yDiff < 0 ? 'LEANING FORWARD' : 'LEANING BACKWARD';
    } else {
      return xDiff < 0 ? 'LEANING LEFT' : 'LEANING RIGHT';
    }
  };

  const leanDirection = getLeanDirection();

  return (
    <div className="brainwave-container">
      <div className="demo-container">
        {/* Left Side: Interactive Balance Grid */}
        <div className="demo-section">
          <div className="section-header">
            <h4 className="section-title">Body Position Input</h4>
            <p className="section-subtitle">drag the dot to simulate movement</p>
          </div>
          <div
            ref={gridRef}
            className="balance-grid interactive"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="balance-center-zone">
              <span className="balance-label">stable zone</span>
            </div>
            <div
              className={`balance-dot ${isUnstable ? 'unstable' : 'stable'} ${isDragging ? 'dragging' : ''}`}
              style={{
                left: `${dotPosition.x}%`,
                top: `${dotPosition.y}%`
              }}
            >
              {!isDragging && <div className="balance-ripple"></div>}
            </div>
            <div className="balance-axes">
              <div className="balance-axis horizontal">
                <span className="axis-label left">← left</span>
                <span className="axis-label right">right →</span>
              </div>
              <div className="balance-axis vertical">
                <span className="axis-label top">↑ forward</span>
                <span className="axis-label bottom">backward ↓</span>
              </div>
            </div>
          </div>

          {/* Lean Status Display */}
          <div className="lean-display">
            <div className={`lean-indicator ${isUnstable ? 'warning' : 'safe'}`}>
              {leanDirection}
            </div>
          </div>
        </div>

        {/* Right Side: Real-time EEG Response */}
        <div className="demo-section">
          <div className="section-header">
            <h4 className="section-title">EEG Signal Response</h4>
            <p className="section-subtitle">brainwave patterns change with body position</p>
          </div>
          <canvas ref={canvasRef} className="brainwave-canvas" />
          <div className="wave-legend">
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#7873f5' }}></span>
              <span>Delta (0.5-4 Hz)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#6b9bd1' }}></span>
              <span>Theta (4-8 Hz)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#5dbea3' }}></span>
              <span>Alpha (8-13 Hz)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#ff6ec4' }}></span>
              <span>Beta (13-30 Hz)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#ff8fd8' }}></span>
              <span>Gamma (30-50 Hz)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrainwaveAnimation;
