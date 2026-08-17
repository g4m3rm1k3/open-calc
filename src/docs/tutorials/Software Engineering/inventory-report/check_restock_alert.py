from inventory_report import restock_alert

def check_restock_alert():
    inventory = {"widgets": 2, "gadgets": 5, "gizmos": 8}
    result = restock_alert(inventory, threshold=5)
    assert result == ["widgets"]
    print("check_restock_alert passed")

check_restock_alert()
