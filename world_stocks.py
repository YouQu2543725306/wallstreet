# Install dependencies:
# pip install kagglehub supabase pandas numpy
from supabase import create_client
import kagglehub
from kagglehub import KaggleDatasetAdapter
import pandas as pd
import time
import getpass

# Load Kaggle Dataset 
file_path = "World-Stock-Prices-Dataset.csv"
df = kagglehub.load_dataset(
    KaggleDatasetAdapter.PANDAS,
    "nelgiriyewithana/world-stock-prices-daily-updating",
    file_path,
)

print("Dataset loaded successfully!")
print("First 5 records:", df.head())
print(df.info())

# Clean & Transform Data 
# Normalize column names
df.columns = [c.lower().replace(" ", "_") for c in df.columns]

# Drop unused column
if "capital_gains" in df.columns:
    df = df.drop(columns=["capital_gains"])

# Convert date to UTC then extract date only
df["date"] = pd.to_datetime(df["date"], errors="coerce", utc=True).dt.date.astype(str)

# Convert volume to integer
df["volume"] = df["volume"].astype(int)

# Drop any remaining NaNs
df = df.dropna()

print("\n Cleaned Data Info:")
print(df.info())
print(df.head())

# Connect to Supabase 
url = input("Enter your Supabase URL: ")
key = getpass.getpass("Enter your Supabase API Key (hidden): ")                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
supabase = create_client(url, key)

# Insert Data into Supabase Table 
table_name = "world_stocks"
batch_size = 1000

print("\n Starting data upload to Supabase...")

for start in range(0, len(df), batch_size):
    batch = df.iloc[start:start + batch_size].to_dict(orient="records")
    try:
        response = supabase.table(table_name).insert(batch).execute()
        print(f"Upload {batch_size} rows")
    except Exception as e:
        print(f"Error inserting rows {start} - {start + len(batch)}: {e}")
    time.sleep(1)  # Avoid hitting rate limits

print("Upload complete!")
