from inventory_report import format_reorder_line_priced

def check_format_reorder_line_priced():
    result = format_reorder_line_priced("widgets", 12, 4.50)
    assert result == "widgets: reorder 12 units at $4.5"
    print("check_format_reorder_line_priced passed")

check_format_reorder_line_priced()
