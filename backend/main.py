from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import sqlite3
import os

app = Flask(__name__)
CORS(app)

def get_db_connection():
    try:
        conn = sqlite3.connect('bosch.db')
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

@app.route('/api/create-and-load', methods=['POST'])
def create_and_load():
    try:
        # Read CSV file
        df = pd.read_csv("Bosch-Dataset-CSV(2).csv")
        
        # Clean column names
        df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_').str.replace('-', '_')
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        # Create table and load data directly using pandas
        df.to_sql('bosch_equipment', conn, if_exists='replace', index=True)
        
        return jsonify({"message": "Data loaded successfully"}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/view-data', methods=['GET'])
def view_data():
    try:
        conn = get_db_connection()
        df = pd.read_sql_query("SELECT * FROM bosch_equipment LIMIT 100", conn)
        return jsonify({"data": df.to_dict('records')}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/view-fault-data', methods=['GET'])
def view_fault_data():
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
            
        # Query the bosch_equipment table for FA division
        df = pd.read_sql_query("SELECT * FROM bosch_equipment WHERE div='FA'", conn)
        return jsonify({"data": df.to_dict('records')}), 200
        
    except Exception as e:
        print(f"Database error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# Get items(div,calibration_due, calibrator_company,serial number), within DATE and DATE+5, sort by div), accept date as a param

# POST update item with new date




if __name__ == "__main__":
    app.run(debug=True)
