import sys

from PySide6.QtWidgets import QApplication, QLineEdit, QMainWindow, QPushButton


def main() -> int:
    app = QApplication(sys.argv)
    window = QMainWindow()
    window.setWindowTitle("Asset Manager")
    button = QPushButton("Add Asset", window)
    search_box = QLineEdit(window)
    search_box.setPlaceholderText("Search assets...")
    window.show()
    return app.exec()


if __name__ == "__main__":
    sys.exit(main())
