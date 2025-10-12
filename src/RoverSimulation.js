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
let routeIsPossible = true; // Track if B is reachable

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
let turboActive = false;
let turboSpeed = 0;

p.setup = () => {
  p.createCanvas(containerSize.width, containerSize.height).parent(sketchRef.current);
  rover = new Rover(waypoints[0].x * p.width, waypoints[0].y * p.height);
  updateObstacles();
};

// Get the shortest possible path to B using breadth-first search
const getPathToB = () => {
  const targetWaypoint = waypoints[1];
  const targetX = targetWaypoint.x * p.width;
  const targetY = targetWaypoint.y * p.height;
  
  // Create a balanced grid for pathfinding (optimized for performance)
  const gridSize = 25; // Larger grid cells for better performance
  const gridWidth = Math.ceil(p.width / gridSize);
  const gridHeight = Math.ceil(p.height / gridSize);
  
  // Create a grid marking obstacles
  let grid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(0)); // 0 = free space
  
  // Mark all obstacles on the grid with appropriate buffer for the rover
  for (let obstacle of obstacles) {
    const obsX = obstacle.x * p.width;
    const obsY = obstacle.y * p.height;
    const radius = obstacle.size / 2 + rover.size/2 - 5; // Buffer for rover, but not too large
    
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
  if (bestPath) {
    return {
      complete: false,
      x: bestPath.x * gridSize + gridSize / 2,
      y: bestPath.y * gridSize + gridSize / 2,
      path: bestPath.path || []
    };
  } else {
    // No path found at all - return rover's current position
    return {
      complete: false,
      x: rover.x,
      y: rover.y,
      path: []
    };
  }
};

