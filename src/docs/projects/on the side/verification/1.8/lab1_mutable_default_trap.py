def add_item(item, basket=[]):
    basket.append(item)
    return basket


first_call = add_item("apple")
print(first_call)

second_call = add_item("banana")
print(second_call)

print(first_call is second_call)
