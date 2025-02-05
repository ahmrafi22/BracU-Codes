from OpenGL.GL import *
from OpenGL.GLUT import *
from OpenGL.GLU import *
import random
import math

W_Width, W_Height = 600, 800
rocket_x, rocket_y = W_Width//2, 50 

score = 0
missed_balls = 0
misfire_count = 0
game_over = False
is_paused = False
special_ball_chance = 0.3
radius_base = 25

# Create stars
stars = [(random.randint(0, W_Width), random.randint(0, W_Height)) for _ in range(50)]
zones = []


falling_balls = [{"x": random.randint(0, W_Width), 
                  "y": W_Height,
                  "special": random.random() < special_ball_chance,
                  "radius": radius_base} for _ in range(5)]

# shooting balls
shooting_balls = []

# Ball speed
falling_ball_speed = 1
shooting_ball_speed = 10





def findZone(x1, y1, x2, y2):
   dx = x2 - x1
   dy = y2 - y1
   zone = None
   if (abs(dx) >= abs(dy) and dx >= 0 and dy >= 0):
       zone = 0
   elif (abs(dy) > abs(dx) and dx >= 0 and dy >= 0):
       zone = 1
   elif (abs(dy) > abs(dx) and dx <= 0 and dy >= 0):
       zone = 2
   elif (abs(dy) <= abs(dx) and dx <= 0 and dy >= 0):
       zone = 3
   elif (abs(dx) <= abs(dy) and dx <= 0 and dy <= 0):
       zone = 4
   elif (abs(dy) > abs(dx) and dx <= 0 and dy <= 0):
       zone = 5
   elif (abs(dy) >= abs(dx) and dx >= 0 and dy <= 0):
       zone = 6
   elif (abs(dx) >= abs(dy) and dx >= 0 and dy <= 0):
       zone = 7
   return zone

def OriginalZone(x, y, zone):
    if zone == 0:
        return x, y
    elif zone == 1:
        return y, x
    elif zone == 2:
        return -y, x
    elif zone == 3:
        return -x, y
    elif zone == 4:
        return -x, -y
    elif zone == 5:
        return -y, -x
    elif zone == 6:
        return y, -x
    elif zone == 7:
        return x, -y
    
def zoneChangeToZero(x, y, zone):
    if zone == 0:
        return x, y
    elif zone == 1:
        return y, x
    elif zone == 2:
        return y, -x
    elif zone == 3:
        return -x, y
    elif zone == 4:
        return -x, -y
    elif zone == 5:
        return -y, -x
    elif zone == 6:
        return -y, x
    elif zone == 7:
        return x, -y


def convert_center(x,y,c):
    global W_Width, W_Height
    cx,cy = c[0], c[1]
    x = x + cx
    y = y + cy
    return x, y

def drawPoint(c):
    glBegin(GL_POINTS)
    for i in (zones):
        x, y = convert_center(i[0], i[1], c)
        glVertex2f(x, y)
    glEnd()

def convertToZones(x,y):
    global zones
    zones.append((x,y))
    zones.append((y,x))
    zones.append((y,-x))
    zones.append((x,-y))
    zones.append((-x,-y))
    zones.append((-y,-x))
    zones.append((-y,x))
    zones.append((-x,y))

def circleDraw(cx,cy,r):
    global zones
    x = 0
    y = r
    zones = []
    convertToZones(x, y)
    d = 1-r
    while x < y:
        dE = 2*x + 3
        dSE = 2*x - 2*y + 5
        if d < 0:
            d += dE
            x += 1
        else:
            d += dSE
            x += 1
            y -= 1
        convertToZones(x, y)
    drawPoint((cx,cy))


    
def drawLine(x1, y1, x2, y2, color):
    zone = findZone(x1, y1, x2, y2)
    glColor3f(color[0], color[1], color[2])
    glPointSize(2)
    glBegin(GL_POINTS)
    glVertex2f(x1, y1)
    x1, y1 = zoneChangeToZero(x1, y1, zone)
    x2, y2 = zoneChangeToZero(x2, y2, zone)
    dx = x2 - x1
    dy = y2 - y1
    d = 2 * dy - dx
    dE = 2 * dy
    dNE = 2 * (dy - dx)
    x, y = x1, y1
    while x < x2:
        if d <= 0:
            d += dE
            x += 1
        else:
            d += dNE
            x += 1
            y += 1
        xx , yy = OriginalZone(x, y, zone)
        glVertex2f(xx, yy)
    glEnd()


