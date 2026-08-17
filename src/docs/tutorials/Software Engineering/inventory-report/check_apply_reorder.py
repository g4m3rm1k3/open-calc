from inventory_report import apply_reorder, low_stock_items

def check_apply_reorder_updates_counts():
    inventory = {"widgets": 2, "gadgets": 8}
    apply_reorder(inventory, {"widgets": 13})
    assert inventory["widgets"] == 15
    print("check_apply_reorder_updates_counts passed")

def check_low_stock_items_still_flags_widgets():
    inventory = {"widgets": 2, "gadgets": 8}
    result = low_stock_items(inventory, threshold=5)
    assert result == ["widgets"]
    print("check_low_stock_items_still_flags_widgets passed")

check_apply_reorder_updates_counts()
check_low_stock_items_still_flags_widgets()
