import React, {useEffect, useState} from 'react';
import { StyleSheet } from 'react-native';
import { getReading } from '@/scripts/scripts.ts';
import { Text, View } from './Themed';



export default function BloodSugarReading() {
    const [reading, setReading] = useState<string>("Loading...")
    const readingColor = reading == "Loading..." || reading == "Error fetching reading" ? 'black' : Number(reading) < 50 ? 'red' : Number(reading) > 180 ? 'yellow' : 'lawngreen';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getReading();
                setReading(data);
            }
            catch(error) {
                console.error("Error: ", error);
                setReading("Error fetching reading");
            }
        };

        fetchData();

        const interval = setInterval(fetchData, 300000);

        return () => {clearInterval(interval)};
    }, []); // Empty dependency array ensures this runs only once when the component mounts

    return (
        <View>
            <Text style={[styles.largeReading, {color: readingColor}]}>
                {reading}
            </Text>
        </View>
    );

}

const styles = StyleSheet.create({
    largeReading: {
        fontSize: 50,
        fontWeight: 'bold'
    }
    });


