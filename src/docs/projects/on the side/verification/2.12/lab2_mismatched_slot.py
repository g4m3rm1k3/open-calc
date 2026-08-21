import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication, QLineEdit

app = QApplication([])

field = QLineEdit()

calls = []


def on_text_changed_no_args():
    calls.append("called")


field.textChanged.connect(on_text_changed_no_args)

field.setText("a")

print(calls)
