import sys

from PySide6.QtWidgets import (
    QApplication,
    QComboBox,
    QHBoxLayout,
    QLineEdit,
    QMainWindow,
    QPushButton,
    QVBoxLayout,
    QWidget,
)

from asset_manager.domain.asset import Asset, InvalidAssetError
from asset_manager.domain.owner import Owner

from .asset_editor import AssetEditor

PLACEHOLDER_OWNER = Owner("Unassigned", "unassigned@example.com")


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("Asset Manager")

        self.button = QPushButton("Add Asset")
        self.button.clicked.connect(self.open_asset_editor)

        self.search_box = QLineEdit()
        self.search_box.setPlaceholderText("Search assets...")
        self.search_box.textChanged.connect(self.on_search_text_changed)
        self.category_box = QComboBox()
        self.category_box.addItems(["Laptop", "Monitor", "Keyboard", "Mouse", "Other"])

        search_row = QHBoxLayout()
        search_row.addWidget(self.search_box)
        search_row.addWidget(self.category_box)

        main_layout = QVBoxLayout()
        main_layout.addLayout(search_row)
        main_layout.addWidget(self.button)

        central = QWidget()
        central.setLayout(main_layout)
        self.setCentralWidget(central)

        self.editor = None
        self.current_search_text = ""
        self.submitted_assets = []
        self.validation_errors = []

    def open_asset_editor(self) -> None:
        self.editor = AssetEditor()
        self.editor.asset_submitted.connect(self.on_asset_submitted)
        self.editor.show()

    def on_search_text_changed(self, new_text: str) -> None:
        self.current_search_text = new_text

    def on_asset_submitted(self, name: str, serial_number: str, category: str) -> None:
        try:
            asset = Asset(name, serial_number, category, PLACEHOLDER_OWNER)
        except InvalidAssetError as error:
            self.validation_errors.append(error)
            return
        self.submitted_assets.append(asset)


def main() -> int:
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    return app.exec()


if __name__ == "__main__":
    sys.exit(main())
