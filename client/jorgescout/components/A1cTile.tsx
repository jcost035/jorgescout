import React, { useEffect, useState } from 'react';
import { View, Text } from './Themed';
import { getStats } from '@/scripts/scripts.ts';
import { Dimensions, StyleSheet } from 'react-native';

const sideLength = Dimensions.get('screen').width / 3;

interface A1cTileProps {
    startDate: Date | null;
    stats: any;
}

const  A1cTile: React.FC<A1cTileProps> = ({startDate = null, stats = null}) => {
    const [a1c, setA1c] = useState<string>("--");
    
    useEffect(() => {
        if (stats != null){
            setA1c(stats.a1c)
        }
    }, [stats])


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

export default A1cTile;