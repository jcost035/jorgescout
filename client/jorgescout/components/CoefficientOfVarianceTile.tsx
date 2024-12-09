import React, { useEffect, useState } from 'react';
import { View, Text } from './Themed';
import { getStats } from '@/scripts/scripts.ts';
import {Dimensions, StyleSheet } from 'react-native';

export default function CoefficientofVarianceTile() {

    const screenWidth = Dimensions.get('screen').width;
    const sideLength = screenWidth / 3;

    const [varianceCoefficient, setVarianceCoefficient] = useState<string>("--");

    useEffect(() => {
        const fetchData = async () => {
            try{
                const data = await getStats();

                const coefficient = Math.round((data["standard deviation"] / data["average"]["average glucose"]) * 100)

                setVarianceCoefficient(coefficient.toString());
            }
            catch(error) {
                console.log(error, `Error: ${error}`)
            }
        }

        fetchData();
    }, []);


    return (
        <View style={{width: sideLength, height: sideLength, justifyContent: "center", alignItems: "center"}}>
            <Text>CV</Text>
            <Text style={{fontSize: 40}}>{varianceCoefficient}%</Text>
        </View>
    );
}