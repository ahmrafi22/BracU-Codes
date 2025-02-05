def pacman_game(c):
    outcomes = [3, 6, 2, 3, 7, 1, 2, 0]

    def alpha_beta_pruning(node, depth, alpha, beta, maximizing_player):
        if isinstance(node, int):
            return node

        if len(node) == 2 and all(isinstance(x, int) for x in node):
            return max(node) if maximizing_player else min(node)

        if maximizing_player:
            max_eval = float('-inf')
            for subnode in node:
                eval = alpha_beta_pruning(subnode, depth - 1, alpha, beta, False)
                max_eval = max(max_eval, eval)
                alpha = max(alpha, eval)
                if beta <= alpha:
                    break
            return max_eval
        else:
            min_eval = float('inf')
            for subnode in node:
                eval = alpha_beta_pruning(subnode, depth - 1, alpha, beta, True)
                min_eval = min(min_eval, eval)
                beta = min(beta, eval)
                if beta <= alpha:
                    break
            return min_eval

    def dark_magic_strategy(node, c):
        max_node = [max(subnode) - c for subnode in node]
        return max(max_node)


    game_tree = [[outcomes[i], outcomes[i+1]] for i in range(0, len(outcomes), 2)]


    without_magic = alpha_beta_pruning(game_tree, 3, float('-inf'), float('inf'), True)


    with_dark_magic = dark_magic_strategy(game_tree, c)


    if with_dark_magic > without_magic:
        print(f"The new minimax value is {with_dark_magic}. Pacman goes right and uses dark magic.")
    else:
        print(f"The minimax value is {without_magic}. Pacman does not use dark magic.")

    print("with Dark Magic:",with_dark_magic)
    print("without Dark Magic:",without_magic)

# Example usage
cost = int(input("Enter the cost: "))
pacman_game(cost)