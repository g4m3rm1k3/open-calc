import subprocess
import os

CHECK_DIR = os.path.dirname(os.path.abspath(__file__))

def check_inventory_cli():
    result = subprocess.run(
        ["python3", "inventory_cli.py", "inventory.json", "5"],
        capture_output=True,
        text=True,
        cwd=CHECK_DIR,
    )
    assert result.returncode == 0
    assert result.stdout == "widgets\n"
    print("check_inventory_cli passed")

check_inventory_cli()
