f1 = open("input3.txt", "r")
f2 = open("output3.txt", "w")
a = int(f1.readline())
t = []
t1 = [tuple(map(int, f1.readline().split())) for i in range(a)]
def get_end_time(t):
    return t[1]
t1.sort(key=get_end_time)
dt = []
lt = 0
for t in t1:
    if t[0] >= lt:
        dt.append(t)
        lt = t[1]
R = len(dt)
f2.write(f"{R}\n")
for task in dt:
    f2.write(f"{task[0]} {task[1]}\n")
f1.close()
f2.close()