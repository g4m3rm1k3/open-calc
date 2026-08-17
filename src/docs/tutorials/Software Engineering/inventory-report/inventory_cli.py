import sys
import json
from inventory_report import low_stock_items

def parse_inventory(f):
    inventory = json.load(f)
    if not isinstance(inventory, dict):
        raise ValueError("inventory file must contain a JSON object, got: " + repr(inventory))
    for name, count in inventory.items():
        if not isinstance(count, int):
            raise ValueError("inventory count for " + name + " is not a number: " + repr(count))
        if count < 0:
            raise ValueError("inventory count for " + name + " cannot be negative: " + repr(count))
    return inventory

def load_inventory(path):
    """Load an inventory from a JSON file at path.

    Contract:
    - Returns a dict mapping item name (str) to count (int, >= 0).
    - Raises ValueError if the file's own top-level JSON is not an
      object, or if any count is not an int, or is negative.
    This contract must hold regardless of load_inventory's own
    internal implementation.
    """
    with open(path) as f:
        return parse_inventory(f)

def main():
    inventory = load_inventory(sys.argv[1])
    threshold = int(sys.argv[2])
    for name in low_stock_items(inventory, threshold):
        print(name)

if __name__ == "__main__":
    main()
