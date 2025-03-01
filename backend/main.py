from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import sqlite3
import os
import datetime
import json
import uuid
import random
import numpy as np

app = Flask(__name__)
# Simple CORS configuration
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
        
        # Convert the DataFrame to a list of dictionaries
        tools_inventory = df.to_dict('records')
        
        # Map 'index' to 'id' for frontend compatibility
        for tool in tools_inventory:
            if 'index' in tool:
                tool['id'] = tool['index']
        
        return jsonify({"tools_inventory": tools_inventory}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

def convert_date_format(date_str):
    """
    Convert various date formats to the format used in the database (DD-MMM-YY)
    Examples:
    - 06/06/2025 -> 06-Jun-25
    - 06-June-2025 -> 06-Jun-25
    - 06-Jun-2025 -> 06-Jun-25
    - 2025-06-06 -> 06-Jun-25
    """
    if not date_str:
        return date_str
    
    try:
        # Try different date formats
        date_obj = None
        formats_to_try = [
            '%d/%m/%Y',  # 06/06/2025
            '%d-%B-%Y',  # 06-June-2025
            '%d-%b-%Y',  # 06-Jun-2025
            '%Y-%m-%d',  # 2025-06-06
            '%m/%d/%Y',  # 06/06/2025 (US format)
            '%d-%m-%Y',  # 06-06-2025
            '%d %B %Y',  # 06 June 2025
            '%d %b %Y',  # 06 Jun 2025
        ]
        
        for date_format in formats_to_try:
            try:
                date_obj = datetime.datetime.strptime(date_str, date_format)
                break
            except ValueError:
                continue
        
        if date_obj:
            # Convert to the format used in the database (DD-MMM-YY)
            return date_obj.strftime('%d-%b-%y')
        else:
            # If all formats fail, return the original string
            return date_str
    except Exception as e:
        print(f"Error converting date format: {e}")
        return date_str

@app.route('/api/update-tool', methods=['POST'])
def update_tool():
    conn = None
    try:
        # Get the tool data from the request
        tool_data = request.json
        print("Received tool data:", tool_data)
        
        if not tool_data or 'id' not in tool_data:
            return jsonify({"error": "Invalid tool data or missing ID"}), 400
        
        # Connect to the database
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        # Map frontend field names to database column names
        field_mapping = {
            'name': 'description',
            'serialNumber': 'serial_no',
            'brand': 'brand',
            'division': 'div',
            'calibrator': 'calibrator',
            'range': 'range',
            'tolerance': 'tolerence_limit_external',  # Fixed field name based on schema
            'lastCalibration': 'last__calibration',   # Fixed field name based on schema
            'nextCalibration': 'calibration__due',
            'calibrationInterval': 'actual_calibration_interval',  # Fixed field name based on schema
            'calibrationNumber': 'calibration_report_number',      # Fixed field name based on schema
            'location': 'pic',  # Using pic field for location
            'status': 'in_use'  # Using in_use field for status
        }
        
        # Build the SQL update statement
        update_fields = []
        values = []
        
        for frontend_field, db_field in field_mapping.items():
            if frontend_field in tool_data:
                # Convert date formats if needed
                if frontend_field in ['lastCalibration', 'nextCalibration']:
                    value = convert_date_format(tool_data[frontend_field])
                else:
                    value = tool_data[frontend_field]
                
                update_fields.append(f"{db_field} = ?")
                values.append(value)
        
        if not update_fields:
            return jsonify({"error": "No fields to update"}), 400
        
        # Add the ID to the values list
        values.append(tool_data['id'])
        
        # Execute the update query
        cursor = conn.cursor()
        # Use 'index' column instead of 'id'
        query = f"UPDATE bosch_equipment SET {', '.join(update_fields)} WHERE \"index\" = ?"
        
        print(f"Executing query: {query}")
        print(f"With values: {values}")
        
        cursor.execute(query, values)
        conn.commit()
        
        # Check if any rows were affected
        if cursor.rowcount == 0:
            return jsonify({"error": f"No tool found with ID {tool_data['id']}"}), 404
        
        return jsonify({
            "status": "success",
            "message": "Tool updated successfully",
            "updated_id": tool_data['id']
        }), 200
        
    except Exception as e:
        print(f"Error updating tool: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# Create a table for malfunction reports if it doesn't exist
def create_malfunction_reports_table():
    conn = get_db_connection()
    if not conn:
        print("Failed to connect to database when creating malfunction_reports table")
        return False
    
    try:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS malfunction_reports (
                id TEXT PRIMARY KEY,
                tool_id TEXT NOT NULL,
                tool_name TEXT NOT NULL,
                serial_number TEXT NOT NULL,
                severity TEXT NOT NULL,
                description TEXT NOT NULL,
                reported_at TEXT NOT NULL,
                UNIQUE(tool_id)
            )
        ''')
        conn.commit()
        print("Malfunction reports table created or already exists")
        return True
    except Exception as e:
        print(f"Error creating malfunction_reports table: {e}")
        return False
    finally:
        conn.close()

@app.route('/api/malfunction-reports', methods=['GET'])
def get_malfunction_reports():
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM malfunction_reports")
        
        # Convert the result to a list of dictionaries
        columns = [column[0] for column in cursor.description]
        reports = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        return jsonify({"malfunction_reports": reports}), 200
    except Exception as e:
        print(f"Error getting malfunction reports: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/malfunction-reports', methods=['POST'])
def create_malfunction_report():
    try:
        # Get the report data from the request
        report_data = request.json
        print("Received malfunction report data:", report_data)
        
        if not report_data or 'toolId' not in report_data or 'description' not in report_data:
            return jsonify({"error": "Invalid report data or missing required fields"}), 400
        
        # Connect to the database
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        # Check if a report already exists for this tool
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id FROM malfunction_reports WHERE tool_id = ?",
            (report_data['toolId'],)
        )
        existing_report = cursor.fetchone()
        
        if existing_report:
            return jsonify({
                "status": "exists",
                "message": "A report already exists for this tool",
                "report_id": existing_report[0]
            }), 200
        
        # Generate a unique ID for the report
        report_id = str(uuid.uuid4())
        
        # Insert the new report
        cursor.execute(
            """
            INSERT INTO malfunction_reports 
            (id, tool_id, tool_name, serial_number, severity, description, reported_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                report_id,
                report_data['toolId'],
                report_data['toolName'],
                report_data['serialNumber'],
                report_data['severity'],
                report_data['description'],
                report_data['reportedAt']
            )
        )
        conn.commit()
        
        return jsonify({
            "status": "success",
            "message": "Malfunction report created successfully",
            "report_id": report_id
        }), 201
    except Exception as e:
        print(f"Error creating malfunction report: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/malfunction-reports/<report_id>', methods=['PUT'])
def update_malfunction_report(report_id):
    try:
        # Get the report data from the request
        report_data = request.json
        print(f"Updating malfunction report {report_id} with data:", report_data)
        
        if not report_data or 'description' not in report_data:
            return jsonify({"error": "Invalid report data or missing description"}), 400
        
        # Connect to the database
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        # Update the report
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE malfunction_reports 
            SET severity = ?, description = ?
            WHERE id = ?
            """,
            (
                report_data['severity'],
                report_data['description'],
                report_id
            )
        )
        conn.commit()
        
        # Check if any rows were affected
        if cursor.rowcount == 0:
            return jsonify({"error": f"No report found with ID {report_id}"}), 404
        
        return jsonify({
            "status": "success",
            "message": "Malfunction report updated successfully",
            "report_id": report_id
        }), 200
    except Exception as e:
        print(f"Error updating malfunction report: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/malfunction-reports/<report_id>', methods=['DELETE'])
def delete_malfunction_report(report_id):
    try:
        # Connect to the database
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        # Delete the report
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM malfunction_reports WHERE id = ?",
            (report_id,)
        )
        conn.commit()
        
        # Check if any rows were affected
        if cursor.rowcount == 0:
            return jsonify({"error": f"No report found with ID {report_id}"}), 404
        
        return jsonify({
            "status": "success",
            "message": "Malfunction report deleted successfully"
        }), 200
    except Exception as e:
        print(f"Error deleting malfunction report: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# get the count only for 1st graph
@app.route('/api/worker-allocation', methods=['GET'])
def get_worker_allocation():
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500

        # Fetch relevant data
        query = "SELECT serial_no, pic, calibrator, calibration__due FROM bosch_equipment"
        df = pd.read_sql_query(query, conn)

        # Drop rows with missing essential values
        df = df.dropna(subset=["serial_no", "pic"])

        # Compute old_workload (count of serial_no per pic)
        workload_df = df.groupby("pic")["serial_no"].count().reset_index()
        workload_df.rename(columns={"serial_no": "old_workload"}, inplace=True)

        # Merge workload count with main dataframe
        merged_df = df.merge(workload_df, on="pic", how="left")

        # Convert to JSON response
        return jsonify({"worker_allocation": merged_df.to_dict(orient="records")}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/optimize-worker-allocation', methods=['GET'])      # graph
def optimize_worker_allocation():
    try:
        print(f"[LOG] {datetime.datetime.now().isoformat()} - Optimize worker allocation endpoint called")
        
        # Get worker allocation data directly from the database
        conn = get_db_connection()
        if not conn:
            print(f"[LOG] {datetime.datetime.now().isoformat()} - Database connection failed")
            return jsonify({"error": "Database connection failed"}), 500

        # Fetch relevant data
        query = "SELECT serial_no, pic, calibrator, calibration__due FROM bosch_equipment"
        df = pd.read_sql_query(query, conn)

        # Drop rows with missing essential values
        df = df.dropna(subset=["serial_no", "pic"])

        # Compute old_workload (count of serial_no per pic)
        workload_df = df.groupby("pic")["serial_no"].count().reset_index()
        workload_df.rename(columns={"serial_no": "old_workload"}, inplace=True)

        # Merge workload count with main dataframe
        merged_df = df.merge(workload_df, on="pic", how="left")
        
        # Convert to dictionary for processing
        data = merged_df.to_dict(orient="records")

        # Extract unique workers and prepare calibration items
        workers = list(set(item["pic"] for item in data))  # Unique workers
        calibration_items = []
        for item in data:
            calibration_items.append((
                item.get("calibrator", ""), 
                item.get("serial_no", ""), 
                item.get("calibration__due", ""), 
                item.get("old_workload", 0)
            ))
        
        print(f"[LOG] {datetime.datetime.now().isoformat()} - Processing {len(workers)} workers and {len(calibration_items)} calibration items")

        # Apply heuristic model
        optimized_allocation = apply_heuristic_model(workers, calibration_items)
        
        print(f"[LOG] {datetime.datetime.now().isoformat()} - Optimization complete. Generated {len(optimized_allocation)} worker assignments")

        # Prepare the optimized data to match serial_no and pic
        result = optimized_allocation
        return jsonify({"optimized_worker_allocation": result}), 200

    except Exception as e:
        error_message = str(e)
        print(f"[LOG] {datetime.datetime.now().isoformat()} - Error in optimize worker allocation: {error_message}")
        return jsonify({"error": error_message}), 500
    finally:
        if conn:
            conn.close()
        print(f"[LOG] {datetime.datetime.now().isoformat()} - Optimize worker allocation endpoint completed")

@app.route('/api/update-worker-allocation', methods=['POST'])       # run model and update db
def update_worker_allocation():
    try:
        print(f"[LOG] {datetime.datetime.now().isoformat()} - Update worker allocation endpoint called")
        
        # Get optimized allocation data directly from the database
        conn = get_db_connection()
        if not conn:
            print(f"[LOG] {datetime.datetime.now().isoformat()} - Database connection failed")
            return jsonify({"error": "Database connection failed"}), 500

        # Fetch relevant data
        query = "SELECT serial_no, pic, calibrator, calibration__due FROM bosch_equipment"
        df = pd.read_sql_query(query, conn)

        # Drop rows with missing essential values
        df = df.dropna(subset=["serial_no", "pic"])

        # Compute old_workload (count of serial_no per pic)
        workload_df = df.groupby("pic")["serial_no"].count().reset_index()
        workload_df.rename(columns={"serial_no": "old_workload"}, inplace=True)

        # Merge workload count with main dataframe
        merged_df = df.merge(workload_df, on="pic", how="left")
        
        # Convert to dictionary for processing
        data = merged_df.to_dict(orient="records")

        # Extract unique workers and prepare calibration items
        workers = list(set(item["pic"] for item in data))  # Unique workers
        calibration_items = []
        for item in data:
            calibration_items.append((
                item.get("calibrator", ""), 
                item.get("serial_no", ""), 
                item.get("calibration__due", ""), 
                item.get("old_workload", 0)
            ))
        
        print(f"[LOG] {datetime.datetime.now().isoformat()} - Processing {len(workers)} workers and {len(calibration_items)} calibration items")

        # Apply heuristic model to get worker load distribution
        optimized_worker_loads = apply_heuristic_model(workers, calibration_items)
        if not optimized_worker_loads:
            print(f"[LOG] {datetime.datetime.now().isoformat()} - No optimized data available")
            return jsonify({"error": "No optimized data available"}), 500
        
        print(f"[LOG] {datetime.datetime.now().isoformat()} - Optimization complete. Generated worker load distribution")
        
        # Create a mapping of serial numbers to workers based on the optimized distribution
        # This is needed because apply_heuristic_model returns (worker_id, workload_count) tuples
        # but we need to map each serial_no to a worker for the database update
        
        print(f"[LOG] {datetime.datetime.now().isoformat()} - Creating worker assignments based on optimized distribution")
        
        # Convert optimized_worker_loads to a dictionary for easier access
        target_workloads = {worker_id: load for worker_id, load in optimized_worker_loads}
        
        # Track current assignments to ensure we don't exceed target workloads
        current_workloads = {worker_id: 0 for worker_id in workers}
        
        # Create assignments mapping serial numbers to workers
        worker_assignments = []  # List of (worker_id, serial_no) tuples
        
        # First, group calibration items by calibrator and due date for better assignment
        grouped_items = {}
        for item in calibration_items:
            calibrator, serial_no, due_date, _ = item
            key = (calibrator, due_date)
            if key not in grouped_items:
                grouped_items[key] = []
            grouped_items[key].append(serial_no)
        
        # Assign items to workers based on target workloads
        for (calibrator, due_date), serial_numbers in grouped_items.items():
            # Find workers who still need more items to reach their target
            available_workers = [w for w in workers if current_workloads[w] < target_workloads.get(w, 0)]
            
            if not available_workers:
                # If all workers have reached their targets, distribute remaining items evenly
                available_workers = workers
            
            # Sort workers by how far they are from their target (ascending)
            available_workers.sort(key=lambda w: target_workloads.get(w, 0) - current_workloads[w], reverse=True)
            
            # Assign serial numbers to workers
            for serial_no in serial_numbers:
                # Get the worker who needs the most items to reach target
                best_worker = available_workers[0]
                
                # Add assignment
                worker_assignments.append((best_worker, serial_no))
                
                # Update current workload
                current_workloads[best_worker] += 1
                
                # Re-sort workers if there are more items to assign
                if len(serial_numbers) > 1:
                    available_workers.sort(key=lambda w: target_workloads.get(w, 0) - current_workloads[w], reverse=True)
        
        print(f"[LOG] {datetime.datetime.now().isoformat()} - Created {len(worker_assignments)} worker assignments")
        
        # Now update the database with the new assignments
        cursor = conn.cursor()
        update_query = "UPDATE bosch_equipment SET pic = ? WHERE serial_no = ?"
        
        update_count = 0
        for worker_id, serial_no in worker_assignments:
            cursor.execute(update_query, (worker_id, serial_no))
            update_count += 1

        conn.commit()
        
        print(f"[LOG] {datetime.datetime.now().isoformat()} - Database updated successfully. {update_count} records modified")

        return jsonify({
            "message": "Worker allocation updated successfully",
            "workers_processed": len(workers),
            "items_processed": len(calibration_items),
            "updates_applied": update_count
        }), 200

    except Exception as e:
        error_message = str(e)
        print(f"[LOG] {datetime.datetime.now().isoformat()} - Error in update worker allocation: {error_message}")
        return jsonify({"error": error_message}), 500
    finally:
        if conn:
            conn.close()
        print(f"[LOG] {datetime.datetime.now().isoformat()} - Update worker allocation endpoint completed")

def apply_heuristic_model(workers, calibration_items):
    """
    Apply a heuristic model to optimize worker allocation based on:
    1. Balancing workload among workers (highest priority)
    2. Considering location grouping (calibrator) (higher priority)
    3. Considering deadline grouping (calibration_due) (higher priority)
    4. Ensuring each worker's workload is within ±5 tasks from average
    
    Returns a list of tuples (worker_id, optimized_load)
    """
    if not workers or len(workers) == 0:
        return []
    
    # Initialize worker tracking
    worker_data = {
        worker: {
            'assigned_load': 0,
            'locations': set(),
            'deadlines': set()
        } for worker in workers
    }
    
    # Current workloads
    workloads = {worker: 0 for worker in workers}
    
    # Group tasks by location and deadline
    task_groups = {}
    for item in calibration_items:
        calibrator, serial_no, due_date, _ = item
        key = (calibrator, due_date)
        if key not in task_groups:
            task_groups[key] = []
        task_groups[key].append(item)
    
    # Heuristic weights
    w1 = 2.7  # Workload balancing (highest priority)
    w2 = 2.0  # Location grouping (higher priority)
    w3 = 2.3  # Deadline grouping (higher priority)
    
    # Function to get average workload
    def get_avg_workload():
        return int(sum(workloads.values()) / max(len(workloads), 1))
    
    # Heuristic function to score workers for a task
    def heuristic(worker, location, due_date):
        avg_workload = get_avg_workload()
        
        # Workload penalty: Higher deviation = higher penalty
        workload_penalty = abs(workloads[worker] - avg_workload)
        
        # Location penalty: Prefer same location
        location_penalty = 0 if location in worker_data[worker]['locations'] else 1
        
        # Deadline penalty: Reward workers with the same deadline
        deadline_penalty = 0 if due_date in worker_data[worker]['deadlines'] else 1
        deadline_reward = -0.5 if due_date in worker_data[worker]['deadlines'] else 0
        
        # Calculate total penalty
        total_penalty = (w1 * workload_penalty) + (w2 * location_penalty) + (w3 * (deadline_penalty + deadline_reward))
        
        return total_penalty
    
    # Sort task groups by due date (earliest first)
    sorted_task_groups = sorted(task_groups.items(), key=lambda x: x[0][1])
    
    # Assign tasks using heuristic scoring
    new_assignments = []
    for (location, due_date), group in sorted_task_groups:
        for item in group:
            # Pick the best worker using the heuristic
            best_worker = min(workers, key=lambda w: heuristic(w, location, due_date))
            
            # Assign task to the best worker
            new_assignments.append((best_worker, item[1]))  # (worker_id, serial_no)
            
            # Update worker data
            workloads[best_worker] += 1  # Increment workload
            worker_data[best_worker]['assigned_load'] += 1
            worker_data[best_worker]['locations'].add(location)
            worker_data[best_worker]['deadlines'].add(due_date)
    
    # Ensure minimum workload of 10 for each worker
    min_workload = 10
    total_items = sum(workloads.values())
    
    # First pass: identify workers below minimum
    workers_below_min = [w for w in workers if workloads[w] < min_workload]
    
    if workers_below_min and total_items >= len(workers) * min_workload:
        # Calculate how many items we need to redistribute
        items_needed = sum(min_workload - workloads[w] for w in workers_below_min)
        
        # Identify workers who can give up items
        donors = [w for w in workers if workloads[w] > min_workload]
        
        if donors:
            # Calculate how many items each donor can give
            items_to_take = {}
            remaining_needed = items_needed
            
            # Sort donors by workload (highest first)
            sorted_donors = sorted(donors, key=lambda w: workloads[w], reverse=True)
            
            for donor in sorted_donors:
                # Calculate how many items this donor can give
                available = workloads[donor] - min_workload
                to_take = min(available, remaining_needed)
                
                if to_take > 0:
                    items_to_take[donor] = to_take
                    remaining_needed -= to_take
                
                if remaining_needed <= 0:
                    break
            
            # Redistribute items
            for donor, to_take in items_to_take.items():
                workloads[donor] -= to_take
                
                # Distribute to workers below minimum
                for recipient in workers_below_min:
                    needed = min_workload - workloads[recipient]
                    if needed > 0:
                        given = min(needed, to_take)
                        workloads[recipient] += given
                        to_take -= given
                    
                    if to_take <= 0:
                        break
    
    # Rebalance workload to ensure each worker is within ±5 tasks from average
    avg_workload = get_avg_workload()
    max_deviation = 5  # Maximum allowed deviation from average
    
    # Identify workers outside the allowed range
    overloaded_workers = [w for w in workers if workloads[w] > avg_workload + max_deviation]
    underloaded_workers = [w for w in workers if workloads[w] < avg_workload - max_deviation]
    
    # Only proceed with rebalancing if there are workers outside the allowed range
    if overloaded_workers and underloaded_workers:
        print(f"Rebalancing workload: Average = {avg_workload}, Allowed range = [{avg_workload - max_deviation}, {avg_workload + max_deviation}]")
        print(f"Overloaded workers: {overloaded_workers}")
        print(f"Underloaded workers: {underloaded_workers}")
        
        # Sort workers by workload (highest to lowest for overloaded, lowest to highest for underloaded)
        overloaded_workers.sort(key=lambda w: workloads[w], reverse=True)
        underloaded_workers.sort(key=lambda w: workloads[w])
        
        # Redistribute tasks from overloaded to underloaded workers
        for donor in overloaded_workers:
            # Calculate how many tasks need to be redistributed
            excess = workloads[donor] - (avg_workload + max_deviation)
            
            if excess <= 0:
                continue  # Skip if worker is now within range
            
            print(f"Worker {donor} needs to give up {excess} tasks")
            
            # Redistribute to underloaded workers
            for recipient in underloaded_workers:
                # Calculate how many tasks this recipient can take
                deficit = (avg_workload - max_deviation) - workloads[recipient]
                
                if deficit <= 0:
                    continue  # Skip if worker is now within range
                
                # Transfer tasks
                transfer = min(excess, deficit)
                workloads[donor] -= transfer
                workloads[recipient] += transfer
                excess -= transfer
                
                print(f"Transferred {transfer} tasks from {donor} to {recipient}")
                
                if excess <= 0:
                    break  # Done redistributing from this donor
    
    # Calculate final workload distribution
    final_workloads = [(worker, workloads[worker]) for worker in workers]
    
    # Print for debugging
    print("Initial workloads:", {w: 0 for w in workers})
    print("Final workloads after rebalancing:", dict(final_workloads))
    print("Average workload:", avg_workload)
    print("Allowed range:", [avg_workload - max_deviation, avg_workload + max_deviation])
    print("Total items before:", len(calibration_items))
    print("Total items after:", sum(load for _, load in final_workloads))
    
    return final_workloads

if __name__ == "__main__":
    # Create the malfunction reports table if it doesn't exist
    create_malfunction_reports_table()
    
    # Print database schema information
    try:
        conn = get_db_connection()
        if conn:
            cursor = conn.cursor()
            cursor.execute("PRAGMA table_info(bosch_equipment)")
            columns = cursor.fetchall()
            print("\n=== Database Schema for bosch_equipment ===")
            for column in columns:
                print(f"Column: {column}")
            
            # Get a sample row to understand the data
            cursor.execute("SELECT * FROM bosch_equipment LIMIT 1")
            sample_row = cursor.fetchone()
            if sample_row:
                print("\n=== Sample Row ===")
                for i, column in enumerate(columns):
                    column_name = column[1]
                    value = sample_row[i] if i < len(sample_row) else None
                    print(f"{column_name}: {value}")
            
            # Print malfunction_reports schema
            cursor.execute("PRAGMA table_info(malfunction_reports)")
            columns = cursor.fetchall()
            print("\n=== Database Schema for malfunction_reports ===")
            for column in columns:
                print(f"Column: {column}")
            
            conn.close()
    except Exception as e:
        print(f"Error getting schema information: {e}")
    
    app.run(debug=True)
