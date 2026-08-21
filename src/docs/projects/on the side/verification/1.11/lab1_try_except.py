def to_int(value):
    try:
        return int(value)
    except ValueError:
        return None


print(to_int("42"))
print(to_int("not a number"))
