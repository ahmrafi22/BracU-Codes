
from OpenGL.GL import *
from OpenGL.GLUT import *
from OpenGL.GLU import *
import random
import time

class PointGen:
    def __init__(self):
        self.points = []
        self.speed = 1
        self.play = True
        self.blink = False
        self.blink_timer = time.time()  # Initialize timer with the current time

    def add_point(self, x, y):
        color = [random.random(), random.random(), random.random(), 1]
        direction = random.choice([(1, 1), (-1, 1), (1, -1), (-1, -1)])
        point = [x, 500-y, direction[0], direction[1], color]
        self.points.append(point)

    def move_points(self):
        if self.play:
            for p in self.points:
                p[0] += p[2]*self.speed
                p[1] += p[3]*self.speed
                
                # Bounce off walls
                if p[0] <= 50 or p[0] >= 450:
                    p[2] *= -1
                if p[1] <= 50 or p[1] >= 450:
                    p[3] *= -1

                # Handle blinking
                if self.blink:
                    current_time = time.time()
                    elapsed_time = current_time - self.blink_timer

                    if elapsed_time >= 1:  # Reset blink timer every second
                        self.blink_timer = current_time

                    if elapsed_time % 1 < 0.5:  # Visible for the first half-second
                        p[4][3] = 1
                    else:  # Invisible for the other half
                        p[4][3] = 0
                else:
                    p[4][3] = 1  # Reset to visible when not blinking

point_manager = PointGen()

def drawbox():
    glLineWidth(1)
    glColor3f(203/255, 242/255, 242/255)  
    glBegin(GL_QUADS)
    glVertex2d(50, 50)
    glVertex2d(450, 50)
    glVertex2d(450, 450)
    glVertex2d(50, 450)
    glEnd()

def mouseListener(button, state, x, y):
    button_names = {
        GLUT_LEFT_BUTTON: "LEFT",
        GLUT_RIGHT_BUTTON: "RIGHT",
        GLUT_MIDDLE_BUTTON: "MIDDLE"
    }
    if state == GLUT_DOWN:  
        print(f"{button_names.get(button, 'UNKNOWN')} Button Pressed")

        if button == GLUT_RIGHT_BUTTON:
            if 50 <= x <= 450 and 50 <= y <= 450:
                point_manager.add_point(x, y)
        elif button == GLUT_LEFT_BUTTON:
            point_manager.blink = not point_manager.blink

def keyboardListener(key, x, y):
    if key == b' ':
        print("Space Button pressed")
        point_manager.play = not point_manager.play
    elif key == GLUT_KEY_UP:
        print("UP arrow Button pressed")
        point_manager.speed += 1
    elif key == GLUT_KEY_DOWN:
        print("Down arrow Button pressed")
        point_manager.speed = max(1, point_manager.speed - 1)

def draw_points(x, y, size, color):
    glColor4f(color[0], color[1], color[2], color[3])
    glPointSize(size) 
    glEnable(GL_POINT_SMOOTH)
    glBegin(GL_POINTS)
    glVertex2f(x, y) 
    glEnd()

def iterate():
    glViewport(0, 0, 500, 500)
    glMatrixMode(GL_PROJECTION)
    glLoadIdentity()
    glOrtho(0.0, 500, 0.0, 500, 0.0, 1.0)
    glMatrixMode(GL_MODELVIEW)
    glLoadIdentity()

def showScreen():
    glClear(GL_COLOR_BUFFER_BIT)
    glEnable(GL_BLEND)
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA)
    glLoadIdentity()
    iterate()
    
    drawbox()
    
    for p in point_manager.points:
        draw_points(p[0], p[1], 10, p[4])
    glutSwapBuffers()
    
def animate(pointt):
    point_manager.move_points()
    glutTimerFunc(16, animate, "pointt")  # ~60 FPS
    glutPostRedisplay()
    
glutInit()
glutInitDisplayMode(GLUT_RGBA)
glutInitWindowSize(500, 500)
glutInitWindowPosition(0, 0)
glutCreateWindow(b"Blinking Points cse 423")
glutDisplayFunc(showScreen)
glutTimerFunc(0, animate, "pointt")
glutMouseFunc(mouseListener)
glutKeyboardFunc(keyboardListener)
glutSpecialFunc(keyboardListener)
glutMainLoop()
