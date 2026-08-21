import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication, QPushButton

app = QApplication([])

button = QPushButton("Delete")

deleted = []


def delete_item(name):
    deleted.append(name)


button.clicked.connect(lambda: delete_item("ThinkPad X1"))

button.click()
print(deleted)
