import React, {useEffect, useState} from 'react';
import { StyleSheet } from 'react-native';
import { getReading } from '@/scripts/scripts.ts';
import { Text, View } from './Themed';
import YutaniGradients, { colors } from './style/YutaniGradients';


export default function BloodSugarReading() {
    const [reading, setReading] = useState<string>(":/");
    const [readingColor, setReadingColor] = useState<string>("black");
    

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getReading();
                setReading(data.value + " " + data.trendArrow);

                const color = data.value == "Loading..." || data.value == "---" ? 'black' : Number(data.value) < 70 ? 'red' : Number(data.value) > 180 ? 'orange' : colors.lightGreen;
                setReadingColor(color)
            }
            catch(error) {
                console.error("Error: ", error);
                setReading("Error");
            }
        };
         
        fetchData();
        

        const interval = setInterval(fetchData, 300000);

        return () => {clearInterval(interval)};
    }, []); // Empty dependency array ensures this runs only once when the component mounts

    return (
        <View style={{backgroundColor: "transparent"}}>
            <View style={{height: 0}}>
                <YutaniGradients/>
            </View>
            <Text style={[styles.largeReading, {color: readingColor, filter: "url(#blur)"}]}>
                {reading}
            </Text>
        </View>
    );

}

const styles = StyleSheet.create({
    largeReading: {
        fontSize: 60,
        fontFamily: "TecoSans",
        fontWeight: "light",
        filter: "url(#blur)"
    }
});


