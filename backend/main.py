from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import sqlite3
import os
import datetime

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

@app.route('/api/no1', methods=['POST', 'GET'])
def handle_date_selection():
    try:
        # Check if this is a request for calibration data
        get_data = request.args.get('get_data', 'false').lower() == 'true'
        
        if get_data and request.method == 'GET':
            # Return calibration data from the database
            try:
                # Initialize empty calibration data
                calibration_data = {}
                
                # Get calibration data from database
                conn = get_db_connection()
                if not conn:
                    return jsonify({"error": "Database connection failed"}), 500
                
                try:
                    # Query the database for calibration data
                    df = pd.read_sql_query(
                        "SELECT description, serial_no, calibrator, calibration__due FROM bosch_equipment WHERE calibration__due IS NOT NULL", 
                        conn
                    )
                    
                    # Process the data to organize by date
                    for _, row in df.iterrows():
                        try:
                            # Format date to YYYY-MM-DD (handling the format in the CSV: "12-Oct-26")
                            if pd.notna(row['calibration__due']):
                                try:
                                    # First try direct parsing with strptime
                                    due_date = datetime.datetime.strptime(row['calibration__due'], '%d-%b-%y')
                                    date_key = due_date.strftime('%Y-%m-%d')
                                    
                                    # Add to calibration data
                                    if date_key not in calibration_data:
                                        calibration_data[date_key] = []
                                    
                                    calibration_data[date_key].append({
                                        "name": row['description'] if pd.notna(row['description']) else 'Unknown Equipment',
                                        "serial": row['serial_no'] if pd.notna(row['serial_no']) else 'No Serial',
                                        "company": row['calibrator'] if pd.notna(row['calibrator']) else 'Unknown Company'
                                    })
                                except ValueError:
                                    try:
                                        # If that fails, try manual parsing
                                        date_parts = row['calibration__due'].split('-')
                                        if len(date_parts) == 3:
                                            day = date_parts[0]
                                            month = date_parts[1]
                                            year = date_parts[2]
                                            
                                            # Add '20' prefix if the year is only 2 digits
                                            if len(year) == 2:
                                                year = '20' + year
                                            
                                            # Reconstruct the date string
                                            date_str = f"{day}-{month}-{year}"
                                            
                                            # Parse the date
                                            due_date = datetime.datetime.strptime(date_str, '%d-%b-%Y')
                                            date_key = due_date.strftime('%Y-%m-%d')
                                            
                                            # Add to calibration data
                                            if date_key not in calibration_data:
                                                calibration_data[date_key] = []
                                            
                                            calibration_data[date_key].append({
                                                "name": row['description'] if pd.notna(row['description']) else 'Unknown Equipment',
                                                "serial": row['serial_no'] if pd.notna(row['serial_no']) else 'No Serial',
                                                "company": row['calibrator'] if pd.notna(row['calibrator']) else 'Unknown Company'
                                            })
                                        else:
                                            # Skip this row if date format is invalid
                                            continue
                                    except Exception as parse_error:
                                        print(f"Error parsing date '{row['calibration__due']}': {parse_error}")
                                        continue
                        except Exception as date_error:
                            print(f"Error processing date: {row['calibration__due']}, {date_error}")
                except Exception as db_error:
                    print(f"Database error when fetching calibration data: {str(db_error)}")
                    return jsonify({
                        "status": "error",
                        "message": f"Database error: {str(db_error)}"
                    }), 500
                finally:
                    conn.close()
                
                return jsonify({
                    "status": "success",
                    "data": calibration_data
                }), 200
                
            except Exception as data_error:
                print(f"Error preparing calibration data: {str(data_error)}")
                return jsonify({
                    "status": "error",
                    "message": f"Error preparing calibration data: {str(data_error)}"
                }), 500
        
        # Handle date selection (POST request)
        date = request.args.get('date')
        
        if not date:
            return jsonify({"error": "Date parameter is required"}), 400
        
        # Log the date selection
        print(f"Date selected: {date}")
        
        # Store the date selection in the database
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            # Create a table for date selections if it doesn't exist
            conn.execute('''
                CREATE TABLE IF NOT EXISTS date_selections (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    selected_date TEXT NOT NULL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Insert the selected date
            conn.execute(
                "INSERT INTO date_selections (selected_date) VALUES (?)",
                (date,)
            )
            
            # Commit the changes
            conn.commit()
            
            # Get equipment due for calibration on the selected date
            cursor = conn.cursor()
            cursor.execute(
                "SELECT COUNT(*) FROM bosch_equipment WHERE date(calibration__due) = date(?)",
                (date,)
            )
            equipment_count = cursor.fetchone()[0]
            
            return jsonify({
                "message": f"Date selection received: {date}",
                "status": "success",
                "details": {
                    "date_stored": True,
                    "equipment_count": equipment_count,
                    "timestamp": datetime.datetime.now().isoformat()
                }
            }), 200
            
        except Exception as db_error:
            print(f"Database error: {str(db_error)}")
            return jsonify({
                "message": f"Date selection received: {date}",
                "status": "partial_success",
                "error": f"Database operation failed: {str(db_error)}"
            }), 200
        
        finally:
            if conn:
                conn.close()
        
    except Exception as e:
        print(f"Error handling request: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/tools-inventory', methods=['GET'])
def get_tools_inventory():
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        # First, let's get the column names from the table to make sure we're using the right ones
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(bosch_equipment)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Build a query that selects all columns
        query = f"SELECT * FROM bosch_equipment"
        
        df = pd.read_sql_query(query, conn)
        return jsonify({"tools_inventory": df.to_dict('records')}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    app.run(debug=True)
