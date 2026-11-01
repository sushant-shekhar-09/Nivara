import pandas as pd
from pathlib import Path

# Xinxiang
xinxiang_dir = Path("data/raw/10423537_xinxiang")
for f in ["demographic.csv", "phq9.csv", "gad7.csv", "pss.csv", "isi.csv"]:
    p = xinxiang_dir / f
    df = pd.read_csv(p)
    print(f"\n--- Xinxiang {f} ({df.shape}) ---")
    print("Cols:", list(df.columns))
    print("Head:\n", df.head(1).to_dict(orient="records"))

# UK
uk_file = Path("data/raw/24052236_uk/Akram et al 2023 Student MH Data UK SciData.xlsx")
df_uk = pd.read_excel(uk_file)
print(f"\n--- UK SciData ({df_uk.shape}) ---")
print("Cols sample (first 30):", list(df_uk.columns)[:30])
gad_cols = [c for c in df_uk.columns if "gad" in c.lower()]
phq_cols = [c for c in df_uk.columns if "phq" in c.lower()]
pss_cols = [c for c in df_uk.columns if "pss" in c.lower()]
print("UK GAD cols:", gad_cols)
print("UK PHQ cols:", phq_cols)
print("UK PSS cols:", pss_cols)
