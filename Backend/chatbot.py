import pandas as pd
import numpy as np
import streamlit as st
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sqlalchemy import create_engine
import re

# ----------------------------
# 🔌 Supabase DB Connection
# ----------------------------
username = 'postgres.bmwsulkktotsdxrhxlwp'
password = 'GreenView1234'
host = 'aws-1-eu-west-3.pooler.supabase.com'
port = '5432'
database = 'postgres'
table_name = 'sustainability_table'

db_url = f'postgresql://{username}:{password}@{host}:{port}/{database}'
engine = create_engine(db_url)

# ----------------------------
# 🧠 App Config
# ----------------------------
st.set_page_config(page_title="GreenView Chatbot", layout="wide")
st.title("💬 GreenView AI Copilot 🤖")

# ----------------------------
# 📥 Load Data
# ----------------------------
@st.cache_data
def load_data():
    return pd.read_sql(f"SELECT * FROM {table_name}", engine)

try:
    df = load_data()
except Exception as e:
    st.error(f"Failed to connect to Supabase: {e}")
    st.stop()

if 'Timestamp' not in df.columns:
    st.error("Missing 'Timestamp' column in your table.")
    st.stop()

df['Timestamp'] = pd.to_datetime(df['Timestamp'])
df['Year'] = df['Timestamp'].dt.year
df['Month'] = df['Timestamp'].dt.month
df['DayOfYear'] = df['Timestamp'].dt.dayofyear
df['Elapsed_Days'] = (df['Timestamp'] - df['Timestamp'].min()).dt.days

# Sustainability Score
def calculate_sustainability_score(row):
    weights = {
        'CO2_Emissions_kg': -0.5,
        'Energy_Consumption_kWh': -0.3,
        'Waste_Generated_kg': -0.2
    }
    return sum(row.get(k, 0) * w for k, w in weights.items())

df['Sustainability_Score'] = df.apply(calculate_sustainability_score, axis=1)
df['Sustainability_Score'] = MinMaxScaler().fit_transform(df[['Sustainability_Score']])

# ----------------------------
# 💬 Chat Section
# ----------------------------
st.subheader("💡 Ask a question in natural language")
question = st.text_input("🔎 Example: 'What will be the electricity generation after 90 days using lightgbm?'")

# Supported metrics and aliases
metric_map = {
    "co2": "CO2_Emissions_kg",
    "waste": "Waste_Generated_kg",
    "score": "Sustainability_Score",
    "sustainability": "Sustainability_Score",
    "heat": "Heat_Generation_MWh",
    "electricity": "Electricity_Generation_MWh",
    "power": "Electricity_Generation_MWh"
}

if question:
    # NLP-style parsing
    question_lower = question.lower()
    days_match = re.search(r"(\d+)\s*(day|days|din)", question_lower)
    days_ahead = int(days_match.group(1)) if days_match else 30

    model_name = "lightgbm" if "lightgbm" in question_lower else "xgboost"

    target = None
    for key, col in metric_map.items():
        if key in question_lower:
            target = col
            break

    if not target:
        st.error("⚠️ Couldn't detect the metric you're asking about (CO2, waste, score, etc.)")
        st.stop()

    # Validate column
    if target not in df.columns:
        st.error(f"'{target}' column not found in your dataset.")
        st.stop()

    # Model training
    feature_cols = ['Energy_Consumption_kWh', 'Elapsed_Days', 'Month', 'DayOfYear']
    data = df.dropna(subset=feature_cols + [target])
    X = data[feature_cols]
    y = data[target]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = XGBRegressor(n_estimators=100) if model_name == "xgboost" else LGBMRegressor(n_estimators=100)
    model.fit(X_train, y_train)

    # Forecast
    future_day = df['Elapsed_Days'].max() + days_ahead
    future_month = (df['Month'].iloc[-1] + (days_ahead // 30)) % 12 or 12
    future_doy = (df['DayOfYear'].iloc[-1] + days_ahead) % 365 or 365

    future_input = pd.DataFrame([{
        'Energy_Consumption_kWh': df['Energy_Consumption_kWh'].iloc[-1],
        'Elapsed_Days': future_day,
        'Month': future_month,
        'DayOfYear': future_doy
    }])

    prediction = model.predict(future_input)[0]
    if target == "Sustainability_Score":
        prediction *= 100

    current_value = df[target].iloc[-1]
    if target == "Sustainability_Score":
        current_value *= 100

    change = prediction - current_value
    pct_change = (change / current_value) * 100 if current_value else 0
    change_label = "increase" if change > 0 else "decrease"

    # 🔥 Response
    st.markdown(f"""
    ### 📊 Forecast Summary:
    - **Metric:** `{target.replace('_', ' ')}`
    - **Model:** `{model_name.upper()}`
    - **Days Ahead:** `{days_ahead}`
    
    #### 💬 Predicted value after {days_ahead} days:  
    **➡️ {prediction:.2f} ({change_label} of {abs(change):.2f}, {pct_change:.1f}%) from today**
    """)

    # 📈 Optional chart
    st.subheader("📉 Simulated Forecast Trend")
    chart_preds = []
    for d in range(0, days_ahead + 1, max(1, days_ahead // 15)):
        ed = df['Elapsed_Days'].max() + d
        m = (df['Month'].iloc[-1] + (d // 30)) % 12 or 12
        doy = (df['DayOfYear'].iloc[-1] + d) % 365 or 365
        row = pd.DataFrame([{
            'Energy_Consumption_kWh': df['Energy_Consumption_kWh'].iloc[-1],
            'Elapsed_Days': ed,
            'Month': m,
            'DayOfYear': doy
        }])
        pred = model.predict(row)[0]
        if target == "Sustainability_Score":
            pred *= 100
        chart_preds.append((d, pred))

    chart_df = pd.DataFrame(chart_preds, columns=["Days Ahead", "Prediction"])
    st.line_chart(chart_df.set_index("Days Ahead"))
