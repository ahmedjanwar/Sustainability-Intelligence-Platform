import pandas as pd
import numpy as np
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from datetime import timedelta

st.set_page_config(page_title="GreenView Dashboard", layout="wide")
st.title("🌱 GreenView – Sustainability Intelligence Dashboard")

uploaded_file = st.file_uploader("📤 Upload your sustainability CSV file", type=["csv"])

if uploaded_file is not None:
    df = pd.read_csv(uploaded_file)

    # ----------------------------
    # 🕒 Time Features
    # ----------------------------
    if 'Timestamp' in df.columns:
        df['Timestamp'] = pd.to_datetime(df['Timestamp'])
        df['Year'] = df['Timestamp'].dt.year
        df['Month'] = df['Timestamp'].dt.month
        df['DayOfYear'] = df['Timestamp'].dt.dayofyear
        df['Elapsed_Days'] = (df['Timestamp'] - df['Timestamp'].min()).dt.days
    else:
        st.error("⚠️ Please include a 'Timestamp' column in your dataset.")
        st.stop()

    # ----------------------------
    # 🌍 Sustainability Score
    # ----------------------------
    def calculate_sustainability_score(row):
        weights = {
            'CO2_Emissions_kg': -0.5,
            'Energy_Consumption_kWh': -0.3,
            'Waste_Generated_kg': -0.2
        }
        score = 0
        for feature, weight in weights.items():
            if feature in row:
                score += weight * row[feature]
        return score

    df['Sustainability_Score'] = df.apply(calculate_sustainability_score, axis=1)
    scaler = MinMaxScaler()
    df['Sustainability_Score'] = scaler.fit_transform(df[['Sustainability_Score']])
    latest_score = df['Sustainability_Score'].iloc[-1] * 100

    st.subheader("📊 Current Sustainability Score")
    fig = go.Figure(go.Indicator(
        mode="gauge+number",
        value=latest_score,
        title={'text': "Sustainability Score"},
        gauge={
            'axis': {'range': [0, 100]},
            'bar': {'color': "green"},
            'steps': [
                {'range': [0, 40], 'color': "red"},
                {'range': [40, 70], 'color': "orange"},
                {'range': [70, 100], 'color': "lightgreen"}
            ]
        }
    ))
    st.plotly_chart(fig)

    # ----------------------------
    # 🎛️ Forecast Configuration
    # ----------------------------
    st.subheader("🧠 Forecast Settings")

    metric_choice = st.selectbox("🎯 What do you want to predict?", ['CO2_Emissions_kg', 'Waste_Generated_kg', 'Sustainability_Score'])
    forecast_days = st.slider("⏳ Predict how many days into the future?", 30, 1095, 730)

    # ----------------------------
    # 🧪 Train Model(s)
    # ----------------------------
    feature_cols = ['Energy_Consumption_kWh', 'Elapsed_Days', 'Month', 'DayOfYear']

    if metric_choice not in df.columns:
        st.warning(f"⚠️ Column '{metric_choice}' missing.")
        st.stop()

    data = df.dropna(subset=feature_cols + [metric_choice])
    X = data[feature_cols]
    y = data[metric_choice]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    xgb_model = XGBRegressor(n_estimators=100, learning_rate=0.1)
    lgbm_model = LGBMRegressor(n_estimators=100, learning_rate=0.1)

    xgb_model.fit(X_train, y_train)
    lgbm_model.fit(X_train, y_train)

    # ----------------------------
    # 🔮 Future Forecasts
    # ----------------------------
    st.subheader("📈 Future Forecast Dashboard")

    future_dates = [df['Timestamp'].max() + timedelta(days=i) for i in range(1, forecast_days + 1)]
    future_df = pd.DataFrame({
        'Energy_Consumption_kWh': df['Energy_Consumption_kWh'].iloc[-1],
        'Elapsed_Days': range(df['Elapsed_Days'].max() + 1, df['Elapsed_Days'].max() + forecast_days + 1),
        'Month': [(df['Month'].iloc[-1] + (i // 30)) % 12 or 12 for i in range(forecast_days)],
        'DayOfYear': [(df['DayOfYear'].iloc[-1] + i) % 365 or 365 for i in range(forecast_days)]
    })
    future_df['Date'] = future_dates

    future_df['XGBoost_Prediction'] = xgb_model.predict(future_df[feature_cols])
    future_df['LightGBM_Prediction'] = lgbm_model.predict(future_df[feature_cols])

    if metric_choice == 'Sustainability_Score':
        future_df['XGBoost_Prediction'] *= 100
        future_df['LightGBM_Prediction'] *= 100

    # ----------------------------
    # 📊 Line Chart Comparison
    # ----------------------------
    fig = px.line(
        future_df,
        x="Date",
        y=["XGBoost_Prediction", "LightGBM_Prediction"],
        labels={"value": f"{metric_choice.replace('_', ' ')}", "Date": "Date"},
        title=f"Future Forecast of {metric_choice.replace('_', ' ')}"
    )
    fig.update_layout(legend_title_text='Model')
    st.plotly_chart(fig, use_container_width=True)

    # ----------------------------
    # 📌 Latest Results Summary
    # ----------------------------
    st.subheader("🔍 Latest Prediction (on last forecasted day)")
    latest_row = future_df.iloc[-1]
    col1, col2 = st.columns(2)
    col1.metric("XGBoost Prediction", f"{latest_row['XGBoost_Prediction']:.2f}")
    col2.metric("LightGBM Prediction", f"{latest_row['LightGBM_Prediction']:.2f}")

    # ----------------------------
    # 🔎 Raw Data
    # ----------------------------
    st.markdown("### 📂 Raw Data Preview")
    st.dataframe(df.tail(10))

else:
    st.info("👆 Please upload your sustainability dataset in CSV format to begin.")
