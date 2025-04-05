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
        { x: 0.625, y: 0.5, size: 120 },
        { x: 0.35, y: 0.86, size: 90 },
        { x: 0.85, y: 0.7, size: 120 },
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
      
      // Easter egg variables
      let failedAttempts = 0;
      let easterEggTriggered = false;
      let easterEggPhase = 0; // 0: not triggered, 1: growing cannon, 2: laser beam, 3: obstacles destroyed, 4: moving to B, 5: dancing
      let easterEggTimer = 0;
      let targetedObstacle = -1;
      let destroyedObstacles = [];
      let cannonSize = 0;
      let laserBeamLength = 0;
      let danceAngle = 0;

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
            obstacles.push({ x: 0.85, y: 0.14, size: 130 });
          }
        }
      };

      // Helper function to check if B is blocked
      const isBBlocked = () => {
        // Calculate the direct path from current rover position to waypoint B
        const targetWaypoint = waypoints[1];
        const targetX = targetWaypoint.x * p.width;
        const targetY = targetWaypoint.y * p.height;
        
        // Count how many obstacles are near the direct path to B
        let obstaclesInPath = 0;
        let minDistance = Infinity;
        
        for (let obstacle of obstacles) {
          const obsX = obstacle.x * p.width;
          const obsY = obstacle.y * p.height;
          
          // Check if obstacle is between rover and waypoint B
          // More lenient angle check - if it's broadly in the direction of B
          const angle = p.atan2(targetY - rover.y, targetX - rover.x);
          const angleToObstacle = p.atan2(obsY - rover.y, obsX - rover.x);
          const angleDiff = Math.abs(rover.normalizeAngle(angle - angleToObstacle));
          
          // Calculate distance from obstacle to the line connecting rover and waypoint B
          // This uses the formula for point-to-line distance
          const a = targetY - rover.y;
          const b = -(targetX - rover.x);
          const c = rover.y * (targetX - rover.x) - rover.x * (targetY - rover.y);
          const distToLine = Math.abs(a * obsX + b * obsY + c) / Math.sqrt(a * a + b * b);
          
          // Check if obstacle is near the path and within the range between rover and waypoint B
          const distRoverToB = p.dist(rover.x, rover.y, targetX, targetY);
          const distRoverToObs = p.dist(rover.x, rover.y, obsX, obsY);
          const distObsToB = p.dist(obsX, obsY, targetX, targetY);
          
          // Consider obstacle in path if it's close to the line and between rover and B
          if (distToLine < obstacle.size * 1.5 && distRoverToObs < distRoverToB && distObsToB < distRoverToB) {
            obstaclesInPath++;
            
            // Track the closest obstacle to the rover
            if (distRoverToObs < minDistance) {
              minDistance = distRoverToObs;
              targetedObstacle = obstacles.indexOf(obstacle);
            }
          }
          // Also count obstacles very close to B as blocking
          else if (p.dist(obsX, obsY, targetX, targetY) < obstacle.size * 2) {
            obstaclesInPath++;
          }
        }
        
        // Much more lenient condition - just 2 obstacles or any rover that's stuck for a while
        return obstaclesInPath >= 2 || rover.obstacleStuckCounter > 30;
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

        // Draw obstacles (if not destroyed in Easter egg)
        obstacles.forEach((obstacle, index) => {
          // Skip if this obstacle was destroyed in the Easter egg
          if (easterEggTriggered && destroyedObstacles.includes(index)) return;
          
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
        if (easterEggTriggered) {
          rover.showWithCannon(cannonSize);
        } else {
          rover.show();
        }

        // Handle Easter egg animation phases
        if (easterEggTriggered) {
          handleEasterEggAnimation();
        } else if (isMoving && !isStopped) {
          // Normal rover movement
          rover.update(
            { x: waypoints[currentWaypointIndex].x * p.width, y: waypoints[currentWaypointIndex].y * p.height },
            obstacles.filter((_, index) => !destroyedObstacles.includes(index))
              .map((obs) => ({
                x: obs.x * p.width,
                y: obs.y * p.height,
                size: obs.size,
              }))
          );

          // Check for B being blocked and increment attempts if needed
          if (currentWaypointIndex === 1 && rover.obstacleStuckCounter > 30 && isBBlocked()) {
            rover.obstacleStuckCounter = 0;
            failedAttempts++;
            
            // Check if we should trigger the Easter egg
            if (failedAttempts >= 2 && !easterEggTriggered) {
              easterEggTriggered = true;
              easterEggPhase = 1; // Start growing cannon
              isMoving = false; // Pause normal movement during Easter egg
            }
          }

          if (rover.reachedWaypoint({ x: waypoints[currentWaypointIndex].x * p.width, y: waypoints[currentWaypointIndex].y * p.height })) {
            if (currentWaypointIndex < waypoints.length - 1) {
              currentWaypointIndex++;
            } else {
              isStopped = true;
            }
          }

          if (rover.checkCollision(obstacles.filter((_, index) => !destroyedObstacles.includes(index))
            .map((obs) => ({
              x: obs.x * p.width,
              y: obs.y * p.height,
              size: obs.size,
            })))) {
            isStopped = true;
            
            // If we're trying to reach B and hit an obstacle, count as failed attempt
            if (currentWaypointIndex === 1 && isBBlocked()) {
              failedAttempts++;
              
              // Check if we should trigger the Easter egg
              if (failedAttempts >= 2 && !easterEggTriggered) {
                easterEggTriggered = true;
                easterEggPhase = 1; // Start growing cannon
                isMoving = false; // Pause normal movement during Easter egg
              }
            }
          }
        }
      };

      const handleEasterEggAnimation = () => {
        easterEggTimer++;
        
        switch (easterEggPhase) {
          case 1: // Growing cannon
            cannonSize = Math.min(30, easterEggTimer / 2);
            if (cannonSize >= 30) {
              easterEggPhase = 2; // Move to laser beam phase
              easterEggTimer = 0;
              targetedObstacle = 0; // Start with the first obstacle
              laserBeamLength = 0;
            }
            break;
            
          case 2: // Shooting laser
            // Draw the laser beam - make it more visible with glowing effect
            p.push();
            // Outer glow
            p.stroke(255, 50, 50, 100);
            p.strokeWeight(10);
            
            // Get current target or find one if none is selected
            if (targetedObstacle === -1 || targetedObstacle >= obstacles.length) {
              // Find the first non-destroyed obstacle
              for (let i = 0; i < obstacles.length; i++) {
                if (!destroyedObstacles.includes(i)) {
                  targetedObstacle = i;
                  break;
                }
              }
            }
            
            if (targetedObstacle < obstacles.length) {
              const target = obstacles[targetedObstacle];
              const targetX = target.x * p.width;
              const targetY = target.y * p.height;
              
              // Calculate direction to target
              const angle = p.atan2(targetY - rover.y, targetX - rover.x);
              rover.angle = angle; // Rotate rover toward target
              
              // Calculate current length of laser beam
              const maxLength = p.dist(rover.x, rover.y, targetX, targetY);
              laserBeamLength = Math.min(maxLength, easterEggTimer * 20); // Faster beam
              
              // Draw the laser beam outer glow
              const beamStartX = rover.x + Math.cos(angle) * rover.size * 0.75;
              const beamStartY = rover.y + Math.sin(angle) * rover.size * 0.75;
              const endX = rover.x + laserBeamLength * p.cos(angle);
              const endY = rover.y + laserBeamLength * p.sin(angle);
              p.line(beamStartX, beamStartY, endX, endY);
              
              // Inner bright beam
              p.stroke(255, 0, 0);
              p.strokeWeight(4);
              p.line(beamStartX, beamStartY, endX, endY);
              
              // Brightest core
              p.stroke(255, 200, 200);
              p.strokeWeight(2);
              p.line(beamStartX, beamStartY, endX, endY);
              
              // Add beam particles for effect
              for (let i = 0; i < 5; i++) {
                const particlePos = p.random(0, laserBeamLength);
                const particleX = beamStartX + particlePos * p.cos(angle);
                const particleY = beamStartY + particlePos * p.sin(angle);
                
                p.fill(255, p.random(100, 255), p.random(50, 150), p.random(100, 200));
                p.noStroke();
                p.ellipse(particleX, particleY, p.random(3, 8), p.random(3, 8));
              }
              
              // Check if beam reached target
              if (laserBeamLength >= maxLength) {
                // Add explosion effect - more dramatic
                p.fill(255, 200, 0, 150);
                p.noStroke();
                p.ellipse(targetX, targetY, target.size * 3, target.size * 3);
                
                // Add explosion particles
                for (let i = 0; i < 20; i++) {
                  const explosionAngle = p.random(0, p.TWO_PI);
                  const explosionDist = p.random(10, target.size);
                  p.fill(255, p.random(100, 255), p.random(0, 100), p.random(100, 255));
                  p.ellipse(
                    targetX + p.cos(explosionAngle) * explosionDist,
                    targetY + p.sin(explosionAngle) * explosionDist,
                    p.random(5, 15),
                    p.random(5, 15)
                  );
                }
                
                // Mark obstacle as destroyed
                destroyedObstacles.push(targetedObstacle);
                
                // Move to next obstacle
                let nextObstacle = -1;
                for (let i = 0; i < obstacles.length; i++) {
                  if (!destroyedObstacles.includes(i)) {
                    nextObstacle = i;
                    break;
                  }
                }
                
                if (nextObstacle !== -1) {
                  targetedObstacle = nextObstacle;
                  laserBeamLength = 0;
                  easterEggTimer = 0;
                } else {
                  // All obstacles destroyed, move to next phase
                  easterEggPhase = 3;
                  easterEggTimer = 0;
                }
              }
            } else {
              // No obstacles left, move to next phase
              easterEggPhase = 3;
              easterEggTimer = 0;
            }
            p.pop();
            break;
            
          case 3: // Small pause after destroying obstacles
            if (easterEggTimer > 30) {
              easterEggPhase = 4; // Move to B
              easterEggTimer = 0;
              isMoving = true;
              currentWaypointIndex = 1; // Target waypoint B
              destroyedObstacles = Array.from(Array(obstacles.length).keys()); // Mark all obstacles as destroyed
            }
            break;
            
          case 4: // Moving to B
            // Navigate to B (using normal update logic but with no obstacles)
            rover.update(
              { x: waypoints[1].x * p.width, y: waypoints[1].y * p.height },
              [] // No obstacles
            );
            
            // Check if reached B
            if (rover.reachedWaypoint({ x: waypoints[1].x * p.width, y: waypoints[1].y * p.height })) {
              easterEggPhase = 5; // Start dancing
              easterEggTimer = 0;
              danceAngle = 0;
            }
            break;
            
          case 5: // Dancing at B
            // Perform a victory dance (spinning and pulsing)
            danceAngle += 0.2;
            
            // Draw celebration effects
            for (let i = 0; i < 5; i++) {
              const offset = i * p.TWO_PI / 5;
              const x = waypoints[1].x * p.width + p.cos(danceAngle + offset) * 40;
              const y = waypoints[1].y * p.height + p.sin(danceAngle + offset) * 40;
              
              p.fill(255, 255, 0, 150);
              p.ellipse(x, y, 15, 15);
            }
            
            // Spin the rover
            rover.angle = danceAngle;
            
            // End the dance after a while
            if (easterEggTimer > 180) { // 3 seconds at 60fps
              // Reset everything
              easterEggTriggered = false;
              failedAttempts = 0;
              destroyedObstacles = [];
              easterEggPhase = 0;
              cannonSize = 0;
              isStopped = true;
            }
            break;
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
          
          // Reset easter egg state when obstacles are moved
          easterEggTriggered = false;
          failedAttempts = 0;
          destroyedObstacles = [];
          easterEggPhase = 0;
          cannonSize = 0;
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
        
        // Reset easter egg when restarting
        easterEggTriggered = false;
        failedAttempts = 0;
        destroyedObstacles = [];
        easterEggPhase = 0;
        cannonSize = 0;
      };

      p.pause = () => {
        isMoving = false; // Pause without resetting any state
      };

      p.stop = () => {
        isMoving = false;
        isStopped = true;
        rover.reset(waypoints[0].x * p.width, waypoints[0].y * p.height); // Reset only when stop is called
        currentWaypointIndex = 0;
        
        // Reset easter egg when stopping
        easterEggTriggered = false;
        failedAttempts = 0;
        destroyedObstacles = [];
        easterEggPhase = 0;
        cannonSize = 0;
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
          this.obstacleStuckCounter = 0; // Track how long the rover is stuck
          this.maxStuckThreshold = 50; // Threshold for being stuck
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
        
        // New method to show rover with a cannon
        showWithCannon(cannonSize) {
          p.push();
          p.translate(this.x, this.y);
          p.rotate(this.angle);
          
          // Draw the rover body
          p.fill(100, 100, 255);
          p.rectMode(p.CENTER);
          p.rect(0, 0, this.size * 1.5, this.size);
          
          // Draw the cannon
          p.fill(50, 50, 50);
          p.rectMode(p.CENTER);
          p.rect(this.size * 0.75, 0, cannonSize, this.size / 3);
          
          // Draw cannon tip
          p.fill(200, 0, 0);
          p.ellipse(this.size * 0.75 + cannonSize / 2, 0, 8, 8);
          
          // Draw sensors (dimmer during easter egg)
          p.stroke(0, 0, 255, 50);
          for (let sensorAngle of this.sensorAngles) {
            p.line(
              0,
              0,
              this.sensorRange * 0.5 * p.cos(sensorAngle),
              this.sensorRange * 0.5 * p.sin(sensorAngle)
            );
          }
          p.noStroke();
          
          // Draw rover front indicator
          p.fill(255);
          p.triangle(
            this.size * 0.5,
            0,
            this.size * 0.25,
            -this.size * 0.25,
            this.size * 0.25,
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

          // Check if the rover is stuck in one place
          if (Math.min(...Object.values(sensorReadings)) < this.dangerZone) {
            this.obstacleStuckCounter++;
          } else {
            this.obstacleStuckCounter = 0;
          }

          // Reverse and choose an alternate path if stuck for too long
          if (this.obstacleStuckCounter > this.maxStuckThreshold) {
            this.reverse();
            this.obstacleStuckCounter = 0; // Reset the counter after reversing
          } else {
            // Move forward only if not in immediate danger
            if (Math.min(...Object.values(sensorReadings)) > this.dangerZone / 2) {
              this.x += p.cos(this.angle) * this.speed;
              this.y += p.sin(this.angle) * this.speed;
            }
          }

          // Keep the rover within canvas boundaries
          this.x = p.constrain(this.x, this.size / 2, p.width - this.size / 2);
          this.y = p.constrain(this.y, this.size / 2, p.height - this.size / 2);
        }

        reverse() {
          // Reverse a small distance and change direction slightly to get unstuck
          this.x -= p.cos(this.angle) * this.speed * 2;
          this.y -= p.sin(this.angle) * this.speed * 2;
          this.angle += p.radians(90); // Change direction
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
          this.obstacleStuckCounter = 0;
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