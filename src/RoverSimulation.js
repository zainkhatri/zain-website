import React, { useRef, useEffect, useState, memo } from 'react';
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
  const canvas = p.createCanvas(containerSize.width, containerSize.height).parent(sketchRef.current);
  
  // Mobile optimizations - allow scrolling but prevent other gestures
  canvas.style('touch-action', 'manipulation');
  canvas.style('user-select', 'none');
  canvas.style('-webkit-user-select', 'none');
  canvas.style('-webkit-touch-callout', 'none');
  canvas.style('pointer-events', 'auto'); // Ensure events are handled properly
  
  rover = new Rover(waypoints[0].x * p.width, waypoints[0].y * p.height);
  updateObstacles();
};

// Get the shortest possible path to B using breadth-first search
const getPathToB = () => {
  const targetWaypoint = waypoints[1];
  const targetX = targetWaypoint.x * p.width;
  const targetY = targetWaypoint.y * p.height;
  
  // Create a more precise grid for pathfinding
  const gridSize = 15; // Smaller grid cells for more precise pathfinding
  const gridWidth = Math.ceil(p.width / gridSize);
  const gridHeight = Math.ceil(p.height / gridSize);
  
  // Create a grid marking obstacles
  let grid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(0)); // 0 = free space
  
  // Mark all obstacles on the grid with reduced buffer for the rover
  for (let obstacle of obstacles) {
    const obsX = obstacle.x * p.width;
    const obsY = obstacle.y * p.height;
    const radius = obstacle.size / 2 + rover.size/2 - 2; // Reduced buffer for tighter navigation
    
    // Mark cells covered by this obstacle
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const cellCenterX = x * gridSize + gridSize / 2;
        const cellCenterY = y * gridSize + gridSize / 2;
        
        // If the cell center is within the obstacle radius, mark it as blocked
        if (p.dist(cellCenterX, cellCenterY, obsX, obsY) < radius) {
          grid[y][x] = 1; // 1 = obstacle
        }
      }
    }
  }
  
  // Get start and target grid positions
  const startGridX = Math.floor(rover.x / gridSize);
  const startGridY = Math.floor(rover.y / gridSize);
  const targetGridX = Math.floor(targetX / gridSize);
  const targetGridY = Math.floor(targetY / gridSize);
  
  // Breadth-first search to find closest possible point to B
  const queue = [{x: startGridX, y: startGridY, path: []}];
  const visited = new Set();
  visited.add(`${startGridX},${startGridY}`);
  
  // Directions: up, right, down, left, and diagonals
  const directions = [
    {x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0},
    {x: 1, y: -1}, {x: 1, y: 1}, {x: -1, y: 1}, {x: -1, y: -1}
  ];
  
  let bestPath = null;
  let closestDist = Infinity;
  
  while (queue.length > 0) {
    const current = queue.shift();
    
    // Check if we reached the target
    if (current.x === targetGridX && current.y === targetGridY) {
      return {
        complete: true,
        x: targetGridX * gridSize + gridSize / 2,
        y: targetGridY * gridSize + gridSize / 2
      };
    }
    
    // Calculate distance to target
    const dist = p.dist(current.x * gridSize + gridSize / 2, current.y * gridSize + gridSize / 2,
                       targetX, targetY);
    
    // Update the closest point if this is better
    if (dist < closestDist) {
      closestDist = dist;
      bestPath = current;
    }
    
    // Try all directions
    for (const dir of directions) {
      const nextX = current.x + dir.x;
      const nextY = current.y + dir.y;
      const key = `${nextX},${nextY}`;
      
      // Check if this is a valid next position
      if (nextX >= 0 && nextX < gridWidth && 
          nextY >= 0 && nextY < gridHeight && 
          grid[nextY][nextX] === 0 && 
          !visited.has(key)) {
        
        // Create new path by copying current path and adding this position
        const newPath = [...current.path, {x: nextX, y: nextY}];
        
        queue.push({x: nextX, y: nextY, path: newPath});
        visited.add(key);
      }
    }
  }
  
  // If we get here, no complete path was found
  // Return the closest point we can reach
  return {
    complete: false,
    x: bestPath ? bestPath.x * gridSize + gridSize / 2 : rover.x,
    y: bestPath ? bestPath.y * gridSize + gridSize / 2 : rover.y,
    path: bestPath ? bestPath.path : []
  };
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

// Helper function to check if B is truly unreachable or if rover is trapped
const isBBlocked = () => {
  const targetWaypoint = waypoints[1];
  const targetX = targetWaypoint.x * p.width;
  const targetY = targetWaypoint.y * p.height;
  
  // Create a more accurate pathfinding grid with finer resolution for pre-check
  const gridSize = 15; // Smaller grid size for more accurate pathfinding
  const gridWidth = Math.ceil(p.width / gridSize);
  const gridHeight = Math.ceil(p.height / gridSize);
  
  // Create a grid marking obstacles with proper buffer space
  let grid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(0)); // 0 = free space
  
  // Mark all obstacles on the grid with an appropriate buffer zone
  for (let obstacle of obstacles) {
    const obsX = obstacle.x * p.width;
    const obsY = obstacle.y * p.height;
    const radius = obstacle.size / 2 + rover.size / 2; // Add half rover size as buffer
    
    // Mark cells covered by this obstacle
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const cellCenterX = x * gridSize + gridSize / 2;
        const cellCenterY = y * gridSize + gridSize / 2;
        
        // If the cell center is within the obstacle radius plus buffer, mark it as blocked
        if (p.dist(cellCenterX, cellCenterY, obsX, obsY) < radius + gridSize/2) {
          grid[y][x] = 1; // 1 = obstacle
        }
      }
    }
  }
  
  // Get start and target grid positions
  const startGridX = Math.floor(rover.x / gridSize);
  const startGridY = Math.floor(rover.y / gridSize);
  const targetGridX = Math.floor(targetX / gridSize);
  const targetGridY = Math.floor(targetY / gridSize);
  
  // Check if start or target positions are already in obstacles (trapped)
  if ((startGridX >= 0 && startGridX < gridWidth && 
       startGridY >= 0 && startGridY < gridHeight && 
       grid[startGridY][startGridX] === 1) ||
      (targetGridX >= 0 && targetGridX < gridWidth && 
       targetGridY >= 0 && targetGridY < gridHeight && 
       grid[targetGridY][targetGridX] === 1)) {
    console.log("Start or target position is inside an obstacle!");
    return true; // Path is impossible
  }
  
  // Breadth-first search to find a path
  const queue = [{x: startGridX, y: startGridY}];
  const visited = new Set();
  visited.add(`${startGridX},${startGridY}`);
  
  // Directions: up, right, down, left, and diagonals
  const directions = [
    {x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0},
    {x: 1, y: -1}, {x: 1, y: 1}, {x: -1, y: 1}, {x: -1, y: -1}
  ];
  
  while (queue.length > 0) {
    const current = queue.shift();
    
    // Check if we reached the target
    if (current.x === targetGridX && current.y === targetGridY) {
      // Path found!
      return false; // Path exists
    }
    
    // Try all directions
    for (const dir of directions) {
      const nextX = current.x + dir.x;
      const nextY = current.y + dir.y;
      const key = `${nextX},${nextY}`;
      
      // Check if this is a valid next position
      if (nextX >= 0 && nextX < gridWidth && 
          nextY >= 0 && nextY < gridHeight && 
          grid[nextY][nextX] === 0 && 
          !visited.has(key)) {
        
        queue.push({x: nextX, y: nextY});
        visited.add(key);
      }
    }
  }
  
  console.log("No path found in grid search!");
  
  // Target closest obstacle to B first for destruction
  let closestToB = -1;
  let closestDist = Infinity;
  
  for (let i = 0; i < obstacles.length; i++) {
    const obsX = obstacles[i].x * p.width;
    const obsY = obstacles[i].y * p.height;
    const dist = p.dist(obsX, obsY, targetX, targetY);
    
    if (dist < closestDist) {
      closestDist = dist;
      closestToB = i;
    }
  }
  
  if (closestToB !== -1) {
    targetedObstacle = closestToB;
  } else if (obstacles.length > 0) {
    targetedObstacle = 0;
  }
  
  // No path exists, B is truly unreachable
  return true;
};

