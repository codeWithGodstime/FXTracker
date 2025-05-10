# FXTrackr

## Description:
FXTrackr is a smart currency investment tracker that helps you monitor your dollar purchases and sales in Naira, automatically calculating your real-time profit or loss on each transaction and across your portfolio.

## Problem It Solves:
Most individuals and businesses buying foreign currency manually track their exchange rates and profits, often leading to errors and confusion. FXTrackr eliminates guesswork by giving you clear insights into your gains, matching each sale to previous buys, and showing monthly or yearly profit trends — all in one sleek dashboard.

## Features
- Record FX transactions (BUY or SELL)
- Automatically match SELLs to previous BUYs using FIFO logic
- Calculate real-time net gain and profit percentage per transaction
- View total profit over time (monthly/yearly toggle)
- Identify your most profitable month
- Built with Django + React

## Tech Stack
- Frontend: React, TailwindCSS, Chart.js / Recharts
- Backend: Django REST Framework
- Database: PostgreSQL


## Installation
Backend
```
git clone https://github.com/yourusername/fxtrackr.git
cd fxtracker/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

```
Frontend
```
cd fxtracker/frontend
npm install
npm run dev
```

## Screenshots
![Alt text](screens/Screenshot%202025-05-10%20020440.png)
![Alt text](screens/Screenshot%202025-05-10%20020452.png)
![Alt text](screens/Screenshot%202025-05-10%20020504.png)

Built with love by @Godstime