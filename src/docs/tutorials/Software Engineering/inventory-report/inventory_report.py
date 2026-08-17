def low_stock_items(inventory, threshold=3):
    """Return names of items strictly below the given threshold."""
    low = []
    for name, count in inventory.items():
        if count < threshold:
            low.append(name)
    return sorted(low)

def restock_alert(inventory, threshold=3):
    return [name for name in low_stock_items(inventory, threshold)]

def reorder_suggestion(inventory, threshold=3, target=15):
    if target <= threshold:
        raise ValueError("target must be greater than threshold")
    return {name: target - count for name, count in inventory.items() if count < threshold}

def format_reorder_line(name: str, qty: int) -> str:
    return name + ": reorder " + str(qty)

def format_reorder_line_priced(name: str, qty: int, unit_cost: float) -> str:
    return name + ": reorder " + str(qty) + " units at $" + str(unit_cost)

def build_reorder_report(inventory, threshold=3, target=15):
    suggestions = reorder_suggestion(inventory, threshold, target)
    lines = []
    for name, qty in sorted(suggestions.items()):
        lines.append(format_reorder_line(name, qty))
    return lines

def apply_reorder(inventory, suggestions):
    for name, qty in suggestions.items():
        inventory[name] = inventory.get(name, 0) + qty
    return inventory

def low_stock_across_stores(store_inventories, threshold=3):
    seen = {}
    for inventory in store_inventories:
        for name in low_stock_items(inventory, threshold):
            key = name.casefold()
            if key not in seen:
                seen[key] = name
    return sorted(seen.values())
