from inventory_report import low_stock_across_stores

# Regression test: Lesson 136 found that every existing check for this
# function used hand-typed store data with perfectly consistent, single-
# case item names, so a real-world data-entry inconsistency (the same
# item logged under different casing by two different stores) was never
# exercised. This uses a deliberately messier, more realistic fixture to
# verify the two spellings collapse into one entry instead of two.
def check_low_stock_across_stores_dedupes_case_variants():
    store_alpha = {"widgets": 2, "gadgets": 8}
    store_beta = {"gizmos": 1, "sprockets": 9}
    store_gamma = {"Widgets": 1, "bolts": 0}
    names = low_stock_across_stores([store_alpha, store_beta, store_gamma], threshold=3)
    assert names == ["bolts", "gizmos", "widgets"], names
    print("check_low_stock_across_stores_dedupes_case_variants passed")

check_low_stock_across_stores_dedupes_case_variants()
