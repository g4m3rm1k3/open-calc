import inventory_report

def make_recording_low_stock_items():
    calls = []
    def mock_low_stock_items(inventory, threshold):
        calls.append((inventory, threshold))
        return ["fake_item"]
    mock_low_stock_items.calls = calls
    return mock_low_stock_items

def check_restock_alert_calls_low_stock_items_correctly():
    real_low_stock_items = inventory_report.low_stock_items
    mock = make_recording_low_stock_items()
    inventory_report.low_stock_items = mock
    try:
        sample_inventory = {"widgets": 2}
        result = inventory_report.restock_alert(sample_inventory, threshold=5)
        assert result == ["fake_item"]
        assert mock.calls == [(sample_inventory, 5)]
    finally:
        inventory_report.low_stock_items = real_low_stock_items
    print("check_restock_alert_calls_low_stock_items_correctly passed")

check_restock_alert_calls_low_stock_items_correctly()
