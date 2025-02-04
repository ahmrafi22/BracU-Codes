class Graph:
    def __init__(self, n):
        self.graph = {}
        for i in range(1, n + 1):
            self.graph[i] = []

    def add_edge(self, u, v):
        self.graph[u].append(v)
        self.graph[v].append(u)

def dfs(graph, city, visited):
    visited.add(city)
    f2.write(str(city) + ' ')

    for neighbor in graph[city]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)


f=open("input3.txt")
f2=open("output3.txt", "w")
N, M = map(int, f.readline().split())
g = Graph(N)

for _ in range(M):
    u, v = map(int, f.readline().split())
    g.add_edge(u, v)

visited = set()
dfs(g.graph, 1, visited)


