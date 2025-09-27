import pandas as pd
import numpy as np
import streamlit as st
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
import re

st.set_page_config(page_title="GreenView Chatbot", layout="wide")

st.title("💬 GreenView AI Copilot 🤖")
st.markdown("Ask me questions like:")
st.markdown("- `'20 days baad CO2 emissions kya hon gi XGBoost se?'`")
st.markdown("- `'LightGBM se Waste 90 din baad kitni hogi?'`")
st.markdown("- `'Sustainability Score 180 days ke baad?'`")

uploaded_file = st.file_uploader("📤 Upload your sustainability CSV file", type=["csv"])

if uploaded_file is not None:
    df = pd.read_csv(uploaded_file)

    # Time engineering
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
        score = 0
        for feature, weight in weights.items():
            if feature in row:
                score += weight * row[feature]
        return score

    df['Sustainability_Score'] = df.apply(calculate_sustainability_score, axis=1)
    scaler = MinMaxScaler()
    df['Sustainability_Score'] = scaler.fit_transform(df[['Sustainability_Score']])

    # Features for prediction
    feature_cols = ['Energy_Consumption_kWh', 'Elapsed_Days', 'Month', 'DayOfYear']

    # Chatbot input
    question = st.text_input("💬 Ask your question")

    if question:
        # Parse the question
        time_match = re.search(r"(\d+)\s*(days|din)", question)
        model_match = "xgboost" if "xgboost" in question.lower() else "lightgbm" if "lightgbm" in question.lower() else "xgboost"
        metric_map = {
            "co2": "CO2_Emissions_kg",
            "waste": "Waste_Generated_kg",
            "score": "Sustainability_Score",
            "sustainability": "Sustainability_Score"
        }
        metric_match = None
        for keyword, col_name in metric_map.items():
            if keyword in question.lower():
                metric_match = col_name
                break

        # Validate
        if not time_match or not metric_match:
            st.error("⚠️ Please ask a question like: '30 din baad CO2 kya hoga XGBoost ke mutabiq?'")
            st.stop()

        days_ahead = int(time_match.group(1))
        model_name = model_match
        target = metric_match

        # Prepare data
        data = df.dropna(subset=feature_cols + [target])
        X = data[feature_cols]
        y = data[target]
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        if model_name == "xgboost":
            model = XGBRegressor(n_estimators=100, learning_rate=0.1)
        else:
            model = LGBMRegressor(n_estimators=100, learning_rate=0.1)

        model.fit(X_train, y_train)

        # Future point
        future_day = df['Elapsed_Days'].max() + days_ahead
        future_month = (df['Month'].iloc[-1] + int(days_ahead / 30)) % 12 or 12
        future_day_of_year = ((df['DayOfYear'].iloc[-1] + days_ahead) % 365)

        future_input = pd.DataFrame([{
            'Energy_Consumption_kWh': df['Energy_Consumption_kWh'].iloc[-1],
            'Elapsed_Days': future_day,
            'Month': future_month,
            'DayOfYear': future_day_of_year
        }])

        prediction = model.predict(future_input)[0]
        if target == "Sustainability_Score":
            prediction *= 100

        # Final response
        st.success(f"📈 Predicted `{target.replace('_', ' ')}` after **{days_ahead} days** using **{model_name.upper()}**:")
        st.metric(label="Forecasted Value", value=f"{prediction:.2f}")

        # Optional: Chart
        st.subheader("📉 Predicted Trend (Optional Simulation)")

        future_range = list(range(0, days_ahead + 1, int(days_ahead / 10) or 1))
        chart_preds = []

        for d in future_range:
            day = df['Elapsed_Days'].max() + d
            month = (df['Month'].iloc[-1] + int(d / 30)) % 12 or 12
            doy = ((df['DayOfYear'].iloc[-1] + d) % 365)
            row = {
                'Energy_Consumption_kWh': df['Energy_Consumption_kWh'].iloc[-1],
                'Elapsed_Days': day,
                'Month': month,
                'DayOfYear': doy
            }
            pred = model.predict(pd.DataFrame([row]))[0]
            if target == "Sustainability_Score":
                pred *= 100
            chart_preds.append((d, pred))

        # Plot chart
        df_chart = pd.DataFrame(chart_preds, columns=["Days Ahead", "Prediction"])
        st.line_chart(df_chart.set_index("Days Ahead"))

else:
    st.info("👆 Please upload your sustainability CSV to begin asking questions.")
