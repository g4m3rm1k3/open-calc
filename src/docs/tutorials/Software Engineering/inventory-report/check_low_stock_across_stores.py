from inventory_report import low_stock_across_stores

def check_low_stock_across_stores_message():
    store_a = {"widgets": 2, "gadgets": 8}
    store_b = {"gizmos": 1, "sprockets": 9}
    store_c = {"bolts": 0, "widgets": 5}
    names = low_stock_across_stores([store_a, store_b, store_c], threshold=3)
    message = ", ".join(names)
    assert message == "bolts, gizmos, widgets", message
    print("check_low_stock_across_stores_message passed")

check_low_stock_across_stores_message()
