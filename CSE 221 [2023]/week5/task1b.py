from collections import deque, defaultdict

def find_course_order(N, prerequisites):
    graph = defaultdict(list)
    lis_2 = [0] * (N + 1)

    for prerequisite in prerequisites:
        A, B = prerequisite
        graph[A].append(B)
        lis_2[B] += 1

    queue = deque([course for course in range(1, N + 1) if lis_2[course] == 0])


    result = []

    while queue:
        current_course = queue.popleft()
        result.append(current_course)

        for neighbor_course in graph[current_course]:
            lis_2[neighbor_course] -= 1

            if lis_2[neighbor_course] == 0:
                queue.append(neighbor_course)


    if len(result) == N:
        return result
    else:
        return "IMPOSSIBLE"



file1 = open("input1b.txt", 'r')
N, M = map(int, file1.readline().split())
prerequisites = [tuple(map(int, line.split())) for line in file1.readlines()]

result = find_course_order(N, prerequisites)

file2 = open("output1b.txt", 'w')
file2.write(" ".join(map(str, result)))
file2.close()
