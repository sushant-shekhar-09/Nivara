import pandas as pd
import json

df = pd.read_csv("data/raw/25771164_bangladesh/Processed.csv").drop_duplicates()
cols = ['Age', 'Gender', 'University', 'Department', 'Academic_Year', 'Current_CGPA', 'waiver_or_scholarship']

feature_meta = {}
for c in cols:
    val_counts = df[c].value_counts().to_dict()
    feature_meta[c] = {
        "dtype": str(df[c].dtype),
        "unique_count": len(val_counts),
        "values": val_counts
    }
    print(f"\nFeature: {c} ({len(val_counts)} unique)")
    for k, v in val_counts.items():
        print(f"  - '{k}': {v} ({v/len(df)*100:.1f}%)")

print("\n--- PSS Items (1..10) Summary ---")
pss_cols = [f"PSS{i}" for i in range(1, 11)]
for c in pss_cols:
    print(f"{c}: min={df[c].min()}, max={df[c].max()}, mean={df[c].mean():.2f}")
