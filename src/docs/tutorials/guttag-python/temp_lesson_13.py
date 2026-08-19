def factorial(n):
    if n == 0:          # base case
        return 1
    else:               # recursive case
        return n * factorial(n - 1)

print("--- factorial ---")
print(factorial(5))   # 120
print(factorial(0))   # 1
print(factorial(1))   # 1

def bad_factorial(n):
    return n * bad_factorial(n - 1)  # no base case!

print("--- bad_factorial ---")
try:
    bad_factorial(5)
except Exception as e:
    print(f"{type(e).__name__}: {e}")
    
def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

print("--- fib ---")
print(fib(0))   # 0
print(fib(1))   # 1
print(fib(10))  # 55
print(fib(30))  # 832040

def my_sum(lst):
    if len(lst) == 0:      # base case: empty list
        return 0
    return lst[0] + my_sum(lst[1:])  # recursive case

print("--- my_sum ---")
print(my_sum([1, 2, 3, 4]))  # 10
print(my_sum([]))             # 0

def flatten(lst):
    result = []
    for item in lst:
        if isinstance(item, list):
            result.extend(flatten(item))  # recurse on nested list
        else:
            result.append(item)           # base case: not a list
    return result

print("--- flatten ---")
print(flatten([1, [2, 3], [4, [5, 6]], 7]))

def hanoi(n, source, target, aux):
    if n == 1:
        print(f'Move disk 1 from {source} to {target}')
        return
    hanoi(n-1, source, aux, target)   # move n-1 disks to aux
    print(f'Move disk {n} from {source} to {target}')
    hanoi(n-1, aux, target, source)   # move n-1 disks from aux to target

print("--- hanoi ---")
hanoi(3, 'A', 'C', 'B')
