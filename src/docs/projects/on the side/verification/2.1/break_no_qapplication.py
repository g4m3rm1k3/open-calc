import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QMainWindow

window = QMainWindow()
