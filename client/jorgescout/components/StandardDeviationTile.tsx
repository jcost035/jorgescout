import React, { useEffect, useState } from 'react';
import { View, Text } from './Themed';
import { getStats } from '@/scripts/scripts.ts';
import {Dimensions, StyleSheet } from 'react-native';

export default function StandardDeviationTile({startDate=null}:{startDate: Date|null}) {

    const screenWidth = Dimensions.get('screen').width;
    const sideLength = screenWidth / 3;

    const [stdDeviation, setStdDeviation] = useState<string>("--");

    useEffect(() => {
        const fetchData = async () => {
            try{
                const data = await getStats(startDate);
                setStdDeviation(data["standard deviation"]);
            }
            catch(error) {
                console.log(error, `Error: ${error}`)
            }
        }

        fetchData();
    }, [startDate]);


    return (
        <View style={{width: sideLength, height: sideLength, justifyContent: "center", alignItems: "center"}}>
            <Text>Standard{"\n"}Deviation</Text>
            <Text style={{fontSize: 40}}>{stdDeviation}</Text>
        </View>
    );
}