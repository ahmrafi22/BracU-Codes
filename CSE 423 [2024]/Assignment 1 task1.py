
from OpenGL.GL import *
from OpenGL.GLUT import *
from OpenGL.GLU import *
import random


gradient_background = True
gradient_intensity = 1.0
night_cycle_count = 0
W_Width, W_Height = 800, 500
rain_spawn_width = 400

num_raindrops = 350
raindrops = []
min_rain_speed = 0.5
max_rain_speed = 1
rain_angle = 0.5
rain_height_limit = W_Height * 0.48

class Raindrop:
    def __init__(self):
        self.reset()
        
    def reset(self):
        self.x = random.uniform(-rain_spawn_width/2, W_Width + rain_spawn_width/2)
        self.y = random.uniform(W_Height, W_Height + 100)
        self.speed = random.uniform(min_rain_speed, max_rain_speed)
        self.length = random.uniform(10, 20)
        
    def update(self):
        self.y -= self.speed * 0.5
        self.x -= self.speed * rain_angle * 0.5
        
        if self.y < rain_height_limit:
            self.reset()
            return
            
        if self.x < -rain_spawn_width/2 or self.x > W_Width + rain_spawn_width/2:
            self.reset()
            return

def get_roof_height(x):
    if 80 <= x <= 250:
        return 300 + (x - 80) * (100/170)
    elif 250 < x <= 420:
        return 400 - (x - 250) * (100/170)
    return 0

def should_draw_raindrop(x, y, end_x, end_y):
    if 100 <= x <= 400 and y <= 300:
        return False
    if 100 <= end_x <= 400 and end_y <= 300:
        return False
        
    if 80 <= x <= 420:
        roof_height = get_roof_height(x)
        if y <= roof_height:
            return False
            
    if 80 <= end_x <= 420:
        roof_height = get_roof_height(end_x)
        if end_y <= roof_height:
            return False
            
    return True

def iterate():
    glViewport(0, 0, 500, 500)
    glMatrixMode(GL_PROJECTION)
    glLoadIdentity()
    glOrtho(0.0, 500, 0.0, 500, 0.0, 1.0)
    glMatrixMode(GL_MODELVIEW)
    glLoadIdentity()

def drawGradientBackground():
    global gradient_background, gradient_intensity
    
    
    glBegin(GL_QUADS)
    sky_color = [0.52 * gradient_intensity, 
                 0.82 * gradient_intensity, 
                 0.90 * gradient_intensity]
    glColor3fv(sky_color)
    glVertex2f(0, 500)
    glVertex2f(500, 500)
    
    middle_green = [0.0 * gradient_intensity, 
                    0.51 * gradient_intensity, 
                    0.0 * gradient_intensity]
    glColor3fv(middle_green)
    glVertex2f(500, 250)
    glVertex2f(0, 250)
    
    green_shade = [0.51 * gradient_intensity, 
                   0.75 * gradient_intensity, 
                   0.42 * gradient_intensity]
    glColor3fv(green_shade)
    glVertex2f(0, 250)
    glVertex2f(500, 250)
    
    ground_color = [1.0 * gradient_intensity, 
                    1.0 * gradient_intensity, 
                    0.8 * gradient_intensity]
    glColor3fv(ground_color)
    glVertex2f(500, 0)
    glVertex2f(0, 0)
    
    glEnd()

