import random

def round_result(depth):
    outcomes = []
    num_branches = 2 ** depth
    for _ in range(num_branches):
        outcomes.append([random.choice([-1, 1]) for _ in range(2)])
    return outcomes

def alpha_beta(outcomes, depth, index, alpha, beta, current_player, first_player):
    if depth == 0:
        return outcomes[index][0], index

    maximizer = current_player == first_player
    if maximizer:
        value = float('-inf')
        for i in range(2):
            result, new_index = alpha_beta(outcomes, depth-1, index, alpha, beta, 1-current_player, first_player)
            value = max(value, result)
            alpha = max(alpha, value)
            if alpha >= beta:
                break
        return value, index + 1 if depth == 1 else index
    else:
        value = float('inf')
        for i in range(2):
            result, new_index = alpha_beta(outcomes, depth-1, index, alpha, beta, 1-current_player, first_player)
            value = min(value, result)
            beta = min(beta, value)
            if alpha >= beta:
                break
        return value, index + 1 if depth == 1 else index

def simulate_game(first_player):
    players = ['Scorpion', 'Sub-Zero']
    results = []
    current_player = first_player

    for round_num in range(3):
        depth = random.randint(2, 5)
        outcomes = round_result(depth)
        result, _ = alpha_beta(outcomes, depth, 0, float('-inf'), float('inf'), current_player, first_player)
        results.append(result)
        current_player = 1 - current_player

    winner = players[1-first_player] if sum(results) > 0 else players[first_player]

    print(f"Game Winner: {winner}")
    print(f"Total Rounds Played: 3")
    for i, result in enumerate(results, 1):
        round_winner = players[current_player] if result > 0 else players[1-current_player]
        print(f"Winner of Round {i}: {round_winner}")

first_player = int(input("Enter 0 for 'Scorpion' 1 for 'Sub-Zero' :"))
simulate_game(first_player)