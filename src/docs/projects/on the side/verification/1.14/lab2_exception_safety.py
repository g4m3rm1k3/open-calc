f = open("throwaway.txt", "w")
try:
    f.write("hello")
    raise ValueError("something went wrong")
except ValueError:
    pass
print(f"manual open/close, still closed? {f.closed}")


try:
    with open("throwaway.txt", "w") as g:
        g.write("hello")
        raise ValueError("something went wrong")
except ValueError:
    pass
print(f"with statement, still closed? {g.closed}")
