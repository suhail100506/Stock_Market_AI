# StockSense-AI: ML Dataset Storage Directory

This directory stores historical market datasets and partitioned CSV splits created by `ml/create_ml_dataset.py` and `ml/preprocessing.py`:

- `{SYMBOL}_train_2018_2023.csv`: Chronological In-Sample Training partition (2018-2023).
- `{SYMBOL}_val_2024.csv`: Chronological Out-of-Time Validation partition (2024).
- `{SYMBOL}_test_2025.csv`: Chronological Out-of-Sample Forward Test partition (2025).
- `{SYMBOL}_full_ml_dataset.csv`: Complete historical dataset with all computed features and target labels.

To generate or refresh dataset files:
```bash
python -m ml.create_ml_dataset
```
