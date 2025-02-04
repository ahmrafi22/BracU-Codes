def has_cycle_dfs(graph, visited, current, parent):
    visited[current] = True

    for next in graph[current]:
        if not visited[next]:
            if has_cycle_dfs(graph, visited, next, current):
                return True
        elif next != parent:
            return True

    return False

def is_cyclic(graph, n):
    visited = [False] * (n + 1)

    for i in range(1, n + 1):
        if not visited[i]:
            if has_cycle_dfs(graph, visited, i, -1):
                return "YES"

    return "NO"


with open('input4.txt', 'r') as file:
    n, m = map(int, file.readline().split())
    edges = [tuple(map(int, file.readline().split())) for _ in range(m)]


graph = {i: [] for i in range(1, n + 1)}
for edge in edges:
    graph[edge[0]].append(edge[1])


result = is_cyclic(graph, n)
print(result)
