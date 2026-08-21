import sys

from PySide6.QtWidgets import QApplication, QMainWindow, QPushButton


def main() -> int:
    app = QApplication(sys.argv)
    window = QMainWindow()
    window.setWindowTitle("Asset Manager")
    button = QPushButton("Add Asset", window)
    window.show()
    return app.exec()


if __name__ == "__main__":
    sys.exit(main())
