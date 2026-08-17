import inventory_report

def stub_reorder_suggestion(inventory, threshold, target):
    return {"zzz_item": 5, "aaa_item": 10}

# Regression test: Lesson 125 found build_reorder_report echoing
# reorder_suggestion's own unsorted dict order, disagreeing with
# restock_alert's alphabetical convention. This pins down sorted
# output regardless of what order the underlying dict happens to be in.
def check_build_reorder_report_sorts_regardless_of_stub_order():
    real_reorder_suggestion = inventory_report.reorder_suggestion
    inventory_report.reorder_suggestion = stub_reorder_suggestion
    try:
        result = inventory_report.build_reorder_report({}, threshold=1, target=2)
        assert result == ["aaa_item: reorder 10", "zzz_item: reorder 5"]
    finally:
        inventory_report.reorder_suggestion = real_reorder_suggestion
    print("check_build_reorder_report_sorts_regardless_of_stub_order passed")

def stub_reorder_suggestion_empty(inventory, threshold, target):
    return {}

def check_build_reorder_report_handles_empty_suggestions():
    real_reorder_suggestion = inventory_report.reorder_suggestion
    inventory_report.reorder_suggestion = stub_reorder_suggestion_empty
    try:
        result = inventory_report.build_reorder_report({}, threshold=1, target=2)
        assert result == []
    finally:
        inventory_report.reorder_suggestion = real_reorder_suggestion
    print("check_build_reorder_report_handles_empty_suggestions passed")

check_build_reorder_report_sorts_regardless_of_stub_order()
check_build_reorder_report_handles_empty_suggestions()
