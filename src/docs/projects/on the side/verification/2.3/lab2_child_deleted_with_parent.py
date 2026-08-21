import gc
import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import QObject

parent = QObject()
child = QObject(parent)

print("child created, parent() is parent:", child.parent() is parent)

del parent
gc.collect()

try:
    print(child.objectName())
    print("child still usable after parent deleted")
except RuntimeError as error:
    print(f"RuntimeError: {error}")
