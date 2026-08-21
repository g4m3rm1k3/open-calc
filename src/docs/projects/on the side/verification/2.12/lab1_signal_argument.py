import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication, QLineEdit

app = QApplication([])

field = QLineEdit()

received = []


def on_text_changed(new_text):
    received.append(new_text)


field.textChanged.connect(on_text_changed)

field.setText("a")
field.setText("as")
field.setText("ass")

print(received)
