# Pulse Assignment – 4

### SaaS Product Review Scraper (G2, Capterra & TrustRadius)

## Project Overview

This project is a **full-stack web application** that allows users to scrape SaaS product reviews from popular platforms such as **G2**, **Capterra**, and **TrustRadius** for a given company and date range. The scraped reviews can also be downloaded as a JSON file.

---

## How It Works

1. User submits scraping parameters from the frontend form.
2. Backend validates input.
3. Playwright launches a browser and navigates the target platform.
4. Reviews are filtered by date and normalized.
5. Results are saved to a JSON file and returned to the frontend.

---

## Features

- Frontend form to select:
  - Company name
  - Review source (G2 / Capterra / TrustRadius)
  - Start date & End date
- Backend scraping with **Playwright**
- Date-based filtering of reviews
- G2 authentication handling (login required for pagination)
- Pagination support (Capterra & TrustRadius)
- Performance optimizations:
  - Parallel DOM extraction
  - Early pagination stop
  - Blocking images, fonts
- JSON file generation & auto-download
- Loading popup during scraping
- Graceful error handling

---

## Tech Stack

### Frontend

- React
- Tailwind CSS

### Backend

- Node.js
- Express.js
- Playwright (browser automation)

---

[**Output**](/output/output.json) - output/ouput.json

## Project Structure

```
scraper/
│
├── scraper-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Form.jsx
│   │   │   └── Loading.jsx
│   │   └── App.jsx
│
├── src/
│   ├── middleware/
│   │   └── validate.js
│   ├── routes/
│   │   └── scraper.js
│   ├── scrapers/
│   │   ├── g2scraper.js
│   │   ├── capterrascraper.js
│   │   └── trscraper.js
│   ├── utils/
│   │   └── browser.js
│   └── index.js
│── output/
│   └── output.json
│
├── .env
├── package.json
└── README.md
```

---

## Setup Instructions

### 1️. Clone the Repository

```bash
git clone https://github.com/Nandan328/pulse-assignment
cd pulse-assignment
```

---

### 2️. Backend Setup

```bash
npm install
npx playwright install
```

Create a `.env` file (required for G2 scraping):

```env
G2_EMAIL=your_g2_email
G2_PASSWORD=your_g2_password
```

Start Application:

```bash
npm start
```

Runs applcation on:

```
http://localhost:3000
```

---

### 3️. Frontend Setup

To do changes in frontend

```bash
cd scraper-frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## Build & Run

The project uses a single start command to build the frontend and run the backend server.

```bash
npm start
```

---

## API Endpoint

### POST `/api/scrape-request`

**Request Body**

```json
{
  "companyname": "Notion",
  "source": "Capterra",
  "startDate": "01-05-2025",
  "endDate": "25-12-2025"
}
```

**Response**

```json
{
  "success": true,
  "companyname": "Notion",
  "source": "Capterra",
  "totalReviews": 42
}
```

---

## Download Output File

On successful scraping, the backend generates:

```
/output/output.json
```

The frontend **automatically downloads** this file once scraping completes.

You can also access it directly:

```
http://localhost:3000/output
```

---

## Platform-Specific Notes

### G2

- Pagination beyond page 1 requires login
- The scraper authenticates using credentials from `.env`
- Sorting is done using the “Most Recent” option

### Capterra

- Fully accessible without login
- Supports pagination
- Scraper stops early when reviews fall outside date range

### TrustRadius (Bonus Source)

- Fully paginated without authentication
- Uses semantic selectors for stability
- Scraper stops early when reviews fall outside date range

---

## Limitations

- G2 limits unauthenticated pagination
- Scraping depends on site DOM stability
- G2 employs bot-detection mechanisms; as a result, scraping may occasionally require multiple attempts

---

## Conclusion

This project demonstrates:

- Real-world browser automation
- Handling of authentication-based scraping(for G2)
- Efficient pagination & filtering

---
