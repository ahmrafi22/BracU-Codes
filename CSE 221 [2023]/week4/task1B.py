def create_adjacency_list(N, M, edges):
    adjacency_list = [[] for _ in range(N + 1)]

    for u, v, w in edges:
        adjacency_list[u].append((v, w))

    result = [(i, adjacency_list[i]) for i in range(N + 1)]


    with open("output1b.txt", "w") as file:
        for rank, list in result:
            file.write(f"{rank} : {' '.join([f'({v},{w})' for v, w in list])}\n")


file1=open(f"input1b.txt", "r")
N, M = map(int, file1.readline().split())
edges = [tuple(map(int, file1.readline().split())) for _ in range(M)]

create_adjacency_list(N, M, edges)

