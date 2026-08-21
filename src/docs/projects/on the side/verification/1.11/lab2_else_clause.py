def bad_version(values):
    try:
        first = values[0]
        second = values[1]
    except IndexError:
        return "no first element"
    return f"{first}, {second}"


def good_version(values):
    try:
        first = values[0]
    except IndexError:
        return "no first element"
    else:
        second = values[1]
        return f"{first}, {second}"


print(bad_version([1]))
print(good_version([1]))
