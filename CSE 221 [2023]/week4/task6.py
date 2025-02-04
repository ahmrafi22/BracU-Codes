def max_diamonds(grid):
    def dfs(x, y, diamonds_collected):
        # Check if the current position is out of bounds or an obstacle
        if not (0 <= x < rows) or not (0 <= y < cols) or grid[x][y] == '#':
            return diamonds_collected

        # Check if the current cell contains a diamond
        if grid[x][y] == 'D':
            diamonds_collected += 1

        # Mark the current cell as visited
        grid[x][y] = '#'

        # Explore all possible moves (up, down, left, right)
        diamonds_collected = dfs(x + 1, y, diamonds_collected)
        diamonds_collected = dfs(x - 1, y, diamonds_collected)
        diamonds_collected = dfs(x, y + 1, diamonds_collected)
        diamonds_collected = dfs(x, y - 1, diamonds_collected)

        return diamonds_collected

    rows, cols = len(grid), len(grid[0])
    max_diamonds_collected = 0

    # Find the starting position
    for i in range(rows):
        for j in range(cols):
            if grid[i][j] == '.':
                max_diamonds_collected = max(max_diamonds_collected, dfs(i, j, 0))

    return max_diamonds_collected

# Read input from the file
with open('input6.txt', 'r') as file:
    R, H = map(int, file.readline().split())
    grid = [list(file.readline().strip()) for _ in range(R)]

# Calculate and print the maximum number of diamonds
result = max_diamonds(grid)
file2= open(f"output6.txt", 'a')
file2.write(str(result))
