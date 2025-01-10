import React, { useEffect, useState } from 'react';
import { View, Text } from './Themed';
import { getStats } from '@/scripts/scripts.ts';
import {Dimensions, StyleSheet } from 'react-native';

export default function AverageGlucoseTile({startDate=null}:{startDate:Date|null}) {

    const screenWidth = Dimensions.get('screen').width;
    const height = screenWidth / 4;
    const width = screenWidth / 4;


    const [avgGlucose, setAvgGlucose] = useState<string>("--");

    useEffect(() => {
        const fetchData = async () => {
            try{
                const data = await getStats(startDate);
                setAvgGlucose(data["average"]["average glucose"]);
            }
            catch(error) {
                console.log(error, `Error: ${error}`)
            }
        }

        fetchData();
    }, [startDate]);


    return (
        <View style={{width: width, height: height, justifyContent: "center", alignItems: "center"}}>
            <Text>Average{"\n"}Glucose</Text>
            <Text style={{fontSize: 27}}>{avgGlucose}</Text>
        </View>
    );
}