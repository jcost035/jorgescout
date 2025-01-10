import React, { useEffect, useState } from 'react';
import { View, Text } from './Themed';
import { getStats } from '@/scripts/scripts.ts';
import { Dimensions, StyleSheet } from 'react-native';

const height = Dimensions.get('screen').width / 4;
const width = Dimensions.get('screen').width / 4;

interface A1cTileProps {
    startDate: Date | null;
}

const  A1cTile: React.FC<A1cTileProps> = ({startDate = null}) => {
    const [a1c, setA1c] = useState<string>("--");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const stats = await getStats(startDate);
                setA1c(stats.a1c);
            }
            catch(error) {
                console.error(`Error: ${error}`)
            }
        }

        fetchData();
    }, [startDate]);

    return (
        <View style={styles.tile}>
            <Text style={styles.title}>A1c</Text>
            <Text style={styles.reading}>{a1c}%</Text>
        </View>
    );
    
}


const styles = StyleSheet.create({
    tile: {
        height: height, 
        width: width, 
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "",
        flexDirection: "column",

    },
    reading: {
        fontSize: 27,  
    },
    title: {
        fontSize: 15,
    }
});

export default A1cTile;