def drawRocket(x, y):
    rocket_color = (151/255, 10/255, 245/255)
    red = (224/255, 79/255, 93/255)

    points = [
        (x-15, y), (x+15, y),
        (x+15, y+40), (x-15, y+40),
        (x-15, y)
    ]
    for i in range(len(points)-1):
        drawLine(points[i][0], points[i][1], 
                points[i+1][0], points[i+1][1], 
                rocket_color)
    

    for y_fill in range(y, y+40):
        drawLine(x-14, y_fill, x+14, y_fill, rocket_color)
    

    drawLine(x-15, y+40, x, y+60, red)
    drawLine(x, y+60, x+15, y+40, red)
    
    # Fill 
    for i in range(20):
        progress = i / 20
        base_width = 30 * (1 - progress)
        y_pos = y+40 + i
        drawLine(x-base_width/2, y_pos, 
                x+base_width/2, y_pos, red)
    
    # Fins
    fin_points = [
        [(x-15, y), (x-25, y-15), (x-15, y+15), (x-15, y)],
        [(x+15, y), (x+25, y-15), (x+15, y+15), (x+15, y)]
    ]
    
    for fin in fin_points:
        for i in range(len(fin)-1):
            drawLine(fin[i][0], fin[i][1],
                    fin[i+1][0], fin[i+1][1],
                    rocket_color)
            

        if fin[0][0] < x:  # Left fin
            for x_fill in range(int(x-25), int(x-15)):
                y_start = y + (x_fill - (x-25)) * 2
                y_end = y + 15 - (x_fill - (x-25))
                drawLine(x_fill, y_start, x_fill, y_end, rocket_color)
        else:  
            for x_fill in range(int(x+15), int(x+25)):
                y_start = y + (x+25 - x_fill) * 2
                y_end = y + 15 - (x+25 - x_fill)
                drawLine(x_fill, y_start, x_fill, y_end, rocket_color)
    
    # Thruster fire
    fire_colors = [(1.0, 0.5, 0.0), (1.0, 0.0, 0.0), (1.0, 1.0, 0.0)]
    for i, color in enumerate(fire_colors):
        fire_width = 20 - i*4
        fire_height = 15 - i*3
        drawLine(x-fire_width/2, y, x, y-fire_height, color)
        drawLine(x, y-fire_height, x+fire_width/2, y, color)



def fallingBalls():
    global falling_balls, missed_balls, game_over, score
    
    if game_over:
        return
        
    for ball in falling_balls[:]:
        ball["y"] -= falling_ball_speed
        
        # Animate special balls' radius
        if ball.get("special"):
            ball["radius"] = radius_base + 5 * math.sin(ball["y"]/20)
            ball_color = (245/255, 7/255, 197/255)  
        else:
            ball_color = (245/255, 233/255, 7/255)  
            
        # Check collision with rocket
        if (abs(ball["x"] - rocket_x) < 20 and 
            abs(ball["y"] - rocket_y) < 40):
            game_over = True
            print(f"Game Over! Collision with circle\nFinal Score: {score}")
            return
            
        # Ball goes off screen
        if ball["y"] < 0:
            missed_balls += 1
            falling_balls.remove(ball)
            falling_balls.append({
                "x": random.randint(0, W_Width),
                "y": W_Height,
                "special": random.random() < special_ball_chance,
                "radius": radius_base
            })
            print(f"Missed ball! ({missed_balls}/3)")
            
            if missed_balls >= 3:
                game_over = True
                print(f"Game Over! Too many missed balls\nFinal Score: {score}")
                return
                

        glColor3f(*ball_color)
        circleDraw(ball["x"], ball["y"], ball["radius"])



def shootingBalls():
    global shooting_balls, falling_balls, score, misfire_count, game_over
    
    if game_over:
        return
        
    updated_balls = []
    hit_detected = False
    
    for shoot in shooting_balls:
        shoot["y"] += shooting_ball_speed
        
        # Check for collision with falling balls
        for ball in falling_balls[:]:
            if (abs(shoot["x"] - ball["x"]) < ball["radius"] and 
                abs(shoot["y"] - ball["y"]) < ball["radius"]):
                hit_detected = True
                falling_balls.remove(ball)
                # Add new ball at top
                falling_balls.append({
                    "x": random.randint(0, W_Width),
                    "y": W_Height,
                    "special": random.random() < special_ball_chance,
                    "radius": radius_base
                })
                score += 3 if ball.get("special") else 1
                print(f"Score: {score}")
                break
                
        # Keep balls that are still on-screen and haven't hit anything
        if shoot["y"] <= W_Height and not hit_detected:
            updated_balls.append(shoot)
            circleDraw(shoot["x"], shoot["y"], 5)
        elif shoot["y"] > W_Height:
            misfire_count += 1
            if misfire_count >= 8:
                game_over = True
                print(f"Game Over! Too many misfires\nFinal Score: {score}")
                return
                
    shooting_balls = updated_balls


