from inventory_report import low_stock_items

def check_low_stock_items():
    inventory = {"widgets": 2, "gadgets": 5, "gizmos": 8}
    result = low_stock_items(inventory, threshold=5)
    assert result == ["widgets"]
    print("check_low_stock_items passed")

# Regression test: Lesson 131's own mutation test found that every
# existing check happened to use inventories with only one qualifying
# item, so removing low_stock_items' sorted() call was never noticed.
# This uses two items, deliberately out of order, to actually verify it.
def check_low_stock_items_returns_sorted_names():
    inventory = {"zebra": 1, "apple": 2}
    result = low_stock_items(inventory, threshold=5)
    assert result == ["apple", "zebra"]
    print("check_low_stock_items_returns_sorted_names passed")

check_low_stock_items()
check_low_stock_items_returns_sorted_names()
