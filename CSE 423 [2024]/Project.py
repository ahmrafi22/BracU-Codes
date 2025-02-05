from OpenGL.GL import *
from OpenGL.GLUT import *
from OpenGL.GLU import *
import random
import math

asteroid_rotations = {}  # rotation angles for each asteroid
asteroid_speeds = {} # speed for each asteroid

W_Width=1000
W_Height =800
ref_width=500  #player pos
ref_height=200 #player pos

stop=False
quit=False
retry=False
loser=False

obstacles = []
max_met=3
spawn_x=random.randint(5,900)
spawn_y=570
speed=8  # angled vertical astroid speed
player_radius = 25
lives=3
score=0
smaller_circle = player_radius * 0.5
player_box_size = player_radius *1.5

split_asteroids = []  #split asteroids
split_speed = 20  # split asteroids speed
last_split_time = 0  # Track when the last split occurred
split_delay = random.uniform(5000, 7000)  # Initial delay in milliseconds

horizontal_asteroids = []  # List to store asteroids moving horizontally
last_horizontal_spawn = 0  # last time a horizontal asteroid was spawned
horizontal_spawn_delay = random.uniform(3000, 5000)  # horizontal spawn delay ...
asteroid_shapes = {}  # asteroid shapes for reuse

power = 1
power_active = False #shield
power_timer = 0
power_duration = 3000  
power_ready = False
last_power_time = 0
power_delay = random.uniform(4000, 8000)
power_down = False

horizontal_blast_power = 0 
horizontal_blast_active = False #lazer
horizontal_blast_timer = 0
horizontal_blast_duration = 1000
horizontal_blast_ready = False
last_horizontal_blast_time = 0
horizontal_blast_delay = random.uniform(7000, 8000)

powerup_x = -50  
powerup_y = -50
powerup_radius = 10 # health powerup radius
powerup_active = False
last_powerup_time = 0
powerup_spawn_delay = 0 #delay after heath losing
color_index = 0 
last_color_change = 0

laser_active = False # horizontal blast power lazer
laser_start_time = 0
laser_duration = 500

stars_layer = []  #stars array
NUM_STARS_LAYER = 25
STAR_SPEED = 4



#------------MID POINT CIRCLE ALGORITHM----------------
def cir_point(x, y, cx, cy):
    glBegin(GL_POINTS)
    glVertex2f(x + cx, y + cy)
    glVertex2f(y + cx, x + cy)

    glVertex2f(y + cx, -x + cy)
    glVertex2f(x + cx, -y + cy)

    glVertex2f(-x + cx, -y + cy)
    glVertex2f(-y + cx, -x + cy)

    glVertex2f(-y + cx, x + cy)
    glVertex2f(-x + cx, y + cy)
    glEnd()

def MPCA(cx, cy, radius):
    d = 1 - radius
    x = 0
    y = radius
    cir_point(x, y, cx, cy)
    while x < y:
        if d < 0:
            d = d + 2 * x + 3
        else:
            d = d + 2 * x - 2 * y + 5
            y = y - 1
        x = x + 1
        cir_point(x, y, cx, cy)

#-------------------MID POINT LINE ALGORITHM-------------------

def Z(x1,y1,x2,y2):
   dx = x2 - x1
   dy = y2 - y1
   if abs(dx) > abs(dy):
       if dx>=0 and dy>=0: 
           return 0
       elif dx>=0 and dy<=0: 
           return 7
       elif dx<=0 and dy>=0: 
           return 3
       elif dx<=0 and dy<=0: 
           return 4
   else :
       if dx>=0 and dy>=0: 
           return 1
       elif dx<=0 and dy>=0: 
           return 2
       elif dx<=0 and dy<=0: 
           return 5
       elif dx>=0 and dy<=0: 
           return 6
def Z_0(z, x, y):
   if z == 0: 
       return (x,y)
   elif z == 1: 
       return (y,x)
   elif z == 2: 
       return (y,-x)
   elif z == 3: 
       return (-x,y)
   elif z == 4: 
       return (-x,-y)
   elif z == 5: 
       return (-y,-x)
   elif z == 6: 
       return (-y,x)
   elif z == 7: 
       return (x,-y)
def Z_M(z, x, y):
   if z == 0: 
       return (x,y)
   elif z == 1: 
       return (y,x)
   elif z == 2: 
       return (-y,x)
   elif z == 3: 
       return (-x,y)
   elif z == 4: 
       return (-x,-y)
   elif z == 5: 
       return (-y,-x)
   elif z == 6: 
       return (y,-x)
   elif z == 7: 
       return (x,-y)


def draw_points(x, y, color = (0, 0, 0), size=2):
   glColor3fv(color)
   glPointSize(size)
   glBegin(GL_POINTS)
   glVertex2f(x,y)
   glEnd()

