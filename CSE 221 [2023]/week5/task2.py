def topological_sort_with_lex_smallest(N, prerequisites):
    in_degree = [0] * (N + 1)
    adjacency_list = [[] for i in range(N + 1)]

    for a, b in prerequisites:
        in_degree[b] += 1
        adjacency_list[a].append(b)

    heap = sorted([course for course in range(1, N + 1) if in_degree[course] == 0])

    result = []

    while heap:
        course = heap.pop(0)
        result.append(course)

        for neighbor in adjacency_list[course]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                heap.append(neighbor)
                heap.sort()

    if len(result) != N:
        return "IMPOSSIBLE"

    return result


file1=open(f"input2.txt", "r")
N, M = map(int, file1.readline().split())
prerequisites = [list(map(int, file1.readline().split())) for i in range(M)]

sequence = topological_sort_with_lex_smallest(N, prerequisites)

res_str = ""
if sequence == "IMPOSSIBLE":
    res_str = sequence
else:
    for i in sequence:
        res_str += str(i) + " "

f=open(f"output2.txt", "w")
f.write(res_str)
f.close()