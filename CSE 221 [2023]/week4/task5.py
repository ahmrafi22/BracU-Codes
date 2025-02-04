from collections import deque

def shortest_path(graph, start, end):
    queue = deque([(start, [start])])
    visited = set()

    while queue:
        current_node, path = queue.popleft()

        if current_node == end:
            return path

        if current_node not in visited:
            visited.add(current_node)

            for neighbor in graph[current_node]:
                if neighbor not in visited:
                    queue.append((neighbor, path + [neighbor]))

    return None


with open('input5.txt', 'r') as file:
    n, m, destination = map(int, file.readline().split())
    edges = [tuple(map(int, file.readline().split())) for _ in range(m)]

graph = {i: [] for i in range(1, n + 1)}
for edge in edges:
    graph[edge[0]].append(edge[1])
    graph[edge[1]].append(edge[0])

path = shortest_path(graph, 1, destination)


if path:
    time_required = len(path) - 1
    print(f"Time: {time_required}")
    print("Shortest Path:", " ".join(map(str, path)))
else:
    print("No path found.")