def MPLA(x1, y1, x2, y2, color):
   z = Z(x1,y1,x2,y2)
   x1,y1 = Z_0(z, x1, y1)
   x2,y2 = Z_0(z, x2, y2)
   dx = x2 - x1
   dy = y2 - y1
   d = 2*dy - dx
   incE = 2*dy
   incNE = 2*(dy - dx)
   x = x1
   y = y1
   x0, y0 = Z_M(z, x, y)
   draw_points(x0, y0, color)
   while x < x2:
       if d <= 0:
           d = d + incE
           x = x + 1
       else:
           d = d + incNE
           x = x + 1
           y = y + 1
       x0, y0 = Z_M(z, x, y)
       draw_points(x0, y0, color)

#--------------Draw buttons----------------
def pause(x, y, color = (1,1,0)):
   MPLA(x + 10, y + 20, x + 10, y - 20, color)
   MPLA(x - 10, y + 20, x - 10, y - 20, color)

def play(x, y, color = (1,1,0)):
   MPLA(x - 10, y + 20, x - 10, y - 20, color)
   MPLA(x - 10, y + 20, x + 10, y, color)
   MPLA(x - 10, y - 20, x + 10, y, color)

def again(x, y, color = (0,0,1)):
   MPLA(x, y, x + 20, y - 20, color)
   MPLA(x, y, x + 20, y + 20, color)
   MPLA(x, y, x + 40, y, color)

def close(x, y, color = (1,0,0)):
   MPLA(x - 20 , y + 20 , x + 20, y - 20 , color)
   MPLA(x - 20 , y - 20 , x + 20, y + 20, color)


#--------draw lives indicator---------
def draw_lives():
    global lives
    glLineWidth(3)  
    
    for i in range(lives):
        x = 20 + i * 30
        y = W_Height - 120
        
        # Color based on remaining lives
        if lives == 3:
            color = (0.0, 1.0, 0.0)  # Green
        elif lives == 2:
            color = (1.0, 1.0, 0.0)  # Yellow
        else:
            color = (1.0, 0.0, 0.0)  # Red
            
        MPLA(x, y, x + 20, y - 20, color)
    
    glLineWidth(1.0)  


#-------------------Stars in the backgroud-------------------
def init_stars():
    global  stars_layer
    

    
    # Initialize  stars
    for _ in range(NUM_STARS_LAYER):
        x = random.randint(0, W_Width)
        y = random.randint(0, W_Height)
        stars_layer.append([x, y])


# Update stars function
def update_stars():
    global stars_layer1, stars_layer
    
    
    # Update  stars going down
    for star in stars_layer:
        star[1] -= STAR_SPEED
        if star[1] < 0:
            star[1] = W_Height
            star[0] = random.randint(0, W_Width)

# Draw stars function
def draw_stars():
    
    glPointSize(1.5)
    glColor3f(0.8, 0.8, 0.8)  
    glBegin(GL_POINTS)
    for star in stars_layer:
        glVertex2f(star[0], star[1])
    glEnd()


#-------Draw Main Player----------------

def player():
    global ref_width, ref_height, player_radius
    
    # Define colors
    red = (1.0, 0.0, 0.0)
    blue = (0.3, 0.5, 1.0)
    black = (0.0, 0.0, 0.0)
    
    # Scale  character
    scale = player_radius / 25
    
    # Main body outline (black)
    for x in range(-12, 13):
        for y in range(-20, 21):
            # Body shape
            if ((x/12)**2 + (y/20)**2 <= 1 and 
                not (x > 5 and y > 10)):  
                draw_points(ref_width + x*scale, ref_height + y*scale, black, 2)
    
    # Main body fill (red) f
    for x in range(-11, 12):
        for y in range(-19, 20):
            # Body shape
            if ((x/11)**2 + (y/19)**2 <= 1 and 
                not (x > 4 and y > 9)):  
                draw_points(ref_width + x*scale, ref_height + y*scale, red, 2)
    
    # Visor (black outline)
    for x in range(2, 13):
        for y in range(5, 16):
            if ((x-7)**2/25 + (y-10)**2/16 <= 1):
                draw_points(ref_width + x*scale, ref_height + y*scale, black, 2)
    
    # Visor (blue fill)
    for x in range(3, 12):
        for y in range(6, 15):
            if ((x-7)**2/20 + (y-10)**2/14 <= 1):
                draw_points(ref_width + x*scale, ref_height + y*scale, blue, 2)

    # Backpack (black outline)
    for x in range(-14, -9):
        for y in range(-10, 11):
            if ((x+11)**2/6 + (y/10)**2 <= 1):
                draw_points(ref_width + x*scale, ref_height + y*scale, black, 2)

    # Backpack (red fill)
    for x in range(-13, -10):
        for y in range(-9, 10):
            if ((x+11)**2/5 + (y/9)**2 <= 1):
                draw_points(ref_width + x*scale, ref_height + y*scale, red, 2)

    # Legs
    for x in range(-8, -1):  # Left leg
        for y in range(-24, -16):
            draw_points(ref_width + x*scale, ref_height + y*scale, black, 2)
            if (x > -7 and y > -23):
                draw_points(ref_width + x*scale, ref_height + y*scale, red, 2)
                
    for x in range(1, 8):  # Right leg
        for y in range(-24, -16):
            draw_points(ref_width + x*scale, ref_height + y*scale, black, 2)
            if (x < 7 and y > -23):
                draw_points(ref_width + x*scale, ref_height + y*scale, red, 2)



