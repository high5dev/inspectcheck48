import React from 'react';
import {ActivityIndicator, Dimensions, StyleSheet} from 'react-native';
import {Block, Text, theme} from 'galio-framework';
import Tile from "../components/Tile";
import SyncDatabase from "../db/SyncDatabase";
import {ClientEvent} from "clientevent";
import {MediaSync} from "../components/MediaSync";
import Database from "../db/db";
import CHANGES from "../constants/CHANGES";
import * as Updates from 'expo-updates';

const {width} = Dimensions.get('screen');

export default class Home extends React.Component {
  state = {
    syncMessage: "",
    updateAvailable: false,
    changes: false,
    debugOptions: false
  }

  constructor(props) {
    super(props);
    this.syncDatabase = new SyncDatabase({
      onStatus: (msg) => {
        this.setState({syncMessage: msg});
        ClientEvent.emit("DB_SYNC_MESSAGE", msg);
      },
      onComplete: () => {
        this.setState({syncMessage: ""});
        ClientEvent.emit("DB_SYNC_MESSAGE", "");
      }
    });
  }

  componentDidMount() {
    ClientEvent.on("HEADER_SYNC_HOME", "Home", () => this.syncCall());
    ClientEvent.on("HOME_RESET_DB", "Home", () => this.resetCall());
    // setTimeout(()=>this.props.navigation.navigate('Inspections'))
    // setTimeout(()=>this .props.navigation.navigate('Agencies'))
    this.checkForUpdate();
    const self = this;
    Database().getConfig("lastChange", "-1", (lastChange) => {
      if (parseInt(lastChange) < CHANGES.reverse()[0].id) {
        self.setState({changes: true});
      }
    });
  }

  componentWillUnmount() {
    ClientEvent.off("HEADER_SYNC_HOME", "Home");
    ClientEvent.off("HOME_RESET_DB", "Home");
  }

  syncCall() {
    if (this.state.syncMessage.length === 0) {
      this.syncDatabase.sync();
      this.checkForUpdate();
    }
  }

  resetCall() {
    if (this.state.syncMessage.length === 0) {
      this.syncDatabase.reset((response) => {
        ClientEvent.emit("CONFIG_RESET_RESPONSE", response);
      });
    }
  }

  checkForUpdate() {
    const self = this;
    Updates.checkForUpdateAsync().then(({isAvailable}) => {
      if (isAvailable) {
        self.setState({updateAvailable: true});
      }
    }).catch((err) => {
      console.log(err);
    })
  }

  doUpdate() {
    Updates.reloadAsync();
    //   .catch((err) => {
    //   alert("There was an error retrieving the update. Are you connected to a network?");
    // });
  }

  render() {
    const {navigation} = this.props;
    return (
      <Block flex center style={styles.home}>
        {this.state.syncMessage.length > 0 && (
          <Block style={{paddingTop: 10}}>
            <ActivityIndicator size={"large"} color={theme.COLORS.WARNING}/>
            <Text>{this.state.syncMessage}</Text>
          </Block>
        )}

        <Block row>
          <Tile icon="clipboard-notes" family="foundation"
                onPress={() => navigation.navigate('Inspections')}>Inspections</Tile>
          <Tile icon="md-business" family="ionicon" onPress={() => navigation.navigate("Agencies")}>Agencies</Tile>
        </Block>
        {this.state.debugOptions && (
          <Block row>
            <Tile icon="md-construct" family="ionicon"
                  onPress={() => navigation.navigate('Debug')}>Debug</Tile>
          </Block>
        )}
        {(this.state.updateAvailable || this.state.changes) && (
          <Block row>
            {this.state.updateAvailable && (
              <Tile icon="ios-code-download" family="ionicon"
                    onPress={() => this.doUpdate()}>Update</Tile>
            )}
            {this.state.changes && (
              <Tile icon="burst-new" family="foundation"
                    onPress={() => navigation.navigate('ChangeLog')}>Changes</Tile>
            )}
          </Block>
        )}
        <MediaSync/>
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
