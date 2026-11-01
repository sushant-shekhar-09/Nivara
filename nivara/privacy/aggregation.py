"""
Privacy-Aware Aggregate Analytics Module for Nivara AI.
Implements Minimum-Group-Size Suppression for higher-education institutional reporting.
NOTE: This is minimum-group-size suppression to prevent cell re-identification,
NOT a formal k-anonymity quasi-identifier equivalence class algorithm.
"""

from typing import Dict, Any, List, Optional
import pandas as pd

MINIMUM_GROUP_SIZE_THRESHOLD = 5

def apply_minimum_group_suppression(
    df: pd.DataFrame,
    group_col: str,
    metric_cols: List[str],
    min_size: int = MINIMUM_GROUP_SIZE_THRESHOLD
) -> List[Dict[str, Any]]:
    """
    Aggregates dataframe by group_col and applies cell suppression to any group
    with total sample count < min_size, preventing individual student re-identification.
    """
    records = []
    grouped = df.groupby(group_col)
    
    for group_name, group_df in grouped:
        n_count = len(group_df)
        
        if n_count < min_size:
            # Cell suppression applied
            row_dict = {
                group_col: group_name,
                "sample_size": n_count,
                "status": "SUPPRESSED",
                "suppression_reason": f"Minimum group size threshold violated (N = {n_count} < {min_size})."
            }
            for col in metric_cols:
                row_dict[f"{col}_mean"] = None
                row_dict[f"{col}_elevated_pct"] = None
        else:
            row_dict = {
                group_col: group_name,
                "sample_size": n_count,
                "status": "REPORTABLE",
                "suppression_reason": None
            }
            for col in metric_cols:
                row_dict[f"{col}_mean"] = round(float(group_df[col].mean()), 2)
                if col in ["elevated_depression", "elevated_anxiety"]:
                    row_dict[f"{col}_elevated_pct"] = round(float(group_df[col].mean() * 100), 2)
                    
        records.append(row_dict)
        
    return records
