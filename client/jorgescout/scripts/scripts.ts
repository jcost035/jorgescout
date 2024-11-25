// import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

// const queryClient = new QueryClient();


interface Reading {
    value: number;
    datetime: string;
}

export async function getReading() {
    try {
        const response = await fetch('http://127.0.0.1:5000/');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data.latest_reading.toString() + " " + data.trend_arrow || 'No reading found';
      } catch (error) {
        console.error('Error fetching data:', error);
        return 'Error fetching reading';
      }
}

