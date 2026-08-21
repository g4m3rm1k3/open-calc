import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication, QPushButton

app = QApplication([])

names = ["ThinkPad X1", "Dell Monitor", "Logitech Mouse"]
buttons = []
clicked_names = []

for name in names:
    button = QPushButton(f"Delete {name}")
    button.clicked.connect(lambda: clicked_names.append(name))
    buttons.append(button)

for button in buttons:
    button.click()

print(clicked_names)
