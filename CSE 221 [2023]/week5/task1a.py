def find_course_order(N, prerequisites):
    graph = [[] for _ in range(N + 1)]
    for prerequisite in prerequisites:
        graph[prerequisite[0]].append(prerequisite[1])

    visited = [0] * (N + 1)
    order = []

    for course in range(1, N + 1):
        if visited[course] == 0:
            result = dfs(course, graph, visited, order)
            if result == "IMPOSSIBLE":
                return "IMPOSSIBLE"

    return order[::-1]


def dfs(course, graph, visited, order):
    visited[course] = 1
    for next_course in graph[course]:
        if visited[next_course] == 0:
            result = dfs(next_course, graph, visited, order)
            if result == "IMPOSSIBLE":
                return "IMPOSSIBLE"
        elif visited[next_course] == 1:
            return "IMPOSSIBLE"

    visited[course] = 2
    order.append(course)
    return order



file1 = open("input1a.txt", 'r')
N, M = map(int, file1.readline().split())
prerequisites = [tuple(map(int, line.split())) for line in file1.readlines()]

result = find_course_order(N, prerequisites)

file2 = open("output1a.txt", 'w')
file2.write(" ".join(map(str, result)))
file2.close()