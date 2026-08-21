class ThrowawayAsset:
    def __init__(self, name):
        self.name = name


def retire(asset, on_retired):
    print(f"retiring {asset.name}")
    on_retired(asset)


def log_retirement(asset):
    print(f"LOG: {asset.name} was retired")


laptop = ThrowawayAsset("ThinkPad X1")
retire(laptop, log_retirement)
