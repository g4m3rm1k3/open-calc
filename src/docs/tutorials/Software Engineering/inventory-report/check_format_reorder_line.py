from inventory_report import format_reorder_line

def check_format_reorder_line():
    result = format_reorder_line("widgets", 12)
    assert result == "widgets: reorder 12"
    print("check_format_reorder_line passed")

check_format_reorder_line()
