def greet(name: str) -> None:
    print(f"Hello, {name}")


def shout(word: str) -> str:
    return word


greet("Ada")
print(shout("hi"))

print(greet.__annotations__)
print(shout.__annotations__)
