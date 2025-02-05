import random
def overlap(slots,N,T):
    temp_arr=[( slots[i:i+N].count('1')) for i in range(0, len(slots)-N+1, T)]
    overlap=0
    for i in range(T):
        count=max(temp_arr[i]-1,0)
        overlap+=count
    return overlap


def consistency(slots,N,T):
    consitency = 0
    for i in range(N):
        scheduled_count = sum(int(slots[j * N + i]) for j in range(T))
        consitency += abs(scheduled_count - 1)
    return consitency


def calculate_fitness(slots,N,T):
    panelty=(overlap(slots,N,T)+consistency(slots,N,T))
    return -panelty


def random_selection(population):
    parent1 = random.choice(population)
    parent2 = random.choice(population)
    if parent1 == parent2:
        parent2 = random.choice(population)
    return parent1, parent2


def Single_point_crossover(parent1,parent2):
    crossover_point = random.randint(1, len(parent1)-1)
    child1 = parent1[:crossover_point] + parent2[crossover_point:]
    child2 = parent2[:crossover_point] + parent1[crossover_point:]
    return child1, child2

def Double_point_crossover(parent1, parent2):
    str_length = len(parent1)
    point1 = random.randint(0, str_length - 1)
    point2 = point1
    while point2 == point1:
        point2 = random.randint(0, str_length - 1)

    point1, point2 = min(point1, point2), max(point1, point2)

    child1 = parent1[:point1] + parent2[point1:point2] + parent1[point2:]
    child2 = parent2[:point1] + parent1[point1:point2] + parent2[point2:]
    return child1, child2



def R_mutation(child):
    m = random.randint(1, len(child)-1)

    list1 = list(child)
    list1[m] = '1' if list1[m] == '0' else '0'
    return "".join(list1)

def genetic_algorithm(N, T, population_size):
    population = [''.join(str(random.randint(0, 1)) for _ in range(N*T)) for _ in range(population_size)]
    best_fitness = float("-inf")
    best_schedule = None

    while best_fitness != 0:
        new_population = []

        while len(new_population) < population_size:

            parent1, parent2 = random_selection(population)

            child1, child2 = Single_point_crossover(parent1, parent2)
            child3, child4 = Double_point_crossover(parent1, parent2)

            mutated_child1 = R_mutation(child1)
            mutated_child2 = R_mutation(child2)

            new_population.extend([mutated_child1, mutated_child2])

        fitness_scores = [calculate_fitness(slots, N, T) for slots in new_population]


        current_best_fitness = max(fitness_scores)
        current_best_index = fitness_scores.index(current_best_fitness)


        if current_best_fitness > best_fitness:
            best_fitness = current_best_fitness
            best_schedule = new_population[current_best_index]

        population = new_population

    return best_fitness, best_schedule , child3, child4

input = open('/content/input.txt', 'r')
lin1=input.readline()
N,T=map(int, lin1.split())
courses=[input.readline().strip() for _ in range(N)]
fitness,schedule, child3, child4 =genetic_algorithm(N,T,population_size=256)
print(f'Task1:\n Schedule: {schedule} \n Fitness:{fitness}')
print(f'Task2:\n Mutated child1:{child3} \n Mutated child2: {child4}')
