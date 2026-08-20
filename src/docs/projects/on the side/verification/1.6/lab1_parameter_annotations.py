def greet(name: str):
    print(f"Hello, {name}")


greet("Ada")
greet(42)

print(greet.__annotations__)
