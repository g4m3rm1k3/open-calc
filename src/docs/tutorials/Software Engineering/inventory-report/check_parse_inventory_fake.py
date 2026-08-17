import io
from inventory_cli import parse_inventory

def check_parse_inventory_with_fake_file():
    fake_file = io.StringIO('{"widgets": 2, "gadgets": 5}')
    inventory = parse_inventory(fake_file)
    assert inventory == {"widgets": 2, "gadgets": 5}
    print("check_parse_inventory_with_fake_file passed")

def check_parse_inventory_fake_rejects_negative():
    fake_file = io.StringIO('{"widgets": -1}')
    try:
        parse_inventory(fake_file)
        assert False, "expected ValueError, none was raised"
    except ValueError:
        print("check_parse_inventory_fake_rejects_negative passed")

check_parse_inventory_with_fake_file()
check_parse_inventory_fake_rejects_negative()
