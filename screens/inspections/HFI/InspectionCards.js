import {Dimensions} from 'react-native';
import SideSwipe from 'react-native-sideswipe';

import data from '../../../constants/inspectionData';
import React from "react";
import InspectionCard from "./inspectionCard";

export default class InspectionCards extends React.Component {
  state = {
    currentIndex: 0,
    cards: data
  };

  updateValue(id, value, index) {
    this.setState({
      cards: this.state.cards.map((card, i) => {
        if (i === index) {
          return {...card, [id]: value};
        } else {
          return card;
        }
      })
    })
  }

  render = () => {
    // center items on screen
    const {width} = Dimensions.get('window');
    const contentOffset = (InspectionCard.WIDTH);
    if (!this.state.cards){
      // console.log('null')
      return null;
    }
    return (
      <SideSwipe
        index={this.state.currentIndex}
        itemWidth={width}
        style={{width}}
        data={this.state.cards || []}
        contentOffset={0}
        onIndexChange={index =>
          this.setState(() => ({currentIndex: index}))
        }
        useVelocityForIndex={false}
        renderItem={({itemIndex, currentIndex, item, animatedValue}) => {
          return (
            <InspectionCard
              {...item}
              totalItems={this.state.cards && this.state.cards.length || 0}
              index={itemIndex}
              currentIndex={currentIndex}
              animatedValue={animatedValue}
              onUpdate={(id, value) => this.updateValue(id, value, currentIndex)}
            />
          )
        }}
      />
    );
  };
}