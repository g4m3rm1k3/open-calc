import sys

from PySide6.QtGui import QAction, QKeySequence
from PySide6.QtWidgets import (
    QAbstractItemView,
    QApplication,
    QComboBox,
    QFormLayout,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QMainWindow,
    QMessageBox,
    QPushButton,
    QTableView,
    QVBoxLayout,
    QWidget,
)

from asset_manager.domain.asset import Asset, InvalidAssetError
from asset_manager.domain.owner import Owner

from .application_state import ApplicationState
from .asset_editor import AssetEditor
from .asset_filter_proxy_model import AssetFilterProxyModel
from .asset_table_model import AssetTableModel
from .category_delegate import CategoryDelegate

PLACEHOLDER_OWNER = Owner("Unassigned", "unassigned@example.com")


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("Asset Manager")

        menu_bar = self.menuBar()
        file_menu = menu_bar.addMenu("&File")

        new_action = QAction("&New", self)
        new_action.setShortcut(QKeySequence(QKeySequence.StandardKey.New))
        new_action.triggered.connect(self.open_asset_editor)
        file_menu.addAction(new_action)

        edit_action = QAction("&Edit", self)
        edit_action.setEnabled(False)
        file_menu.addAction(edit_action)

        delete_action = QAction("&Delete", self)
        delete_action.setEnabled(False)
        file_menu.addAction(delete_action)

        file_menu.addSeparator()

        exit_action = QAction("E&xit", self)
        exit_action.setShortcut(QKeySequence("Ctrl+Q"))
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)

        self.button = QPushButton("Add Asset")
        self.button.clicked.connect(self.open_asset_editor)

        self.search_box = QLineEdit()
        self.search_box.setPlaceholderText("Search assets...")
        self.search_box.textChanged.connect(self.on_search_text_changed)
        self.category_box = QComboBox()
        self.category_box.addItems(["All Categories", "Laptop", "Monitor", "Keyboard", "Mouse", "Other"])
        self.category_box.currentTextChanged.connect(self.on_category_filter_changed)

        search_row = QHBoxLayout()
        search_row.addWidget(self.search_box)
        search_row.addWidget(self.category_box)

        self.state = ApplicationState()
        self.assets_model = AssetTableModel(self.state.assets, self)
        self.proxy_model = AssetFilterProxyModel(self)
        self.proxy_model.setSourceModel(self.assets_model)
        self.assets_table = QTableView()
        self.assets_table.setModel(self.proxy_model)
        self.assets_table.setSelectionBehavior(QAbstractItemView.SelectionBehavior.SelectRows)
        self.assets_table.selectionModel().currentRowChanged.connect(self.on_current_row_changed)
        self.category_delegate = CategoryDelegate(self)
        self.assets_table.setItemDelegateForColumn(2, self.category_delegate)

        self.detail_name_label = QLabel("")
        self.detail_serial_label = QLabel("")
        self.detail_category_label = QLabel("")
        self.detail_owner_label = QLabel("")
        self.detail_status_label = QLabel("")

        detail_layout = QFormLayout()
        detail_layout.addRow("Name:", self.detail_name_label)
        detail_layout.addRow("Serial Number:", self.detail_serial_label)
        detail_layout.addRow("Category:", self.detail_category_label)
        detail_layout.addRow("Owner:", self.detail_owner_label)
        detail_layout.addRow("Status:", self.detail_status_label)

        main_layout = QVBoxLayout()
        main_layout.addLayout(search_row)
        main_layout.addWidget(self.button)
        main_layout.addWidget(self.assets_table)
        main_layout.addLayout(detail_layout)

        central = QWidget()
        central.setLayout(main_layout)
        self.setCentralWidget(central)

        self.editor = None

    def open_asset_editor(self) -> None:
        self.editor = AssetEditor()
        self.editor.asset_submitted.connect(self.on_asset_submitted)
        self.editor.show()

    def on_search_text_changed(self, new_text: str) -> None:
        self.proxy_model.set_search_text(new_text)

    def on_category_filter_changed(self, category: str) -> None:
        self.proxy_model.set_category_filter(category)

    def on_current_row_changed(self, current, previous) -> None:
        if not current.isValid():
            self.detail_name_label.setText("")
            self.detail_serial_label.setText("")
            self.detail_category_label.setText("")
            self.detail_owner_label.setText("")
            self.detail_status_label.setText("")
            return
        source_index = self.proxy_model.mapToSource(current)
        asset = self.state.assets[source_index.row()]
        self.detail_name_label.setText(asset.name)
        self.detail_serial_label.setText(asset.serial_number)
        self.detail_category_label.setText(asset.category)
        self.detail_owner_label.setText(f"{asset.owner.name} ({asset.owner.email})")
        self.detail_status_label.setText("Retired" if asset.is_retired else "Active")

    def on_asset_submitted(self, name: str, serial_number: str, category: str) -> None:
        try:
            asset = Asset(name, serial_number, category, PLACEHOLDER_OWNER)
        except InvalidAssetError as error:
            self.state.validation_errors.append(error)
            QMessageBox.warning(self.editor, "Invalid Asset", str(error))
            return
        self.assets_model.add_asset(asset)
        self.editor.accept()


def main() -> int:
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    return app.exec()


if __name__ == "__main__":
    sys.exit(main())