p.draw = () => {
  p.background(240);

  // Draw grid (optimized for mobile)
  p.stroke(200);
  p.strokeWeight(0.5); // Thinner lines for mobile performance
  const gridStep = p.width < 600 ? 100 : 50; // Larger grid on mobile
  for (let i = 0; i < p.width; i += gridStep) {
    p.line(i, 0, i, p.height);
  }
  for (let i = 0; i < p.height; i += gridStep) {
    p.line(0, i, p.width, i);
  }
  p.strokeWeight(1); // Reset stroke weight

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

                // Check for B being truly unreachable or if rover is trapped
    if (currentWaypointIndex === 1 && rover.obstacleStuckCounter > 40) { // Reduced time to check
      // Only do the expensive path check when the rover has been stuck for a while
      console.log("Checking if rover can get closer to B...");
      
      // Get the closest reachable point to B
      const closestPoint = getPathToB();
      
      // If we're already at or very close to the closest possible point to B
      const distToClosestPossible = p.dist(rover.x, rover.y, closestPoint.x, closestPoint.y);
      console.log(`Distance to closest possible point: ${distToClosestPossible}`);
      
      if (distToClosestPossible < rover.size || rover.obstacleStuckCounter > 100) {
        console.log("Rover is as close to B as possible or has been stuck too long!");
        rover.obstacleStuckCounter = 0;
        
        // Trigger the Easter egg - we've tried to get as close as possible
        console.log("EASTER EGG TRIGGERED - AT CLOSEST POSSIBLE POINT TO B!");
        easterEggTriggered = true;
        easterEggPhase = 1; // Start growing cannon
        isMoving = false; // Pause normal movement during Easter egg
      } else {
        // We can actually get closer to B - reset stuck counter and try to move there
        rover.obstacleStuckCounter = 0;
        
        // Update the waypoint to be this closest reachable point instead of actual B
        // This will let the rover approach B as closely as possible
        const tempWaypoint = {
          x: closestPoint.x / p.width,
          y: closestPoint.y / p.height,
          label: 'B'
        };
        
        // Temporarily replace waypoint B with this closest reachable point
        const originalB = waypoints[1];
        waypoints[1] = tempWaypoint;
        
        // After a timeout, restore the original B waypoint
        setTimeout(() => {
          waypoints[1] = originalB;
        }, 5000);
        
        // Help the rover by giving it a small "nudge" toward the closest point
        const angleToClosest = p.atan2(closestPoint.y - rover.y, closestPoint.x - rover.x);
        rover.angle = angleToClosest;
        rover.x += p.cos(rover.angle) * 5;
        rover.y += p.sin(rover.angle) * 5;
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
      // Temporarily boost speed for epic dash to B!
      const originalSpeed = rover.speed;
      const originalAngularVelocity = rover.maxAngularVelocity;
      rover.speed = 25; // HELLA fast speed for easter egg
      rover.maxAngularVelocity = p.radians(15); // Super fast turning
      
      // Add speed trail effect
      p.push();
      p.stroke(255, 255, 0, 100);
      p.strokeWeight(3);
      for (let i = 0; i < 5; i++) {
        const trailX = rover.x - p.cos(rover.angle) * (i * 8);
        const trailY = rover.y - p.sin(rover.angle) * (i * 8);
        p.ellipse(trailX, trailY, 10 - i * 2, 10 - i * 2);
      }
      p.pop();
      
      // Navigate to B (using normal update logic but with no obstacles)
      rover.update(
        { x: waypoints[1].x * p.width, y: waypoints[1].y * p.height },
        [] // No obstacles
      );
      
      // Restore original speed and angular velocity
      rover.speed = originalSpeed;
      rover.maxAngularVelocity = originalAngularVelocity;
      
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
  // Only handle mouse events if they're actually within the canvas bounds
  if (event && event.target && event.target !== p.canvas) {
    return true; // Allow event to propagate normally
  }
  
  if (editModeActive) {
    // Only prevent default if we're actually interacting with an obstacle
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
        // Only prevent default when actually clicking on an obstacle
        if (event && event.preventDefault) {
          event.preventDefault();
          event.stopPropagation();
        }
        return false;
      }
    }

    if (!obstacleClicked) {
      // Deselect obstacle if clicked outside any obstacle
      selectedObstacleIndex = -1;
    }
  }
  // Always allow event to propagate for non-edit interactions
  return true;
};

p.mouseDragged = (event) => {
  // Only handle mouse events if they're actually within the canvas bounds
  if (event && event.target && event.target !== p.canvas) {
    return true; // Allow event to propagate normally
  }
  
  if (editModeActive && selectedObstacleIndex !== -1) {
    // Only prevent default when actually dragging an obstacle
    if (event && event.preventDefault) {
      event.preventDefault();
      event.stopPropagation();
    }

    obstacles[selectedObstacleIndex].x = p.mouseX / p.width;
    obstacles[selectedObstacleIndex].y = p.mouseY / p.height;
    
    // Reset easter egg state when obstacles are moved
    easterEggTriggered = false;
    failedAttempts = 0;
    destroyedObstacles = [];
    easterEggPhase = 0;
    cannonSize = 0;
    
    return false; // Prevent further event propagation
  }
  // Always allow event to propagate for non-edit interactions
  return true;
};

// For touch devices - improved mobile support
p.touchStarted = (event) => {
  // Only handle touch events if they're actually within the canvas bounds
  if (event && event.target && event.target !== p.canvas) {
    return true; // Allow event to propagate normally
  }
  
  // Only handle touch events in edit mode
  if (editModeActive) {
    return p.mousePressed(event);
  }
  // Allow normal touch behavior for non-edit mode
  return true;
};

p.touchMoved = (event) => {
  // Only handle touch events if they're actually within the canvas bounds
  if (event && event.target && event.target !== p.canvas) {
    return true; // Allow event to propagate normally
  }
  
  // Only handle touch events in edit mode
  if (editModeActive) {
    return p.mouseDragged(event);
  }
  // Allow normal touch behavior for non-edit mode
  return true;
};

p.touchEnded = (event) => {
  // Only handle touch events if they're actually within the canvas bounds
  if (event && event.target && event.target !== p.canvas) {
    return true; // Allow event to propagate normally
  }
  
  // Only handle touch events in edit mode
  if (editModeActive) {
    selectedObstacleIndex = -1; // Deselect on touch end
    return false;
  }
  // Allow normal touch behavior for non-edit mode
  return true;
};

