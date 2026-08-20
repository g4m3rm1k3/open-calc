from typing import Optional, Union

print(Optional[str] == Union[str, None])


def username_for_id(user_id: int) -> Optional[str]:
    if user_id == 1:
        return "ada"
    if user_id == 2:
        return "grace"
    return None


print(username_for_id(1))
print(username_for_id(99))
print(username_for_id.__annotations__)
