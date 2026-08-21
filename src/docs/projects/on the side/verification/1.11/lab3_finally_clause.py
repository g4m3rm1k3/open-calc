def process(value):
    print("starting")
    try:
        result = 100 / value
    except ZeroDivisionError:
        print("cannot divide by zero")
        return None
    finally:
        print("cleanup runs no matter what")
    return result


print(process(5))
print(process(0))
