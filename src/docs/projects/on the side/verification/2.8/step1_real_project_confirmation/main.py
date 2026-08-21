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


def main() -> int:
    app = QApplication(sys.argv)
    window = QMainWindow()
    window.setWindowTitle("Asset Manager")

    button = QPushButton("Add Asset")
    search_box = QLineEdit()
    search_box.setPlaceholderText("Search assets...")
    category_box = QComboBox()
    category_box.addItems(["Laptop", "Monitor", "Keyboard", "Mouse", "Other"])

    search_row = QHBoxLayout()
    search_row.addWidget(search_box)
    search_row.addWidget(category_box)

    main_layout = QVBoxLayout()
    main_layout.addLayout(search_row)
    main_layout.addWidget(button)

    central = QWidget()
    central.setLayout(main_layout)
    window.setCentralWidget(central)

    window.show()
    return app.exec()


if __name__ == "__main__":
    sys.exit(main())
