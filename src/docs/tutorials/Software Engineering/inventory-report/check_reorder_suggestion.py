from inventory_report import reorder_suggestion

def reorder_suggestion_naive(inventory, threshold=3, target=15):
    result = {}
    for name, count in inventory.items():
        if count < threshold:
            result[name] = target - count
    return result

def check_reorder_suggestion_matches_naive():
    inventory = {"widgets": 3, "gadgets": 8}
    real = reorder_suggestion(inventory)
    naive = reorder_suggestion_naive(inventory)
    assert real == naive
    print("check_reorder_suggestion_matches_naive passed")

def check_reorder_suggestion_matches_naive_second_inventory():
    inventory = {"widgets": 2, "gadgets": 5, "gizmos": 8}
    real = reorder_suggestion(inventory, threshold=5)
    naive = reorder_suggestion_naive(inventory, threshold=5)
    assert real == naive
    print("check_reorder_suggestion_matches_naive_second_inventory passed")

check_reorder_suggestion_matches_naive()
check_reorder_suggestion_matches_naive_second_inventory()
