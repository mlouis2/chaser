# "SKELETON ATTACK!" by Maddie Louis

https://mlouis2.github.io/chaser/
https://codepen.io/mlouis2/pen/yPRJRG

The purpose of the game is to avoid skeleton enemies that chase you around the screen. They get faster and more powerful over time, and health and star power-ups will appear to assist you. The score is based off of time, so the mission is to stay alive as long as possible.

GAME COMPONENTS
  - Player sprite (controlled by mouse movement)
  - Enemy skeleton sprites (follow the player at randomly generated speeds)
  - Health
    - Health bar (starts at 100% and decreases on collision of player and skeleton enemy)
    - Health Power-Ups (hearts that appear every 5 seconds)
  - Star Power-Ups (stars that appear every 10 seconds)
  - Score (based off of the time spent alive)
    - Current score
    - High score

GAME CONTROLS
  - Mouse movement controls Player sprite's movement
  - Mouse click:
    - Pauses game, brings up information screen
    - Resumes game if paused, continues drawing frames
    - Restarts game if the game was over (health bar at 0)
