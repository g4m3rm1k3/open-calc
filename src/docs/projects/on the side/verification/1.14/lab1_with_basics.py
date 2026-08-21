with open("throwaway.txt", "w") as f:
    f.write("hello")
    print(f.closed)

print(f.closed)
