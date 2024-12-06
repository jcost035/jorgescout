import React, { useEffect, useState } from 'react';
import { View, Text } from './Themed';
import { getStats } from '@/scripts/scripts.ts';
import Dimensions, { StyleSheet } from 'react-native';

const sideLength = Dimensions.Dimensions.get('screen').width / 3;

export default function A1cTile() {
    const [a1c, setA1c] = useState<string>("--");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const stats = await getStats();
                setA1c(stats.a1c);
            }
            catch(error) {
                console.error(`Error: ${error}`)
            }
        }

        fetchData();
    }, []);

    return (
        <View style={styles.tile}>
            <Text style={styles.title}>A1c</Text>
            <Text style={styles.reading}>{a1c}%</Text>
        </View>
    );
    
}


const styles = StyleSheet.create({
    tile: {
        height: sideLength, 
        width: sideLength, 
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "",
        flexDirection: "column",

    },
    reading: {
        fontSize: 40,  
    },
    title: {
        fontSize: 20,
    }
});