import gc
import os
import weakref

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtGui import QAction
from PySide6.QtWidgets import QApplication, QMainWindow

app = QApplication([])

window = QMainWindow()

triggers = []
action_ref = None


def on_new_triggered():
    triggers.append("new")


def build_menu():
    global action_ref
    menu_bar = window.menuBar()
    file_menu = menu_bar.addMenu("&File")

    new_action = QAction("&New", window)
    new_action.triggered.connect(on_new_triggered)
    file_menu.addAction(new_action)

    edit_action = QAction("&Edit", window)
    edit_action.setEnabled(False)
    file_menu.addAction(edit_action)

    action_ref = weakref.ref(new_action)
    return file_menu, new_action, edit_action


file_menu, new_action, edit_action = build_menu()

print(type(file_menu))
print(new_action.isEnabled())
print(edit_action.isEnabled())

del new_action, edit_action
gc.collect()

print(action_ref())
print(action_ref().parent() is window)

print(triggers)
action_ref().trigger()
print(triggers)
