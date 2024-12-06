import React, { PureComponent } from 'react'
import { Svg, G, Rect, Line } from 'react-native-svg'
import { Dimensions } from 'react-native'
import * as d3 from 'd3'

const screenWidth = Dimensions.get('screen').width;
const sideLength = screenWidth / 3;

const GRAPH_MARGIN = 5;
const GRAPH_BAR_WIDTH = 10;
const colors = {
    axis: '#E4E4E4',
    bars: '#15AD13'
  };

export default class BarChart extends PureComponent {
    render() {

        const n = 10;
        const testData = [{ tir: 5, day: "0" , color: "#15AD13" }];
        
        for (let i = 1; i < n; i++) {
            testData.push(
            { tir: 5, day: i.toString(), color: "#15AD13" }
            );
        }

        testData.push({tir: 5, day: "10", color: "yellow" });

        for (let i = 11; i < 30; i++) {
            testData.push(
            { tir: 5, day: i.toString(), color: "#15AD13"  }
            );
        }

        const graphHeight = sideLength - 2 * GRAPH_MARGIN;
        const graphWidth =screenWidth - 2 * GRAPH_MARGIN;

        const xDomain = testData.map(item => item.day);
        const xRange = [0, graphWidth]
        const x = d3.scalePoint().domain(xDomain).range(xRange).padding(1);

        const yDomain = [0, 50];
        const yRange = [0, graphHeight];
        const y = d3.scaleLinear().domain(yDomain).range(yRange);

        return (
        <Svg width={screenWidth} height={sideLength}>
            {/* translate for 'graphHeight' on y axis */}
            <G y={graphHeight}>
                {testData.map(item => (
                    <Rect
                    key={item.day}
                    x={x(item.day)! - (GRAPH_BAR_WIDTH / 2)}
                    y={y(item.tir) * - 1 - 10}
                    rx={2.5}
                    width={GRAPH_BAR_WIDTH}
                    height={y(item.tir)}
                    fill={item.color}
                    />
                ))}

                {testData.map(item => (
                    <Rect
                    key={item.day}
                    x={x(item.day)! - (GRAPH_BAR_WIDTH / 2)}
                    y={y(item.tir) * - 1 - 30}
                    rx={2.5}
                    width={GRAPH_BAR_WIDTH}
                    height={y(item.tir)}
                    fill={item.color}
                    />
                ))}

                <Line
                    x1="10"
                    y1="0"
                    x2={screenWidth-10}
                    y2="0"
                    stroke="black"
                    strokeWidth="0.5"
                />
            </G>
        </Svg>
        )
    }
}