import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication

from asset_editor import build_asset_editor

app = QApplication([])

editor = build_asset_editor()

print(editor.windowTitle())
layout = editor.layout()
print(layout.rowCount())
