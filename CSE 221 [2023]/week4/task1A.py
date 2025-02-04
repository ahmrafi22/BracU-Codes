def create_adjacency_matrix(N, M, edges):
    adj_matrix = [[0] * (N + 1) for i in range(N + 1)]

    for u, v, w in edges:
        adj_matrix[u][v] = w
    return adj_matrix


file1 = open(f"input1a.txt", 'r')
N, M = map(int, file1.readline().split())
edges = []
for _ in range(M):
    u, v, w = map(int, file1.readline().split())
    edges.append((u, v, w))


file2 = open(f"output1a.txt", 'a')
adj_matrix = create_adjacency_matrix(N, M, edges)

for row in adj_matrix:
    file2.write(" ".join(map(str, row)) + "\n")
