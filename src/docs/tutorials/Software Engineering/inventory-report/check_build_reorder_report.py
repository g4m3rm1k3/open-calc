from inventory_report import build_reorder_report

def check_build_reorder_report():
    lines = build_reorder_report({"widgets": 2, "gadgets": 8}, threshold=5, target=15)
    assert lines == ["widgets: reorder 13"]
    print("check_build_reorder_report passed")

check_build_reorder_report()

def check_build_reorder_report_rejects_target_below_threshold():
    try:
        build_reorder_report({"widgets": 3, "gadgets": 8}, threshold=5, target=2)
        assert False, "expected ValueError, none was raised"
    except ValueError:
        print("check_build_reorder_report_rejects_target_below_threshold passed")

check_build_reorder_report_rejects_target_below_threshold()
