from inventory_cli import load_inventory

def check_load_inventory_contract_accepts_good_data():
    inventory = load_inventory("inventory.json")
    assert inventory == {"widgets": 2, "gadgets": 5, "gizmos": 8}
    for count in inventory.values():
        assert isinstance(count, int) and count >= 0
    print("check_load_inventory_contract_accepts_good_data passed")

def check_load_inventory_contract_rejects_non_numeric():
    try:
        load_inventory("inventory_bad.json")
        assert False, "expected ValueError, none was raised"
    except ValueError:
        print("check_load_inventory_contract_rejects_non_numeric passed")

def check_load_inventory_contract_rejects_negative():
    try:
        load_inventory("inventory_negative.json")
        assert False, "expected ValueError, none was raised"
    except ValueError:
        print("check_load_inventory_contract_rejects_negative passed")

check_load_inventory_contract_accepts_good_data()
check_load_inventory_contract_rejects_non_numeric()
check_load_inventory_contract_rejects_negative()
