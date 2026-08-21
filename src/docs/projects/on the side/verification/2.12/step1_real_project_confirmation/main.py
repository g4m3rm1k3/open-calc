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

from asset_editor import build_asset_editor


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

    def open_asset_editor(self) -> None:
        self.editor = build_asset_editor()
        self.editor.show()

    def on_search_text_changed(self, new_text: str) -> None:
        self.current_search_text = new_text


def main() -> int:
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    return app.exec()


if __name__ == "__main__":
    sys.exit(main())
