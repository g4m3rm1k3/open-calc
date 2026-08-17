from inventory_cli import load_inventory

def check_load_inventory_accepts_zero_count():
    inventory = load_inventory("inventory_zero.json")
    assert inventory == {"widgets": 0, "gadgets": 8}
    print("check_load_inventory_accepts_zero_count passed")

def check_load_inventory_rejects_negative_count():
    try:
        load_inventory("inventory_negative.json")
        assert False, "expected ValueError, none was raised"
    except ValueError:
        print("check_load_inventory_rejects_negative_count passed")

check_load_inventory_accepts_zero_count()
check_load_inventory_rejects_negative_count()
