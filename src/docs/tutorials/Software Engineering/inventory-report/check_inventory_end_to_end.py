import subprocess
import os

CHECK_DIR = os.path.dirname(os.path.abspath(__file__))

def check_inventory_end_to_end_rejects_bad_data():
    result = subprocess.run(
        ["python3", "inventory_cli.py", "inventory_bad.json", "5"],
        capture_output=True,
        text=True,
        cwd=CHECK_DIR,
    )
    assert result.returncode == 1
    assert result.stdout == ""
    assert "gadgets" in result.stderr
    print("check_inventory_end_to_end_rejects_bad_data passed")

check_inventory_end_to_end_rejects_bad_data()
