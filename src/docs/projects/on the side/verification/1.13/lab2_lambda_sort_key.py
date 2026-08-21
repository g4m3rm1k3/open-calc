class ThrowawayAsset:
    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f"ThrowawayAsset({self.name!r})"


assets = [ThrowawayAsset("Monitor"), ThrowawayAsset("Chair"), ThrowawayAsset("Laptop")]

by_name = sorted(assets, key=lambda a: a.name)
print(by_name)
