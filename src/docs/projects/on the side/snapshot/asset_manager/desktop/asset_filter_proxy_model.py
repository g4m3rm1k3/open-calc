from PySide6.QtCore import QSortFilterProxyModel, Qt


class AssetFilterProxyModel(QSortFilterProxyModel):
    def __init__(self, parent=None) -> None:
        super().__init__(parent)
        self._search_text = ""
        self._category_filter = "All Categories"

    def set_search_text(self, text: str) -> None:
        self._search_text = text
        self.invalidate()

    def set_category_filter(self, category: str) -> None:
        self._category_filter = category
        self.invalidate()

    def filterAcceptsRow(self, source_row, source_parent) -> bool:
        model = self.sourceModel()
        name = model.index(source_row, 0, source_parent).data(Qt.ItemDataRole.DisplayRole) or ""
        category = model.index(source_row, 2, source_parent).data(Qt.ItemDataRole.DisplayRole) or ""

        if self._category_filter != "All Categories" and category != self._category_filter:
            return False

        if self._search_text and self._search_text.lower() not in name.lower():
            return False

        return True
