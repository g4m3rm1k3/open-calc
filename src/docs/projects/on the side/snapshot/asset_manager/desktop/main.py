import sys

from PySide6.QtWidgets import QApplication, QMainWindow


def main() -> int:
    app = QApplication(sys.argv)
    window = QMainWindow()
    window.setWindowTitle("Asset Manager")
    window.show()
    return app.exec()


if __name__ == "__main__":
    sys.exit(main())
