import React from 'react';
import {Alert, FlatList, KeyboardAvoidingView, StyleSheet, TouchableOpacity} from "react-native";
import {Block, Text, theme} from "galio-framework";
import Database from "../../db/db";
import {ClientEvent} from "clientevent";

export default class Inspections extends React.Component {
  // state = {data: []};
  // navigation = props.navigation;
  state = {
    data: [{
      id: "1234",
      dated: new Date().getTime(),
      completed: new Date().getTime(),
      inspected_by: "Adam Smith",
      user_id: "1234",
      type: 1,
      typeName: "High Frequency",
      playground_id: "123456",
      playgroundName: "Some Playground",
      agencyName: "Agency Name",
      findings: 0,
    }]
  };

  componentDidMount() {
    ClientEvent.on("HEADER_ADD_INSPECTIONS", "Inspections", () => this.addButton());
    ClientEvent.on("HEADER_REFRESH_INSPECTIONS", "Inspections", () => this.refreshList());
    this.refreshList();

    // setTimeout(()=>this.props.navigation.navigate("InspectionAdd"),250); //{agency_id: "fb559ce0-5298-11ea-b3a8-bfae959ecc40"}

    // setTimeout(() => this.props.navigation.navigate("HFInspection", {
    //   inspection_id: "620ee390-677c-11ea-81d7-e9f6ce7c716d",
    //   playground_id: "57fda1b0-5788-11ea-8e16-31dc1f14c705",
    //   playground_name: "Test Playground",
    //   agency_name: "Agency X",
    //   // completed: "2019-01-01"
    // }), 250); //{inspection_id: "620ee390-677c-11ea-81d7-e9f6ce7c716d"}

    // setTimeout(() => this.props.navigation.navigate("QUICKInspection", {
    //   inspection_id: "b550aad0-faec-11ea-97f0-156bedb77ce8",
    //   playground_id: "57fda1b0-5788-11ea-8e16-31dc1f14c705",
    //   playground_name: "Test Playground",
    //   agency_name: "Agency X",
    //   // completed: "2019-01-01"
    // }), 250);
  }

  componentWillUnmount() {
    ClientEvent.off("HEADER_ADD_INSPECTIONS", "Inspections");
    ClientEvent.off("HEADER_REFRESH_INSPECTIONS", "Inspections");
  }

  refreshList() {
    Database().query("SELECT i.id, dated, completed,inspected_by,user_id,i.type,playground_id, p.name as playgroundName, a.name as agencyName, it.description as typeName, it.type as itemType,\n" +
      "       (SELECT count(id) FROM finding_asset WHERE inspection_id=i.id AND compliant = 2) as findings\n" +
      "    from inspections i\n" +
      "    JOIN playgrounds p ON i.playground_id=p.id AND p.deleted=false JOIN agencies a ON a.id=p.agency_id AND a.deleted=false\n" +
      "    JOIN inspection_types it ON it.id=i.type WHERE i.deleted=false AND i.archived=false ORDER BY datetime(dated) DESC;", [], (error, results) => {
      this.setState({data: results});
    });
  }

  reUploadMedia(item){
    Database().query("UPDATE media SET uploaded=0 WHERE id IN (SELECT finding_asset_media.media_id FROM finding_asset_media\n" +
      "    JOIN finding_asset ON finding_asset_media.finding_id = finding_asset.id\n" +
      "    WHERE finding_asset.inspection_id=? AND media_id IS NOT NULL\n" +
      "UNION\n" +
      "SELECT mx_item_media.media_id FROM mx_item_media\n" +
      "    JOIN inspection_mx_items ON mx_item_media.mx_id = inspection_mx_items.id\n" +
      "    WHERE inspection_mx_items.inspection_id=? AND media_id IS NOT NULL\n" +
      "UNION\n" +
      "SELECT pre FROM inspection_conditions WHERE inspection_id=? AND pre IS NOT NULL\n" +
      "UNION\n" +
      "SELECT post FROM inspection_conditions WHERE inspection_id=? AND post IS NOT NULL);", [item.id, item.id, item.id, item.id], (error, results) => {
      ClientEvent.emit("MEDIA_UPLOAD");
    })
  }

  longPress(item) {
    this.showOptions(item);
  }

  showOptions(item) {
    const self = this;
    let options = [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      }]

    options.push({
      text: 'View/Edit',
      onPress: () => {
        self.navigateTo(item);
      }
    });

    options.push({
      text: 'Re-Upload Media',
      onPress: () => {
        self.reUploadMedia(item);
      }
    });

    // if (!!this.props.canDelete) {
    //   options.push({
    //     text: 'Delete',
    //     onPress: () => {
    //       self.props.onDelete && self.props.onDelete(self.props.mediaId);
    //     }
    //   });
    // }
    Alert.alert(
      'Inspection Menu',
      'Pick',
      options,
      {cancelable: false}
    );
  }

  navigateTo(item){
    this.props.navigation.navigate(`${String(item.itemType || "").toUpperCase()}Inspection`, {
      inspection_id: item.id,
      playground_id: item.playground_id,
      playground_name: item.playgroundName,
      agency_name: item.agencyName,
      completed: item.completed
    })
  }

  renderItem = ({item}) => {
    return (
      <Block style={styles.rows} row center space="between">
        <Block flex middle left style={styles.agency}>
          <TouchableOpacity
            // onPress={() => this.props.navigation.navigate("Inspection", {id: item.id})}
            onPress={() => this.navigateTo(item)}
            onLongPress={() => this.longPress(item)}
            delayLongPress={750}
          >

            <Text bold left style={{paddingBottom: 5}}>
              {item.playgroundName || ""}
            </Text>
            <Text size={13} left>
              {item.agencyName || ""}
            </Text>
            <Text size={10} left>
              {item.typeName || ""}
            </Text>
            <Text size={10} left>
              {item.dated}
            </Text>
          </TouchableOpacity>
        </Block>
        <Block flex width={150} middle right style={styles.actions}>
          <Block flex width={75} middle>

            <TouchableOpacity
              // onPress={() => this.props.navigation.navigate("Playgrounds", {agency_id: item.id})}
              style={{alignItems: "center"}}
            >
              <Text bold size={10} style={{
                marginBottom: 0,
                paddingBottom: 0
              }}>{!item.completed ? "in progress" : "completed"}</Text>
              <Text muted size={10} style={{marginTop: 0, paddingTop: 0}}> </Text>
            </TouchableOpacity>

            <TouchableOpacity
              // onPress={() => this.props.navigation.navigate("Playgrounds", {agency_id: item.id})}
              style={{alignItems: "center"}}
            >
              <Text bold size={10} style={{
                marginBottom: 0,
                paddingBottom: 0
              }}>{item.findings || 0}</Text>
              <Text muted size={10} style={{marginTop: 0, paddingTop: 0}}>Findings</Text>
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
      <KeyboardAvoidingView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.settings}>
        <FlatList
          data={this.state.data}
          keyExtractor={(item, index) => String(item.id)}
          renderItem={this.renderItem}
          ListHeaderComponent={
            <Block style={styles.title}>
              <Text center muted size={12}>
                Choose below to edit/view or use the plus button to create
              </Text>
            </Block>
          }
        />
        {this.state.data.length === 0 && (
          <Block style={styles.title}>
            <Text bold center size={theme.SIZES.BASE} style={{paddingBottom: 5}}>
              No Inspections
            </Text>
            <Text size={13} center>
              Please Add using the Plus button above.
            </Text>
          </Block>
        )}
      </KeyboardAvoidingView>

    );
  }

  addButton() {
    this.props.navigation.navigate("InspectionAdd", {});
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
