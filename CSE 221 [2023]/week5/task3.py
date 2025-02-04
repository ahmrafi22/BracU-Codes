from collections import defaultdict


def add_edge(graph, u, v):
    graph[u].append(v)


def dfs_stack(graph, node, visited, stack):
    visited[node] = True
    for neighbor in graph[node]:
        if not visited[neighbor]:
            dfs_stack(graph, neighbor, visited, stack)
    stack.append(node)


def dfs_components(transpose_graph, node, visited, component):
    visited[node] = True
    component.append(node)
    for neighbor in transpose_graph[node]:
        if not visited[neighbor]:
            dfs_components(transpose_graph, neighbor, visited, component)


def transpose_graph(graph):
    transpose = defaultdict(list)
    for u, neighbors in graph.items():
        for v in neighbors:
            transpose[v].append(u)
    return transpose


def strongly_connected_components(graph, N):
    visited = [False] * (N + 1)
    stack = []
    for i in range(1, N + 1):
        if not visited[i]:
            dfs_stack(graph, i, visited, stack)

    transpose = transpose_graph(graph)
    visited = [False] * (N + 1)
    components = []

    while stack:
        node = stack.pop()
        if not visited[node]:
            component = []
            dfs_components(transpose, node, visited, component)
            components.append(component)

    return components


file1=open(f"input3.txt", "r")
N, M = map(int, file1.readline().split())
graph = defaultdict(list)

for _ in range(M):
    u, v = map(int, file1.readline().split())
    add_edge(graph, u, v)

components = strongly_connected_components(graph, N)
for component in components:
    res_str = ""
    with open(f"output3.txt", "a") as f2:
        for i in component:
            res_str += str(i) + " "
        res_str += "\n"
        f2.write(res_str)

        f2.close()