p.windowResized = () => {
  p.resizeCanvas(containerSize.width, containerSize.height);
  if (rover) {
    rover.reset(waypoints[0].x * p.width, waypoints[0].y * p.height);
  }
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
  // Modern gradient background
  let bgGradient = p.drawingContext.createLinearGradient(0, 0, p.width, p.height);
  bgGradient.addColorStop(0, '#1a1a2e');
  bgGradient.addColorStop(1, '#16213e');
  p.drawingContext.fillStyle = bgGradient;
  p.drawingContext.fillRect(0, 0, p.width, p.height);

  // Draw subtle grid
  p.stroke(255, 255, 255, 20);
  p.strokeWeight(0.5);
  for (let i = 0; i < p.width; i += 50) {
    p.line(i, 0, i, p.height);
  }
  for (let i = 0; i < p.height; i += 50) {
    p.line(0, i, p.width, i);
  }
  p.noStroke();

  // Draw waypoints with glow
  for (let wp of waypoints) {
    // Outer glow
    p.fill(255, 215, 0, 100);
    p.noStroke();
    p.ellipse(wp.x * p.width, wp.y * p.height, 45, 45);

    // Main waypoint
    p.fill(255, 215, 0);
    p.ellipse(wp.x * p.width, wp.y * p.height, 35, 35);

    // Label
    p.fill(30, 30, 50);
    p.textFont('Fahkwang');
    p.textSize(20);
    p.textStyle(p.BOLD);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(wp.label, wp.x * p.width, wp.y * p.height);
  }

  // Draw obstacles (if not destroyed in Easter egg)
  obstacles.forEach((obstacle, index) => {
    // Skip if this obstacle was destroyed in the Easter egg
    if (easterEggTriggered && destroyedObstacles.includes(index)) return;

    // Obstacle shadow/glow
    p.fill(80, 120, 255, 100);
    p.noStroke();
    p.ellipse(
      obstacle.x * p.width,
      obstacle.y * p.height,
      obstacle.size + 10,
      obstacle.size + 10
    );

    // Main obstacle
    p.fill(100, 150, 255);
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
    // Normal rover movement - just go towards target and avoid obstacles
    rover.update(
      { x: waypoints[currentWaypointIndex].x * p.width, y: waypoints[currentWaypointIndex].y * p.height },
      obstacles.filter((_, index) => !destroyedObstacles.includes(index))
        .map((obs) => ({
          x: obs.x * p.width,
          y: obs.y * p.height,
          size: obs.size,
        }))
    );

    // Check if reached waypoint
    if (rover.reachedWaypoint({ x: waypoints[currentWaypointIndex].x * p.width, y: waypoints[currentWaypointIndex].y * p.height })) {
      if (currentWaypointIndex < waypoints.length - 1) {
        currentWaypointIndex++;
      } else {
        isStopped = true;
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
        turboActive = true; // Activate turbo mode!
        turboSpeed = 0;
        currentWaypointIndex = 1; // Target waypoint B
        destroyedObstacles = Array.from(Array(obstacles.length).keys()); // Mark all obstacles as destroyed
      }
      break;
      
    case 4: // Moving to B with TURBO!
      if (turboActive) {
        // Accelerate to max speed
        turboSpeed = Math.min(20, turboSpeed + 1);

        // Point directly at B
        const targetX = waypoints[1].x * p.width;
        const targetY = waypoints[1].y * p.height;
        const angleToB = p.atan2(targetY - rover.y, targetX - rover.x);
        rover.angle = angleToB;

        // ZOOM toward B
        rover.x += p.cos(rover.angle) * turboSpeed;
        rover.y += p.sin(rover.angle) * turboSpeed;

        // Draw turbo flames behind rover
        p.push();
        p.translate(rover.x, rover.y);
        p.rotate(rover.angle);

        // Multiple flame particles
        for (let i = 0; i < 8; i++) {
          const flameLength = p.random(20, 40) + turboSpeed * 2;
          const flameWidth = p.random(5, 15);
          const offsetY = p.random(-10, 10);

          p.fill(255, p.random(100, 200), 0, p.random(150, 255));
          p.noStroke();
          p.ellipse(
            -flameLength / 2 - rover.size,
            offsetY,
            flameLength,
            flameWidth
          );
        }

        // Speed lines
        p.stroke(255, 255, 255, 100);
        p.strokeWeight(2);
        for (let i = 0; i < 5; i++) {
          const lineLength = p.random(30, 60);
          const offsetY = p.random(-15, 15);
          p.line(-rover.size - lineLength, offsetY, -rover.size, offsetY);
        }

        p.pop();
      } else {
        // Normal movement (shouldn't happen but fallback)
        rover.update(
          { x: waypoints[1].x * p.width, y: waypoints[1].y * p.height },
          [] // No obstacles
        );
      }

      // Check if reached B
      if (rover.reachedWaypoint({ x: waypoints[1].x * p.width, y: waypoints[1].y * p.height })) {
        easterEggPhase = 5; // Start dancing
        easterEggTimer = 0;
        danceAngle = 0;
        turboActive = false;
        turboSpeed = 0;
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
  if (!isMoving && isStopped) {
    rover.reset(waypoints[0].x * p.width, waypoints[0].y * p.height);
    currentWaypointIndex = 0;
  }

  // Reset state
  destroyedObstacles = [];
  cannonSize = 0;
  failedAttempts = 0;
  easterEggTriggered = false;
  easterEggPhase = 0;

  // STEP 1: Check if route to B is possible
  routeIsPossible = !isBBlocked();

  if (routeIsPossible) {
    // Route is possible - start normal navigation
    isMoving = true;
    isStopped = false;
  } else {
    // Route is NOT possible - trigger easter egg immediately
    isMoving = false;
    isStopped = false;

    // Find closest obstacle to B to target first
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

    // Trigger easter egg
    easterEggTriggered = true;
    easterEggPhase = 1;
  }
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
  turboActive = false;
  turboSpeed = 0;
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
    this.speed = 3.5;
    this.angle = 0;
    this.size = 25;
    this.sensorRange = 120;
    this.numSensors = 3; // Left, Center, Right
    this.sensorAngles = [-p.radians(45), 0, p.radians(45)];
    this.maxAngularVelocity = p.radians(4);
    this.dangerZone = 45;
  }

  show() {
    p.push();
    p.translate(this.x, this.y);
    p.rotate(this.angle);

    // Draw rover shadow/glow
    p.fill(255, 80, 100, 120);
    p.noStroke();
    p.rectMode(p.CENTER);
    p.rect(0, 0, this.size * 1.6, this.size * 1.1, 3);

    // Draw main body
    p.fill(255, 60, 80);
    p.rect(0, 0, this.size * 1.5, this.size, 3);

    // Draw sensors (subtle)
    p.stroke(255, 120, 140, 80);
    p.strokeWeight(1);
    for (let sensorAngle of this.sensorAngles) {
      p.line(
        0,
        0,
        this.sensorRange * 0.6 * p.cos(sensorAngle),
        this.sensorRange * 0.6 * p.sin(sensorAngle)
      );
    }
    p.noStroke();

    // Draw wheels
    p.fill(40, 40, 60);
    p.rectMode(p.CENTER);
    p.rect(-this.size * 0.3, -this.size * 0.55, this.size * 0.6, this.size * 0.25, 2);
    p.rect(-this.size * 0.3, this.size * 0.55, this.size * 0.6, this.size * 0.25, 2);

    // Draw front indicator (brighter)
    p.fill(255, 200, 210);
    p.triangle(
      this.size * 0.75,
      0,
      this.size * 0.5,
      -this.size * 0.3,
      this.size * 0.5,
      this.size * 0.3
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

    // Draw the rover body (red)
    p.fill(255, 60, 80);
    p.rectMode(p.CENTER);
    p.rect(0, 0, this.size * 1.5, this.size, 3);

    // Draw the cannon
    p.fill(50, 50, 50);
    p.rectMode(p.CENTER);
    p.rect(this.size * 0.75, 0, cannonSize, this.size / 3, 2);

    // Draw cannon tip
    p.fill(255, 220, 0);
    p.ellipse(this.size * 0.75 + cannonSize / 2, 0, 10, 10);

    // Draw sensors (dimmer during easter egg)
    p.stroke(255, 120, 140, 50);
    p.strokeWeight(1);
    for (let sensorAngle of this.sensorAngles) {
      p.line(
        0,
        0,
        this.sensorRange * 0.5 * p.cos(sensorAngle),
        this.sensorRange * 0.5 * p.sin(sensorAngle)
      );
    }
    p.noStroke();

    // Draw wheels
    p.fill(40, 40, 60);
    p.rectMode(p.CENTER);
    p.rect(-this.size * 0.3, -this.size * 0.55, this.size * 0.6, this.size * 0.25, 2);
    p.rect(-this.size * 0.3, this.size * 0.55, this.size * 0.6, this.size * 0.25, 2);

    // Draw rover front indicator
    p.fill(255, 200, 210);
    p.triangle(
      this.size * 0.5,
      0,
      this.size * 0.25,
      -this.size * 0.3,
      this.size * 0.25,
      this.size * 0.3
    );

    p.pop();
  }

  update(target, obstacles) {
    // Read sensors
    let sensorReadings = this.readSensors(obstacles);

    // Calculate avoidance vector from sensors
    let avoidanceVector = p.createVector(0, 0);

    for (let i = 0; i < this.numSensors; i++) {
      let reading = sensorReadings[i];
      if (reading < this.dangerZone) {
        // Object is in danger zone, apply strong avoidance
        let avoidanceStrength = p.map(reading, 0, this.dangerZone, 4, 0.5);
        let avoidanceAngle = this.angle + this.sensorAngles[i] + p.PI;
        avoidanceVector.add(p5.Vector.fromAngle(avoidanceAngle).mult(avoidanceStrength));
      }
    }

    // Calculate goal vector
    let goalVector = p.createVector(target.x - this.x, target.y - this.y);
    goalVector.normalize();

    // Combine avoidance and goal vectors
    let combinedVector = p5.Vector.add(goalVector.mult(1.2), avoidanceVector.mult(2.5));
    combinedVector.normalize();

    // Smoothly adjust the angle
    let desiredAngle = combinedVector.heading();
    let angleDifference = this.normalizeAngle(desiredAngle - this.angle);
    angleDifference = p.constrain(angleDifference, -this.maxAngularVelocity, this.maxAngularVelocity);
    this.angle += angleDifference;

    // Move forward if safe
    const minSensorReading = Math.min(...sensorReadings);
    if (minSensorReading > this.dangerZone / 3) {
      this.x += p.cos(this.angle) * this.speed;
      this.y += p.sin(this.angle) * this.speed;
    }

    // Keep the rover within canvas boundaries
    this.x = p.constrain(this.x, this.size, p.width - this.size);
    this.y = p.constrain(this.y, this.size, p.height - this.size);
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
    const distance = p.dist(this.x, this.y, target.x, target.y);
    // Make the threshold for reaching waypoint B a bit larger and more forgiving
    const threshold = this.size * 0.75;
    return distance < threshold;
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

export default memo(RoverSimulation);