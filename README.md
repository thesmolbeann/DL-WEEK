# Team Deepear
## Track 5 : Bosch

---
## 1. Introduction

Our product aims to be a tool that removes the need for manual checking of physical worksheets for more efficient and fair scheduling and greater attention to faults.

Links :
[Video](),
[Slides](https://www.canva.com/design/DAGgd9fjX88/uAmrt2n33eY3mRklJ8uRwA/edit)

Our product is pretty cool man 
### 6 thumbs up!!!

<img src="./group_photo.jpg">

---

## 2. Setting Up

### 2a. Run the Backend first

1. Create the virtual envirnoment:
```bash
cd backend
python -m venv venv
```

2. Activate the environment:
```bash
source venv/bin/activate  # For Mac/Linux
venv\Scripts\activate     # For Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Startup Backend
```bash
python main.py # Or python3 main.py
```
>Backend server will start on ```127.0.0.1:5000```

5. Create the database (skip if bosch.db already exists)
```bash
curl -X POST http://127.0.0.1:5000/api/create-and-load
```
You should see a bosch.db file in the **/backend** folder.

---
### 2b. Run the Frontend
Open a new terminal, from the **root** directory,
1. Install dependencies:
```bash
cd backend
npm install --legacy-peer-deps
```

2. Spin up the frontend
```bash
npm run dev
```
>Frontend will start at ```localhost:3000```

