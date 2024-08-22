import React from 'react';
import {FlatList, SafeAreaView, StyleSheet, TouchableOpacity} from "react-native";
import {Block, Text, theme} from "galio-framework";
import Database from "../../db/db";
import {ImageAsset} from "../../components/ImageAsset";
import {ClientEvent} from "clientevent";
import {objArraySortByKey} from "../../util/shared";

export default class Assets extends React.Component {
  // state = {data: []};
  // navigation = props.navigation;
  state = {data: []};

  componentDidMount() {
    ClientEvent.on("HEADER_ADD_ASSETS", "Assets", () => this.addButton());
    ClientEvent.on("HEADER_CLONE_ASSETS", "Assets", () => this.cloneButton());
    ClientEvent.on("HEADER_REFRESH_ASSETS", "Assets", () => this.refreshList());
    this.refreshList();
    // setTimeout(()=>this.props.navigation.navigate("AssetAddEdit", {id: "6c9f4f10-5788-11ea-8e16-31dc1f14c705", playground_id: "57fda1b0-5788-11ea-8e16-31dc1f14c705"}),100);
  }

  componentWillUnmount() {
    ClientEvent.off("HEADER_ADD_ASSETS", "Assets");
    ClientEvent.off("HEADER_CLONE_ASSETS", "Assets");
    ClientEvent.off("HEADER_REFRESH_ASSETS", "Assets");
  }

  refreshList() {
    const playgroundId = this.props.navigation.getParam('playground_id', "");
    Database().query("SELECT * FROM assets WHERE playground_id=? AND deleted=false ORDER BY name ASC;", [playgroundId], (error, results) => {
      this.setState({data: objArraySortByKey(results, "name")});
    });
  }

  addButton() {
    const playgroundId = this.props.navigation.getParam('playground_id', "");
    this.props.navigation.navigate("AssetAddEdit", {playground_id: playgroundId});
  }

  cloneButton() {
    const playgroundId = this.props.navigation.getParam('playground_id', "");
    this.props.navigation.navigate("ImportAssets", {playground_id: playgroundId});
  }

  renderItem = ({item}) => {
    const {navigation} = this.props;
    return (
      <Block style={styles.rows} row center space="between">
        <ImageAsset
          style={{
            borderRadius: 20,
            height: 50,
            width: 50,
            marginRight: 5
          }}
          mediaId={item.thumbnail_url || ""}
          updated={Math.round(new Date().getTime() / 1000)}
          placeholderColor='#b3e5fc'/>
        <Block flex middle left style={styles.agency}>
          <TouchableOpacity
            onPress={() => navigation.navigate("AssetAddEdit", {id: item.id, playground_id: item.playground_id})}
          >
            <Text bold left style={{paddingBottom: 5}}>
              {item.name}
            </Text>
            <Text size={13} left>
              {item.part_number}
            </Text>
          </TouchableOpacity>
        </Block>
        <Block flex width={150} middle right style={styles.actions}>
          <Block flex width={75} middle>
            {/*<TouchableOpacity*/}
            {/*  onPress={() => this.props.navigation.navigate("Home")}*/}
            {/*  style={{alignItems:"center"}}*/}
            {/*>*/}
            <Text bold size={10} style={{marginBottom: 0}}>{0}</Text>
            <Text muted size={10} style={{marginTop: 0}}>Open Issues</Text>
            {/*</TouchableOpacity>*/}
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
              No Assets Loaded for this Site
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
