import subprocess

def check_inventory_cli():
    result = subprocess.run(
        ["python3", "inventory_cli.py", "inventory.json", "5"],
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0
    assert result.stdout == "widgets\n"
    print("check_inventory_cli passed")

check_inventory_cli()
