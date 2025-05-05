# Meteor Evader

## 🚀 Game Overview
Meteor Evader is an exciting arcade-style space game where you control a space character trying to avoid various meteors and asteroids. Your goal is to survive long enough to reach 60 points and be rescued! The game features multiple types of obstacles and power-ups to help you along the way.


## 🎮 Controls
- **W** - Move Up
- **A** - Move Left
- **S** - Move Down
- **D** - Move Right
- **X** - Activate Shield Power-up (when available)
- **C** - Activate Horizontal Blast Power-up (when available)
- **Mouse** - Click on buttons for pause/play, retry, and quit

## 🕹️ Gameplay Elements

### Asteroids Types
1. **Vertical Falling Asteroids** - These meteors fall from the top of the screen at different angles
2. **Horizontal Asteroids** - These appear from the sides of the screen and move horizontally
3. **Split Asteroids** - Sometimes asteroids will split into two smaller pieces that target your character

### Power-ups

#### 🛡️ Shield Power (Key: X)
- Activates a protective shield around your character for 3 seconds
- Prevents all damage from asteroids while active
- Recharges automatically after 8-12 seconds
- Indicated by a purple lightning bolt icon at the top of the screen when ready

#### 🔫 Horizontal Blast (Key: C)
- Fires a horizontal laser beam that destroys all asteroids at your current height
- Very effective against horizontal asteroids
- Recharges automatically after 7-8 seconds
- Indicated by a yellow icon at the top of the screen when ready

#### ❤️ Health Power-up
- Appears randomly as a flashing colored circle
- Collect to gain an extra life (maximum of 3 lives)
- Spawns more frequently when you have fewer lives
- Will only appear when you have less than 3 lives

## 📊 Game Stats
- **Lives** - You start with 3 lives, shown at the top of the screen
- **Score** - Increases as you avoid or destroy asteroids
- **Rescue Goal** - Reach 60 points to win the game and be rescued!

## 💡 Tips & Strategies
- Use the shield when surrounded by multiple asteroids
- The horizontal blast is most effective when there are many asteroids in a horizontal line
- Split asteroids will bounce once off walls before targeting you directly
- The game gets progressively harder as your score increases:
  - Asteroid speed increases at 25 and 45 points
  - More types of asteroids appear as you progress

## ⚙️ Game Controls Summary
| Key | Action |
|-----|--------|
| W | Move Up |
| A | Move Left |
| S | Move Down |
| D | Move Right |
| X | Activate Shield |
| C | Activate Horizontal Blast |


## 🎮 Game States
- **Normal Play** - Dodge asteroids and collect power-ups
- **Paused** - Game is paused (click play button to resume)
- **Game Over** - Displayed when you lose all lives
- **Victory** - Achieved when you reach 60 points

## 🌟 Features
- Dynamic asteroid generation with unique rotation patterns
- Multiple power-up systems
- Starfield background animation
- Increasing difficulty based on score
- Detailed sprite rendering using Mid-Point Circle and Line Algorithms

---

Enjoy the game and good luck surviving the meteor shower!
