class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n + 1))
        self.size = [1] * (n + 1)

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x, y):
        root_x, root_y = map(self.find, (x, y))
        if root_x != root_y:
            if self.size[root_x] < self.size[root_y]:
                root_x, root_y = root_y, root_x
            self.parent[root_y] = root_x
            self.size[root_x] += self.size[root_y]

    def get_circle_size(self, x):
        return self.size[self.find(x)]


def process_input(file_path):
    with open(file_path, "r") as fin:
        N, K = map(int, fin.readline().split())
        uf = UnionFind(N)
        size = []
        for _ in range(K):
            A, B = map(int, fin.readline().split())
            uf.union(A, B)
            size.append(uf.get_circle_size(A))
    return size


def write_output(file_path, data):
    with open(file_path, "w") as fout:
        fout.write("\n".join(map(str, data)))


if __name__ == "__main__":
    input_file = "input3.txt"
    output_file = "output3.txt"

    result = process_input(input_file)
    write_output(output_file, result)
