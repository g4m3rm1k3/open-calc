import os

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtCore import QObject, Signal
from PySide6.QtWidgets import QApplication

app = QApplication([])


class Doorbell(QObject):
    pressed = Signal(str)


visits = []


def on_pressed(visitor_name):
    visits.append(f"door opened for {visitor_name}")


doorbell = Doorbell()
doorbell.pressed.connect(on_pressed)

print(visits)
print(type(doorbell.pressed))

doorbell.pressed.emit("Ada")

print(visits)
