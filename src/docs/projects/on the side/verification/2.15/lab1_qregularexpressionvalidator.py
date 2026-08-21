import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import QRegularExpression
from PySide6.QtGui import QRegularExpressionValidator
from PySide6.QtWidgets import QApplication, QLineEdit

app = QApplication([])

field = QLineEdit()
pattern = QRegularExpression("[A-Za-z0-9-]*")
validator = QRegularExpressionValidator(pattern)
field.setValidator(validator)

print(validator.validate("", 0))
print(validator.validate("SN-001", 6))
print(validator.validate("SN 001", 6))
print(field.validator() is validator)
