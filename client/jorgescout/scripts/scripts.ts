import DeviceInfo from 'react-native-device-info';
// import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

// const queryClient = new QueryClient();
const ip = '192.168.0.130'
const home_ip = '127.0.0.1'

export async function getReading() {
    try {
        let response = await fetch(`http://${ip}:5001/`);
        if (!response.ok) {
          response = await fetch(`http://${home_ip}:5001/`);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
        }
        const data = await response.json();
        return { value: data.latest_reading.toString() || 'No reading found ', trendArrow: data.trend_arrow };
        //return data.latest_reading.toString() + " " + data.trend_arrow || 'No reading found';
    }
    catch (error) {
      console.error('Error fetching data:', error);
      return {value: 'Error', trendArrow: ''};
    }
}

export async function getHistory(minutes: number) {
  try {
    const response = await fetch(`http://${ip}:5001/history/minutes/${minutes}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const historyData = await response.json();

    return historyData;
  } 
  catch (error) {
    console.error('Error fetching data:', error);
  }

}

export async function getStats() {
  try {
    const response = await fetch(`http://${ip}:5001/stats`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json()
  }
  catch (error) {
    console.error('Error fetching data:', error);
  }


}

export async function getDailyTimeInRange() {
  try {
    const response = await fetch(`http://${ip}:5001/getdailytir/30`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json()
  }
  catch (error) {
    console.error('Error fetching data:', error);
  }
}



