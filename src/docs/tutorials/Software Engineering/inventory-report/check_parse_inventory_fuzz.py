import io
import json
from hypothesis import given, strategies as st
from inventory_cli import parse_inventory

json_like_values = st.one_of(
    st.dictionaries(st.text(min_size=1, max_size=5), st.integers()),
    st.lists(st.integers(), max_size=5),
    st.integers(),
    st.text(),
    st.none(),
    st.booleans(),
)

@given(json_like_values)
def check_parse_inventory_never_crashes_unexpectedly(value):
    fake_file = io.StringIO(json.dumps(value))
    try:
        parse_inventory(fake_file)
    except ValueError:
        pass

check_parse_inventory_never_crashes_unexpectedly()
print("check_parse_inventory_never_crashes_unexpectedly passed")
