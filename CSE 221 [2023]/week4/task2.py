from collections import defaultdict, deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    traversal = []

    while queue:
        current_node = queue.popleft()
        if current_node not in visited:
            traversal.append(current_node)
            visited.add(current_node)
            queue.extend(graph[current_node])

    return traversal


file=open("input2.txt", "r")
N, M = map(int, file.readline().split())
edges = [tuple(map(int, file.readline().split())) for _ in range(M)]


graph = defaultdict(list)
for edge in edges:
    u, v = edge
    graph[u].append(v)
    graph[v].append(u)

traversal_result = bfs(graph, 1)

with open("output.txt", "w") as output_file:
    output_file.write(" ".join(map(str, traversal_result)))

