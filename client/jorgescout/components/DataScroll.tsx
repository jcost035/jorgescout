import React, {useEffect, useState} from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { getReading } from '@/scripts/scripts.ts';
import { Text, View } from './Themed';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';



export default function DataScroll() {
    
    
    const windowWidth = Dimensions.get('screen').width;
    

    return (
        <GestureHandlerRootView>
            <ScrollView>
                <View style={{height: 1000, backgroundColor: "red", width: windowWidth, flexDirection: "column"}}>
                    <View style={{ flexDirection: "row", height: (windowWidth / 2)}}>
                        <View style={{height: (windowWidth / 2), width: windowWidth/2, backgroundColor: "green"}}></View>
                        <View style={{height: (windowWidth / 2), width: windowWidth/2, backgroundColor: "blue"}}></View>
                    </View>
                    <View style={{ flexDirection: "row"}}>
                        <View style={{height: (windowWidth / 2), width: windowWidth/2, backgroundColor: "orange"}}></View>
                        <View style={{height: (windowWidth / 2), width: windowWidth/2, backgroundColor: "yellow"}}></View>
                    </View>
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    );
    
}