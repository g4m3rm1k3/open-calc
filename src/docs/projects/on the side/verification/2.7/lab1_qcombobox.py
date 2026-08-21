import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication, QComboBox, QMainWindow

app = QApplication([])

window = QMainWindow()
category_box = QComboBox(window)
category_box.addItems(["Laptop", "Monitor", "Keyboard", "Mouse", "Other"])

print(category_box.count())
print(category_box.currentText())
print(category_box.itemText(1))

category_box.setCurrentIndex(1)
print(category_box.currentText())
