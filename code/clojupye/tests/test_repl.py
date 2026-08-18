from clojupye.repl import run_repl


def test_help_command_lists_both_commands(monkeypatch, capsys):
    lines = iter([":help", ":quit"])
    monkeypatch.setattr("builtins.input", lambda prompt="": next(lines))

    run_repl()

    output = capsys.readouterr().out
    assert ":help  show this message" in output
    assert ":quit  exit the REPL" in output
