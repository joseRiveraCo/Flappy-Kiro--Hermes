# Requirements Document

## Introduction

Flappy Kiro is a retro browser-based endless side-scroller game inspired by Flappy Bird. The player guides a Hermes character through gaps between green pipes while collecting coins and tracking distance traveled. The game features a hand-drawn/sketchy visual style with parallax cloud effects, sprite-based character animations, and local high score persistence. It is designed as a lightweight AWS workshop/demo project using vanilla HTML5 Canvas and JavaScript with no heavy frameworks.

## Glossary

- **Game_Engine**: The core game loop and rendering system built on HTML5 Canvas
- **Player_Character**: The Hermes sprite that the player controls, rendered using three animation states (idle, jump, fall)
- **Pipe_Generator**: The subsystem responsible for spawning and positioning pipe obstacles at regular intervals
- **Coin_System**: The subsystem that spawns, positions, and manages collectible coin items
- **Collision_Detector**: The subsystem that checks for intersections between the Player_Character and obstacles or collectibles
- **Score_Manager**: The subsystem that tracks current score, distance traveled, and persists high scores
- **Parallax_Layer**: A visual layer of semi-transparent clouds moving at varying speeds to create depth
- **Game_Over_Screen**: The overlay displayed when the player collides with an obstacle or the floor
- **Canvas**: The HTML5 Canvas element used for all game rendering
- **localStorage**: The browser Web Storage API used for persisting high score data locally

## Requirements

### Requirement 1: Game Initialization and Rendering

**User Story:** As a player, I want the game to load quickly in my browser and display a retro-styled game world, so that I can start playing immediately.

#### Acceptance Criteria

1. WHEN the page loads, THE Game_Engine SHALL initialize an HTML5 Canvas element and render a light blue sky background
2. WHEN the game starts, THE Game_Engine SHALL run a continuous game loop at a consistent frame rate using requestAnimationFrame
3. THE Game_Engine SHALL render all game elements (Player_Character, pipes, coins, clouds, score) on the Canvas each frame
4. THE Game_Engine SHALL apply a retro hand-drawn visual style with green-colored pipes and a light blue background

### Requirement 2: Player Character Control and Animation

**User Story:** As a player, I want to control the Hermes character with simple input, so that I can navigate through obstacles.

#### Acceptance Criteria

1. WHEN the player presses the spacebar or taps the screen, THE Player_Character SHALL apply an upward velocity (flap/jump)
2. WHILE no input is received, THE Player_Character SHALL accelerate downward due to gravity
3. WHILE the Player_Character vertical velocity is near zero or slightly negative, THE Game_Engine SHALL render the hermes_idle.png sprite
4. WHEN the Player_Character is moving upward after a flap, THE Game_Engine SHALL render the hermes_jump.png sprite
5. WHILE the Player_Character is falling at high velocity, THE Game_Engine SHALL render the hermes_fall.png sprite
6. WHEN the player flaps, THE Game_Engine SHALL play the jump.wav sound effect

### Requirement 3: Pipe Obstacle Generation

**User Story:** As a player, I want pipes to appear at regular intervals with gaps, so that I have obstacles to navigate through.

#### Acceptance Criteria

1. THE Pipe_Generator SHALL spawn pairs of vertical green pipes (top and bottom) at regular horizontal intervals
2. THE Pipe_Generator SHALL randomize the vertical position of the gap between each pipe pair within playable bounds
3. THE Pipe_Generator SHALL maintain a consistent gap size between top and bottom pipes that allows the Player_Character to pass through
4. WHILE the game is active, THE Pipe_Generator SHALL scroll pipes from right to left at a constant speed
5. WHEN a pipe pair scrolls completely off the left edge of the Canvas, THE Pipe_Generator SHALL remove the pipe pair from memory

### Requirement 4: Collectible Coins

**User Story:** As a player, I want to collect coins during gameplay, so that I can increase my score and have additional goals beyond survival.

#### Acceptance Criteria

