// import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

// const queryClient = new QueryClient();

export async function getReading() {
    try {
        const response = await fetch('http://192.168.0.250:5001/');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return { value: data.latest_reading.toString() || 'No reading found ', trendArrow: data.trend_arrow };
        //return data.latest_reading.toString() + " " + data.trend_arrow || 'No reading found';
      } catch (error) {
        console.error('Error fetching data:', error);
        return {value: 'Error fetching reading', trendArrow: ''};
      }
}



