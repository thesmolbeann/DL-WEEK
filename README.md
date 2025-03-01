## Run the Backend first

Install Dependencies:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # For Mac/Linux
venv\Scripts\activate     # For Windows
pip install -r requirements.txt
```

Startup Backend
```bash
python main.py
``` 

Call endpoiint to create db
```bash
curl -X POST http://localhost:5000/api/create-and-load
```
You should see a bosch.db file in the **/backend** folder.
If it doesnt work, replace localhost with 127.0.0.1

See the table
```bash
curl http://localhost:5000/api/view-data
```

## Run the frontend
Install dependencies
```bash
cd frontend
npm install --legacy-peer-deps
```

Spin up the frontend
```bash
npm run dev
```

Access frontend at http://localhost:3000

