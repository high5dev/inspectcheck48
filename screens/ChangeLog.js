import React, {Fragment} from 'react';
import {FlatList, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity} from "react-native";
import Database from "../db/db";
import {Block, Icon, Text, theme} from "galio-framework";
import CHANGES from "../constants/CHANGES";
import {Foundation} from '@expo/vector-icons';
import materialTheme from '../constants/Theme';

export default class ChangeLog extends React.Component {
  state = {};
  changeList = CHANGES;

  componentDidMount() {
    Database().getConfig("lastChange", "-1", (lastChange) => {
      this.setState({lastChange: parseInt(lastChange)}, () => {
        Database().setConfig("lastChange", String(this.changeList[0].id), () => {
        })
      });
    });

  }

  renderItem = ({item}) => {
    const {navigate} = this.props.navigation;
    return (
      <Block style={styles.rows} space="between">
        <TouchableOpacity onPress={() => navigate('ChangeLogEntry', {item: item})}>
          <Block row left style={{paddingTop: 7}}>
            <Block style={{width: 24}}>
              {this.state.lastChange < item.id && (
                <Foundation name="burst-new" size={24} color={materialTheme.COLORS.ACTIVE}/>
              )}
            </Block>
            <Block row left space="between">
              <Block left style={{width:"88%"}}>
                <Text size={14} style={{marginRight: 10, color: "#454545", marginBottom: 8}}>{item.dated}</Text>
                <Text size={12}>{item.title}</Text>
              </Block>
              <Block right style={{width:24}}>
                <Icon name="angle-right" family="font-awesome" style={{paddingRight: 5, marginTop: "auto"}}/>
              </Block>
            </Block>
          </Block>
        </TouchableOpacity>
      </Block>);
  };

  render() {

    return (
      <SafeAreaView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.settings}>
        <Block style={styles.title}>
          <Text bold center size={theme.SIZES.BASE} style={{paddingBottom: 5}}>
            Recent Changes
          </Text>
          <Text center muted size={12}>
            Most recent on top
          </Text>
        </Block>
        {!!this.state.lastChange && (
          <FlatList
            data={this.changeList}
            keyExtractor={(item, index) => String(item.id)}
            renderItem={this.renderItem}
          />
        )}
      </SafeAreaView>
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
  },
  rows: {
    height: theme.SIZES.BASE * 4.5,
    paddingHorizontal: theme.SIZES.BASE,
    marginBottom: theme.SIZES.BASE / 2,
    backgroundColor: '#fff'
  }
});
