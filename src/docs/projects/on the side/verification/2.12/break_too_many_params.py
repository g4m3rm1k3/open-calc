import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication, QLineEdit

app = QApplication([])

field = QLineEdit()


def on_text_changed_too_many(new_text, extra_required_arg):
    print(new_text, extra_required_arg)


field.textChanged.connect(on_text_changed_too_many)

field.setText("a")