def keyboardListener(key, x, y):
    global rocket_x, rocket_y, shooting_balls

    if game_over:
        return


    if key == b'a': 
        rocket_x = max(rocket_x - 20, 15)
    elif key == b'd':  
        rocket_x = min(rocket_x + 20, W_Width - 15)
    elif key == b' ':
        shooting_balls.append({"x": rocket_x, "y": rocket_y + 60})


button_size = 40  
click_area = 60   

button_y = W_Height - 60  
left_arrow_pos = (50, W_Height+40)
play_pause_pos = (W_Width//2 - button_size//2, W_Height+40)
cross_pos = (W_Width - 80, W_Height+40)

def drawExit(x, y, color):
    drawLine(x, y, x+50, y-50, color)
    drawLine(x, y-50, x+50, y, color)

def drawBack(x, y, color):
    drawLine(x, y, x + 25, y + 50, color)
    drawLine(x, y, x - 25, y + 50, color)
    drawLine(x - 20, y, x + 20, y, color)
    drawLine(x, y, x, y + 50, color)

def drawPausePlay(x, y, color):
    if not is_paused:
        drawLine(x-25, y+25, x-25, y-25, color)
        drawLine(x-25, y+25, x+25, y, color)
        drawLine(x-25, y-25, x+25, y, color)
    else:
        drawLine(x-20, y+25, x-20, y-25, color)
        drawLine(x+20, y+25, x+20, y-25, color)

def mouseListener(button, state, x, y):
    global game_over, score, missed_balls, misfire_count, falling_balls, is_paused
    
    if state == GLUT_DOWN:

        mouse_y = W_Height - y
        

        if (left_arrow_pos[0] - click_area//2 <= x <= left_arrow_pos[0] + button_size + click_area//2 and
            button_y - click_area//2 <= mouse_y <= button_y + button_size + click_area//2):
            game_over = False
            score = 0
            missed_balls = 0
            misfire_count = 0
            falling_balls = [{"x": random.randint(0, W_Width), 
                              "y": W_Height,
                              "special": random.random() < special_ball_chance,
                              "radius": radius_base} for _ in range(5)]
            print("Starting Over")
        

        elif (play_pause_pos[0] - click_area//2 <= x <= play_pause_pos[0] + button_size + click_area//2 and
              button_y - click_area//2 <= mouse_y <= button_y + button_size + click_area//2):

            is_paused = not is_paused
            print("Paused" if is_paused else "Playing")
        
        elif (cross_pos[0] - click_area//2 <= x <= cross_pos[0] + button_size + click_area//2 and
              button_y - click_area//2 <= mouse_y <= button_y + button_size + click_area//2):
            print(f"Goodbye\nFinal Score: {score}")
            glutLeaveMainLoop()

def display():
    glClear(GL_COLOR_BUFFER_BIT)
    glViewport(0, 0, W_Width, W_Height)
    glMatrixMode(GL_PROJECTION)
    glLoadIdentity()
    glOrtho(0.0, W_Width, 0.0, W_Height, 0.0, 1.0)
    

    glColor3f(1.0, 1.0, 1.0)
    for star in stars:
        glBegin(GL_POINTS)
        glVertex2f(star[0], star[1])
        glEnd()
    

    drawRocket(rocket_x, rocket_y)
    

    if not is_paused:
        fallingBalls()
        shootingBalls()
    
    glColor3f(0.0, 1.0, 0.0)  
    drawBack(left_arrow_pos[0], button_y, (0.0, 1.0, 0.0))
    
    glColor3f(1.0, 0.5, 0.0)  
    drawPausePlay(play_pause_pos[0], button_y, (1.0, 0.5, 0.0))
    
    glColor3f(1.0, 0.0, 0.0)  
    drawExit(cross_pos[0], button_y, (1.0, 0.0, 0.0))
    
    glutSwapBuffers()

def timer(value):
    glutPostRedisplay()
    glutTimerFunc(16, timer, 0)


glutInit()
glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB)
glutInitWindowSize(W_Width, W_Height)
glutInitWindowPosition(100, 100)
glutCreateWindow(b"Falling Balls Game")
glClearColor(0.0, 0.0, 0.0, 0.0)
glShadeModel(GL_FLAT)
glutDisplayFunc(display)
glutKeyboardFunc(keyboardListener)
glutMouseFunc(mouseListener)
glutTimerFunc(0, timer, 0)
glutMainLoop()
