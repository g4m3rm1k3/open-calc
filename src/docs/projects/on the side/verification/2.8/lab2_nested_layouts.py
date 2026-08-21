import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

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

app = QApplication([])

window = QMainWindow()
search_box = QLineEdit()
search_box.setPlaceholderText("Search assets...")
category_box = QComboBox()
category_box.addItems(["Laptop", "Monitor", "Keyboard", "Mouse", "Other"])
button = QPushButton("Add Asset")

search_row = QHBoxLayout()
search_row.addWidget(search_box)
search_row.addWidget(category_box)

main_layout = QVBoxLayout()
main_layout.addLayout(search_row)
main_layout.addWidget(button)

central = QWidget()
central.setLayout(main_layout)
window.setCentralWidget(central)

print(search_box.parent() is central)
print(category_box.parent() is central)
print(button.parent() is central)
print(main_layout.count())
print(search_row.count())
