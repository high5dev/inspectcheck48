import React from 'react';
import {FlatList, SafeAreaView, StyleSheet, TouchableOpacity} from "react-native";
import {Block, Text, theme} from "galio-framework";
import Database from "../../db/db";
import {ClientEvent} from "clientevent";

export default class Agencies extends React.Component {
  // state = {data: []};
  // navigation = props.navigation;
  state = {data: []};

  componentDidMount() {
    ClientEvent.on("HEADER_ADD_AGENCIES", "Agencies", () => this.addButton());
    ClientEvent.on("HEADER_REFRESH_AGENCIES", "Agencies", () => this.refreshList());
    this.refreshList();
    // setTimeout(()=>this.props.navigation.navigate("Playgrounds", {agency_id: "7f9f6c60-56c2-11ea-8f97-0b3da08213c2"}),100);
  }

  componentWillUnmount() {
    ClientEvent.off("HEADER_ADD_AGENCIES", "Agencies");
    ClientEvent.off("HEADER_REFRESH_AGENCIES", "Agencies");
  }

  refreshList() {
    Database().query("SELECT agencies.*, (SELECT COUNT(id) FROM playgrounds WHERE agency_id=agencies.id AND playgrounds.deleted=false) as playgrounds FROM agencies WHERE agencies.deleted=false ORDER BY name ASC;", [], (error, results) => {
      this.setState({data: results});
    });
  }

  renderItem = ({item}) => {
    return (
      <Block style={styles.rows} row center space="between">
        <Block flex middle left style={styles.agency}>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate("AgencyAddEdit", {id: item.id})}
          >

            <Text bold left style={{paddingBottom: 5}}>
              {item.name || ""}
            </Text>
            <Text size={13} left>
              {item.poc || ""}
            </Text>
            <Text size={13} left>
              {`${item.city || ""}, ${item.state || ""} ${item.zip || ""}`}
            </Text>
          </TouchableOpacity>
        </Block>
        <Block flex width={150} middle right style={styles.actions}>
          <Block flex width={75} middle>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate("Playgrounds", {agency_id: item.id})}
              style={{alignItems: "center"}}
            >
              <Text bold size={10} style={{
                marginBottom: 0,
                paddingBottom: 0
              }}>{item.playgrounds}</Text>
              <Text muted size={10} style={{marginTop: 0, paddingTop: 0}}>Playgrounds</Text>
            </TouchableOpacity>
          </Block>
          {/*<Block flex width={75} middle>*/}
          {/*  <TouchableOpacity*/}
          {/*    onPress={() => this.props.navigation.navigate("Home")}*/}
          {/*    style={{alignItems: "center"}}*/}
          {/*  >*/}
          {/*    <Text bold size={10} style={{marginBottom: 0}}>{ownerPlaygrounds.length}</Text>*/}
          {/*    <Text muted size={10} style={{marginTop: 0}}>Assets</Text>*/}
          {/*  </TouchableOpacity>*/}
          {/*</Block>*/}
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
              No Agencies
            </Text>
            <Text size={13} center>
              Please Add using the Plus button above.
            </Text>
          </Block>
        )}
      </SafeAreaView>

    );
  }

  addButton() {
    // console.log('add called');
    this.props.navigation.navigate("AgencyAddEdit", {});
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
