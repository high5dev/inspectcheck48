import React from 'react';
import {ScrollView, StyleSheet, TouchableOpacity} from "react-native";
import {Block, Icon, Text, theme} from "galio-framework";
import CHANGES from "../constants/CHANGES";
import {Foundation} from '@expo/vector-icons';
import materialTheme from '../constants/Theme';

export default class ChangeLogEntry extends React.Component {
  state = {}

  componentDidMount() {
    this.setState({...this.props.navigation.getParam('item', {})});
  }

  renderItem = ({item, index}) => {
    const {navigate} = this.props.navigation;
    const shorten = function (description) {
      return description;
    }

    return (
      <Block style={styles.rows} space="between">
        <TouchableOpacity onPress={() => navigate('Pro')}>
          <Block row left space="between" style={{paddingTop: 7}}>
            <Block style={{width: 24}}>
              <Foundation name="burst-new" size={24} color={materialTheme.COLORS.ACTIVE}/>
            </Block>
            <Block>
              <Text size={14} style={{marginRight: 10, color: "#454545", marginBottom: 8}}>{item.dated}</Text>
              <Text size={12}>{item.title}</Text>
            </Block>
            <Icon name="angle-right" family="font-awesome" style={{paddingRight: 5, marginTop: "auto"}}/>
          </Block>
        </TouchableOpacity>
      </Block>);
  }


  render() {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.settings}>
        <Block style={styles.title}>
          <Text bold center size={theme.SIZES.BASE} style={{paddingBottom: 5}}>
            {this.state.dated || ""}
          </Text>
          <Text center size={16}>
            {this.state.title || ""}
          </Text>
        </Block>
        <Block style={styles.title}>
          <Text left size={14}>
            {this.state.description || ""}
          </Text>
        </Block>
        {(this.state.points || []).map((point, index) => {
          return <Block row key={index} style={{paddingLeft: 30}}>
            <Icon name="angle-right" family="font-awesome" style={{paddingRight: 5}}/>
            <Text size={14} style={{marginRight: 10, color: "#454545", marginBottom: 8, width: "90%"}}>{point}</Text>
          </Block>
        })}

      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  settings: {
    paddingVertical: theme.SIZES.BASE / 3,
  },
  title: {
    paddingTop: theme.SIZES.BASE,
    paddingBottom: theme.SIZES.BASE / 2,
    paddingLeft: 20,
    paddingRight: 20
  },
  rows: {
    height: theme.SIZES.BASE * 4.5,
    paddingHorizontal: theme.SIZES.BASE,
    marginBottom: theme.SIZES.BASE / 2,
    backgroundColor: '#fff'
  }
});
