import dataclasses

from PySide6.QtCore import QAbstractTableModel, QModelIndex, Qt

from asset_manager.domain.asset import Asset, InvalidAssetError


class AssetTableModel(QAbstractTableModel):
    COLUMN_HEADERS = ["Name", "Serial Number", "Category"]

    def __init__(self, assets: list[Asset], parent=None) -> None:
        super().__init__(parent)
        self._assets = assets

    def rowCount(self, parent=QModelIndex()) -> int:
        return len(self._assets)

    def columnCount(self, parent=QModelIndex()) -> int:
        return len(self.COLUMN_HEADERS)

    def data(self, index, role=Qt.ItemDataRole.DisplayRole):
        asset = self._assets[index.row()]
        column = index.column()
        if role == Qt.ItemDataRole.DisplayRole:
            if column == 0:
                return asset.display_name
            if column == 1:
                return asset.serial_number
            if column == 2:
                return asset.category
            return None
        if role == Qt.ItemDataRole.EditRole:
            if column == 0:
                return asset.name
            if column == 1:
                return asset.serial_number
            if column == 2:
                return asset.category
            return None
        if role == Qt.ItemDataRole.TextAlignmentRole:
            if column == 1:
                return Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter
            return None
        return None

    def flags(self, index):
        return super().flags(index) | Qt.ItemFlag.ItemIsEditable

    def setData(self, index, value, role=Qt.ItemDataRole.EditRole) -> bool:
        if role != Qt.ItemDataRole.EditRole:
            return False
        asset = self._assets[index.row()]
        column = index.column()
        try:
            if column == 0:
                new_asset = dataclasses.replace(asset, name=value)
            elif column == 1:
                new_asset = dataclasses.replace(asset, serial_number=value)
            elif column == 2:
                new_asset = dataclasses.replace(asset, category=value)
            else:
                return False
        except InvalidAssetError:
            return False
        self._assets[index.row()] = new_asset
        self.dataChanged.emit(index, index, [role])
        return True

    def headerData(self, section, orientation, role=Qt.ItemDataRole.DisplayRole):
        if role != Qt.ItemDataRole.DisplayRole:
            return None
        if orientation == Qt.Orientation.Horizontal:
            return self.COLUMN_HEADERS[section]
        return None

    def add_asset(self, asset: Asset) -> None:
        row = len(self._assets)
        self.beginInsertRows(QModelIndex(), row, row)
        self._assets.append(asset)
        self.endInsertRows()
