"""
Accumulated, verified function library for the Graphics/CAD-CAM curriculum.

Purpose: every function below is copied verbatim from a lesson that has
already been written, verified via Bash, and shipped as a real
Lesson-NN.md file. This library exists so a NEW lesson's own scratch
verification script can start from a trusted, already-correct base
instead of retyping 15-20 reused functions from memory every time.

This does NOT replace per-lesson verification. The schema's own rule
still applies: a lesson's own NEW code, and its real interaction with
whatever it reuses from here, must still be actually run via Bash THIS
session before being written into that lesson's markdown. What this file
removes is the risk/effort of re-transcribing already-proven code from
memory or from HANDOFF.md's prose summaries.

This file lives in the project (not the session-specific scratchpad) on
purpose, so any future session can read it directly. It is a working
tool for building the curriculum, not a lesson itself, and not something
a learner following the curriculum needs to open.

Organized by the lesson that gave each function its own full
first-appearance treatment. A self-check block at the bottom re-confirms
a handful of already-known values whenever this file is run directly.
Append each new lesson's own reusable functions here as it's written,
plus one new self-check line confirming a known value from that lesson.
"""

import math


# ── L1-3: points, vectors ────────────────────────────────────────────

def distance_1d(a, b):
    return abs(a - b)


def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


# ── L6: basis vectors ────────────────────────────────────────────────

def from_components(x_amount, y_amount, x_axis, y_axis):
    along_x = scale_vector(x_axis, x_amount)
    along_y = scale_vector(y_axis, y_amount)
    return add_vector_to_point(along_x, along_y)


# ── L7-8: dot and cross products ─────────────────────────────────────

def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


# ── L9-10: norm, 2D distance, normalize ──────────────────────────────

def norm(v):
    return math.sqrt(dot_product(v, v))


def distance_2d(a, b):
    return norm(subtract_points(a, b))


def normalize(v):
    return scale_vector(v, 1 / norm(v))


# ── L12: unified local-to-global transform ───────────────────────────

def transform_to_global(point_in_local, origin_in_global, x_axis_in_global, y_axis_in_global):
    offset = from_components(point_in_local[0], point_in_local[1], x_axis_in_global, y_axis_in_global)
    return add_vector_to_point(origin_in_global, offset)


# ── L14-15: matrices (homogeneous 2D / row-major nested tuples) ─────

