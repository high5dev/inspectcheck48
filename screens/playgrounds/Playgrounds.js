import React from 'react';
import {FlatList, SafeAreaView, StyleSheet, TouchableOpacity} from "react-native";
import {Block, Text, theme} from "galio-framework";
import Database from "../../db/db";
import {ClientEvent} from "clientevent";

export default class Playgrounds extends React.Component {
  state = {data: []};

  componentDidMount() {
    ClientEvent.on("HEADER_ADD_PLAYGROUNDS", "Playgrounds", () => this.addButton());
    ClientEvent.on("HEADER_REFRESH_PLAYGROUNDS", "Playgrounds", () => this.refreshList());
    this.refreshList();
    // setTimeout(() => this.props.navigation.navigate("Assets", {playground_id: "57fda1b0-5788-11ea-8e16-31dc1f14c705"}), 100);
  }

  componentWillUnmount() {
    ClientEvent.off("HEADER_ADD_PLAYGROUNDS", "Playgrounds");
    ClientEvent.off("HEADER_REFRESH_PLAYGROUNDS", "Playgrounds");
  }

  refreshList() {
    const agencyId = this.props.navigation.getParam('agency_id', "");
    Database().query("SELECT playgrounds.*,(SELECT COUNT(id) FROM assets WHERE playground_id=playgrounds.id AND assets.deleted=false) as assets FROM playgrounds WHERE agency_id=? AND playgrounds.deleted=false ORDER BY name ASC;", [agencyId], (error, results) => {
      this.setState({data: results});
    });
  }

  addButton() {
    const agencyId = this.props.navigation.getParam('agency_id', "");
    this.props.navigation.navigate("PlaygroundAddEdit", {agency_id: agencyId});
  }


  renderItem = ({item}) => {
    const {navigation} = this.props;
    return (
      <Block style={styles.rows} row center space="between">
        <Block flex middle left style={styles.agency}>
          <TouchableOpacity
            onPress={() => navigation.navigate('PlaygroundAddEdit', {id: item.id, agency_id: item.agency_id})}
          >
            <Text bold left style={{paddingBottom: 5}}>
              {item.name}
            </Text>
            <Text size={13} left>
              {item.location_notes}
            </Text>
          </TouchableOpacity>
        </Block>
        <Block flex width={150} middle right style={styles.actions}>
          <Block flex width={75} middle>
            <TouchableOpacity
              onPress={() => navigation.navigate("Assets", {playground_id: item.id})}
              style={{alignItems: "center"}}
            >
              <Text bold size={10} style={{marginBottom: 0}}>{item.assets}</Text>
              <Text muted size={10} style={{marginTop: 0}}>Assets</Text>
            </TouchableOpacity>
          </Block>
        </Block>
      </Block>
    );
  }

  render() {

    return (
      <SafeAreaView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.settings}>
        <FlatList
          data={this.state.data}
          keyExtractor={(item, index) => String(item.id)}
          renderItem={this.renderItem}
          ListHeaderComponent={
            <Block style={styles.title}>
              <Text center muted size={12}>
                Choose below to view
              </Text>
            </Block>
          }
        />
        {this.state.data.length === 0 && (
          <Block style={styles.title}>
            <Text bold center size={theme.SIZES.BASE} style={{paddingBottom: 5}}>
              No Playgrounds Loaded for this Agency
            </Text>
            <Text size={13} center>
              Please Add using the Plus button above.
            </Text>
          </Block>
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
  },
  agency: {
    width: theme.SIZES.BASE,
    // borderRightColor:'#000',
    // borderRightWidth:1
  },
  actions: {
    width: theme.SIZES.BASE
  },
  actionOption: {
    height: theme.SIZES.BASE * 4.5
  },
});
