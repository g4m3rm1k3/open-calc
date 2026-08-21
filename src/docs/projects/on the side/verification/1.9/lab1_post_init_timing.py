from dataclasses import dataclass


@dataclass
class Loud:
    value: int

    def __post_init__(self):
        print(f"post_init running, self.value is already {self.value}")


print("before construction")
loud = Loud(42)
print("after construction")
