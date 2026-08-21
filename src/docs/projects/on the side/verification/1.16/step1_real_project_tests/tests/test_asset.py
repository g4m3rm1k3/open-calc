import pytest

from asset_manager.domain.asset import Asset, InvalidAssetError
from asset_manager.domain.owner import Owner


def make_owner():
    return Owner("Jane Doe", "jane.doe@example.com")


def test_asset_creation_stores_all_fields():
    owner = make_owner()
    asset = Asset("ThinkPad X1", "SN-48213", "Laptop", owner)
    assert asset.name == "ThinkPad X1"
    assert asset.serial_number == "SN-48213"
    assert asset.category == "Laptop"
    assert asset.owner == owner
    assert asset.is_retired is False


def test_mark_retired_retires_an_active_asset():
    asset = Asset("ThinkPad X1", "SN-48213", "Laptop", make_owner())
    result = asset.mark_retired()
    assert result is True
    assert asset.is_retired is True


def test_mark_retired_returns_false_when_already_retired():
    asset = Asset("ThinkPad X1", "SN-48213", "Laptop", make_owner())
    asset.mark_retired()
    result = asset.mark_retired()
    assert result is False


def test_blank_name_raises_invalid_asset_error():
    with pytest.raises(InvalidAssetError) as exc_info:
        Asset("   ", "SN-48213", "Laptop", make_owner())
    assert exc_info.value.field == "name"


def test_invalid_asset_error_is_also_a_value_error():
    with pytest.raises(ValueError):
        Asset("", "SN-48213", "Laptop", make_owner())
