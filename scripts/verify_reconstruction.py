import pandas as pd
import numpy as np

# Load Processed.csv
df = pd.read_csv("data/raw/25771164_bangladesh/Processed.csv")
print("Processed shape:", df.shape)

# Let's inspect PSS values range
pss_cols = [f"PSS{i}" for i in range(1, 11)]
gad_cols = [f"GAD{i}" for i in range(1, 8)]
phq_cols = [f"PHQ{i}" for i in range(1, 10)]

print("PSS min/max:")
for col in pss_cols:
    print(f"  {col}: min={df[col].min()}, max={df[col].max()}, unique={sorted(df[col].unique())}")

print("GAD min/max:")
for col in gad_cols:
    print(f"  {col}: min={df[col].min()}, max={df[col].max()}, unique={sorted(df[col].unique())}")

print("PHQ min/max:")
for col in phq_cols:
    print(f"  {col}: min={df[col].min()}, max={df[col].max()}, unique={sorted(df[col].unique())}")

# Reconstruct GAD7: sum(GAD1..7)
gad_reconstructed = df[gad_cols].sum(axis=1)
gad_match = (gad_reconstructed == df["Anxiety Value"]).sum()
gad_mismatch = (gad_reconstructed != df["Anxiety Value"]).sum()
print(f"\nGAD-7 Reconstruction: Exact matches = {gad_match}/{len(df)} ({gad_match/len(df)*100:.2f}%), Mismatches = {gad_mismatch}")
if gad_mismatch > 0:
    mismatch_idx = df[gad_reconstructed != df["Anxiety Value"]].index
    print("GAD mismatch examples:")
    print(df.loc[mismatch_idx[:5], gad_cols + ["Anxiety Value"]])
    print("Reconstructed:", gad_reconstructed.loc[mismatch_idx[:5]])

# Reconstruct PHQ9: sum(PHQ1..9)
phq_reconstructed = df[phq_cols].sum(axis=1)
phq_match = (phq_reconstructed == df["Depression Value"]).sum()
phq_mismatch = (phq_reconstructed != df["Depression Value"]).sum()
print(f"\nPHQ-9 Reconstruction: Exact matches = {phq_match}/{len(df)} ({phq_match/len(df)*100:.2f}%), Mismatches = {phq_mismatch}")
if phq_mismatch > 0:
    mismatch_idx = df[phq_reconstructed != df["Depression Value"]].index
    print("PHQ mismatch examples:")
    print(df.loc[mismatch_idx[:5], phq_cols + ["Depression Value"]])
    print("Reconstructed:", phq_reconstructed.loc[mismatch_idx[:5]])

# Reconstruct PSS with reverse scoring of 5, 6, 7, 8 (assuming 0-4 scale: reverse = 4 - x)
pss_reconstructed_rev5678 = (
    df["PSS1"] + df["PSS2"] + df["PSS3"] + df["PSS4"]
    + (4 - df["PSS5"])
    + (4 - df["PSS6"])
    + (4 - df["PSS7"])
    + (4 - df["PSS8"])
    + df["PSS9"] + df["PSS10"]
)

# Also test straight sum (no reverse)
pss_straight_sum = df[pss_cols].sum(axis=1)

# Also test Cohen standard 4, 5, 7, 8 reverse
pss_rev4578 = (
    df["PSS1"] + df["PSS2"] + df["PSS3"]
    + (4 - df["PSS4"])
    + (4 - df["PSS5"])
    + df["PSS6"]
    + (4 - df["PSS7"])
    + (4 - df["PSS8"])
    + df["PSS9"] + df["PSS10"]
)

print(f"\nPSS with reverse 5,6,7,8: Exact matches = {(pss_reconstructed_rev5678 == df['Stress Value']).sum()}/{len(df)}")
print(f"PSS straight sum (no reverse): Exact matches = {(pss_straight_sum == df['Stress Value']).sum()}/{len(df)}")
print(f"PSS reverse 4,5,7,8: Exact matches = {(pss_rev4578 == df['Stress Value']).sum()}/{len(df)}")

diff_rev5678 = pss_reconstructed_rev5678 - df["Stress Value"]
print("\nDifference distribution (reconstructed_rev5678 - Stress Value):")
print(diff_rev5678.value_counts().head(10))

print("\nSample comparisons (first 5 rows):")
for i in range(5):
    row = df.iloc[i]
    print(f"Row {i}: PSS items={[row[c] for c in pss_cols]} | Reconstructed rev5678={pss_reconstructed_rev5678.iloc[i]} | Straight sum={pss_straight_sum.iloc[i]} | Supplied Stress Value={row['Stress Value']}")