#-------------------Draw Asteroids-------------------

def draw___asteroidss():
    global score,angle,speed

    if score >=25:
        speed=12
                      # increasing speeds of angled vertical  as per points
    if score >=45:
        speed=13

    # Only draw obstacles if score is less than 60
    if score < 60:
        # Draw vertical falling asteroids
        for x, y, radius, asteroid_id,angle in obstacles:
            draw_asteroid(x, y, radius, asteroid_id)
        
        # Draw horizontal asteroids
        for asteroid in horizontal_asteroids:
            draw_asteroid(asteroid['x'], asteroid['y'], asteroid['radius'], asteroid['id'])
        
        # Draw split asteroids
        for asteroid in split_asteroids:
            draw_asteroid(asteroid['x'], asteroid['y'], asteroid['radius'], asteroid['id'])

def draw_asteroid_line(x1, y1, x2, y2, color=(0.6, 0.6, 0.6)):
    MPLA(int(x1), int(y1), int(x2), int(y2), color)


def create_asteroid_shape(num_vertices):
    angles = []
    radii = []
    for i in range(num_vertices):
        angle = (i * 2 * math.pi / num_vertices) + random.uniform(-0.2, 0.2)
        radius = random.uniform(0.7, 1.3)
        angles.append(angle)
        radii.append(radius)
    return angles, radii

