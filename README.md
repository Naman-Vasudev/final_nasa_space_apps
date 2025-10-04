# ClimaCast

[Check it out on Vercel](https://will-it-rain-on-my-parade-deploy-6q.vercel.app)  
or  
[Visit my website](https://www.namanvasudev.us)


**History predicts the future.**

ClimaCast is an advanced web application for long-term weather probability analysis. It leverages decades of historical climate data to provide detailed climatological insights for any location on Earth. Users can explore typical weather conditions, analyze trends, and receive AI-powered summaries and suggestions for a specific date window.

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

1.  **Location & Date Selection:** The user selects a location on the map (or via search) and a target date.
2.  **Data Fetching:** The application queries the NASA POWER API for over 30 years of historical daily weather data for the chosen coordinates.
3.  **Client-Side Analysis:** A robust analysis engine written in TypeScript runs in the browser. It filters the entire dataset to a specific "window" around the target date (e.g., ±15 days) for every year in the record.
4.  **Statistical Calculation:** The engine calculates a comprehensive set of climatological statistics, including percentiles, probabilities, distributions, and long-term trends (using the Mann-Kendall test).
5.  **Data Visualization:** The results are rendered using Recharts and custom React components to create interactive graphs, cards, and detailed modal views.
6.  **AI Augmentation (Optional):** The user can request AI-driven insights. The structured analysis data is sent to a serverless backend function, which securely queries a generative AI model to generate summaries, activity plans, or chatbot responses based *only* on the provided data.

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