def drawHouse():

    glColor3f(0.76, 0.60, 0.42)  
    glBegin(GL_TRIANGLES)
    glVertex2f(100, 100)
    glVertex2f(400, 100)
    glVertex2f(400, 300)
    glVertex2f(100, 100)
    glVertex2f(400, 300)
    glVertex2f(100, 300)
    glEnd()

    glColor3f(0.8, 0.13, 0.13) 
    glBegin(GL_TRIANGLES)
    glVertex2f(80, 300)
    glVertex2f(420, 300)
    glVertex2f(250, 400)
    glEnd()

    glColor3f(0.4, 0.2, 0.0) 
    glBegin(GL_TRIANGLES)
    glVertex2f(220, 100)
    glVertex2f(280, 100)
    glVertex2f(280, 200)
    glVertex2f(220, 100)
    glVertex2f(280, 200)
    glVertex2f(220, 200)
    glEnd()

    glColor3f(0.8, 0.92, 0.97) 
    glBegin(GL_TRIANGLES)
    glVertex2f(330, 200)
    glVertex2f(378, 200)
    glVertex2f(378, 260)
    glVertex2f(330, 200)
    glVertex2f(378, 260)
    glVertex2f(330, 260)
    glEnd()

    glColor3f(0.55, 0.27, 0.07)  
    glBegin(GL_LINES)
    glVertex2f(330, 230)
    glVertex2f(378, 230)
    glEnd()
    
    glBegin(GL_LINES)
    glVertex2f(354, 200)
    glVertex2f(354, 260)
    glEnd()

def drawRain():
    glColor3f(52/255, 101/255, 235/255)
    glLineWidth(1.6)
    for drop in raindrops:
        end_x = drop.x - drop.length * rain_angle
        end_y = drop.y - drop.length
        if should_draw_raindrop(drop.x, drop.y, end_x, end_y):
            glBegin(GL_LINES)
            glVertex2f(drop.x, drop.y)
            glVertex2f(end_x, end_y)
            glEnd()

def showScreen():
    global gradient_background, gradient_intensity
    glClear(GL_COLOR_BUFFER_BIT)
    glLoadIdentity()
    iterate()

    if gradient_background:
        drawGradientBackground()
    else:
        glClearColor(34/255, 36/255, 35/255, 1)
        glClear(GL_COLOR_BUFFER_BIT)

    drawHouse()
    drawRain()
    glutSwapBuffers()

def animate():
    global rain_angle, min_rain_speed, max_rain_speed
    
    for drop in raindrops:
        drop.update()
    
    glutPostRedisplay()

def keyboardHandler(key, x, y):
    global gradient_background, gradient_intensity, night_cycle_count
    
    if key == b'n':
        gradient_intensity = max(0.1, gradient_intensity - 0.3)
        night_cycle_count += 1

        if night_cycle_count >= 4:
            gradient_background = False
            night_cycle_count = 0
    
    elif key == b'd':
        gradient_intensity = min(1.0, gradient_intensity + 0.3)
        night_cycle_count += 1
        
        if night_cycle_count >= 4:
            gradient_background = False
            night_cycle_count = 0
    
    gradient_background = True
    glutPostRedisplay()

def specialKeyHandler(key, x, y):
    global rain_angle, min_rain_speed, max_rain_speed
    
    if key == GLUT_KEY_UP:
        min_rain_speed = min(min_rain_speed + 0.2, 1)
        max_rain_speed = min(max_rain_speed + 0.2, 3)
    elif key == GLUT_KEY_DOWN:
        min_rain_speed = max(min_rain_speed - 0.2, 0.3)
        max_rain_speed = max(max_rain_speed - 0.2, 0.8)
    elif key == GLUT_KEY_RIGHT:
        rain_angle = max(rain_angle - 0.1, -1.0)
    elif key == GLUT_KEY_LEFT:
        rain_angle = min(rain_angle + 0.1, 1.0)
    
    for drop in raindrops:
        drop.speed = random.uniform(min_rain_speed, max_rain_speed)
    
    glutPostRedisplay()


glutInit()
glutInitDisplayMode(GLUT_RGBA)
glutInitWindowSize(500, 500)
glutInitWindowPosition(0, 0)
glutCreateWindow(b"House Rain cse 423")
    
for _ in range(num_raindrops):
    raindrops.append(Raindrop())
    print(raindrops)
    
glutDisplayFunc(showScreen)
glutKeyboardFunc(keyboardHandler)
glutSpecialFunc(specialKeyHandler)
glutIdleFunc(animate)
glutMainLoop()

