import heapq


def dijkstra(graph, start):
    dis_list = [float("inf")] * len(graph)
    dis_list[start] = 0

    pq = [(0, start)]

    while pq:
        dist_u, u = heapq.heappop(pq)
        for v, w in graph[u]:
            dist_v = dist_u + w

            if dist_v < dis_list[v]:
                dis_list[v] = dist_v
                heapq.heappush(pq, (dist_v, v))
    return dis_list


with open(f"input1.txt", "r") as f:
    N, M = map(int, f.readline().split())
    graph = [[] for i in range(N)]

    for i in range(M):
        u, v, w = map(int, f.readline().split())
        graph[u - 1].append((v - 1, w))

    start = int(f.readline()) - 1
    dis_list = dijkstra(graph, start)
    res_str = ""
    for i in dis_list:
        if i != float("inf"):
            res_str += str(i) + " "
        else:
            res_str += "-1" + " "

with open(f"output1.txt", "w") as f:
    f.write(res_str)
