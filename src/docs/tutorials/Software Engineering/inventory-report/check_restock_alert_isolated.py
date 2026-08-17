import inventory_report

def fake_low_stock_items(inventory, threshold):
    return ["fake_item"]

def check_restock_alert_isolated():
    real_low_stock_items = inventory_report.low_stock_items
    inventory_report.low_stock_items = fake_low_stock_items
    try:
        result = inventory_report.restock_alert({}, threshold=5)
        assert result == ["fake_item"]
    finally:
        inventory_report.low_stock_items = real_low_stock_items
    print("check_restock_alert_isolated passed")

check_restock_alert_isolated()