def dot3(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def apply_matrix(matrix, point_h):
    row0_result = dot3(matrix[0], point_h)
    row1_result = dot3(matrix[1], point_h)
    row2_result = dot3(matrix[2], point_h)
    return (row0_result, row1_result, row2_result)


def get_column(matrix, col_index):
    return (matrix[0][col_index], matrix[1][col_index], matrix[2][col_index])


def multiply_matrices(a, b):
    b_col0 = get_column(b, 0)
    b_col1 = get_column(b, 1)
    b_col2 = get_column(b, 2)
    row0 = (dot3(a[0], b_col0), dot3(a[0], b_col1), dot3(a[0], b_col2))
    row1 = (dot3(a[1], b_col0), dot3(a[1], b_col1), dot3(a[1], b_col2))
    row2 = (dot3(a[2], b_col0), dot3(a[2], b_col1), dot3(a[2], b_col2))
    return (row0, row1, row2)


# ── L17: tolerance ────────────────────────────────────────────────────

def nearly_equal(a, b, tolerance):
    return abs(a - b) < tolerance


# ── L18-19, L26: geometric predicates ────────────────────────────────

def is_point_on_line(p, a, b):
    return cross_product(subtract_points(b, a), subtract_points(p, a)) == 0


def is_point_on_line_tolerant(p, a, b, tolerance):
    return nearly_equal(cross_product(subtract_points(b, a), subtract_points(p, a)), 0, tolerance)


def classify_turn(a, b, c):
    turn_value = cross_product(subtract_points(b, a), subtract_points(c, a))
    if turn_value > 0:
        return "left"
    elif turn_value < 0:
        return "right"
    else:
        return "straight"


def classify_turn_tolerant(a, b, c, tolerance):
    turn_value = cross_product(subtract_points(b, a), subtract_points(c, a))
    if nearly_equal(turn_value, 0, tolerance):
        return "straight"
    elif turn_value > 0:
        return "left"
    else:
        return "right"


def orientation(a, b, c):
    turn_value = cross_product(subtract_points(b, a), subtract_points(c, a))
    if turn_value > 0:
        return 1
    elif turn_value < 0:
        return -1
    else:
        return 0


def signed_area(a, b, c):
    return cross_product(subtract_points(b, a), subtract_points(c, a)) / 2


# ── L21-22, L24-25: parametric lines, rays, segments ─────────────────

def point_on_line(line_point, line_direction, t):
    return add_vector_to_point(line_point, scale_vector(line_direction, t))


def is_t_on_segment(t):
    return 0 <= t <= 1


def is_t_on_ray(t):
    return t >= 0


def find_t_for_point(p, line_point, line_direction):
    offset = subtract_points(p, line_point)
    return dot_product(offset, line_direction) / dot_product(line_direction, line_direction)


def is_point_on_segment(p, segment_start, segment_end, segment_direction):
    if is_point_on_line(p, segment_start, segment_end):
        t = find_t_for_point(p, segment_start, segment_direction)
        return is_t_on_segment(t)
    else:
        return False


def is_point_on_ray(p, ray_origin, ray_direction):
    second_point = point_on_line(ray_origin, ray_direction, 1)
    if is_point_on_line(p, ray_origin, second_point):
        t = find_t_for_point(p, ray_origin, ray_direction)
        return is_t_on_ray(t)
    else:
        return False


def line_intersection(point1, dir1, point2, dir2):
    diff = subtract_points(point2, point1)
    denominator = cross_product(dir1, dir2)
    t = cross_product(diff, dir2) / denominator
    return point_on_line(point1, dir1, t)


def segment_intersection(segment1_start, segment1_end, segment2_start, segment2_end):
    dir1 = subtract_points(segment1_end, segment1_start)
    dir2 = subtract_points(segment2_end, segment2_start)
    denominator = cross_product(dir1, dir2)
    if denominator == 0:
        return "no intersection"
    diff = subtract_points(segment2_start, segment1_start)
    t = cross_product(diff, dir2) / denominator
    s = cross_product(diff, dir1) / denominator
    if is_t_on_segment(t) == False:
        return "no intersection"
    if is_t_on_segment(s) == False:
        return "no intersection"
    return point_on_line(segment1_start, dir1, t)


def normalize_segment(segment):
    p1 = segment[0]
    p2 = segment[1]
    if p1[0] <= p2[0]:
        return (p1, p2)
    else:
        return (p2, p1)


# ── L28-29: distance to line / segment ───────────────────────────────

def distance_to_line(p, line_point, line_direction):
    t = find_t_for_point(p, line_point, line_direction)
    closest_point = point_on_line(line_point, line_direction, t)
    return norm(subtract_points(p, closest_point))


def distance_to_segment(p, segment_start, segment_end):
    direction = subtract_points(segment_end, segment_start)
    t = find_t_for_point(p, segment_start, direction)
    if is_t_on_segment(t):
        closest_point = point_on_line(segment_start, direction, t)
    else:
        distance_to_start = norm(subtract_points(p, segment_start))
        distance_to_end = norm(subtract_points(p, segment_end))
        if distance_to_start < distance_to_end:
            closest_point = segment_start
        else:
            closest_point = segment_end
    return norm(subtract_points(p, closest_point))


# ── L30-32: circles ───────────────────────────────────────────────────

def distance_from_center(p, circle):
    center = circle[0]
    return norm(subtract_points(p, center))


def classify_point_vs_circle(p, circle, tolerance):
    center = circle[0]
    radius = circle[1]
    distance = norm(subtract_points(p, center))
    if nearly_equal(distance, radius, tolerance):
        return "on"
    elif distance < radius:
        return "inside"
    else:
        return "outside"


def circle_line_intersection(line_point, line_direction, circle):
    center = circle[0]
    radius = circle[1]
    d = subtract_points(line_point, center)
    a = dot_product(line_direction, line_direction)
    b = 2 * dot_product(d, line_direction)
    c = dot_product(d, d) - radius * radius
    discriminant = b * b - 4 * a * c
    if nearly_equal(discriminant, 0, 0.0000001):
        t = -b / (2 * a)
        return (point_on_line(line_point, line_direction, t),)
    elif discriminant < 0:
        return "no intersection"
    else:
        sqrt_discriminant = math.sqrt(discriminant)
        t1 = (-b - sqrt_discriminant) / (2 * a)
        t2 = (-b + sqrt_discriminant) / (2 * a)
        return (
            point_on_line(line_point, line_direction, t1),
            point_on_line(line_point, line_direction, t2),
        )


def perpendicular(v):
    return (-v[1], v[0])


def circle_circle_intersection(circle1, circle2):
    center1 = circle1[0]
    radius1 = circle1[1]
    center2 = circle2[0]
    radius2 = circle2[1]
    center_offset = subtract_points(center2, center1)
    d = norm(center_offset)
    if nearly_equal(d, 0, 0.0000001):
        return "no intersection"
    a_dist = (radius1 * radius1 - radius2 * radius2 + d * d) / (2 * d)
    radical_point = point_on_line(center1, center_offset, a_dist / d)
    radical_direction = perpendicular(center_offset)
    return circle_line_intersection(radical_point, radical_direction, circle1)


# ── L33-34, L37: polygons — representation, edges, area, orientation, convexity ─

def get_edge(polygon, i):
    start = polygon[i]
    end = polygon[(i + 1) % len(polygon)]
    return (start, end)


def get_vertex(polygon, i):
    return polygon[i % len(polygon)]


def polygon_perimeter(polygon):
    total = 0
    for i in range(len(polygon)):
        edge = get_edge(polygon, i)
        edge_start = edge[0]
        edge_end = edge[1]
        edge_length = norm(subtract_points(edge_end, edge_start))
        total = total + edge_length
    return total


def polygon_signed_area(polygon):
    total = 0
    for i in range(len(polygon)):
        edge = get_edge(polygon, i)
        v1 = edge[0]
        v2 = edge[1]
        total = total + cross_product(v1, v2)
    return total / 2


def polygon_orientation(polygon):
    area = polygon_signed_area(polygon)
    if area > 0:
        return "counterclockwise"
    elif area < 0:
        return "clockwise"
    else:
        return "degenerate"


def is_convex_vertex(polygon, i):
    prev_vertex = get_vertex(polygon, i - 1)
    current_vertex = get_vertex(polygon, i)
    next_vertex = get_vertex(polygon, i + 1)
    overall = polygon_orientation(polygon)
    local_turn = classify_turn(prev_vertex, current_vertex, next_vertex)
    if overall == "counterclockwise":
        return local_turn == "left"
    else:
        return local_turn == "right"


def is_polygon_convex(polygon):
    overall_orientation = polygon_orientation(polygon)
    for i in range(len(polygon)):
        prev_vertex = get_vertex(polygon, i - 1)
        current_vertex = get_vertex(polygon, i)
        next_vertex = get_vertex(polygon, i + 1)
        local_turn = classify_turn(prev_vertex, current_vertex, next_vertex)
        if overall_orientation == "counterclockwise":
            if local_turn == "right":
                return False
        else:
            if local_turn == "left":
                return False
    return True


# ── L44: robust point-in-polygon (supersedes L35's original) ─────────

def count_ray_crossings_robust(point, far_point, polygon):
    count = 0
    for i in range(len(polygon)):
        edge = get_edge(polygon, i)
        edge_start = edge[0]
        edge_end = edge[1]
        ray_dir = subtract_points(far_point, point)
        edge_dir = subtract_points(edge_end, edge_start)
        denominator = cross_product(ray_dir, edge_dir)
        if denominator != 0:
            diff = subtract_points(edge_start, point)
            t = cross_product(diff, edge_dir) / denominator
            s = cross_product(diff, ray_dir) / denominator
            if t >= 0:
                if s >= 0:
                    if s < 1:
                        count = count + 1
    return count


def is_point_in_polygon_robust(point, polygon):
    far_point = (point[0] + 1000, point[1])
    crossings = count_ray_crossings_robust(point, far_point, polygon)
    return crossings % 2 == 1


# ── L36: polygon-polygon intersection ────────────────────────────────

def count_boundary_intersections(polygon_a, polygon_b):
    count = 0
    for i in range(len(polygon_a)):
        edge_a = get_edge(polygon_a, i)
        for j in range(len(polygon_b)):
            edge_b = get_edge(polygon_b, j)
            result = segment_intersection(edge_a[0], edge_a[1], edge_b[0], edge_b[1])
            if result != "no intersection":
                count = count + 1
    return count


def polygons_intersect(polygon_a, polygon_b):
    if count_boundary_intersections(polygon_a, polygon_b) > 0:
        return True
    if is_point_in_polygon_robust(polygon_b[0], polygon_a):
        return True
    if is_point_in_polygon_robust(polygon_a[0], polygon_b):
        return True
    return False


# ── L38: convex hull (gift wrapping) ─────────────────────────────────

def find_leftmost_point(points):
    leftmost = points[0]
    for p in points:
        if p[0] < leftmost[0]:
            leftmost = p
    return leftmost


def find_next_hull_point(points, current):
    candidate = points[0]
    if candidate == current:
        candidate = points[1]
    for p in points:
        turn = orientation(current, candidate, p)
        if turn == -1:
            candidate = p
    return candidate


def convex_hull(points):
    start = find_leftmost_point(points)
    hull = [start]
    current = start
    next_point = find_next_hull_point(points, current)
    while next_point != start:
        hull.append(next_point)
        current = next_point
        next_point = find_next_hull_point(points, current)
    return hull


# ── L42: polygon triangulation (ear clipping) ────────────────────────

def is_vertex_of_triangle(v, triangle):
    if v == triangle[0]:
        return True
    if v == triangle[1]:
        return True
    if v == triangle[2]:
        return True
    return False


def is_ear(polygon, i):
    if is_convex_vertex(polygon, i) == False:
        return False
    prev_vertex = get_vertex(polygon, i - 1)
    current_vertex = get_vertex(polygon, i)
    next_vertex = get_vertex(polygon, i + 1)
    triangle = [prev_vertex, current_vertex, next_vertex]
    for j in range(len(polygon)):
        test_vertex = polygon[j]
        if is_vertex_of_triangle(test_vertex, triangle) == False:
            if is_point_in_polygon_robust(test_vertex, triangle):
                return False
    return True


def find_ear_index(polygon):
    for i in range(len(polygon)):
        if is_ear(polygon, i):
            return i
    return 0


def remove_vertex(polygon, i):
    result = []
    for j in range(len(polygon)):
        if j != i:
            result.append(polygon[j])
    return result


def triangulate(polygon):
    remaining = polygon
    triangles = []
    while len(remaining) > 3:
        ear_index = find_ear_index(remaining)
        prev_vertex = get_vertex(remaining, ear_index - 1)
        current_vertex = get_vertex(remaining, ear_index)
        next_vertex = get_vertex(remaining, ear_index + 1)
        triangles.append((prev_vertex, current_vertex, next_vertex))
        remaining = remove_vertex(remaining, ear_index)
    triangles.append((remaining[0], remaining[1], remaining[2]))
    return triangles


# ── L39: sweep line ───────────────────────────────────────────────────

def find_intersections_swept(segments):
    normalized = []
    for segment in segments:
        normalized.append(normalize_segment(segment))
    sorted_segments = sorted(normalized)
    checked_count = 0
    intersection_count = 0
    for i in range(len(sorted_segments)):
        segment_i = sorted_segments[i]
        end_x_i = segment_i[1][0]
        for j in range(i + 1, len(sorted_segments)):
            segment_j = sorted_segments[j]
            start_x_j = segment_j[0][0]
            if start_x_j > end_x_i:
                break
            checked_count = checked_count + 1
            result = segment_intersection(segment_i[0], segment_i[1], segment_j[0], segment_j[1])
            if result != "no intersection":
                intersection_count = intersection_count + 1
    return (intersection_count, checked_count)


# ── L40-41: Voronoi / Delaunay ────────────────────────────────────────

def closest_seed(query_point, seeds):
    closest = seeds[0]
    closest_distance = norm(subtract_points(query_point, seeds[0]))
    for seed in seeds:
        distance = norm(subtract_points(query_point, seed))
        if distance < closest_distance:
            closest = seed
            closest_distance = distance
    return closest


def bisector(seed1, seed2):
    midpoint = point_on_line(seed1, subtract_points(seed2, seed1), 0.5)
    direction = perpendicular(subtract_points(seed2, seed1))
    return (midpoint, direction)


def circumcenter(a, b, c):
    bisector_ab = bisector(a, b)
    bisector_bc = bisector(b, c)
    return line_intersection(bisector_ab[0], bisector_ab[1], bisector_bc[0], bisector_bc[1])


def is_delaunay_triangle(a, b, c, other_points):
    triangle_center = circumcenter(a, b, c)
    triangle_radius = norm(subtract_points(triangle_center, a))
    circumcircle = (triangle_center, triangle_radius)
    for p in other_points:
        if classify_point_vs_circle(p, circumcircle, 0.0000001) == "inside":
            return False
    return True


# ── L43: spatial grid ─────────────────────────────────────────────────

def cell_of(point, cell_size):
    return (point[0] // cell_size, point[1] // cell_size)


def cells_adjacent(cell1, cell2):
    dx = cell1[0] - cell2[0]
    dy = cell1[1] - cell2[1]
    if dx < -1:
        return False
    if dx > 1:
        return False
    if dy < -1:
        return False
    if dy > 1:
        return False
    return True


# ── L46: 3D extension ─────────────────────────────────────────────────

def add_vector_to_point_3d(point, vector):
    return (point[0] + vector[0], point[1] + vector[1], point[2] + vector[2])


def subtract_points_3d(a, b):
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def scale_vector_3d(vector, factor):
    return (vector[0] * factor, vector[1] * factor, vector[2] * factor)


def from_components_3d(x_amount, y_amount, z_amount, x_axis, y_axis, z_axis):
    along_x = scale_vector_3d(x_axis, x_amount)
    along_y = scale_vector_3d(y_axis, y_amount)
    along_z = scale_vector_3d(z_axis, z_amount)
    return add_vector_to_point_3d(add_vector_to_point_3d(along_x, along_y), along_z)


# ── L47: rotation about a principal axis ──────────────────────────────

def rotate_z(point, theta_degrees):
    x, y, z = point
    theta = math.radians(theta_degrees)
    x_new = x * math.cos(theta) - y * math.sin(theta)
    y_new = x * math.sin(theta) + y * math.cos(theta)
    return (x_new, y_new, z)


def rotate_x(point, theta_degrees):
    x, y, z = point
    theta = math.radians(theta_degrees)
    y_new = y * math.cos(theta) - z * math.sin(theta)
    z_new = y * math.sin(theta) + z * math.cos(theta)
    return (x, y_new, z_new)


def rotate_y(point, theta_degrees):
    x, y, z = point
    theta = math.radians(theta_degrees)
    z_new = z * math.cos(theta) - x * math.sin(theta)
    x_new = z * math.sin(theta) + x * math.cos(theta)
    return (x_new, y, z_new)


# ── L48: rotation matrices (reuse dot3/apply_matrix/multiply_matrices unchanged) ──

def rotation_matrix_z(theta_degrees):
    theta = math.radians(theta_degrees)
    c = math.cos(theta)
    s = math.sin(theta)
    return ((c, -s, 0), (s, c, 0), (0, 0, 1))


def rotation_matrix_x(theta_degrees):
    theta = math.radians(theta_degrees)
    c = math.cos(theta)
    s = math.sin(theta)
    return ((1, 0, 0), (0, c, -s), (0, s, c))


def rotation_matrix_y(theta_degrees):
    theta = math.radians(theta_degrees)
    c = math.cos(theta)
    s = math.sin(theta)
    return ((c, 0, s), (0, 1, 0), (-s, 0, c))


# ── L49: Euler angles (fixed ZYX composition order) ────────────────────

def euler_to_matrix(yaw_z, pitch_y, roll_x):
    rz = rotation_matrix_z(yaw_z)
    ry = rotation_matrix_y(pitch_y)
    rx = rotation_matrix_x(roll_x)
    return multiply_matrices(rz, multiply_matrices(ry, rx))


# ── L50: gimbal lock detection ──────────────────────────────────────────

def is_near_gimbal_lock(pitch_degrees, tolerance_degrees):
    distance_from_positive_90 = abs(pitch_degrees - 90)
    distance_from_negative_90 = abs(pitch_degrees - (-90))
    if distance_from_positive_90 < tolerance_degrees:
        return True
    if distance_from_negative_90 < tolerance_degrees:
        return True
    return False


# ── L51: axis-angle rotation (Rodrigues' rotation formula) ─────────────

def cross_product_3d(a, b):
    return (
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    )


def norm_3d(v):
    return math.sqrt(dot3(v, v))


def normalize_3d(v):
    return scale_vector_3d(v, 1 / norm_3d(v))


def rotate_by_axis_angle(point, axis, theta_degrees):
    k = normalize_3d(axis)
    theta = math.radians(theta_degrees)
    c = math.cos(theta)
    s = math.sin(theta)
    term1 = scale_vector_3d(point, c)
    term2 = scale_vector_3d(cross_product_3d(k, point), s)
    term3 = scale_vector_3d(k, dot3(k, point) * (1 - c))
    return add_vector_to_point_3d(add_vector_to_point_3d(term1, term2), term3)


# ── L52: quaternions ─────────────────────────────────────────────────

def quaternion_from_axis_angle(axis, theta_degrees):
    k = normalize_3d(axis)
    theta = math.radians(theta_degrees)
    half = theta / 2
    s = math.sin(half)
    return (math.cos(half), k[0] * s, k[1] * s, k[2] * s)


def quaternion_norm(q):
    w, x, y, z = q
    return math.sqrt(w * w + x * x + y * y + z * z)


def quaternion_conjugate(q):
    w, x, y, z = q
    return (w, -x, -y, -z)


def quaternion_multiply(q1, q2):
    w1, x1, y1, z1 = q1
    w2, x2, y2, z2 = q2
    w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2
    x = w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2
    y = w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2
    z = w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2
    return (w, x, y, z)


def rotate_by_quaternion(point, q):
    p = (0, point[0], point[1], point[2])
    q_conjugate = quaternion_conjugate(q)
    result = quaternion_multiply(quaternion_multiply(q, p), q_conjugate)
    return (result[1], result[2], result[3])


# ── L54: quaternion interpolation (slerp) ───────────────────────────────

def quaternion_dot(q1, q2):
    return q1[0] * q2[0] + q1[1] * q2[1] + q1[2] * q2[2] + q1[3] * q2[3]


def quaternion_scale(q, factor):
    return (q[0] * factor, q[1] * factor, q[2] * factor, q[3] * factor)


def quaternion_add(q1, q2):
    return (q1[0] + q2[0], q1[1] + q2[1], q1[2] + q2[2], q1[3] + q2[3])


def slerp(q1, q2, t):
    d = quaternion_dot(q1, q2)
    if d < 0:
        q2 = quaternion_scale(q2, -1)
        d = -d
    d = max(-1, min(d, 1))
    omega = math.acos(d)
    if omega < 0.0000001:
        return q1
    s1 = math.sin((1 - t) * omega) / math.sin(omega)
    s2 = math.sin(t * omega) / math.sin(omega)
    return quaternion_add(quaternion_scale(q1, s1), quaternion_scale(q2, s2))


# ── L55: rigid transformations (4x4 homogeneous matrices) ──────────────

def dot4(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]


def apply_matrix4(matrix, point_h):
    return (
        dot4(matrix[0], point_h),
        dot4(matrix[1], point_h),
        dot4(matrix[2], point_h),
        dot4(matrix[3], point_h),
    )


def to_homogeneous_3d(point):
    return (point[0], point[1], point[2], 1)


def build_rigid_transform(rotation_matrix, translation):
    r = rotation_matrix
    t = translation
    return (
        (r[0][0], r[0][1], r[0][2], t[0]),
        (r[1][0], r[1][1], r[1][2], t[1]),
        (r[2][0], r[2][1], r[2][2], t[2]),
        (0, 0, 0, 1),
    )


def get_column4(matrix, col_index):
    return (matrix[0][col_index], matrix[1][col_index], matrix[2][col_index], matrix[3][col_index])


def multiply_matrices4(a, b):
    b_col0 = get_column4(b, 0)
    b_col1 = get_column4(b, 1)
    b_col2 = get_column4(b, 2)
    b_col3 = get_column4(b, 3)
    row0 = (dot4(a[0], b_col0), dot4(a[0], b_col1), dot4(a[0], b_col2), dot4(a[0], b_col3))
    row1 = (dot4(a[1], b_col0), dot4(a[1], b_col1), dot4(a[1], b_col2), dot4(a[1], b_col3))
    row2 = (dot4(a[2], b_col0), dot4(a[2], b_col1), dot4(a[2], b_col2), dot4(a[2], b_col3))
    row3 = (dot4(a[3], b_col0), dot4(a[3], b_col1), dot4(a[3], b_col2), dot4(a[3], b_col3))
    return (row0, row1, row2, row3)


# ── L56: SE(2)/SE(3) — the group of rigid transformations ──────────────

def transpose3(matrix):
    return (
        (matrix[0][0], matrix[1][0], matrix[2][0]),
        (matrix[0][1], matrix[1][1], matrix[2][1]),
        (matrix[0][2], matrix[1][2], matrix[2][2]),
    )


def invert_rigid_transform(transform):
    rotation = (
        (transform[0][0], transform[0][1], transform[0][2]),
        (transform[1][0], transform[1][1], transform[1][2]),
        (transform[2][0], transform[2][1], transform[2][2]),
    )
    translation = (transform[0][3], transform[1][3], transform[2][3])
    rotation_inverse = transpose3(rotation)
    negated_translation = scale_vector_3d(translation, -1)
    translation_inverse = apply_matrix(rotation_inverse, negated_translation)
    return build_rigid_transform(rotation_inverse, translation_inverse)


# ── L57: transformation hierarchies ─────────────────────────────────────

def find_node(hierarchy, name):
    for node in hierarchy:
        if node[0] == name:
            return node
    return None


def get_world_transform(hierarchy, node_name):
    chain = []
    current_name = node_name
    while current_name is not None:
        node = find_node(hierarchy, current_name)
        chain.append(node[1])
        current_name = node[2]
    result = chain[len(chain) - 1]
    i = len(chain) - 2
    while i >= 0:
        result = multiply_matrices4(result, chain[i])
        i = i - 1
    return result


# ── L58: cameras as coordinate transformations ──────────────────────────

def world_to_camera(camera_world_transform, point_world):
    view_transform = invert_rigid_transform(camera_world_transform)
    return apply_matrix4(view_transform, to_homogeneous_3d(point_world))


# ── L59: perspective projection ─────────────────────────────────────────

def build_perspective_matrix(focal_length):
    f = focal_length
    return (
        (f, 0, 0, 0),
        (0, f, 0, 0),
        (0, 0, 1, 0),
        (0, 0, -1, 0),
    )


def perspective_divide(point_h):
    w = point_h[3]
    return (point_h[0] / w, point_h[1] / w, point_h[2] / w)


def project_point(point_camera, focal_length):
    matrix = build_perspective_matrix(focal_length)
    raw = apply_matrix4(matrix, point_camera)
    return perspective_divide(raw)


# ── L60: orthographic projection ────────────────────────────────────────

def build_orthographic_matrix(scale):
    s = scale
    return (
        (s, 0, 0, 0),
        (0, s, 0, 0),
        (0, 0, 1, 0),
        (0, 0, 0, 1),
    )


def project_point_orthographic(point_camera, scale):
    matrix = build_orthographic_matrix(scale)
    raw = apply_matrix4(matrix, point_camera)
    return perspective_divide(raw)


# ── L61: view frustums ───────────────────────────────────────────────────

def is_in_frustum(point_camera, near, far, vertical_half_fov_degrees, aspect_ratio):
    x, y, z = point_camera
    depth = -z
    if depth < near:
        return False
    if depth > far:
        return False
    vertical_limit = math.tan(math.radians(vertical_half_fov_degrees))
    horizontal_limit = vertical_limit * aspect_ratio
    if abs(y / depth) > vertical_limit:
        return False
    if abs(x / depth) > horizontal_limit:
        return False
    return True


# ── L62: clipping planes ────────────────────────────────────────────────

def point_on_segment_3d(p1, p2, t):
    direction = subtract_points_3d(p2, p1)
    return add_vector_to_point_3d(p1, scale_vector_3d(direction, t))


def clip_segment_to_near(p1, p2, near):
    depth1 = -p1[2]
    depth2 = -p2[2]
    if depth1 >= near and depth2 >= near:
        return (p1, p2)
    if depth1 < near and depth2 < near:
        return None
    t = (near - depth1) / (depth2 - depth1)
    new_point = point_on_segment_3d(p1, p2, t)
    if depth1 < near:
        return (new_point, p2)
    else:
        return (p1, new_point)


# ── L63: 3D lines and planes ─────────────────────────────────────────────

def point_on_line_3d(line_point, line_direction, t):
    return add_vector_to_point_3d(line_point, scale_vector_3d(line_direction, t))


def is_point_on_plane(point, plane, tolerance):
    point_on_plane, normal = plane
    offset = subtract_points_3d(point, point_on_plane)
    return nearly_equal(dot3(normal, offset), 0, tolerance)


def signed_distance_to_plane(point, plane):
    point_on_plane, normal = plane
    offset = subtract_points_3d(point, point_on_plane)
    return dot3(normal, offset) / norm_3d(normal)


# ── L64: ray-plane intersection ─────────────────────────────────────────

def ray_plane_intersection(ray_origin, ray_direction, plane):
    point_on_plane, normal = plane
    denominator = dot3(normal, ray_direction)
    if nearly_equal(denominator, 0, 0.0000001):
        return "no intersection"
    numerator = dot3(normal, subtract_points_3d(point_on_plane, ray_origin))
    t = numerator / denominator
    if is_t_on_ray(t) == False:
        return "no intersection"
    return point_on_line_3d(ray_origin, ray_direction, t)


# ── L65: ray-triangle intersection ──────────────────────────────────────

def is_point_in_triangle_3d(point, v0, v1, v2, normal):
    edge0 = subtract_points_3d(v1, v0)
    to_point0 = subtract_points_3d(point, v0)
    cross0 = cross_product_3d(edge0, to_point0)
    if dot3(cross0, normal) < 0:
        return False
    edge1 = subtract_points_3d(v2, v1)
    to_point1 = subtract_points_3d(point, v1)
    cross1 = cross_product_3d(edge1, to_point1)
    if dot3(cross1, normal) < 0:
        return False
    edge2 = subtract_points_3d(v0, v2)
    to_point2 = subtract_points_3d(point, v2)
    cross2 = cross_product_3d(edge2, to_point2)
    if dot3(cross2, normal) < 0:
        return False
    return True


def ray_triangle_intersection(ray_origin, ray_direction, v0, v1, v2):
    normal = cross_product_3d(subtract_points_3d(v1, v0), subtract_points_3d(v2, v0))
    plane = (v0, normal)
    hit = ray_plane_intersection(ray_origin, ray_direction, plane)
    if hit == "no intersection":
        return "no intersection"
    if is_point_in_triangle_3d(hit, v0, v1, v2, normal):
        return hit
    return "no intersection"


# ── L66: sphere geometry ─────────────────────────────────────────────────

def classify_point_vs_sphere(point, sphere, tolerance):
    center, radius = sphere
    distance = norm_3d(subtract_points_3d(point, center))
    if nearly_equal(distance, radius, tolerance):
        return "on"
    elif distance < radius:
        return "inside"
    else:
        return "outside"


def sphere_line_intersection(line_point, line_direction, sphere):
    center, radius = sphere
    d = subtract_points_3d(line_point, center)
    a = dot3(line_direction, line_direction)
    b = 2 * dot3(d, line_direction)
    c = dot3(d, d) - radius * radius
    discriminant = b * b - 4 * a * c
    if nearly_equal(discriminant, 0, 0.0000001):
        t = -b / (2 * a)
        return (point_on_line_3d(line_point, line_direction, t),)
    elif discriminant < 0:
        return "no intersection"
    else:
        sqrt_discriminant = math.sqrt(discriminant)
        t1 = (-b - sqrt_discriminant) / (2 * a)
        t2 = (-b + sqrt_discriminant) / (2 * a)
        return (
            point_on_line_3d(line_point, line_direction, t1),
            point_on_line_3d(line_point, line_direction, t2),
        )


# ── L67: box geometry (slab method) ─────────────────────────────────────

def is_point_in_box(point, box):
    min_c, max_c = box
    if point[0] < min_c[0] or point[0] > max_c[0]:
        return False
    if point[1] < min_c[1] or point[1] > max_c[1]:
        return False
    if point[2] < min_c[2] or point[2] > max_c[2]:
        return False
    return True


def slab_narrow(origin_c, direction_c, min_c, max_c, t_near, t_far):
    if direction_c == 0:
        if origin_c < min_c or origin_c > max_c:
            return None
        return (t_near, t_far)
    t1 = (min_c - origin_c) / direction_c
    t2 = (max_c - origin_c) / direction_c
    if t1 > t2:
        t1, t2 = t2, t1
    new_near = max(t_near, t1)
    new_far = min(t_far, t2)
    if new_near > new_far:
        return None
    return (new_near, new_far)


def ray_box_intersection(ray_origin, ray_direction, box):
    min_c, max_c = box
    t_near = -1000000.0
    t_far = 1000000.0

    result_x = slab_narrow(ray_origin[0], ray_direction[0], min_c[0], max_c[0], t_near, t_far)
    if result_x is None:
        return "no intersection"
    t_near, t_far = result_x

    result_y = slab_narrow(ray_origin[1], ray_direction[1], min_c[1], max_c[1], t_near, t_far)
    if result_y is None:
        return "no intersection"
    t_near, t_far = result_y

    result_z = slab_narrow(ray_origin[2], ray_direction[2], min_c[2], max_c[2], t_near, t_far)
    if result_z is None:
        return "no intersection"
    t_near, t_far = result_z

    if t_far < 0:
        return "no intersection"
    t = t_near if t_near >= 0 else t_far
    return point_on_line_3d(ray_origin, ray_direction, t)


# ── Self-check: confirm the library still reproduces known-correct values ──

if __name__ == "__main__":
    checks = []

    checks.append(("L9 norm((3,4))", norm((3, 4)), 5.0))
    checks.append(("L12 transform_to_global", transform_to_global((3, 4), (50, 20), (0, 1), (-1, 0)), (46, 23)))
    checks.append(("L14 apply_matrix", apply_matrix(((0, -1, 50), (1, 0, 20), (0, 0, 1)), (3, 4, 1)), (46, 23, 1)))
    checks.append(("L19 classify_turn", classify_turn((0, 0), (3, 4), (0, 5)), "left"))
    checks.append(("L24 line_intersection", line_intersection((0, 0), (3, 4), (6, 0), (-1, 2)), (3.5999999999999996, 4.8)))
    checks.append(("L30 classify_point_vs_circle", classify_point_vs_circle((3, 4), ((0, 0), 5), 0.0000001), "on"))
    checks.append(("L31 circle_line_intersection (tangent)", circle_line_intersection((-10, 5), (1, 0), ((0, 0), 5)), ((0.0, 5.0),)))
    checks.append(("L32 circle_circle_intersection", circle_circle_intersection(((0, 0), 5), ((6, 0), 5)), ((3.0, -4.0), (3.0, 4.0))))
    checks.append(("L33 polygon_perimeter (rectangle)", polygon_perimeter([(0, 0), (4, 0), (4, 3), (0, 3)]), 14.0))
    checks.append(("L34 polygon_signed_area (notch)", polygon_signed_area([(0, 0), (4, 0), (2, 2), (4, 4), (0, 4)]), 12.0))
    checks.append(("L38 convex_hull (square+interior)", convex_hull([(0, 0), (4, 0), (4, 4), (0, 4), (2, 2)]), [(0, 0), (4, 0), (4, 4), (0, 4)]))
    checks.append(("L41 circumcenter", circumcenter((0, 0), (6, 0), (3, 6)), (3.0, 2.25)))
    checks.append(("L42 triangulate area cross-check", sum(polygon_signed_area(list(t)) for t in triangulate([(0, 0), (4, 0), (2, 2), (4, 4), (0, 4)])), 12.0))
    checks.append(("L44 is_point_in_polygon_robust (notch, fixed)", is_point_in_polygon_robust((1, 2), [(0, 0), (4, 0), (2, 2), (4, 4), (0, 4)]), True))
    checks.append(("L46 from_components_3d (z=0 collapse)", from_components_3d(3, 4, 0, (0, 1, 0), (-1, 0, 0), (0, 0, 1)), (-4, 3, 0)))

    l47_rz = rotate_z((3, 4, 0), 90)
    checks.append(("L47 rotate_z((3,4,0),90) matches L13's (-4,3)",
                    (round(l47_rz[0]), round(l47_rz[1]), l47_rz[2]), (-4, 3, 0)))

    l48_via_matrix = apply_matrix(rotation_matrix_z(90), (3, 4, 0))
    checks.append(("L48 rotation_matrix_z(90) applied to (3,4,0) matches rotate_z",
                    (round(l48_via_matrix[0]), round(l48_via_matrix[1]), l48_via_matrix[2]), (-4, 3, 0)))

    l49_euler = apply_matrix(euler_to_matrix(90, 0, 0), (3, 4, 0))
    checks.append(("L49 euler_to_matrix(90,0,0) collapses to pure yaw, matches rotate_z",
                    (round(l49_euler[0]), round(l49_euler[1]), round(l49_euler[2])), (-4, 3, 0)))

    checks.append(("L50 is_near_gimbal_lock(89.999, 0.01)", is_near_gimbal_lock(89.999, 0.01), True))
    checks.append(("L50 is_near_gimbal_lock(45, 0.01)", is_near_gimbal_lock(45, 0.01), False))

    l51_axis_point = normalize_3d((1, 1, 0))
    l51_fixed = rotate_by_axis_angle(l51_axis_point, (1, 1, 0), 40)
    l51_ok = all(nearly_equal(l51_fixed[i], l51_axis_point[i], 1e-9) for i in range(3))
    checks.append(("L51 rotate_by_axis_angle fixes a point on its own axis", l51_ok, True))

    l52_q = quaternion_from_axis_angle((0, 0, 1), 90)
    l52_rotated = rotate_by_quaternion((3, 4, 0), l52_q)
    l52_ok = (round(l52_rotated[0]), round(l52_rotated[1]), round(l52_rotated[2])) == (-4, 3, 0)
    checks.append(("L52 rotate_by_quaternion(90 about z) matches rotate_z", l52_ok, True))

    l53_qa = quaternion_from_axis_angle((0, 0, 1), 15)
    l53_qb = quaternion_from_axis_angle((0, 0, 1), 50)
    l53_composed = quaternion_multiply(l53_qb, l53_qa)
    l53_direct = quaternion_from_axis_angle((0, 0, 1), 65)
    l53_ok = all(nearly_equal(l53_composed[i], l53_direct[i], 1e-9) for i in range(4))
    checks.append(("L53 composing 15deg then 50deg about same axis matches direct 65deg", l53_ok, True))

    l54_q_identity = quaternion_from_axis_angle((0, 0, 1), 0)
    l54_q_90 = quaternion_from_axis_angle((0, 0, 1), 90)
    l54_mid = slerp(l54_q_identity, l54_q_90, 0.5)
    l54_q_45 = quaternion_from_axis_angle((0, 0, 1), 45)
    l54_ok = all(nearly_equal(l54_mid[i], l54_q_45[i], 1e-9) for i in range(4))
    checks.append(("L54 slerp midpoint between 0deg and 90deg matches direct 45deg", l54_ok, True))

    l55_transform = build_rigid_transform(rotation_matrix_z(90), (50, 20, 15))
    l55_result = apply_matrix4(l55_transform, to_homogeneous_3d((3, 4, 0)))
    l55_ok = (round(l55_result[0]), round(l55_result[1]), l55_result[2]) == (46, 23, 15)
    checks.append(("L55 3D fixture transform matches L12/L14's own (46,23), plus height 15", l55_ok, True))

    l56_t = build_rigid_transform(rotation_matrix_z(40), (10, -5, 8))
    l56_t_inv = invert_rigid_transform(l56_t)
    l56_p = (3, 4, 5)
    l56_forward = apply_matrix4(l56_t, to_homogeneous_3d(l56_p))
    l56_back = apply_matrix4(l56_t_inv, l56_forward)
    l56_ok = all(nearly_equal(l56_back[i], l56_p[i], 1e-6) for i in range(3))
    checks.append(("L56 invert_rigid_transform round-trips a point back to itself", l56_ok, True))

    l57_identity = build_rigid_transform(((1, 0, 0), (0, 1, 0), (0, 0, 1)), (0, 0, 0))
    l57_fixture_to_table = build_rigid_transform(rotation_matrix_z(90), (50, 20, 15))
    l57_tool_to_fixture = build_rigid_transform(rotation_matrix_z(0), (1, 1, 1))
    l57_hierarchy = [
        ("table", l57_identity, None),
        ("fixture", l57_fixture_to_table, "table"),
        ("tool", l57_tool_to_fixture, "fixture"),
    ]
    l57_tool_world = get_world_transform(l57_hierarchy, "tool")
    l57_result = apply_matrix4(l57_tool_world, to_homogeneous_3d((2, 0, 0)))
    l57_ok = all(nearly_equal(l57_result[i], (49.0, 23.0, 16.0)[i], 1e-9) for i in range(3))
    checks.append(("L57 get_world_transform matches L55's own hand-composed tool/fixture/table result", l57_ok, True))

    l58_camera_world = build_rigid_transform(rotation_matrix_x(30), (0, 0, 20))
    l58_cam_in_own_space = world_to_camera(l58_camera_world, (0, 0, 20))
    l58_ok = all(nearly_equal(l58_cam_in_own_space[i], (0, 0, 0)[i], 1e-9) for i in range(3))
    checks.append(("L58 a camera's own position is always the origin in its own camera space", l58_ok, True))

    l59_near = project_point((1, 0, -10, 1), 10)
    l59_far = project_point((1, 0, -20, 1), 10)
    l59_ok = nearly_equal(l59_near[0], 1.0, 1e-9) and nearly_equal(l59_far[0], 0.5, 1e-9)
    checks.append(("L59 a point twice as far projects to half the screen-x", l59_ok, True))

    l60_near = project_point_orthographic((1, 0, -10, 1), 10)
    l60_far = project_point_orthographic((1, 0, -20, 1), 10)
    l60_ok = nearly_equal(l60_near[0], l60_far[0], 1e-9)
    checks.append(("L60 orthographic projection ignores depth: near/far project to the same x", l60_ok, True))

    l61_ok = is_in_frustum((0, 0, -10), 1, 100, 45, 16 / 9) and not is_in_frustum((0, 0, 5), 1, 100, 45, 16 / 9)
    checks.append(("L61 is_in_frustum accepts a point ahead, rejects one behind the camera", l61_ok, True))

    l62_clipped = clip_segment_to_near((0, 0, -0.5), (0, 0, -5), 1)
    l62_ok = l62_clipped is not None and nearly_equal(-l62_clipped[0][2], 1.0, 1e-9)
    checks.append(("L62 clip_segment_to_near produces a new endpoint at exactly the near plane", l62_ok, True))

    l63_near_plane = ((0, 0, -1), (0, 0, 1))
    l63_ok = nearly_equal(signed_distance_to_plane((5, 5, -1), l63_near_plane), 0.0, 1e-9)
    checks.append(("L63 the near-plane boundary is exactly reproducible as a plane, signed_distance=0", l63_ok, True))

    l64_table_plane = ((0, 0, 0), (0, 0, 1))
    l64_hit = ray_plane_intersection((3, 4, 10), (0, 0, -1), l64_table_plane)
    l64_ok = l64_hit == (3.0, 4.0, 0.0)
    checks.append(("L64 ray_plane_intersection hits the table straight down at (3,4,0)", l64_ok, True))

    l65_v0, l65_v1, l65_v2 = (0, 0, 0), (4, 0, 0), (0, 4, 0)
    l65_inside = ray_triangle_intersection((1, 1, 5), (0, 0, -1), l65_v0, l65_v1, l65_v2)
    l65_outside = ray_triangle_intersection((10, 10, 5), (0, 0, -1), l65_v0, l65_v1, l65_v2)
    l65_ok = l65_inside == (1.0, 1.0, 0.0) and l65_outside == "no intersection"
    checks.append(("L65 ray_triangle_intersection distinguishes inside vs outside the triangle", l65_ok, True))

    l66_sphere = ((0, 0, 0), 5)
    l66_result = sphere_line_intersection((0, 0, -10), (0, 0, 1), l66_sphere)
    l66_ok = l66_result == ((0.0, 0.0, -5.0), (0.0, 0.0, 5.0))
    checks.append(("L66 sphere_line_intersection through the center hits at +-radius", l66_ok, True))

    l67_box = ((0, 0, 0), (10, 10, 10))
    l67_hit = ray_box_intersection((5, 5, -10), (0, 0, 1), l67_box)
    l67_ok = l67_hit == (5.0, 5.0, 0.0)
    checks.append(("L67 ray_box_intersection hits an axis-aligned box on its bottom face", l67_ok, True))

    all_passed = True
    for name, actual, expected in checks:
        ok = actual == expected
        if ok == False:
            all_passed = False
        print(name, "->", actual, "OK" if ok else "MISMATCH, expected " + str(expected))

    print("ALL PASSED" if all_passed else "SOME CHECKS FAILED")
