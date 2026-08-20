from typing import Union


def stringify(value: Union[int, str]) -> str:
    return str(value)


print(stringify(5))
print(stringify("hi"))
print(stringify.__annotations__)
