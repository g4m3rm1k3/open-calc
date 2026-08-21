from dataclasses import dataclass, field


@dataclass
class Basket:
    items: list = field(default_factory=list)


first_basket = Basket()
first_basket.items.append("apple")
print(first_basket.items)

second_basket = Basket()
print(second_basket.items)

print(first_basket.items is second_basket.items)
