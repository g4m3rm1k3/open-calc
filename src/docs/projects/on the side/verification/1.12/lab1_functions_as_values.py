def shout(message):
    print(message.upper())


print(type(shout))

stored = shout
stored("hello")

actions = [shout, print]
for action in actions:
    action("dispatched")
