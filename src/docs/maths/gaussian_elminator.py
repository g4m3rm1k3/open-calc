class GausiianElimination:
    """Handles Gaussian elimination with step logging."""

    def __init__(self, augmented_matrix):
        """Make a copy so we don't destroy the original data."""
        self.original = [row[:] for row in augmented_matrix]
        self.matrix = [row[:] for row in augmented_matrix] # working copy
        self.steps = [] # list of stgrings describing what we did

    def log(self, message):
        """Record a step so we can show it later."""
        self.steps.append(message)
        print(message)

    def multiply_row(self, r, scalar):
        """Multiply row r by scalar."""
        if abs(scalar) < 1e-10:
            return
        for j in range(len(self.matrix[r])):
            self.matrix[r][j] *= scalar
        self.log(f"Multiplied row {r} by {scalar}")

    def add_multiple(self, src, dest, multiple):
        """Add multiple * src_row to dest_row"""
        for j in range(len(self.matrix[dest])):
            self.matrix[dest][j] += multiple * self.matrix[src][j]

    def swap_rows(self, r1, r2):
        """Swap two rows."""
        self.matrix[r1], self.matrix[r2] = self.matrix[r2], self.matrix[r1]
        self.log(f"Swapped rows {r1} and {r2}")

    def forward_elimination(self):
        """Turn matrix into upper triangular form."""
        rows = len(self.matrix)


        for i in range(rows):
            # Make pivot = 1
            pivot = self.matrix[i][i]
            if abs(pivot) < 1e-10:
                self.log(f"Zero pivot at ({i}, {i}) - skipping")
                continue
            self.multiply_row(i, 1.0/pivot)

            # Eliminate below
            for j in range(i + 1, rows):
                factor = self.matrix[j][i]
                if abs(factor) > 1e-10:
                    self.add_multiple(i, j, -factor)

    def backward_elimination(self):
        rows = len(self.matrix)
        for i in range(rows-1, -1, -1):
            if abs(self.matrix[i][i]) < 1e-10:
                continue
            for j in range(i-1, -1, -1):
                factor = self.matrix[j][i]
                if abs(factor) > 1e-10:
                    self.add_multiple(i, j, -factor)

    def get_solution(self):
        return "Solution computed. (Full version in next lab)"





if __name__ == "__main__":
    test_mat = [[1,3,6], [4,-2,8]]
    solver = GausiianElimination(test_mat)
    solver.forward_elimination()
    print("\nFinal matrix after forward elimination:")
    for row in solver.matrix:
        print([round(x, 4) for x in row])
    solver.backward_elimination()
    print("\nFinal matrix after backward elimination:")
    for row in solver.matrix:
        print([round(x, 4) for x in row])