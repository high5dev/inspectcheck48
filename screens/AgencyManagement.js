import React from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import {Block, theme} from 'galio-framework';

import Tile from "../components/Tile";
const {width} = Dimensions.get('screen');

export default class AgencyManagement extends React.Component {

  render() {
    const { navigation } = this.props;
    return (
      <Block flex center style={styles.home}>
        <Block card row>
          <Tile icon="md-business" family="ionicon" onPress={()=>navigation.navigate("Agencies")}>Agencies</Tile>
          <Tile icon="md-return-left" family="ionicon" onPress={()=>navigation.goBack()}>Back</Tile>
        </Block>
        <Block card row>
          {/*<Tile icon="md-home" family="ionicon">Playgrounds</Tile>*/}
          {/*<Tile icon="md-help-buoy" family="ionicon">Assets</Tile>*/}
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  home: {
    width: width,
  },
  search: {
    height: 48,
    width: width - 32,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 3,
  },
  header: {
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    elevation: 4,
    zIndex: 2,
  },
  tabs: {
    marginBottom: 24,
    marginTop: 10,
    elevation: 4,
  },
  tab: {
    backgroundColor: theme.COLORS.TRANSPARENT,
    width: width * 0.50,
    borderRadius: 0,
    borderWidth: 0,
    height: 24,
    elevation: 0,
  },
  tabTitle: {
    lineHeight: 19,
    fontWeight: '300'
  },
  divider: {
    borderRightWidth: 0.3,
    borderRightColor: theme.COLORS.MUTED,
  },
  products: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE * 2,
  },
});
