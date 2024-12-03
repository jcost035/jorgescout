import React, {useEffect, useState} from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { getReading } from '@/scripts/scripts.ts';
import { Text, View } from './Themed';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import A1cTile from '@/components/A1cTile';
import TimeInRange from '@/components/TimeInRange';



export default function DataScroll() {
    
    
    const windowWidth = Dimensions.get('screen').width;
    

    return (
        <GestureHandlerRootView>
            <ScrollView>
                <View style={{ width: windowWidth, flexDirection: "column"}}>
                    <View style={styles.horizontalSeparator} />
                    <View style={{ flexDirection: "row"}}>
                        <A1cTile/>
                        <View style={styles.verticalSeparator} />
                        <TimeInRange/>
                        <View style={styles.verticalSeparator} />
                        <View style={{height: (windowWidth / 3), width: windowWidth/3, backgroundColor: ""}}></View>
                    </View>
                    <View style={styles.horizontalSeparator} />
                    <View style={{ flexDirection: "row"}}>
                        <View style={{height: (windowWidth/ 3), width: windowWidth, backgroundColor: ""}}></View>
                    </View>
                    <View style={styles.horizontalSeparator} />
                    <View style={{ flexDirection: "row"}}>
                        <View style={{height: (windowWidth / 3), width: windowWidth/3, backgroundColor: ""}}></View>
                        <View style={styles.verticalSeparator} />
                        <View style={{height: (windowWidth / 3), width: windowWidth/3, backgroundColor: ""}}></View>
                        <View style={styles.verticalSeparator} />
                        <View style={{height: (windowWidth / 3), width: windowWidth/3, backgroundColor: ""}}></View>
                    </View>
                    <View style={styles.horizontalSeparator} />

                </View>
            </ScrollView>
        </GestureHandlerRootView>
    );
    
}

const styles = StyleSheet.create(
    {
        horizontalSeparator: {
            backgroundColor: "black",
            height: 1,
            width: '100%',
        },
        verticalSeparator: {
            backgroundColor: "black",
            width: 1,
            height: '100%',
        }
    }
)