1. THE Coin_System SHALL spawn coins between pipe pairs or along safe flight paths
2. WHEN the Player_Character overlaps a coin, THE Coin_System SHALL remove the coin from the game world and increment the score by 1
3. WHEN a coin is collected, THE Game_Engine SHALL play a collection animation (brief visual feedback)
4. WHILE the Player_Character has not touched a coin, THE Coin_System SHALL keep the coin visible and in position
5. THE Coin_System SHALL scroll coins from right to left at the same speed as pipes

### Requirement 5: Collision Detection

**User Story:** As a player, I want fair and responsive collision detection, so that the game feels predictable and enjoyable.

#### Acceptance Criteria

1. WHEN the Player_Character intersects with a pipe, THE Collision_Detector SHALL trigger a game over event
2. WHEN the Player_Character touches the floor (bottom of the Canvas), THE Collision_Detector SHALL trigger a game over event
3. WHEN the Player_Character moves above the top of the Canvas, THE Collision_Detector SHALL constrain the Player_Character position to the top boundary
4. THE Collision_Detector SHALL use hitbox-based detection with a slightly reduced bounding box to ensure collisions feel fair to the player
5. WHEN a collision is detected with an obstacle, THE Game_Engine SHALL display a brief hit animation or visual effect before transitioning to the Game_Over_Screen

### Requirement 6: Score System and Display

**User Story:** As a player, I want to see my current score, distance, and best score, so that I can track my progress and compete with myself.

#### Acceptance Criteria

1. THE Score_Manager SHALL display the current coin count on the game screen during gameplay
2. THE Score_Manager SHALL track and display the distance traveled in meters during gameplay
3. WHEN a game over event occurs, THE Score_Manager SHALL compare the current session score to the stored high score
4. IF the current score exceeds the stored high score, THEN THE Score_Manager SHALL update the high score in localStorage
5. THE Score_Manager SHALL persist the best score using the browser localStorage API so it survives page reloads
6. WHEN the Game_Over_Screen is displayed, THE Score_Manager SHALL show the final coin count, distance traveled, and best score

### Requirement 7: Game Over and Restart

**User Story:** As a player, I want a clear game over screen with my results and the ability to restart, so that I can try again quickly.

#### Acceptance Criteria

1. WHEN a game over event occurs, THE Game_Engine SHALL stop all gameplay movement and input processing
2. WHEN a game over event occurs, THE Game_Engine SHALL play the game_over.wav sound effect
3. WHEN the Game_Over_Screen is displayed, THE Game_Engine SHALL show a restart option (button or key prompt)
4. WHEN the player activates the restart option, THE Game_Engine SHALL reset all game state and begin a new game session
5. THE Game_Over_Screen SHALL display the final score, distance traveled, and high score

### Requirement 8: Parallax Background Effects

**User Story:** As a player, I want a visually appealing background with depth, so that the game feels immersive and polished.

#### Acceptance Criteria

1. THE Parallax_Layer SHALL render semi-transparent cloud sprites at multiple depth levels
2. THE Parallax_Layer SHALL scroll clouds at different speeds based on their depth level (farther clouds move slower)
3. WHILE the game is active, THE Parallax_Layer SHALL continuously loop clouds so the background never appears empty
4. THE Parallax_Layer SHALL render behind all gameplay elements (pipes, coins, Player_Character)

### Requirement 9: Technical Constraints

**User Story:** As a developer running an AWS workshop, I want the game to be lightweight and easy to understand, so that participants can learn from the code.

#### Acceptance Criteria

1. THE Game_Engine SHALL be implemented using vanilla HTML5, CSS, and JavaScript without heavy frameworks or build tools
2. THE Game_Engine SHALL load all sprite assets from the kiro-introduction-starter-kit/assets/ directory
3. THE Game_Engine SHALL run in modern browsers (Chrome, Firefox, Safari, Edge) without plugins or extensions
4. THE Game_Engine SHALL maintain a target frame rate of 60 frames per second during normal gameplay on standard hardware
5. THE Game_Engine SHALL use sprite batching to minimize draw calls and render all same-type sprites in grouped sequences per frame
6. THE Pipe_Generator SHALL use an object pool to recycle pipe instances instead of creating and destroying objects each frame
7. THE Coin_System SHALL use an object pool to recycle coin instances instead of creating and destroying objects each frame
