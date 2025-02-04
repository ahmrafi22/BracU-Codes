import heapq


def dijkstra(graph, start):
    distances = {node: float("inf") for node in graph}
    distances[start] = 0
    heap = [(0, start)]

    while heap:
        current_distance, current_node = heapq.heappop(heap)

        if current_distance > distances[current_node]:
            continue

        for neighbor, weight in graph[current_node].items():
            distance = current_distance + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(heap, (distance, neighbor))

    return distances


def find_meeting_node(graph, alice_start, bob_start):
    alice_distances = dijkstra(graph, alice_start)
    bob_distances = dijkstra(graph, bob_start)

    min_time = float("inf")
    meeting_node = None

    for node in graph:
        if alice_distances[node] + bob_distances[node] < min_time:
            min_time = max(alice_distances[node], bob_distances[node])
            meeting_node = node

        if alice_distances[node] == bob_distances[node]:
            if alice_distances[node] < min_time:
                min_time = alice_distances[node]
                meeting_node = node
                break

    return min_time, meeting_node


with open("input2.txt", "r") as f:
    N, M = map(int, f.readline().split())
    graph = {i: {} for i in range(1, N + 1)}

    for _ in range(M):
        u, v, w = map(int, f.readline().split())
        graph[u][v] = w

    alice_start, bob_start = map(int, f.readline().split())

min_time, meeting_node = find_meeting_node(graph, alice_start, bob_start)
with open("output2.txt", "a") as f:
    if min_time == float("inf"):
        f.write("Impossible")
    else:
        f.write(f"Time {min_time}\n")
        f.write(f"Node {meeting_node}")
