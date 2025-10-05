# ClimaCast (https://final-nasa-space-apps.vercel.app/)

**History predicts the future.**

ClimaCast is an advanced web application for long-term weather probability analysis. It leverages decades of historical climate data to provide detailed climatological insights for any location on Earth. For future dates, it provides a statistical climatology forecast, while for past dates, it displays the actual recorded weather. Users can explore typical weather conditions, analyze trends, and receive AI-powered summaries and suggestions for a specific date window.

## Key Features

- **Interactive Map:** Select any point on the globe to analyze.
- **Historical Data Analysis:** Processes over 30 years of daily data from the NASA POWER project.
- **Multi-Parameter Visualization:** In-depth analysis of Temperature, Precipitation, Wind, Humidity, UV Index, and "Feels Like" comfort metrics.
- **Interactive Climatology Graph:** Visualize the typical progression of weather conditions around your selected date.
- **Long-Term Trend Detection:** Automatically performs a Mann-Kendall trend analysis to identify significant long-term climate trends.
- **AI-Powered Insights:**
  - **AI Summary:** Generates a concise, natural-language summary of the climate conditions.
  - **AI Activity Planner:** Suggests suitable indoor and outdoor activities based on the data.
  - **AI Chatbot:** Ask questions about the analyzed data in plain English.
- **Detailed Breakdowns:** Drill down into each weather parameter with detailed charts on distributions, probabilities, and yearly trends.
- **Modern & Responsive UI:** A sleek, dark-mode interface built for a seamless user experience on any device.

## Technology Stack

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Charting & Visualization:** Recharts
- **Interactive Map:** Leaflet.js
- **Climate Data Source:** NASA POWER API
- **AI Integration:** A serverless backend function that interfaces with a powerful generative AI model to provide contextual, data-driven insights.

## How It Works

ClimaCast provides two types of weather insights based on the date you select:

### For Past Dates: Actual Historical Weather

If you choose a date in the past (typically more than 3-4 days ago), ClimaCast retrieves and displays the **actual, recorded weather data** from the NASA POWER archives for that specific day. This allows you to see exactly what the weather was like at your chosen location on a historical date.

### For Future & Recent Dates: Climatological Determination

If you choose today's date, a recent date, or any date in the future, ClimaCast performs a **climatological determination**. It analyzes over 30 years of historical data for a date window around your selected day to determine the most probable weather conditions. This is not a traditional forecast but a powerful statistical prediction based on decades of climate patterns, showing you what the weather is *typically* like for that time of year.

## Getting Started

Follow these instructions to get a local copy of ClimaCast up and running for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- `npm` or `yarn` package manager

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/climacast.git
    cd climacast
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    This project uses a backend service for its AI features, which requires an API key.

    - Create a new file named `.env` in the root of the project.
    - Add your API key to this file:
      ```
      API_KEY="your_ai_service_api_key_here"
      ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

5.  **Open the application:**
    Navigate to `http://localhost:5173` (or the address shown in your terminal) in your web browser. You should now see the ClimaCast application running.
