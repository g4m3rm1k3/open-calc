def print_matrix(mat, title=""):
    if title:
        print(title)
    for row in mat:
        print([round(x, 4) for x in row]) # round for cleaner display
    print() # empty line

def multiply_row(mat, r, scalar):
    """Multiply row r by scalar (scalar != 0)"""
    for j in range(len(mat[r])):
        mat[r][j] *= scalar

def add_multiple(mat, src_row, dest_row, multiple):
    """Add multiple * src_row to des_row"""
    for j in range(len(mat[dest_row])):
        mat[dest_row][j] += multiple * mat[src_row][j]


def swap_rows(mat, r1, r2):
    mat[r1], mat[r2] = mat[r2], mat[r1]

def forward_elimination(mat):
    rows = len(mat)
    cols = len(mat[0]) - 1 # eclude the b column

    for i in range(rows):
        # make pivot 1 (if possible)
        pivot = mat[i][i]
        if abs(pivot) < 1e-10:
            print(f"Zero pivot position ({i},{i})")
            continue
        multiply_row(mat, i, 1.0 / pivot)

        print_matrix(mat, f"After making pivot 1 in row {i}:")

        # Eliminate below
        for j in range(i + 1, rows):
            factor = mat[j][i]
            add_multiple(mat, i, j, -factor)
            print_matrix(mat, f"After elmimating below pivot in row {j}:")

def back_substitution(mat):
    rows = len(mat)
    cols = len(mat[0]) - 1
    # Initialize a list of zeros for our results [x1, x2, x3]
    x = [0] * cols

    # Start from the bottom row and move up
    for i in range(rows - 1, -1, -1):
        # The variable starts as the constant on the far right (the b value)
        x[i] = mat[i][cols]
        
        # Subtract the known values from the variables we already solved
        # This is the "Plugging In" step
        for j in range(i + 1, cols):
            x[i] -= mat[i][j] * x[j]
            
    return x


# Test data  - our running example
augmented = [
    [1,-1,2,14],
    [-2,3,-6, -41],
    [-3,3,-5,-38]
]

print_matrix(augmented, "Initail augmented matrix:")
mat = [row[:] for row in augmented] # copy


# --- Running the Full Solver ---
print_matrix(augmented, "Initial augmented matrix:")
mat = [row[:] for row in augmented] # copy original data

# Step 1: Build the staircase
forward_elimination(mat)

# Step 2: Solve from the bottom up
solution = back_substitution(mat)

print("Final Solution Set:")
for i, val in enumerate(solution):
    print(f"x{i+1} = {round(val, 2)}")

    