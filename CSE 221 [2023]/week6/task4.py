class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if self.rank[px] > self.rank[py]:
            self.parent[py] = px
        else:
            self.parent[px] = py
            if self.rank[px] == self.rank[py]:
                self.rank[py] += 1

def get_weight(edge):
    return edge[2]

def kruskal(n, edges):
    dsu = DSU(n)
    edges.sort(key=get_weight)
    cost = 0
    for u, v, w in edges:
        if dsu.find(u) != dsu.find(v):
            cost += w
            dsu.union(u, v)
    return cost

with open("input4.txt",'r') as f:
    n, m = map(int, f.readline().split())
    edges = []
    for i in range(m):
        u, v, w = map(int, f.readline().split())
        edges.append((u-1, v-1, w))
    min_cost = kruskal(n, edges)

with open("output4.txt",'a') as out:
    out.write(str(min_cost) + "\n")