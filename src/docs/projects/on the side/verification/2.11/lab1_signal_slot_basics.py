import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication, QPushButton

app = QApplication([])

button = QPushButton("Click me")

clicks = []


def on_clicked():
    clicks.append("clicked!")


button.clicked.connect(on_clicked)

print(clicks)
button.click()
print(clicks)
button.click()
print(clicks)