def draw_asteroid(center_x, center_y, size, asteroid_id):
    if asteroid_id not in asteroid_rotations:
        asteroid_rotations[asteroid_id] = 0
        asteroid_speeds[asteroid_id] = random.uniform(0.1, 0.5)
        num_vertices = random.randint(5, 8)
        asteroid_shapes[asteroid_id] = create_asteroid_shape(num_vertices)

    angles, radii = asteroid_shapes[asteroid_id]
    rotation = asteroid_rotations[asteroid_id]
    
    # Colors for different layers of lines
    outer_color = (0.7, 0.7, 0.7)  # Light gray
    inner_color = (0.5, 0.5, 0.5)  # Medium gray
    fill_color = (0.3, 0.3, 0.3)   # Dark gray
    
    # Calculate rotated points
    points = []
    for i in range(len(angles)):
        angle = angles[i] + math.radians(rotation)
        x = center_x + size * radii[i] * math.cos(angle)
        y = center_y + size * radii[i] * math.sin(angle)
        points.append((x, y))
    
    # Draw outer shape
    for i in range(len(points)):
        x1, y1 = points[i]
        x2, y2 = points[(i + 1) % len(points)]
        draw_asteroid_line(x1, y1, x2, y2, outer_color)
    
    # Draw cross-hatching lines inside
    num_fill_lines = 4
    for i in range(0, len(points), 2):
        x1, y1 = points[i]
        opposite_idx = (i + len(points)//2) % len(points)
        x2, y2 = points[opposite_idx]
        draw_asteroid_line(x1, y1, x2, y2, fill_color)
        
        # some perpendicular lines
        if i < num_fill_lines:
            idx1 = (i + len(points)//4) % len(points)
            idx2 = (i + 3*len(points)//4) % len(points)
            x3, y3 = points[idx1]
            x4, y4 = points[idx2]
            draw_asteroid_line(x3, y3, x4, y4, inner_color)
    
    # Update rotation for next frame
    asteroid_rotations[asteroid_id] = (rotation + asteroid_speeds[asteroid_id]) % 360



def genrate_asteroids ():
    global obstacles, spawn_x, spawn_y, new_radius, asteroid_shapes
    
    # origins upper 30% of the screen height
    upper_bound = W_Height
    lower_bound = W_Height * 0.7
    
    spawn_x = random.randint(50, W_Width - 50)
    spawn_y = random.randint(int(lower_bound), upper_bound)
    new_radius = random.randint(20, 40)
    
    # unique random angle  asteroid between 65-120 degrees
    unique_angle = random.uniform(65, 120)
    
    # Check for overlap 
    overlap = False
    for x, y, radius, asteroid_id, angle in obstacles:
        distance = ((x - spawn_x) ** 2 + (y - spawn_y) ** 2) ** 0.5
        if distance < (radius + new_radius) * 1.2:
            overlap = True
            break
    
    if not overlap and len(obstacles) < max_met:
        # unique ID for the new asteroid
        asteroid_id = len(asteroid_shapes)
        num_vertices = random.randint(8, 10)
        asteroid_shapes[asteroid_id] = create_asteroid_shape(num_vertices)
        asteroid_rotations[asteroid_id] = 0
        asteroid_speeds[asteroid_id] = random.uniform(0.1, 0.5)
        # unique angle to the obstacle data
        obstacles.append((spawn_x, spawn_y, new_radius, asteroid_id, unique_angle))

def check_and_split_asteroid():
    global obstacles, split_asteroids, ref_width, ref_height, last_split_time, split_delay
    current_time = glutGet(GLUT_ELAPSED_TIME)
    
    # if enough time has passed since last split
    if current_time - last_split_time >= split_delay and len(obstacles) > 0:
        # Find eligible asteroids 
        eligible_asteroids = [(i, asteroid) for i, asteroid in enumerate(obstacles) 
                            if asteroid[2] >= 25]  # index and asteroid tuple where radius >= 25
        
        if eligible_asteroids:
            # Randomly select one asteroid to split
            idx, (x, y, radius, asteroid_id,angle) = random.choice(eligible_asteroids)
            
            # Remove to split 
            obstacles.pop(idx)
            
            # new radius  (70% of original)
            new_radius = int(radius * 0.7)
            
            # target direction 
            dx = ref_width - x
            dy = ref_height - y
            angle = math.atan2(dy, dx)
            
            #  two split asteroids with different angles
            split_angle_1 = angle - math.pi/6  # 30 degrees left
            split_angle_2 = angle + math.pi/6  # 30 degrees right
            
            #  unique IDs for new asteroids
            new_id_1 = len(asteroid_shapes)
            new_id_2 = len(asteroid_shapes) + 1
            
            #  new asteroid shapes
            asteroid_shapes[new_id_1] = create_asteroid_shape(random.randint(6, 8))
            asteroid_shapes[new_id_2] = create_asteroid_shape(random.randint(6, 8))
            
            # rotation and speed for new asteroids
            for new_id in [new_id_1, new_id_2]:
                asteroid_rotations[new_id] = 0
                asteroid_speeds[new_id] = random.uniform(0.5, 1.0)
            
            # split asteroids with their target angles
            split_asteroids.extend([
                {
                    'x': x,
                    'y': y,
                    'radius': new_radius,
                    'angle': split_angle_1,
                    'id': new_id_1
                },
                {
                    'x': x,
                    'y': y,
                    'radius': new_radius,
                    'angle': split_angle_2,
                    'id': new_id_2
                }
            ])
            
            # Update last split time and generate new delay
            last_split_time = current_time
            split_delay = random.uniform(5000, 7000)  # New random delay between 5-7 seconds

def update_split_asteroids():
    global split_asteroids, split_speed, score, stop, ref_width, ref_height
    
    asteroids_to_remove = []
    for asteroid in split_asteroids:
        if 'has_bounced' not in asteroid:
            asteroid['has_bounced'] = False
            asteroid['targeting_player'] = False
        
        if not asteroid['has_bounced']:
            # Move in initial split direction before bounce
            asteroid['x'] += math.cos(asteroid['angle']) * split_speed
            asteroid['y'] += math.sin(asteroid['angle']) * split_speed
            
            # Check for border collision
            bounced = False
            if asteroid['x'] - asteroid['radius'] <= 0:  # Left border
                asteroid['angle'] = math.pi - asteroid['angle']
                asteroid['x'] = asteroid['radius']
                bounced = True
            elif asteroid['x'] + asteroid['radius'] >= W_Width:  # Right border
                asteroid['angle'] = math.pi - asteroid['angle']
                asteroid['x'] = W_Width - asteroid['radius']
                bounced = True
            elif asteroid['y'] - asteroid['radius'] <= 0:  # Bottom border
                asteroid['angle'] = -asteroid['angle']
                asteroid['y'] = asteroid['radius']
                bounced = True
            elif asteroid['y'] + asteroid['radius'] >= W_Height:  # Top border
                asteroid['angle'] = -asteroid['angle']
                asteroid['y'] = W_Height - asteroid['radius']
                bounced = True
                
            if bounced:
                asteroid['has_bounced'] = True
                # Calculate new angle to target player
                dx = ref_width - asteroid['x']
                dy = ref_height - asteroid['y']
                asteroid['target_angle'] = math.atan2(dy, dx)
        else:
            # After bounce, move towards player
            if not asteroid['targeting_player']:
                #  transition to target angle
                angle_diff = (asteroid['target_angle'] - asteroid['angle'] + math.pi) % (2 * math.pi) - math.pi
                asteroid['angle'] += angle_diff * 0.1  # turning
                if abs(angle_diff) < 0.1:
                    asteroid['targeting_player'] = True
            
            # Move in current direction
            asteroid['x'] += math.cos(asteroid['angle']) * split_speed
            asteroid['y'] += math.sin(asteroid['angle']) * split_speed
        
        # Remove asteroids that go off screen
        if (asteroid['x'] < -50 or 
            asteroid['x'] > W_Width + 50 or 
            asteroid['y'] < -50 or 
            asteroid['y'] > W_Height + 50):
            if asteroid['has_bounced']:  # Only score if asteroid has completed its bounce
                score += 1
                print(f"Score: {score}")
                if score >= 60:
                    print("You have been rescued! Go back to spaceship!")
                    stop = True
            asteroids_to_remove.append(asteroid)
    
    # Remove off-screen asteroids
    for asteroid in asteroids_to_remove:
        split_asteroids.remove(asteroid)


def droping_asteroids():
    global power_down, obstacles, stop, ref_height, ref_width, lives, loser, speed, score
    global horizontal_asteroids, last_horizontal_spawn, horizontal_spawn_delay
    
    if loser:
        return
    
    current_time = glutGet(GLUT_ELAPSED_TIME)
    
    # Handle vertical falling asteroids with angled motion
    obstacles_to_remove = []
    new_obstacles = []
    for x, y, radius, asteroid_id, angle in obstacles:
        # Convert angle to radians and calculate new position
        angle_rad = math.radians(angle)
        new_x = x + math.cos(angle_rad) * speed
        new_y = y - math.sin(angle_rad) * speed
        
        if new_y - radius <= 0 or new_x < -radius or new_x > W_Width + radius:
            score += 1
            print(f"Score: {score}")
            if score >= 60:
                print("You have been rescued! Go back to spaceship!")
                stop = True
            obstacles_to_remove.append((x, y, radius, asteroid_id, angle))
        else:
            new_obstacles.append((new_x, new_y, radius, asteroid_id, angle))
    
    obstacles[:] = new_obstacles
    
    # Handle horizontal asteroids
    horizontal_asteroids_to_remove = []
    for asteroid in horizontal_asteroids:
        asteroid['x'] += asteroid['speed_x']
        
        if (asteroid['speed_x'] > 0 and asteroid['x'] - asteroid['radius'] > W_Width) or \
           (asteroid['speed_x'] < 0 and asteroid['x'] + asteroid['radius'] < 0):
            score += 3
            print(f"Score: {score}")
            if score >= 60:
                print("You have been rescued! Go back to spaceship!")
                stop = True
            horizontal_asteroids_to_remove.append(asteroid)
    
    for asteroid in horizontal_asteroids_to_remove:
        horizontal_asteroids.remove(asteroid)
    
    # Spawn new horizontal asteroids 
    if current_time - last_horizontal_spawn > horizontal_spawn_delay:
        if random.random() < 0.3:
            from_left = ref_width < W_Width / 2
            y_pos = ref_height + random.randint(-30, 30)
            radius = random.randint(20, 40)
            
            asteroid_id = len(asteroid_shapes)
            num_vertices = random.randint(6, 8)
            asteroid_shapes[asteroid_id] = create_asteroid_shape(num_vertices)
            asteroid_rotations[asteroid_id] = 0
            asteroid_speeds[asteroid_id] = random.uniform(0.5, 1.0)
            
            if from_left:
                x_pos = -radius
                speed_x = random.uniform(15, 13) #horizontal speed if coming from left 
            else:
                x_pos = W_Width + radius
                speed_x = random.uniform(-15, -13) #horizontal speed if coming from right
            
            horizontal_asteroids.append({
                'x': x_pos,
                'y': y_pos,
                'radius': radius,
                'speed_x': speed_x,
                'id': asteroid_id
            })
        
        last_horizontal_spawn = current_time
        horizontal_spawn_delay = random.uniform(1000, 2000)


#----------detect collision---------------

def detect_collision():
    global player_radius, ref_height, ref_width, obstacles, horizontal_asteroids, lives, loser, player_box_size, smaller_circle, power_active, angle
    global last_powerup_time, powerup_spawn_delay
    if loser:
        return
        
    collision_detected = False
    
    # Check collisions with vertical falling asteroids
    for x, y, radius, asteroid_id, angle in obstacles:
        distance = ((x - ref_width) ** 2 + (y - ref_height) ** 2) ** 0.5
        if distance <= player_radius + radius:
            collision_detected = True
            break

    # Check collisions with horizontal asteroids
    for asteroid in horizontal_asteroids:
        distance = ((asteroid['x'] - ref_width) ** 2 + (asteroid['y'] - ref_height) ** 2) ** 0.5
        if distance <= player_radius + asteroid['radius']:
            collision_detected = True
            break

    # Check collisions for smaller circles
    player_box = [
        (ref_width + player_box_size, ref_height),
        (ref_width - player_box_size, ref_height),
        (ref_width, ref_height + player_box_size),
        (ref_width, ref_height - player_box_size)
    ]
    
    for box_x, box_y in player_box:
        # Check vertical asteroids
        for i, (x, y, radius, asteroid_id,angle) in enumerate(obstacles):
            distance = ((x - box_x) ** 2 + (y - box_y) ** 2) ** 0.5
            if distance <= smaller_circle + radius:
                collision_detected = True
                obstacles.pop(i)
                break
                
        # Check horizontal asteroids
        for asteroid in horizontal_asteroids[:]:
            distance = ((asteroid['x'] - box_x) ** 2 + (asteroid['y'] - box_y) ** 2) ** 0.5
            if distance <= smaller_circle + asteroid['radius']:
                collision_detected = True
                horizontal_asteroids.remove(asteroid)
                break

        if collision_detected:
            break

    if collision_detected and not power_active:
        lives -= 1
        last_powerup_time = glutGet(GLUT_ELAPSED_TIME)
        powerup_spawn_delay = random.uniform(4000, 7000) 
        if lives == 2:
            print("!!!!!! 2 Lives left !!!!!!")
        elif lives == 1:
            print("!!!!!! 1 Life left !!!!!!")
        if lives <= 0:
            loser = True


def detect_split_asteroid_collision():
    global ref_width, ref_height, lives, loser, power_active
    
    if loser or power_active:
        return
        
    # Check collision with main character
    for asteroid in split_asteroids[:]:
        distance = ((asteroid['x'] - ref_width) ** 2 + 
                   (asteroid['y'] - ref_height) ** 2) ** 0.5
        
        if distance <= player_radius + asteroid['radius']:
            lives -= 1
            if lives == 2:
                print("!!!!!! 2 Lives left !!!!!!")
            elif lives == 1:
                print("!!!!!! 1 Life left !!!!!!")
            split_asteroids.remove(asteroid)
            if lives <= 0:
                loser = True
            break



#----------PowerUps 1 (Shield for 3 seconds)-------

#draw shield power icon on top
def drawpower(x, y, color=(1, 0, 1)):
    # Lightning bolt shape, shifted 100 pixels right
    points = [
        (x + 85, y + 30),      # Top left
        (x + 100, y + 10),     # Middle right
        (x + 90, y + 10),      # Middle left
        (x + 105, y - 10)      # Bottom right
    ]
    
    # Draw the lightning bolt
    MPLA(points[0][0], points[0][1], points[1][0], points[1][1], color)
    MPLA(points[1][0], points[1][1], points[2][0], points[2][1], color)
    MPLA(points[2][0], points[2][1], points[3][0], points[3][1], color)


#draw shiled around the player
def draw_power_shield():
    if power_active:
        radius = int(player_radius * 1.3)  # shield radius
        x_center = ref_width           # Center X
        y_center = ref_height          # Center Y
        
       
        glColor3f(0.0, 1.0, 0.0)  # Green
        
        # shield circle
        MPCA(x_center, y_center, radius)


def activate_power():
    global power, power_active, power_timer, power_ready, last_power_time, power_delay
    if power > 0:
        power -= 1
        power_active = True
        print("Power shield activated!")
        power_timer = glutGet(GLUT_ELAPSED_TIME)
        power_ready = False
        last_power_time = glutGet(GLUT_ELAPSED_TIME)
        power_delay = random.uniform(8000, 12000)  # delay for next power

def update_power_status():
    global power, power_ready, last_power_time, power_delay
    
    current_time = glutGet(GLUT_ELAPSED_TIME)
    
    # If  enough time has passed
    if not power_ready and current_time - last_power_time > power_delay:
        power = 1
        power_ready = True
        print("Power shield ready!")


#--------PowerUps 2 (Increase health point)-----------------

#draw circle of powerups
def draw_health_powerup():
    global color_index, last_color_change
    
   
    if stop or not powerup_active or lives >= 3:
        return
        
    current_time = glutGet(GLUT_ELAPSED_TIME)
    
    # Change color  500ms
    if current_time - last_color_change >= 500:
        color_index = (color_index + 1) % 3
        last_color_change = current_time
    
    # colors
    colors = [(1, 0, 0), (0, 1, 0), (0, 0, 1)]  # red, green, blue
    
    # powerup circle
    glColor3f(*colors[color_index])
    MPCA(int(powerup_x), int(powerup_y), powerup_radius)
    

#check time to spawn
def spawn_health_powerup():
    global powerup_x, powerup_y, powerup_active, last_powerup_time
    
    current_time = glutGet(GLUT_ELAPSED_TIME)
    

    if (not powerup_active and 
        lives < 3 and 
        current_time - last_powerup_time >= powerup_spawn_delay and 
        not stop):
        powerup_x = random.randint(powerup_radius + 20, W_Width - powerup_radius - 20)
        powerup_y = random.randint(powerup_radius + 20, W_Height - powerup_radius - 20)
        powerup_active = True
        print("Health powerup spawned!")

#if player has taken the powerup circle
def check_powerup_collision():
    global lives, powerup_active
    
    if not powerup_active or lives >= 3 or stop:
        return
        
    # Calculate distance between player and powerup
    distance = ((powerup_x - ref_width) ** 2 + (powerup_y - ref_height) ** 2) ** 0.5
    
    # If collision detected
    if distance <= player_radius + powerup_radius:
        lives += 1
        powerup_active = False
        print(f"Health increased! Lives: {lives}")


#-------------------PowerUps 3 (Horizontal blast to remove all horizontal asteroids)------------------------

#Draw lazer from player
def draw_horizontal_laser():
    global ref_width, ref_height, laser_active, laser_start_time
    
    if laser_active:
        current_time = glutGet(GLUT_ELAPSED_TIME)
        if current_time - laser_start_time <= laser_duration:
            # Draw red laser line
            glColor3f(1.0, 0.0, 0.0)  # Red color
            glLineWidth(3.0)  # Thicker line
            MPLA(0, ref_height, W_Width, ref_height, (1, 0, 0))
            glLineWidth(1.0)  # Reset line width
        else:
            laser_active = False

#Draw icon on top of the screen
def draw_horizontal_blast_power(x, y, color=(1, 1, 0)):  # Yellow color
    points = [
        (x + 165, y + 30),     # Top
        (x + 155, y + 10),     # Middle left
        (x + 175, y + 10),     # Middle right
        (x + 165, y - 10)      # Bottom
    ]
    
    # Draw the horizontal blast icon
    MPLA(points[0][0], points[0][1], points[1][0], points[1][1], color)
    MPLA(points[1][0], points[1][1], points[2][0], points[2][1], color)
    MPLA(points[2][0], points[2][1], points[3][0], points[3][1], color)

def activate_horizontal_blast():
    global horizontal_blast_power, horizontal_blast_active, horizontal_blast_timer
    global horizontal_blast_ready, last_horizontal_blast_time, horizontal_blast_delay
    
    if horizontal_blast_power > 0:
        horizontal_blast_power -= 1
        horizontal_blast_active = True
        print("Horizontal blast activated!")
        horizontal_blast_timer = glutGet(GLUT_ELAPSED_TIME)
        horizontal_blast_ready = False
        last_horizontal_blast_time = glutGet(GLUT_ELAPSED_TIME)
        horizontal_blast_delay = random.uniform(7000, 8000)
        remove_asteroids_at_y_level()

def update_horizontal_blast_status():
    global horizontal_blast_power, horizontal_blast_ready
    global last_horizontal_blast_time, horizontal_blast_delay, horizontal_blast_active
    
    current_time = glutGet(GLUT_ELAPSED_TIME)
    
    # horizontal blast timer
    if horizontal_blast_active:
        if current_time - horizontal_blast_timer >= horizontal_blast_duration:
            horizontal_blast_active = False
    
    # If power isn't ready and enough time has passed (7-8 seconds)
    if not horizontal_blast_ready and current_time - last_horizontal_blast_time > horizontal_blast_delay:
        horizontal_blast_power = 1
        horizontal_blast_ready = True
        print("Horizontal blast ready!")

def remove_asteroids_at_y_level():
    global obstacles, horizontal_asteroids, split_asteroids, ref_height, score
    global laser_active, laser_start_time
    
    # Activate laser animation
    laser_active = True
    laser_start_time = glutGet(GLUT_ELAPSED_TIME)
    
    # the blast zone (the y-range where asteroids will be destroyed)
    blast_zone_top = ref_height + player_radius + 4
    blast_zone_bottom = ref_height - player_radius - 4
    
    # Remove vertical falling asteroids in the blast zone
    new_obstacles = []
    for asteroid in obstacles:
        if blast_zone_bottom <= asteroid[1] <= blast_zone_top:
            score += 1
            print(f"Score increased: {score}")
        else:
            new_obstacles.append(asteroid)
    obstacles[:] = new_obstacles
    
    # Remove horizontal asteroids in the blast zone
    new_horizontal = []
    for asteroid in horizontal_asteroids:
        if blast_zone_bottom <= asteroid['y'] <= blast_zone_top:
            score += 1
            print(f"Score increased: {score}")
        else:
            new_horizontal.append(asteroid)
    horizontal_asteroids[:] = new_horizontal
    
    # Remove split asteroids in the blast zone
    new_split = []
    for asteroid in split_asteroids:
        if blast_zone_bottom <= asteroid['y'] <= blast_zone_top:
            score += 1
            print(f"Score increased: {score}")
        else:
            new_split.append(asteroid)
    split_asteroids[:] = new_split


#-------------------keyboard Mouse listener----------------------------
def keyboardListener(key, x, y):
    global ref_width, ref_height, stop, player_radius, power, horizontal_blast_power
    distance = 30
    
    if key == b'x' and power > 0 and not power_active: #powerUps 1 shield
        activate_power()
    elif key == b'c' and horizontal_blast_power > 0 and not horizontal_blast_active:   #powerUps 3 horizontal blast
        activate_horizontal_blast()
    elif key == b'd' and not stop:
        ref_width += distance 
        if ref_width >= W_Width-20:
            ref_width = W_Width
    elif key == b'a' and not stop:
        ref_width -= distance
        if ref_width <= 20:
            ref_width = 20
    elif key == b's' and not stop:
        ref_height -= distance
        if ref_height <= 55:
            ref_height = 55
    elif key == b'w' and not stop:
        ref_height += distance
        if ref_height >= W_Height-20:
            ref_height = W_Height
    
    glutPostRedisplay()


def mouseListener(button, state, x, y):
    global quit, retry, stop
    if button == GLUT_RIGHT_BUTTON or button == GLUT_DOWN:
        if state == GLUT_DOWN:
            y = W_Height - y
            if x >= 930 and x <= 970 and y >= W_Height - 70 and y <= W_Height - 30:
                quit = True
            elif x >= 20 and x <= 60 and y >= W_Height - 70 and y <= W_Height - 30:
                retry = True
            elif x >= 490 and x <= 510 and y > W_Height - 70 and y <= W_Width - 30:
                stop = not stop 
    glutPostRedisplay()


#-------------------------------Animate----------------------------------------

def animate():
    global quit, retry, stop, loser, score, lives, obstacles
    global player_radius, player_box_size, smaller_circle, ref_width, ref_height
    global horizontal_asteroids, split_asteroids, power_down
    global last_split_time, split_delay, horizontal_spawn_delay, last_horizontal_spawn
    
    if quit:
        glutLeaveMainLoop()
    if not stop:
        update_stars()
        update_power_status()
        draw___asteroidss()
        droping_asteroids()
        update_horizontal_blast_status()
        genrate_asteroids ()
        check_and_split_asteroid()
        update_split_asteroids()
        detect_collision()
        spawn_health_powerup()  
        check_powerup_collision()
        update_horizontal_blast_status()
        detect_split_asteroid_collision()
        if loser:
            if len(obstacles) > 0:
                obstacles.clear()
            if len(horizontal_asteroids) > 0:
                horizontal_asteroids.clear()
            if len(split_asteroids) > 0:
                split_asteroids.clear()
            if loser and not retry:
                print("Game over! Final score:", score)
                stop = True
    if retry:
        # Reset power-related variables
        global power_ready, last_power_time, horizontal_blast_power, horizontal_blast_ready, last_horizontal_blast_time, horizontal_blast_delay
        power_ready = False
        last_power_time = glutGet(GLUT_ELAPSED_TIME)
        horizontal_blast_power = 0
        horizontal_blast_ready = False
        last_horizontal_blast_time = glutGet(GLUT_ELAPSED_TIME)
        horizontal_blast_delay = random.uniform(7000, 8000)
        obstacles.clear()
        horizontal_asteroids.clear()
        last_horizontal_spawn = glutGet(GLUT_ELAPSED_TIME)
        horizontal_spawn_delay = random.uniform(1000, 3000)
        asteroid_rotations.clear()
        asteroid_speeds.clear()
        asteroid_shapes.clear()
        genrate_asteroids () 
        score = 0
        lives = 3
        loser = False
        retry = False 
        player_radius = 25
        smaller_circle = player_radius * 0.5
        player_box_size = player_radius * 1.5
        ref_width = 500
        ref_height = 200
        power_down = False
        stop = False

        last_split_time = glutGet(GLUT_ELAPSED_TIME)
        split_delay = random.uniform(5000, 7000)
        split_asteroids.clear()

#-----------------------Display Function-------------------------------------
def display():
    global stop, loser, power_active, power_timer, power_duration, power_ready
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
    draw_stars()
    draw_health_powerup()
    
    # Update power shield timer
    if power_active:
        current_time = glutGet(GLUT_ELAPSED_TIME)
        if current_time - power_timer >= power_duration:
            power_active = False
    
    if stop:
        pause(W_Width / 2, W_Height - 50)
    else:
        play(W_Width / 2, W_Height - 50) 
    again(W_Width-965, W_Height-50)
    close(W_Width - 50, W_Height - 50)
    
    draw_horizontal_laser()
    
    if power_ready:
        drawpower(50, W_Height - 50)
    
    player()
    if power_active:
        draw_power_shield()

    if horizontal_blast_ready:
        draw_horizontal_blast_power(50, W_Height - 50)
    draw___asteroidss()
    draw_lives()
    glutPostRedisplay()
    glutSwapBuffers()

#------------------------------------Initializtion-------------------------------------------
def init():
    global power_down
    glutInit()
    glutInitWindowSize(W_Width, W_Height)
    glutInitWindowPosition(0, 0)
    glutInitDisplayMode(GLUT_DEPTH | GLUT_DOUBLE | GLUT_RGB) 
    glutCreateWindow(b"Meteor evader")
    glClearColor(0.0, 0.0, 0.0, 1.0)
    glMatrixMode(GL_PROJECTION)
    glLoadIdentity()
    glOrtho(0, W_Width, 0, W_Height, -1, 1)
    glMatrixMode(GL_MODELVIEW)
    glutDisplayFunc(display)
    glutIdleFunc(animate)
    glutKeyboardFunc(keyboardListener)
    glutMouseFunc(mouseListener) 
    init_stars() 
init()
glutMainLoop()
