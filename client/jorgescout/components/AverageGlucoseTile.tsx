import React, { useEffect, useState } from 'react';
import { View, Text } from './Themed';
import { getStats } from '@/scripts/scripts.ts';
import {Dimensions, StyleSheet } from 'react-native';

export default function AverageGlucoseTile() {

    const screenWidth = Dimensions.get('screen').width;
    const sideLength = screenWidth / 3;

    const [avgGlucose, setAvgGlucose] = useState<string>("--");

    useEffect(() => {
        const fetchData = async () => {
            try{
                const data = await getStats();
                setAvgGlucose(data["average"]["average glucose"]);
                console.log(data);
            }
            catch(error) {
                console.log(error, `Error: ${error}`)
            }
        }

        fetchData();
    }, []);


    return (
        <View style={{width: sideLength, height: sideLength, justifyContent: "center", alignItems: "center"}}>
            <Text>Average{"\n"}Glucose</Text>
            <Text style={{fontSize: 40}}>{avgGlucose}</Text>
        </View>
    );
}