import React, { useRef, useEffect, useState } from 'react';
import p5 from 'p5';
import './RoverSimulation.css';

const RoverSimulation = () => {
  const sketchRef = useRef();
  const p5InstanceRef = useRef();
  const [editMode, setEditMode] = useState(false);

  // State to keep track of container size
  const [containerSize, setContainerSize] = useState({ width: 1600, height: 600 });

  // Effect to handle window resize and update container size
  useEffect(() => {
    const handleResize = () => {
      if (sketchRef.current) {
        setContainerSize({
          width: sketchRef.current.offsetWidth,
          height: sketchRef.current.offsetHeight,
        });
      }
    };

    handleResize(); // Set initial size
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Effect to initialize the p5 sketch
  useEffect(() => {
    const sketch = (p) => {
      let rover;
      let obstacles = [
        { x: 0.375, y: 0.4167, size: 90 },
        { x: 0.625, y: 0.5, size: 90 },
        { x: 0.35, y: 0.86, size: 90 },
        { x: 0.85, y: 0.17, size: 120 },
      ];
      let waypoints = [
        { x: 0.0625, y: 0.9167, label: 'A' },
        { x: 0.9375, y: 0.0833, label: 'B' },
      ];
      let currentWaypointIndex = 0;
      let isMoving = false;
      let isStopped = false;
      let editModeActive = false;
      let selectedObstacleIndex = -1;

      p.setup = () => {
        p.createCanvas(containerSize.width, containerSize.height).parent(sketchRef.current);
        rover = new Rover(waypoints[0].x * p.width, waypoints[0].y * p.height);
        updateObstacles();
      };

      p.windowResized = () => {
        p.resizeCanvas(containerSize.width, containerSize.height);
        rover.reset(waypoints[0].x * p.width, waypoints[0].y * p.height);
        updateObstacles();
      };

      const updateObstacles = () => {
        if (p.width < 512) {
          obstacles = obstacles.filter(obs => !(obs.x === 0.85 && obs.y === 0.17));
        } else {
          if (!obstacles.some(obs => obs.x === 0.85 && obs.y === 0.17)) {
            obstacles.push({ x: 0.85, y: 0.17, size: 120 });
          }
        }
      };

      p.draw = () => {
        p.background(240);

        // Draw grid
        p.stroke(200);
        for (let i = 0; i < p.width; i += 50) {
          p.line(i, 0, i, p.height);
        }
        for (let i = 0; i < p.height; i += 50) {
          p.line(0, i, p.width, i);
        }

        // Draw waypoints
        for (let wp of waypoints) {
          p.fill(255, 255, 0); // Yellow color
          p.ellipse(wp.x * p.width, wp.y * p.height, 30, 30);
          p.fill(0);
          p.textFont('Fahkwang');
          p.textSize(24);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(wp.label, wp.x * p.width, wp.y * p.height);
        }

        // Draw obstacles
        obstacles.forEach((obstacle, index) => {
          p.fill(255, 100, 100);
          p.ellipse(
            obstacle.x * p.width,
            obstacle.y * p.height,
            obstacle.size,
            obstacle.size
          );

          if (editModeActive) {
            // Visual indicator for movable obstacles
            p.stroke(0, 0, 255);
            p.strokeWeight(2);
            p.noFill();
            p.ellipse(
              obstacle.x * p.width,
              obstacle.y * p.height,
              obstacle.size + 10,
              obstacle.size + 10
            );
            p.noStroke();
          }

          if (editModeActive && index === selectedObstacleIndex) {
            p.stroke(0, 255, 0);
            p.noFill();
            p.ellipse(
              obstacle.x * p.width,
              obstacle.y * p.height,
              obstacle.size + 15,
              obstacle.size + 15
            );
            p.noStroke();
          }
        });

        // Always show the rover
        rover.show();

        if (isMoving && !isStopped) {
          rover.update(
            { x: waypoints[currentWaypointIndex].x * p.width, y: waypoints[currentWaypointIndex].y * p.height },
            obstacles.map((obs) => ({
              x: obs.x * p.width,
              y: obs.y * p.height,
              size: obs.size,
            }))
          );

          if (rover.reachedWaypoint({ x: waypoints[currentWaypointIndex].x * p.width, y: waypoints[currentWaypointIndex].y * p.height })) {
            if (currentWaypointIndex < waypoints.length - 1) {
              currentWaypointIndex++;
            } else {
              isStopped = true;
            }
          }

          if (rover.checkCollision(obstacles.map((obs) => ({
            x: obs.x * p.width,
            y: obs.y * p.height,
            size: obs.size,
          })))) {
            isStopped = true;
          }
        }
      };

      p.mousePressed = (event) => {
        if (editModeActive) {
          if (event.target === p.canvas) {
            event.preventDefault(); // Prevent default touch behavior
          }

          let obstacleClicked = false;
          for (let i = 0; i < obstacles.length; i++) {
            let d = p.dist(
              p.mouseX,
              p.mouseY,
              obstacles[i].x * p.width,
              obstacles[i].y * p.height
            );
            if (d < obstacles[i].size / 2) {
              selectedObstacleIndex = i;
              obstacleClicked = true;
              break;
            }
          }

          if (!obstacleClicked) {
            // Deselect obstacle if clicked outside any obstacle
            selectedObstacleIndex = -1;
          }
        }
      };

      p.mouseDragged = (event) => {
        if (editModeActive && selectedObstacleIndex !== -1) {
          if (event.target === p.canvas) {
            event.preventDefault(); // Prevent default touch behavior
          }

          obstacles[selectedObstacleIndex].x = p.mouseX / p.width;
          obstacles[selectedObstacleIndex].y = p.mouseY / p.height;
        }
      };

      // For touch devices
      p.touchStarted = (event) => {
        p.mousePressed(event);
      };

      p.touchMoved = (event) => {
        p.mouseDragged(event);
      };

      // Control functions accessible from outside the sketch
      p.start = () => {
        if (!isMoving && isStopped) { // Only reset if the rover has stopped at a waypoint or collision
          rover.reset(waypoints[0].x * p.width, waypoints[0].y * p.height);
          currentWaypointIndex = 0;
        }
        isMoving = true;
        isStopped = false;
      };

      p.pause = () => {
        isMoving = false; // Pause without resetting any state
      };

      p.stop = () => {
        isMoving = false;
        isStopped = true;
        rover.reset(waypoints[0].x * p.width, waypoints[0].y * p.height); // Reset only when stop is called
        currentWaypointIndex = 0;
      };


      p.setEditMode = (mode) => {
        editModeActive = mode;
        if (!mode) {
          selectedObstacleIndex = -1;
        }
      };

      class Rover {
        constructor(x, y) {
          this.x = x;
          this.y = y;
          this.speed = 3;
          this.angle = 0;
          this.size = 20;
          this.sensorRange = 100;
          this.numSensors = 3; // Left, Center, Right
          this.sensorAngles = [-p.radians(45), 0, p.radians(45)];
          this.maxAngularVelocity = p.radians(3);
          this.dangerZone = 30;
        }

        show() {
          p.push();
          p.translate(this.x, this.y);
          p.rotate(this.angle);
          p.fill(100, 100, 255);
          p.rectMode(p.CENTER);
          p.rect(0, 0, this.size * 1.5, this.size);

          // Draw sensors
          p.stroke(0, 0, 255, 100);
          for (let sensorAngle of this.sensorAngles) {
            p.line(
              0,
              0,
              this.sensorRange * p.cos(sensorAngle),
              this.sensorRange * p.sin(sensorAngle)
            );
          }
          p.noStroke();

          p.fill(255);
          p.triangle(
            this.size * 0.75,
            0,
            this.size * 0.5,
            -this.size * 0.25,
            this.size * 0.5,
            this.size * 0.25
          );
          p.pop();
        }

        update(target, obstacles) {
          // Read sensors
          let sensorReadings = this.readSensors(obstacles);

          // Calculate avoidance vector
          let avoidanceVector = p.createVector(0, 0);

          // Calculate avoidance vectors for each sensor
          for (let i = 0; i < this.numSensors; i++) {
            let reading = sensorReadings[i];
            if (reading < this.dangerZone) {
              // Object is in danger zone, apply strong avoidance
              let avoidanceStrength = p.map(reading, 0, this.dangerZone, 5, 1);
              let avoidanceAngle = this.angle + this.sensorAngles[i] + p.PI;
              avoidanceVector.add(p5.Vector.fromAngle(avoidanceAngle).mult(avoidanceStrength));
            } else if (reading < this.sensorRange) {
              // Object detected but not in danger zone, apply moderate avoidance
              let avoidanceStrength = p.map(reading, this.dangerZone, this.sensorRange, 1, 0);
              let avoidanceAngle = this.angle + this.sensorAngles[i] + p.PI;
              avoidanceVector.add(p5.Vector.fromAngle(avoidanceAngle).mult(avoidanceStrength));
            }
          }

          // Calculate goal vector
          let goalVector = p.createVector(target.x - this.x, target.y - this.y);
          goalVector.normalize();

          // Combine avoidance and goal vectors
          let combinedVector = p5.Vector.add(goalVector.mult(1), avoidanceVector.mult(2));
          combinedVector.normalize();

          // Smoothly adjust the angle
          let desiredAngle = combinedVector.heading();
          let angleDifference = this.normalizeAngle(desiredAngle - this.angle);
          angleDifference = p.constrain(angleDifference, -this.maxAngularVelocity, this.maxAngularVelocity);
          this.angle += angleDifference;

          // Move forward only if not in immediate danger
          if (Math.min(...Object.values(sensorReadings)) > this.dangerZone / 2) {
            this.x += p.cos(this.angle) * this.speed;
            this.y += p.sin(this.angle) * this.speed;
          }

          // Keep the rover within canvas boundaries
          this.x = p.constrain(this.x, this.size / 2, p.width - this.size / 2);
          this.y = p.constrain(this.y, this.size / 2, p.height - this.size / 2);
        }

        normalizeAngle(angle) {
          while (angle > p.PI) angle -= p.TWO_PI;
          while (angle < -p.PI) angle += p.TWO_PI;
          return angle;
        }

        readSensors(obstacles) {
          let readings = [this.sensorRange, this.sensorRange, this.sensorRange];
          for (let i = 0; i < this.numSensors; i++) {
            let sensorAngle = this.angle + this.sensorAngles[i];
            let sensorDistance = this.sensorRange;

            // Check for obstacles along each sensor's path
            for (let d = 0; d <= this.sensorRange; d += 2) {
              let sensorX = this.x + d * p.cos(sensorAngle);
              let sensorY = this.y + d * p.sin(sensorAngle);

              // Check if sensor point is outside canvas boundaries
              if (sensorX < 0 || sensorX > p.width || sensorY < 0 || sensorY > p.height) {
                sensorDistance = d;
                break;
              }

              // If the sensor detects an obstacle, store the distance
              if (this.detectObstacleAtPoint(sensorX, sensorY, obstacles)) {
                sensorDistance = d;
                break;
              }
            }

            readings[i] = sensorDistance;
          }
          return readings;
        }

        detectObstacleAtPoint(x, y, obstacles) {
          for (let obstacle of obstacles) {
            let d = p.dist(x, y, obstacle.x, obstacle.y);
            if (d < obstacle.size / 2) {
              return true;
            }
          }
          return false;
        }

        checkCollision(obstacles) {
          for (let obstacle of obstacles) {
            let d = p.dist(this.x, this.y, obstacle.x, obstacle.y);
            if (d < this.size / 2 + obstacle.size / 2) {
              return true;
            }
          }
          return false;
        }

        reachedWaypoint(target) {
          let distance = p.dist(this.x, this.y, target.x, target.y);
          return distance < this.size / 2;
        }

        reset(x, y) {
          this.x = x;
          this.y = y;
          this.angle = 0;
        }
      }
    };

    const myP5 = new p5(sketch);
    p5InstanceRef.current = myP5;

    // Cleanup function to remove the p5 sketch on unmount
    return () => {
      myP5.remove();
    };
  }, [containerSize]);

  const handleEditMode = () => {
    setEditMode(!editMode);
    p5InstanceRef.current.setEditMode(!editMode);
  };

  return (
    <div className="simulation-container">
      <div
        ref={sketchRef}
        className={`sketch-container ${editMode ? 'edit-mode' : ''}`}
      ></div>
      <div className="controls">
        <button onClick={() => p5InstanceRef.current.start()}>Start</button>
        <button onClick={() => p5InstanceRef.current.pause()}>Pause</button>
        <button onClick={() => p5InstanceRef.current.stop()}>Restart</button>
        <button onClick={handleEditMode}>
          {editMode ? 'Exit Edit Mode' : 'Edit Obstacles'}
        </button>
      </div>
    </div>
  );
};

export default RoverSimulation;