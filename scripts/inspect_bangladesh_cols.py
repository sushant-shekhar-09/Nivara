import pandas as pd
from pathlib import Path

data_dir = Path("data/raw/25771164_bangladesh")

for f in ["Raw Dataset.csv", "Processed.csv", "Anxiety.csv", "Depression.csv", "Stress.csv"]:
    p = data_dir / f
    df = pd.read_csv(p)
    print(f"\n==================== {f} (shape: {df.shape}) ====================")
    print("Columns:", list(df.columns))
    print("\nFirst row sample:")
    print(df.iloc[0].to_dict())
