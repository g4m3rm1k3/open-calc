import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import QObject

parent = QObject()
child = QObject(parent)

print(child.parent() is parent)
print(parent.children())
