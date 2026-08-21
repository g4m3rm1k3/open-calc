from asset_manager.domain.asset import Asset
from asset_manager.domain.owner import Owner

jane = Owner("Jane Doe", "jane.doe@example.com")
laptop = Asset("ThinkPad X1", jane)
print(laptop)