// Control functions accessible from outside the sketch
p.start = () => {
  if (!isMoving && isStopped) { // Only reset if the rover has stopped at a waypoint or collision
    rover.reset(waypoints[0].x * p.width, waypoints[0].y * p.height);
    currentWaypointIndex = 0;
  }
  
  // 1. FIRST CHECK: Is a route to B possible?
  console.log("CHECKING: Is a route to B possible?");
  
  // Use pathfinding to determine if B is reachable
  const pathResult = getPathToB();
  
  if (pathResult.complete) {
    // Route is possible - proceed with smart navigation
    console.log("A route to B is possible - navigating smart path");
    
    // Store the path for the rover to follow
    rover.pathToFollow = pathResult.path;
    
    // Normal movement with path following
    isMoving = true;
    isStopped = false;
    easterEggTriggered = false;
  } else {
    // NO ROUTE TO B IS POSSIBLE
    console.log("NO ROUTE TO B IS POSSIBLE!");
    
    // Don't start normal movement - go directly to laser mode
    isMoving = false;
    isStopped = false;
    
    // Find the closest obstacle to B to target first
    let nearestObstacleIndex = -1;
    let nearestObstacleDist = Infinity;
    
    for (let i = 0; i < obstacles.length; i++) {
      const obsX = obstacles[i].x * p.width;
      const obsY = obstacles[i].y * p.height;
      const distToB = p.dist(obsX, obsY, waypoints[1].x * p.width, waypoints[1].y * p.height);
      
      if (distToB < nearestObstacleDist) {
        nearestObstacleDist = distToB;
        nearestObstacleIndex = i;
      }
    }
    
    if (nearestObstacleIndex >= 0) {
      targetedObstacle = nearestObstacleIndex;
    }
    
    // Immediately trigger Easter egg in cannon growth mode
    easterEggTriggered = true;
    easterEggPhase = 1;
  }
  
  // Reset easter egg destruction state
  destroyedObstacles = [];
  cannonSize = 0;
  failedAttempts = 0;
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
    this.speed = 4; // Reduced speed for smoother movement
    this.angle = 0;
    this.size = 20;
    this.sensorRange = 120; // Increased sensor range
    this.numSensors = 3; // 3 ultrasonic sensors like the real NASA rover
    this.sensorAngles = [-p.radians(45), 0, p.radians(45)]; // Left, center, right sensors
    this.maxAngularVelocity = p.radians(4); // Reduced for smoother turning
    this.dangerZone = 45; // Increased danger zone
    this.obstacleStuckCounter = 0;
    this.maxStuckThreshold = 20; // Reduced for more aggressive stuck detection
    this.pathToFollow = [];
    this.currentPathIndex = 0;
    
    // Enhanced Machine Learning Components
    this.memory = []; // Store attempted paths and outcomes
    this.currentAttempt = { path: [], success: false, startTime: 0 };
    this.learningRate = 0.15; // Increased learning rate
    this.explorationRate = 0.4; // Higher exploration rate
    this.successfulPaths = []; // Store paths that worked
    this.failedPaths = []; // Store paths that failed
    this.attemptCount = 0;
    this.bestDistance = Infinity; // Track closest we've gotten to B
    this.targetReached = false;
    
    // New ML features to prevent repetitive behavior
    this.recentMovements = []; // Track recent movement patterns
    this.movementHistory = []; // Track all movement patterns
    this.stuckPatterns = []; // Track patterns that led to getting stuck
    this.successfulPatterns = []; // Track patterns that led to success
    this.adaptiveSpeed = this.speed; // Speed that adapts based on success
    this.lastSuccessfulDirection = null; // Remember last successful direction
    this.repetitionPenalty = 0; // Penalty for repeating failed patterns
    this.innovationBonus = 0.2; // Bonus for trying new approaches
    this.patternMemorySize = 50; // How many patterns to remember
    this.stuckThreshold = 30; // How many frames before considering stuck
    this.consecutiveFailures = 0; // Track consecutive failures
    this.lastPositions = []; // Track recent positions to detect loops
    
    // Enhanced Pathfinding Memory
    this.pathMemory = []; // Store all attempted paths with outcomes
    this.alternativeRoutes = []; // Store alternative route attempts
    this.successfulRouteSegments = []; // Store successful parts of routes
    this.failedRouteSegments = []; // Store failed parts of routes
    this.routeProgress = []; // Track progress toward target for each route
    this.bestRouteToTarget = null; // Remember the best route found so far
    this.currentRouteAttempt = 0; // Track which route we're trying
    this.maxRouteAttempts = 5; // Maximum different routes to try
    this.routeMemorySize = 20; // How many routes to remember
    this.progressThreshold = 10; // Minimum progress to consider a route "working"
    this.lastProgressCheck = { x: 0, y: 0, distance: Infinity }; // Track last progress
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
    
    // Debug: visualize path
    // if (this.pathToFollow && this.pathToFollow.length > 0) {
    //   p.stroke(0, 255, 0);
    //   p.strokeWeight(2);
    //   for (let i = this.currentPathIndex; i < this.pathToFollow.length - 1; i++) {
    //     p.line(
    //       this.pathToFollow[i].x, 
    //       this.pathToFollow[i].y,
    //       this.pathToFollow[i+1].x, 
    //       this.pathToFollow[i+1].y
    //     );
    //   }
    //   p.noStroke();
    //   
    //   // Mark current target
    //   if (this.currentPathIndex < this.pathToFollow.length) {
    //     p.fill(0, 255, 0);
    //     p.ellipse(
    //       this.pathToFollow[this.currentPathIndex].x,
    //       this.pathToFollow[this.currentPathIndex].y,
    //       10, 10
    //     );
    //   }
    // }
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
    // Machine Learning: Start new attempt if needed
    if (this.currentAttempt.startTime === 0) {
      this.startNewAttempt();
    }
    
    // Track progress toward target
    this.trackProgress(target);
    
    // Check if we need to try alternative route
    if (this.shouldTryAlternativeRoute(target)) {
      this.tryAlternativeRoute(target, obstacles);
      return;
    }
    
    // Record current state in path
    this.currentAttempt.path.push({
      x: this.x,
      y: this.y,
      angle: this.angle,
      timestamp: Date.now()
    });
    
    // Track movement patterns
    this.recentMovements.push(this.angle);
    if (this.recentMovements.length > 10) {
      this.recentMovements.shift();
    }
    
    // Calculate distance to target for learning
    const distanceToTarget = p.dist(this.x, this.y, target.x, target.y);
    
    // Update best distance if we're getting closer
    if (distanceToTarget < this.bestDistance) {
      this.bestDistance = distanceToTarget;
      this.lastSuccessfulDirection = this.angle;
      this.recordProgress(target, distanceToTarget);
    }
    
    // Check if we've reached the target
    if (this.reachedWaypoint(target)) {
      this.targetReached = true;
      this.learnFromAttempt(true);
      this.consecutiveFailures = 0; // Reset failure counter on success
      this.recordSuccessfulRoute();
      
      // Stop movement when target is reached
      this.speed = 0;
      console.log(`Rover ML: SUCCESS! Reached target B at distance ${Math.sqrt((this.x - target.x) ** 2 + (this.y - target.y) ** 2).toFixed(2)}`);
      return;
    }
    
    // Read sensors
    let sensorReadings = this.readSensors(obstacles);

    // Use enhanced machine learning to decide movement strategy
    let movementStrategy = this.chooseMovementStrategy(sensorReadings, target, obstacles);
    
    // Calculate avoidance vector
    let avoidanceVector = p.createVector(0, 0);

    // Calculate avoidance vectors for each sensor
    for (let i = 0; i < this.numSensors; i++) {
      let reading = sensorReadings[i];
      if (reading < this.dangerZone) {
        let avoidanceStrength = p.map(reading, 0, this.dangerZone, 5, 1);
        let avoidanceAngle = this.angle + this.sensorAngles[i] + p.PI;
        avoidanceVector.add(p5.Vector.fromAngle(avoidanceAngle).mult(avoidanceStrength));
      } else if (reading < this.sensorRange) {
        let avoidanceStrength = p.map(reading, this.dangerZone, this.sensorRange, 1, 0);
        let avoidanceAngle = this.angle + this.sensorAngles[i] + p.PI;
        avoidanceVector.add(p5.Vector.fromAngle(avoidanceAngle).mult(avoidanceStrength));
      }
    }

    // Calculate goal vector with learning bias
    let goalVector = p.createVector(target.x - this.x, target.y - this.y);
    goalVector.normalize();
    
    // Apply learned preferences with enhanced learning
    if (movementStrategy.preferredDirection) {
      let learnedVector = p5.Vector.fromAngle(movementStrategy.preferredDirection);
      goalVector = p5.Vector.lerp(goalVector, learnedVector, this.learningRate);
    }

    // Combine vectors with strategy weighting
    let combinedVector = p5.Vector.add(
      goalVector.mult(movementStrategy.goalWeight), 
      avoidanceVector.mult(movementStrategy.avoidanceWeight)
    );
    combinedVector.normalize();

    // Apply exploration bonus if present
    if (movementStrategy.explorationBonus > 0) {
      let explorationVector = p5.Vector.fromAngle(Math.random() * p.TWO_PI);
      combinedVector = p5.Vector.lerp(combinedVector, explorationVector, movementStrategy.explorationBonus);
      combinedVector.normalize();
    }

    // Smoothly adjust the angle with better smoothing
    let desiredAngle = combinedVector.heading();
    let angleDifference = this.normalizeAngle(desiredAngle - this.angle);
    angleDifference = p.constrain(angleDifference, -this.maxAngularVelocity, this.maxAngularVelocity);
    
    // Apply smoothing factor for more gradual turns
    const smoothingFactor = 0.3; // Reduced from 1.0 for smoother movement
    this.angle += angleDifference * smoothingFactor;

    // Execute movement with adaptive speed
    this.executeMovement(obstacles, movementStrategy);

    // Keep the rover within canvas boundaries
    this.x = p.constrain(this.x, this.size / 2, p.width - this.size / 2);
    this.y = p.constrain(this.y, this.size / 2, p.height - this.size / 2);
    
    // Enhanced stuck detection and learning - more aggressive
    if (this.obstacleStuckCounter > this.maxStuckThreshold) {
      // Record this as a stuck pattern
      this.stuckPatterns.push({
        angle: this.angle,
        position: { x: this.x, y: this.y },
        sensorReadings: [...sensorReadings],
        timestamp: Date.now()
      });
      
      // Keep stuck patterns manageable
      if (this.stuckPatterns.length > this.patternMemorySize) {
        this.stuckPatterns.shift();
      }
      
      this.learnFromAttempt(false);
      this.recordFailedRoute();
      this.tryAlternativeRoute(target, obstacles);
    }
  }

  // New methods for enhanced pathfinding memory
  trackProgress(target) {
    const currentDistance = p.dist(this.x, this.y, target.x, target.y);
    const progress = this.lastProgressCheck.distance - currentDistance;
    
    // Update last progress check
    this.lastProgressCheck = {
      x: this.x,
      y: this.y,
      distance: currentDistance
    };
    
    // Record significant progress
    if (progress > this.progressThreshold) {
      this.recordProgress(target, currentDistance);
    }
  }

  recordProgress(target, distance) {
    const progress = {
      x: this.x,
      y: this.y,
      distance: distance,
      timestamp: Date.now(),
      routeAttempt: this.currentRouteAttempt
    };
    
    this.routeProgress.push(progress);
    
    // Keep progress memory manageable
    if (this.routeProgress.length > this.routeMemorySize) {
      this.routeProgress.shift();
    }
    
    // Update best route if this is better
    if (distance < (this.bestRouteToTarget?.finalDistance || Infinity)) {
      this.bestRouteToTarget = {
        path: [...this.currentAttempt.path],
        finalDistance: distance,
        routeAttempt: this.currentRouteAttempt
      };
    }
  }

  shouldTryAlternativeRoute(target) {
    // Much more aggressive stuck detection
    if (this.obstacleStuckCounter > this.maxStuckThreshold / 2) {
      return true;
    }
    
    // Check if we've been in the same area too long (reduced threshold)
    const recentProgress = this.routeProgress.slice(-5);
    if (recentProgress.length >= 5) {
      const avgDistance = recentProgress.reduce((sum, p) => sum + p.distance, 0) / recentProgress.length;
      const distanceVariance = recentProgress.reduce((sum, p) => sum + Math.abs(p.distance - avgDistance), 0) / recentProgress.length;
      
      // If distance variance is low, we're likely looping
      if (distanceVariance < 10) {
        return true;
      }
    }
    
    // Check if we haven't made progress in the last few frames
    if (this.lastProgressCheck.distance !== Infinity) {
      const currentDistance = p.dist(this.x, this.y, target.x, target.y);
      if (Math.abs(currentDistance - this.lastProgressCheck.distance) < 2) {
        this.obstacleStuckCounter++;
      }
    }
    
    // Try alternative route more frequently
    if (this.obstacleStuckCounter > 15) {
      return true;
    }
    
    return false;
  }

  tryAlternativeRoute(target, obstacles) {
    this.currentRouteAttempt++;
    
    if (this.currentRouteAttempt > this.maxRouteAttempts) {
      // Reset and try from beginning with different approach
      this.currentRouteAttempt = 0;
      this.resetToBestKnownPosition(target);
      return;
    }
    
    console.log(`Rover ML: Trying alternative route #${this.currentRouteAttempt}`);
    
    // More aggressive alternative route generation
    const alternativeRoute = this.generateAlternativeRoute(target);
    
    if (alternativeRoute) {
      // Move toward the alternative route starting point
      const startPoint = alternativeRoute.startPoint;
      const angleToStart = p.atan2(startPoint.y - this.y, startPoint.x - this.x);
      this.angle = angleToStart;
      
      // Give a bigger boost toward the alternative route
      const boostDistance = Math.min(40, Math.sqrt((this.x - startPoint.x) ** 2 + (this.y - startPoint.y) ** 2));
      this.x += p.cos(this.angle) * boostDistance;
      this.y += p.sin(this.angle) * boostDistance;
      
      this.obstacleStuckCounter = 0; // Reset stuck counter
    } else {
      // Try multiple random directions to find a better path
      let bestAngle = Math.random() * p.TWO_PI;
      let bestDistance = Infinity;
      
      // Test 5 random directions and pick the one that gets us closest to target
      for (let i = 0; i < 5; i++) {
        const testAngle = Math.random() * Math.PI * 2;
        const testX = this.x + Math.cos(testAngle) * 50;
        const testY = this.y + Math.sin(testAngle) * 50;
        const testDistance = Math.sqrt((testX - target.x) ** 2 + (testY - target.y) ** 2);
        
        if (testDistance < bestDistance) {
          bestDistance = testDistance;
          bestAngle = testAngle;
        }
      }
      
      this.angle = bestAngle;
      
      // Move away from current position with the best direction
      this.x += p.cos(this.angle) * 50;
      this.y += p.sin(this.angle) * 50;
      
      this.obstacleStuckCounter = 0;
    }
    
    // Clear recent progress to avoid false stuck detection
    this.routeProgress = this.routeProgress.slice(-2);
  }

  generateAlternativeRoute(target) {
    // Look for successful route segments that got closer to target
    const successfulSegments = this.successfulRouteSegments.filter(segment => 
      segment.finalDistance < p.dist(this.x, this.y, target.x, target.y)
    );
    
    if (successfulSegments.length > 0) {
      // Find the best successful segment
      const bestSegment = successfulSegments.reduce((best, segment) => 
        segment.finalDistance < best.finalDistance ? segment : best
      );
      
      return {
        startPoint: bestSegment.startPoint,
        direction: bestSegment.direction,
        type: 'successful_segment'
      };
    }
    
    // Look for progress points that got us closer
    const currentDistance = Math.sqrt((this.x - target.x) ** 2 + (this.y - target.y) ** 2);
    const progressPoints = this.routeProgress.filter(progress => 
      progress.distance < currentDistance
    );
    
    if (progressPoints.length > 0) {
      const bestProgress = progressPoints.reduce((best, p) => 
        p.distance < best.distance ? p : best
      );
      
      return {
        startPoint: { x: bestProgress.x, y: bestProgress.y },
        direction: p.atan2(target.y - bestProgress.y, target.x - bestProgress.x),
        type: 'progress_point'
      };
    }
    
    // Try multiple escape strategies
    const strategies = [];
    
    // Strategy 1: Go around obstacles
    const obstacleCenters = obstacles.map(obs => ({ x: obs.x * p.width, y: obs.y * p.height }));
    const avgObstacleX = obstacleCenters.reduce((sum, obs) => sum + obs.x, 0) / obstacleCenters.length;
    const avgObstacleY = obstacleCenters.reduce((sum, obs) => sum + obs.y, 0) / obstacleCenters.length;
    const escapeAngle = p.atan2(this.y - avgObstacleY, this.x - avgObstacleX);
    
    strategies.push({
      startPoint: { 
        x: this.x + p.cos(escapeAngle) * 80, 
        y: this.y + p.sin(escapeAngle) * 80 
      },
      direction: escapeAngle,
      type: 'escape_route',
      score: 0
    });
    
    // Strategy 2: Try to go directly toward target from a different angle
    const directAngle = p.atan2(target.y - this.y, target.x - this.x);
    const perpendicularAngle1 = directAngle + p.PI/2;
    const perpendicularAngle2 = directAngle - p.PI/2;
    
    strategies.push({
      startPoint: { 
        x: this.x + p.cos(perpendicularAngle1) * 60, 
        y: this.y + p.sin(perpendicularAngle1) * 60 
      },
      direction: directAngle,
      type: 'perpendicular_approach',
      score: 0
    });
    
    strategies.push({
      startPoint: { 
        x: this.x + p.cos(perpendicularAngle2) * 60, 
        y: this.y + p.sin(perpendicularAngle2) * 60 
      },
      direction: directAngle,
      type: 'perpendicular_approach',
      score: 0
    });
    
    // Strategy 3: Try going to the opposite side of the target
    const oppositeAngle = p.atan2(target.y - this.y, target.x - this.x) + p.PI;
    strategies.push({
      startPoint: { 
        x: this.x + p.cos(oppositeAngle) * 100, 
        y: this.y + p.sin(oppositeAngle) * 100 
      },
      direction: directAngle,
      type: 'opposite_approach',
      score: 0
    });
    
    // Score each strategy based on how close it gets to target
    strategies.forEach(strategy => {
      const distanceToTarget = Math.sqrt((strategy.startPoint.x - target.x) ** 2 + (strategy.startPoint.y - target.y) ** 2);
      strategy.score = 1 / (distanceToTarget + 1); // Closer = higher score
    });
    
    // Return the best strategy
    const bestStrategy = strategies.reduce((best, strategy) => 
      strategy.score > best.score ? strategy : best
    );
    
    return bestStrategy;
  }

  resetToBestKnownPosition(target) {
    if (this.bestRouteToTarget) {
      // Reset to the best position we've found
      const bestPoint = this.bestRouteToTarget.path[Math.floor(this.bestRouteToTarget.path.length / 2)];
      this.x = bestPoint.x;
      this.y = bestPoint.y;
      this.angle = p.atan2(target.y - this.y, target.x - this.x);
      console.log(`Rover ML: Reset to best known position`);
    } else {
      // Reset to start position
      this.x = 50;
      this.y = 50;
      this.angle = 0;
      console.log(`Rover ML: Reset to start position`);
    }
    
    this.obstacleStuckCounter = 0;
    this.currentRouteAttempt = 0;
  }

  recordSuccessfulRoute() {
    const route = {
      path: [...this.currentAttempt.path],
      finalDistance: this.bestDistance,
      routeAttempt: this.currentRouteAttempt,
      timestamp: Date.now()
    };
    
    this.pathMemory.push(route);
    
    // Keep memory manageable
    if (this.pathMemory.length > this.routeMemorySize) {
      this.pathMemory.shift();
    }
    
    console.log(`Rover ML: Recorded successful route with distance ${this.bestDistance.toFixed(2)}`);
  }

  recordFailedRoute() {
    const route = {
      path: [...this.currentAttempt.path],
      finalDistance: this.bestDistance,
      routeAttempt: this.currentRouteAttempt,
      timestamp: Date.now(),
      failureReason: 'stuck'
    };
    
    this.failedRouteSegments.push(route);
    
    // Keep memory manageable
    if (this.failedRouteSegments.length > this.routeMemorySize) {
      this.failedRouteSegments.shift();
    }
    
    console.log(`Rover ML: Recorded failed route with best distance ${this.bestDistance.toFixed(2)}`);
  }

  normalizeAngle(angle) {
    while (angle > p.PI) angle -= p.TWO_PI;
    while (angle < -p.PI) angle += p.TWO_PI;
    return angle;
  }

  // Machine Learning Methods
  startNewAttempt() {
    this.attemptCount++;
    this.currentAttempt = {
      path: [],
      success: false,
      startTime: Date.now(),
      attemptNumber: this.attemptCount
    };
    this.bestDistance = Infinity;
    console.log(`Rover ML: Starting attempt #${this.attemptCount}`);
  }

  learnFromAttempt(success) {
    this.currentAttempt.success = success;
    this.currentAttempt.endTime = Date.now();
    this.currentAttempt.duration = this.currentAttempt.endTime - this.currentAttempt.startTime;
    this.currentAttempt.finalDistance = this.bestDistance;

    // Store in memory
    this.memory.push({ ...this.currentAttempt });

    if (success) {
      this.successfulPaths.push(this.currentAttempt.path);
      console.log(`Rover ML: SUCCESS! Attempt #${this.attemptCount} reached target in ${this.currentAttempt.duration}ms`);
    } else {
      this.failedPaths.push(this.currentAttempt.path);
      console.log(`Rover ML: Failed attempt #${this.attemptCount}. Best distance: ${this.bestDistance.toFixed(2)}`);
    }

    // Keep memory manageable
    if (this.memory.length > 20) {
      this.memory.shift();
    }
    if (this.successfulPaths.length > 5) {
      this.successfulPaths.shift();
    }
    if (this.failedPaths.length > 10) {
      this.failedPaths.shift();
    }
  }

  restartAttempt() {
    console.log(`Rover ML: Restarting attempt due to being stuck`);
    this.x = 50; // Reset to start position
    this.y = 50;
    this.angle = 0;
    this.obstacleStuckCounter = 0;
    this.startNewAttempt();
  }

  chooseMovementStrategy(sensorReadings, target, obstacles) {
    // Balanced strategy for smooth autonomous navigation
    let strategy = {
      goalWeight: 2.5, // Balanced goal weight
      avoidanceWeight: 1.5, // Balanced avoidance weight
      preferredDirection: null,
      explorationBonus: 0,
      speedMultiplier: 1.0 // Normal speed for smooth movement
    };

    // Check for repetitive patterns and apply penalties
    this.detectRepetitivePatterns();
    
    // Calculate adaptive exploration rate based on recent performance
    const adaptiveExplorationRate = this.calculateAdaptiveExplorationRate();
    
    // If we're stuck, be more aggressive but still smooth
    if (this.obstacleStuckCounter > 10) {
      strategy.goalWeight = 3;
      strategy.avoidanceWeight = 1;
      strategy.speedMultiplier = 1.3;
      strategy.explorationBonus = 0.2; // Moderate exploration when stuck
    }
    
    // If we're close to target, be more careful and precise
    const distanceToTarget = Math.sqrt((this.x - target.x) ** 2 + (this.y - target.y) ** 2);
    if (distanceToTarget < 80) {
      strategy.goalWeight = 3;
      strategy.avoidanceWeight = 1.5;
      strategy.speedMultiplier = 0.6; // Slow down more when very close
    }
    
    // If we're very close to target, be extra careful
    if (distanceToTarget < 40) {
      strategy.goalWeight = 4;
      strategy.avoidanceWeight = 1;
      strategy.speedMultiplier = 0.4; // Very slow when almost there
    }
    
    // Apply exploration vs exploitation with adaptive rates
    const shouldExplore = Math.random() < adaptiveExplorationRate;
    
    if (shouldExplore) {
      // Enhanced exploration: Try new directions but still toward target
      strategy.explorationBonus = this.innovationBonus * 0.3; // Reduced exploration bonus
      strategy.preferredDirection = this.generateInnovativeDirectionTowardTarget(target);
      strategy.speedMultiplier = 0.9; // Keep good speed for exploration
      console.log(`Rover ML: Exploring innovative direction toward target: ${(strategy.preferredDirection * 180 / p.PI).toFixed(1)}°`);
    } else if (this.successfulPaths.length > 0) {
      // Enhanced exploitation: Use learned successful patterns with adaptation
      const bestPath = this.getBestSuccessfulPath();
      if (bestPath) {
        const similarPoint = this.findSimilarPoint(bestPath);
        if (similarPoint && !this.isPatternRepetitive(similarPoint)) {
          strategy.preferredDirection = similarPoint.angle;
          strategy.goalWeight = 2.5; // Even stronger goal seeking for known good paths
          strategy.speedMultiplier = 1.2; // Faster for known good paths
          console.log(`Rover ML: Using adapted successful pattern toward target`);
        } else {
          // Fall back to target-focused approach if pattern is repetitive
          strategy.preferredDirection = p.atan2(target.y - this.y, target.x - this.x);
          strategy.goalWeight = 2.2; // Strong goal seeking
          console.log(`Rover ML: Avoiding repetitive pattern, focusing on target`);
        }
      } else {
        // No successful paths, focus directly on target
        strategy.preferredDirection = p.atan2(target.y - this.y, target.x - this.x);
        strategy.goalWeight = 2.2;
        console.log(`Rover ML: No successful patterns, focusing on target`);
      }
    } else {
      // No learning history, focus directly on target
      strategy.preferredDirection = p.atan2(target.y - this.y, target.x - this.x);
      strategy.goalWeight = 2.2;
      console.log(`Rover ML: First attempt, focusing on target`);
    }

    // Apply repetition penalty if we're repeating failed patterns
    if (this.repetitionPenalty > 0) {
      strategy.explorationBonus += this.repetitionPenalty * 0.2; // Reduced penalty impact
      strategy.goalWeight = Math.max(strategy.goalWeight * 0.9, 1.5); // Keep strong goal seeking
      console.log(`Rover ML: Applying repetition penalty: ${this.repetitionPenalty.toFixed(2)}`);
    }

    // Adjust strategy based on sensor readings while maintaining goal focus
    const avgSensorReading = sensorReadings.reduce((a, b) => a + b, 0) / sensorReadings.length;
    if (avgSensorReading < this.dangerZone * 2) {
      // In tight space, still prioritize goal but increase avoidance
      strategy.avoidanceWeight = 2.5;
      strategy.goalWeight = Math.max(strategy.goalWeight * 0.8, 1.5); // Keep minimum goal seeking
      strategy.explorationBonus += 0.2; // Moderate exploration in tight spaces
    }

    // Adaptive speed based on recent success
    strategy.speedMultiplier *= this.adaptiveSpeed / this.speed;

    return strategy;
  }

  // New method to generate innovative direction toward target
  generateInnovativeDirectionTowardTarget(target) {
    // Calculate direct angle to target
    const directAngle = p.atan2(target.y - this.y, target.x - this.x);
    
    // Generate a direction that's innovative but still toward the target
    let attempts = 0;
    const maxAttempts = 15;
    
    while (attempts < maxAttempts) {
      // Add some randomness to the target direction
      const angleVariation = (Math.random() - 0.5) * p.radians(60); // ±30 degrees
      const newDirection = directAngle + angleVariation;
      
      // Check if this direction is significantly different from recent movements
      if (this.isDirectionInnovative(newDirection)) {
        return newDirection;
      }
      
      attempts++;
    }
    
    // If we can't find an innovative direction, use the direct angle to target
    return directAngle;
  }

  // New methods for enhanced ML
  detectRepetitivePatterns() {
    // Track current position
    this.lastPositions.push({ x: this.x, y: this.y, time: Date.now() });
    
    // Keep only recent positions
    if (this.lastPositions.length > 20) {
      this.lastPositions.shift();
    }
    
    // Check for loops in recent movement
    if (this.lastPositions.length > 10) {
      const recentPositions = this.lastPositions.slice(-10);
      const isLooping = this.detectLoop(recentPositions);
      
      if (isLooping) {
        this.repetitionPenalty = Math.min(this.repetitionPenalty + 0.1, 1.0);
        this.consecutiveFailures++;
        console.log(`Rover ML: Detected movement loop! Penalty: ${this.repetitionPenalty.toFixed(2)}`);
      } else {
        this.repetitionPenalty = Math.max(this.repetitionPenalty - 0.05, 0);
      }
    }
  }

  detectLoop(positions) {
    if (positions.length < 6) return false;
    
    // Check if we're moving in a small circle
    const centerX = positions.reduce((sum, pos) => sum + pos.x, 0) / positions.length;
    const centerY = positions.reduce((sum, pos) => sum + pos.y, 0) / positions.length;
    
    const avgDistanceFromCenter = positions.reduce((sum, pos) => {
      return sum + p.dist(pos.x, pos.y, centerX, centerY);
    }, 0) / positions.length;
    
    // If average distance from center is small, we're likely looping
    return avgDistanceFromCenter < this.size * 2;
  }

  calculateAdaptiveExplorationRate() {
    let baseRate = this.explorationRate;
    
    // Increase exploration if we've been failing
    if (this.consecutiveFailures > 3) {
      baseRate = Math.min(baseRate + 0.2, 0.8);
    }
    
    // Increase exploration if we're stuck
    if (this.obstacleStuckCounter > this.stuckThreshold) {
      baseRate = Math.min(baseRate + 0.3, 0.9);
    }
    
    // Decrease exploration if we've been successful recently
    if (this.successfulPaths.length > 0) {
      const lastSuccess = this.successfulPaths[this.successfulPaths.length - 1];
      if (Date.now() - lastSuccess.endTime < 10000) { // 10 seconds
        baseRate = Math.max(baseRate - 0.1, 0.2);
      }
    }
    
    return baseRate;
  }

  generateInnovativeDirection() {
    // Generate a direction that's different from recent attempts
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const newDirection = Math.random() * p.TWO_PI;
      
      // Check if this direction is significantly different from recent movements
      if (this.isDirectionInnovative(newDirection)) {
        return newDirection;
      }
      
      attempts++;
    }
    
    // If we can't find an innovative direction, use a random one
    return Math.random() * p.TWO_PI;
  }

  isDirectionInnovative(direction) {
    // Check if this direction is significantly different from recent movements
    if (this.recentMovements.length === 0) return true;
    
    const recentDirections = this.recentMovements.slice(-5);
    
    for (let recentDir of recentDirections) {
      const angleDiff = Math.abs(direction - recentDir);
      const normalizedDiff = Math.min(angleDiff, p.TWO_PI - angleDiff);
      
      // If direction is too similar to recent ones, it's not innovative
      if (normalizedDiff < p.radians(45)) {
        return false;
      }
    }
    
    return true;
  }

  isPatternRepetitive(pattern) {
    // Check if this pattern is similar to recently failed patterns
    if (this.stuckPatterns.length === 0) return false;
    
    const recentStuckPatterns = this.stuckPatterns.slice(-3);
    
    for (let stuckPattern of recentStuckPatterns) {
      const similarity = this.calculatePatternSimilarity(pattern, stuckPattern);
      if (similarity > 0.7) { // 70% similarity threshold
        return true;
      }
    }
    
    return false;
  }

  calculatePatternSimilarity(pattern1, pattern2) {
    // Simple similarity calculation based on angle difference
    if (!pattern1.angle || !pattern2.angle) return 0;
    
    const angleDiff = Math.abs(pattern1.angle - pattern2.angle);
    const normalizedDiff = Math.min(angleDiff, p.TWO_PI - angleDiff);
    
    // Convert to similarity (0 = very different, 1 = very similar)
    return 1 - (normalizedDiff / p.PI);
  }

  getBestSuccessfulPath() {
    if (this.successfulPaths.length === 0) return null;
    
    // Return the most recent successful path
    return this.successfulPaths[this.successfulPaths.length - 1];
  }

  findSimilarPoint(path) {
    // Find a point in the successful path that's similar to current position
    let bestMatch = null;
    let bestDistance = Infinity;

    for (let point of path) {
      const distance = p.dist(this.x, this.y, point.x, point.y);
      if (distance < bestDistance && distance < 100) { // Within 100 pixels
        bestDistance = distance;
        bestMatch = point;
      }
    }

    return bestMatch;
  }

  executeMovement(obstacles, strategy) {
    const minSensorReading = Math.min(...this.readSensors(obstacles));
    let moved = false;
    
    // Use adaptive speed from strategy
    const currentSpeed = this.speed * (strategy.speedMultiplier || 1);
    
    // Don't move if we've reached the target
    if (this.targetReached) {
      return;
    }
    
    // Safe direct movement with proper safety margins
    if (minSensorReading > this.dangerZone * 1.2) { // Increased safety margin
      const nextX = this.x + Math.cos(this.angle) * currentSpeed;
      const nextY = this.y + Math.sin(this.angle) * currentSpeed;
      
      if (!this.wouldCollideAtPosition(nextX, nextY, obstacles)) {
        this.x = nextX;
        this.y = nextY;
        moved = true;
        this.obstacleStuckCounter = 0;
      }
    }
    
    // If direct movement failed, try smooth angle adjustments
    if (!moved) {
      const angleStep = strategy.explorationBonus > 0 ? 0.1 : 0.08; // Smaller steps for smoother movement
      for (let angleOffset = 0.05; angleOffset <= 1.0; angleOffset += angleStep) { // Reduced range for smoother turns
        for (let direction of [-1, 1]) {
          const testAngle = this.angle + (angleOffset * direction);
          const testX = this.x + Math.cos(testAngle) * currentSpeed;
          const testY = this.y + Math.sin(testAngle) * currentSpeed;
          
          if (!this.wouldCollideAtPosition(testX, testY, obstacles)) {
            this.angle = testAngle;
            this.x = testX;
            this.y = testY;
            moved = true;
            this.obstacleStuckCounter = 0;
            break;
          }
        }
        if (moved) break;
      }
    }
    
    // If still can't move, try smaller movements with smooth angles
    if (!moved) {
      const speedReductions = strategy.explorationBonus > 0 ? [0.8, 0.6, 0.4, 0.2] : [0.7, 0.5, 0.3, 0.2]; // Conservative speed reductions
      const angleSteps = strategy.explorationBonus > 0 ? 0.15 : 0.2; // Moderate angle coverage
      
      for (let speedReduction of speedReductions) {
        for (let testAngle = 0; testAngle < Math.PI * 2; testAngle += angleSteps) {
          const testX = this.x + Math.cos(testAngle) * currentSpeed * speedReduction;
          const testY = this.y + Math.sin(testAngle) * currentSpeed * speedReduction;
          
          if (!this.wouldCollideAtPosition(testX, testY, obstacles)) {
            this.angle = testAngle;
            this.x = testX;
            this.y = testY;
            moved = true;
            this.obstacleStuckCounter = 0;
            break;
          }
        }
        if (moved) break;
      }
    }
    
    // Last resort: find any direction with space and move there smoothly
    if (!moved) {
      let bestAngle = this.angle;
      let maxDistance = 0;
      const angleStep = strategy.explorationBonus > 0 ? 0.1 : 0.15; // Moderate search
      
      for (let testAngle = 0; testAngle < Math.PI * 2; testAngle += angleStep) {
        let distance = this.getDistanceInDirection(testAngle, obstacles);
        if (distance > maxDistance) {
          maxDistance = distance;
          bestAngle = testAngle;
        }
      }
      
      // Move in the direction with most space - conservative
      if (maxDistance > this.size * 0.8) { // Increased threshold for safety
        this.angle = bestAngle;
        const moveDistance = Math.min(currentSpeed * 0.5, maxDistance * 0.4); // Conservative movement
        this.x += Math.cos(this.angle) * moveDistance;
        this.y += Math.sin(this.angle) * moveDistance;
        this.obstacleStuckCounter = 0;
      } else {
        this.obstacleStuckCounter++;
      }
    }
    
    // Update adaptive speed based on success
    if (moved) {
      // Gradually increase speed if we're making progress
      this.adaptiveSpeed = Math.min(this.adaptiveSpeed * 1.01, this.speed * 1.5);
    } else {
      // Decrease speed if we're stuck
      this.adaptiveSpeed = Math.max(this.adaptiveSpeed * 0.99, this.speed * 0.5);
    }
  }

  readSensors(obstacles) {
    let readings = [this.sensorRange, this.sensorRange, this.sensorRange]; // 3 ultrasonic sensors
    const isMobile = p.width < 600;
    const sensorStep = isMobile ? 3 : 2; // More precise sensor readings
    
    for (let i = 0; i < this.numSensors; i++) {
      let sensorAngle = this.angle + this.sensorAngles[i];
      let sensorDistance = this.sensorRange;

      for (let d = 0; d <= this.sensorRange; d += sensorStep) {
        let sensorX = this.x + d * Math.cos(sensorAngle);
        let sensorY = this.y + d * Math.sin(sensorAngle);

        // Check canvas boundaries with comfortable margin
        if (sensorX < this.size / 2 + 10 || sensorX > p.width - this.size / 2 - 10 || 
            sensorY < this.size / 2 + 10 || sensorY > p.height - this.size / 2 - 10) {
          sensorDistance = d;
          break;
        }

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
      let d = Math.sqrt((x - obstacle.x) ** 2 + (y - obstacle.y) ** 2);
      if (d < obstacle.size / 2 + 5) { // Added small buffer for better detection
        return true;
      }
    }
    return false;
  }

  checkCollision(obstacles) {
    // Check obstacles with proper safety margin
    for (let obstacle of obstacles) {
      let d = Math.sqrt((this.x - obstacle.x) ** 2 + (this.y - obstacle.y) ** 2);
      if (d < this.size / 2 + obstacle.size / 2 + 10) { // Increased safety margin
        return true;
      }
    }
    
    // Check canvas boundaries with comfortable margin
    if (this.x < this.size / 2 + 10 || this.x > p.width - this.size / 2 - 10 || 
        this.y < this.size / 2 + 10 || this.y > p.height - this.size / 2 - 10) {
      return true;
    }
    
    return false;
  }

  wouldCollideAtPosition(x, y, obstacles) {
    for (let obstacle of obstacles) {
      let d = Math.sqrt((x - obstacle.x) ** 2 + (y - obstacle.y) ** 2);
      // Increased safety margin to prevent crashes
      if (d < this.size / 2 + obstacle.size / 2 + 15) { // Increased from 5 to 15
        return true;
      }
    }
    
    // Also check canvas boundaries with comfortable margin
    if (x < this.size / 2 + 10 || x > p.width - this.size / 2 - 10 || 
        y < this.size / 2 + 10 || y > p.height - this.size / 2 - 10) {
      return true;
    }
    
    return false;
  }

  getDistanceInDirection(angle, obstacles) {
    let maxDistance = 0;
    
    for (let distance = this.size; distance <= this.sensorRange; distance += 5) {
      const testX = this.x + Math.cos(angle) * distance;
      const testY = this.y + Math.sin(angle) * distance;
      
      // Check canvas boundaries with comfortable margin
      if (testX < this.size / 2 + 10 || testX > p.width - this.size / 2 - 10 || 
          testY < this.size / 2 + 10 || testY > p.height - this.size / 2 - 10) {
        break;
      }
      
      // Check obstacles with increased safety margin
      let collision = false;
      for (let obstacle of obstacles) {
        let d = Math.sqrt((testX - obstacle.x) ** 2 + (testY - obstacle.y) ** 2);
        if (d < obstacle.size / 2 + this.size / 2 + 15) { // Increased from 5 to 15
          collision = true;
          break;
        }
      }
      
      if (collision) {
        break;
      }
      
      maxDistance = distance;
    }
    
    return maxDistance;
  }

  reachedWaypoint(target) {
    const distance = Math.sqrt((this.x - target.x) ** 2 + (this.y - target.y) ** 2);
    // Much more forgiving threshold for reaching waypoint B
    const threshold = this.size * 2.5; // Increased from 1.2 to 2.5 for better detection
    return distance < threshold;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.obstacleStuckCounter = 0;
    
    // Reset machine learning state but keep memory
    this.currentAttempt = { path: [], success: false, startTime: 0 };
    this.bestDistance = Infinity;
    this.targetReached = false;
    
    console.log(`Rover ML: Reset - keeping ${this.memory.length} memories, ${this.successfulPaths.length} successful paths`);
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

// Ensure the rover simulation doesn't interfere with page navigation
useEffect(() => {
  const handleGlobalEvent = (event) => {
    // If event is outside the rover simulation container, ensure it propagates normally
    if (sketchRef.current && !sketchRef.current.contains(event.target)) {
      // Allow normal page interactions - don't interfere
      return;
    }
  };

  // Add passive listeners to avoid blocking page interactions
  document.addEventListener('click', handleGlobalEvent, { passive: true, capture: true });
  document.addEventListener('touchstart', handleGlobalEvent, { passive: true, capture: true });

  return () => {
    document.removeEventListener('click', handleGlobalEvent, { passive: true, capture: true });
    document.removeEventListener('touchstart', handleGlobalEvent, { passive: true, capture: true });
  };
}, []);

const handleEditMode = () => {
  const newEditMode = !editMode;
  console.log('Edit mode toggled:', newEditMode);
  setEditMode(newEditMode);
  if (p5InstanceRef.current && p5InstanceRef.current.setEditMode) {
    p5InstanceRef.current.setEditMode(newEditMode);
    console.log('P5 setEditMode called with:', newEditMode);
  } else {
    console.log('P5 instance not available or setEditMode not found');
  }
};

return (
<div className="simulation-container">
<div
  ref={sketchRef}
  className={`sketch-container ${editMode ? 'edit-mode' : ''}`}
></div>
      <div className="controls">
        <button 
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (p5InstanceRef.current && p5InstanceRef.current.start) {
              p5InstanceRef.current.start();
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (p5InstanceRef.current && p5InstanceRef.current.start) {
              p5InstanceRef.current.start();
            }
          }}
        >
          Start
        </button>
        <button 
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (p5InstanceRef.current && p5InstanceRef.current.pause) {
              p5InstanceRef.current.pause();
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (p5InstanceRef.current && p5InstanceRef.current.pause) {
              p5InstanceRef.current.pause();
            }
          }}
        >
          Pause
        </button>
        <button 
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (p5InstanceRef.current && p5InstanceRef.current.stop) {
              p5InstanceRef.current.stop();
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (p5InstanceRef.current && p5InstanceRef.current.stop) {
              p5InstanceRef.current.stop();
            }
          }}
        >
          Restart
        </button>
        <button 
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Edit button touched');
            handleEditMode();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            console.log('Edit button clicked');
            handleEditMode();
          }}
          style={{ WebkitTapHighlightColor: 'rgba(0, 0, 0, 0.1)' }}
        >
          {editMode ? 'Exit Edit Mode' : 'Edit Obstacles'}
        </button>
      </div>
</div>
);
};

export default memo(RoverSimulation);