import heapq

graph = {}
heuristic_values = {}

def a_star_search(start, goal):
    priority_queue = [(heuristic_values[start], 0, start, [start])]
    visited = set()
    while priority_queue:

        estimated_total_cost, current_cost, current_node, path = heapq.heappop(priority_queue)
        if current_node == goal:
            return current_cost, path

        if current_node in visited:
            continue
        visited.add(current_node)


        for neighbor, neighbor_cost in graph[current_node].items():
            new_cost = current_cost + neighbor_cost
            new_estimated_total_cost = new_cost + heuristic_values[neighbor]

            print(priority_queue, (new_estimated_total_cost, new_cost, neighbor, path + [neighbor]))
            heapq.heappush(priority_queue, (new_estimated_total_cost, new_cost, neighbor, path + [neighbor]))




    return None

with open('input.txt', 'r') as file:
    for line in file:
        info = line.strip().split()
        heuristic_values[info[0]] = int(info[1])
        parent = info[0]
        if parent not in graph:
            graph[parent] = {}
        for i in range(2, len(info), 2):
            child = info[i]
            weight = int(info[i+1])
            graph[parent][child] = weight



start = input("start Node: ")
end = input("Destination: ")


result = a_star_search(start, end)
if result:
    total_cost, path = result
    print(f"Path: {' -> '.join(path)}")
    print(f"Total distance: {total_cost} km")
    with open('output.txt', 'w') as output_file:
        output_file.write(f"Path: {' -> '.join(path)}\nTotal distance: {total_cost} km")
else:
    print("No path found")