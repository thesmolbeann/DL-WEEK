from flask import Flask, render_template, request, jsonify
import pandas as pd
import plotly.express as px
import joblib

app = Flask(__name__)

# Load dataset
df = pd.read_excel("Bosch Dataset-2.xlsx")

# Function to generate interactive graph
def create_visualization():
    fig = px.histogram(df, x="Tool Type", title="Tool Type Distribution")
    return fig.to_html(full_html=False)

@app.route('/')
def index():
    graph_html = create_visualization()
    return render_template("index.html", graph_html=graph_html)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    features = [data['Feature1'], data['Feature2']]  # Replace with actual inputs
    prediction = "Calibration Needed" if sum(features) > 10 else "No Calibration Needed"  # Placeholder logic
    return jsonify({"prediction": prediction})

if __name__ == '__main__':
    app.run(debug=True)
