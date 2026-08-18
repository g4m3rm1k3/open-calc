def run_repl() -> None:
    print("Clojupye REPL")
    while True:
        try:
            line = input("> ")
        except EOFError:
            print()
            break
        except KeyboardInterrupt:
            print()
            continue

        command = line.strip()

        if command == "":
            continue
        elif command == ":quit":
            break
        elif command == ":help":
            print(":help  show this message")
            print(":quit  exit the REPL")
        else:
            print(command)


def main() -> None:
    run_repl()
