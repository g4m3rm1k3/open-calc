from hypothesis import given, seed, strategies as st
from inventory_report import reorder_suggestion

def combine_threshold_and_gap(threshold_and_gap):
    threshold, gap = threshold_and_gap
    return (threshold, threshold + gap)

valid_threshold_target_pairs = st.tuples(
    st.integers(min_value=0, max_value=100),
    st.integers(min_value=1, max_value=100),
).map(combine_threshold_and_gap)

@seed(20260817)
@given(
    inventory=st.dictionaries(
        st.text(alphabet="abcdefghij", min_size=1, max_size=8),
        st.integers(min_value=0, max_value=1000),
        max_size=5,
    ),
    threshold_target=valid_threshold_target_pairs,
)
def check_reorder_quantities_always_positive(inventory, threshold_target):
    threshold, target = threshold_target
    suggestions = reorder_suggestion(inventory, threshold=threshold, target=target)
    for name, qty in suggestions.items():
        assert qty > 0

check_reorder_quantities_always_positive()
print("check_reorder_quantities_always_positive passed")
