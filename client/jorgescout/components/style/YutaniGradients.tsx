import React from 'react';
import { Defs, LinearGradient, Stop, RadialGradient, Mask, Text as SvgText, Filter, FeGaussianBlur } from 'react-native-svg';

const colors = {
    lightGreen: "#6cc592",
    darkGreen: "#33543c",
    lighterGreen: "#86d4a7",
    lightYellow: "#feffde"
}

const YutaniGradients = () => (
  <Defs>

    <Filter id="blur" x="0" y="0" width="100%" height="100%">
        <FeGaussianBlur stdDeviation=".8" />
    </Filter>

    <LinearGradient id="charFadeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopOpacity="0" /> 
        <Stop offset="50%" stopOpacity="1" />
        <Stop offset="100%" stopOpacity="0" />
    </LinearGradient>
    <Mask id="charFadeMask">
        <SvgText
        x="0"
        y="0"
        fontSize={15}
        fill="white"
        >
        A {/* Dummy character for mask definition */}
        </SvgText>
    </Mask>


    <LinearGradient id="greenGradientY" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="5%" stopColor={colors.darkGreen} stopOpacity={0}/>
        <Stop offset="40%" stopColor={colors.lightGreen} />
        <Stop offset="60%" stopColor={colors.lightGreen} />
        <Stop offset="95%" stopColor={colors.darkGreen} stopOpacity={0}/>
    </LinearGradient>
    
    <LinearGradient id="greenGradientX" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor={colors.darkGreen} stopOpacity={0}/>
        <Stop offset="40%" stopColor={colors.lightGreen} />
        <Stop offset="60%" stopColor={colors.lightGreen} />
        <Stop offset="100%" stopColor={colors.darkGreen} stopOpacity={0}/>
    </LinearGradient>

    <RadialGradient
      id="greenRadialGradient"
      cx="50%"
      cy="50%"
      r="50%"
      fx="50%"
      fy="50%"
    >
        <Stop offset="0%" stopColor={colors.lighterGreen} />
        <Stop offset="50%" stopColor={colors.lighterGreen} stopOpacity={1} />
        <Stop offset="100%" stopColor={colors.lighterGreen} stopOpacity={0} />
    </RadialGradient>

    <RadialGradient
      id="yellowRadialGradient"
      cx="50%"
      cy="50%"
      r="50%"
      fx="50%"
      fy="50%"
    >
        <Stop offset="0%" stopColor={colors.lightYellow} />
        <Stop offset="50%" stopColor={colors.lightYellow} stopOpacity={1} />
        <Stop offset="100%" stopColor={colors.lightYellow} stopOpacity={0} />
    </RadialGradient>
  </Defs>
);

export default YutaniGradients;
