f1 = open("input4.txt", "r")
f2 = open("output4.txt", "w")
n,p= map(int, f1.readline().split())
t1 = [tuple(map(int, f1.readline().split())) for i in range(n)]
def get_end_time(task):
    return task[1]
t1.sort(key=get_end_time)

dt = []

def greedy(arr):
  lt=0
  for t in t1:
    if t[0] >= lt:
        dt.append(t)

        lt = t[1]
while p>0:
  t1 = [t for t in t1 if t not in dt]

  greedy(t1)
  p-=1
r = len(dt)
f2.write(f"{r}")
f1.close()
f2.close()