import React from 'react';
import {FlatList, SafeAreaView, StyleSheet, TouchableOpacity} from "react-native";
import {Block, Text, theme} from "galio-framework";
import Icon from '../../../components/Icon';
import Database from "../../../db/db";
import {ClientEvent} from "clientevent";
import {ImageAsset} from "../../../components/ImageAsset";
import {v1} from "uuid";

export default class ImportAssets extends React.Component {
  // state = {data: []};
  // navigation = props.navigation;
  state = {
    data: [],
    agency_id: "",
    agency_name: "",
    playground_id: "",
    playground_name: "",
    assets: [],
    showAssets: false,
  };
  tempAssets = [];
  newPlaygroundId = "";

  componentDidMount() {
    this.newPlaygroundId = this.props.navigation.getParam('playground_id', "");
    const inspection_id = this.props.navigation.getParam('inspection_id', null);

    ClientEvent.on("HEADER_SAVE_IMPORTASSETS", "ImportAssets", () => this.saveButton());
    ClientEvent.on("HEADER_CANCEL_IMPORTASSETS", "ImportAssets", () => this.cancelButton());
    this.refreshList();
    // setTimeout(()=>this.props.navigation.navigate("Playgrounds", {agency_id: "7f9f6c60-56c2-11ea-8f97-0b3da08213c2"}),100);

  }

  componentWillUnmount() {
    ClientEvent.off("HEADER_SAVE_IMPORTASSETS", "ImportAssets");
    ClientEvent.off("HEADER_CANCEL_IMPORTASSETS", "ImportAssets");
  }

  saveButton() {
    if (this.state.assets.length > 0) {
      this.tempAssets = [...this.state.assets];
      this.saveAsset(() => {
        ClientEvent.emit("HEADER_REFRESH_ASSETS");
        ClientEvent.emit("HEADER_REFRESH_PLAYGROUNDS");
        ClientEvent.emit("HEADER_REFRESH_AGENCIES");
        // if (this.state.inspection) {
        ClientEvent.emit("HEADER_REFRESH_INSPECTION");
        // }
        this.cancelButton();
      });
    } else {
      this.cancelButton();
    }
  }

  cancelButton() {
    this.props.navigation.goBack();
  }

  saveAsset(cb) {
    const saveAsset = this.tempAssets.shift();
    if (saveAsset) {
      delete saveAsset['agency_id'];
      delete saveAsset['agency_name'];
      delete saveAsset['id'];
      delete saveAsset['playground_name'];
      saveAsset['playground_id'] = this.newPlaygroundId;
      saveAsset['id'] = v1();
      Database().addSyncExec("assets", saveAsset, () => {
        setTimeout(() => {
          this.saveAsset(cb);
        }, 5)
      });
    } else {
      cb();
    }
  }

  refreshList() {
    const step = this.step();
    if (step === 0) {
      Database().query("SELECT agencies.*, (SELECT COUNT(id) FROM playgrounds WHERE agency_id=agencies.id) as playgrounds  FROM agencies ORDER BY name ASC;", [], (error, results) => {
        this.setState({data: results});
      });
    } else if (step === 1) {
      Database().query("SELECT playgrounds.*,(SELECT COUNT(id) FROM assets WHERE playground_id=playgrounds.id) as assets FROM playgrounds WHERE agency_id=? ORDER BY name ASC;", [this.state.agency_id], (error, results) => {
        this.setState({data: results});
      });
    } else if (step === 2) {
      Database().query("SELECT * FROM assets WHERE playground_id=? ORDER BY name ASC;", [this.state.playground_id], (error, results) => {
        this.setState({data: results});
      });
    } else if (step === 3) {
      this.setState({data: this.state.assets});
    }
  }

  selectAgency = (id, name) => {
    this.setState({agency_id: id, agency_name: name, playground_id: "", playground_name: ""}, () => {
      this.refreshList();
    });
  };

  selectPlayground = (id, name) => {
    this.setState({playground_id: id, playground_name: name}, () => {
      this.refreshList();
    });
  };

  startOver = () => {
    this.setState({agency_id: "", agency_name: "", playground_id: "", playground_name: ""}, () => {
      this.refreshList();
    });
  }

  goThere = () => {
    const step = this.step();
    if (step === 2) {
      this.selectPlayground("", "");
    } else {
      this.startOver();
    }
  }

  renderItem = ({item, index}) => {
    const step = this.step();
    if (step === 0) {
      return this.renderAgency(item, index);
    } else if (step === 1) {
      return this.renderPlayground(item, index);
    } else if (step === 2) {
      return this.renderAsset(item, index);
    } else if (step === 3) {
      return this.renderSavedAsset(item, index);
    }
  };

  addAsset(item) {
    this.setState({assets: this.state.assets.concat(item)});
  }

  removeAsset(index) {
    this.setState({assets: this.state.assets.filter((asset, ind) => ind !== index)}, () => {
      this.refreshList();
    });
  }

  renderAgency(item, index) {
    return (
      <Block style={styles.rows} row center space="between" key={index}>
        <Block flex middle left style={styles.agency}>
          <TouchableOpacity
            onPress={() => this.selectAgency(item.id, item.name)}
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
              onPress={() => this.selectAgency(item.id, item.name)}
              style={{alignItems: "center"}}
            >
              <Text bold size={10} style={{
                marginBottom: 0,
                paddingBottom: 0
              }}>{item.playgrounds}</Text>
              <Text muted size={10} style={{marginTop: 0, paddingTop: 0}}>Playgrounds</Text>
            </TouchableOpacity>
          </Block>
        </Block>
      </Block>
    );
  }

  renderPlayground(item, index) {
    return (
      <Block style={styles.rows} row center space="between" key={index}>
        <Block flex middle left style={styles.agency}>
          <TouchableOpacity
            onPress={() => this.selectPlayground(item.id, item.name)}
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
              onPress={() => this.selectPlayground(item.id, item.name)}
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

  renderAsset(item, index) {
    return (
      <Block style={styles.rows} row center space="between" key={index}>
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
            onPress={() => this.addAsset({
              ...item,
              agency_id: this.state.agency_id,
              agency_name: this.state.agency_name,
              playground_id: this.state.playground_id,
              playground_name: this.state.playground_name
            })}
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

  renderSavedAsset(item, index) {
    return (
      <Block style={styles.rows} row center space="between" key={index}>
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
            onPress={() => this.removeAsset(index)}
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

  renderBack() {
    return (
      <Block style={styles.rows} row center space="between">
        <Block flex middle left style={styles.agency}>
          <TouchableOpacity
            onPress={() => this.goThere()}
          >
            <Text bold left style={{paddingBottom: 5}}>
              Go Back
            </Text>
            <Text size={13} left>
              {" "}
            </Text>
          </TouchableOpacity>
        </Block>
      </Block>
    );
  }

  step() {
    if (this.state.showAssets) return 3;
    if (this.state.agency_id === "") {
      return 0;
    }
    if (this.state.playground_id === "") {
      return 1;
    }
    return 2;
  }

  render() {

    let step = this.step();

    return (
      <SafeAreaView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.settings}>
        <FlatList
          data={this.state.data}
          keyExtractor={(item, index) => String(item.id)}
          renderItem={this.renderItem}
          ListHeaderComponent={
            <React.Fragment>
              {this.state.assets.length === 0 && (
                <Block style={styles.title}>
                  <Text bold center size={theme.SIZES.BASE} style={{paddingBottom: 5}}>
                    No Chosen Assets
                  </Text>
                </Block>
              )}
              {this.state.assets.length > 0 && step !== 3 && (
                <TouchableOpacity
                  onPress={() => this.setState({showAssets: true}, () => {
                    this.refreshList();
                  })}
                >
                  <Block style={styles.title} row center>

                    <Text bold center size={theme.SIZES.BASE} style={{paddingBottom: 5}}>
                      Assets to Copy ({this.state.assets.length})
                    </Text>
                    <Icon
                      size={24}
                      style={{marginTop: -5, marginLeft: 15}}
                      family="font-awesome"
                      name="chevron-circle-up"
                      color={theme.COLORS['ICON']}
                    />
                  </Block>
                </TouchableOpacity>
              )}
              {step === 0 && (
                <Block style={styles.title}>
                  <Text size={13} center>
                    Select Agency
                  </Text>
                </Block>
              )}
              {step === 1 && (
                <React.Fragment>
                  <Block style={styles.title}>
                    <Text size={13} left>
                      Agency: {this.state.agency_name}
                    </Text>
                    <Text size={13} center>
                      Select Playground
                    </Text>
                  </Block>
                  {this.renderBack()}
                </React.Fragment>
              )}
              {step === 2 && (
                <React.Fragment>
                  <Block style={styles.title}>
                    <Text size={13} left>
                      Agency: {this.state.agency_name}
                    </Text>
                    <Text size={13} left>
                      Playground: {this.state.playground_name}
                    </Text>
                    <Text size={13} center>
                      Select Asset
                    </Text>
                  </Block>
                  {this.renderBack()}
                </React.Fragment>
              )}
              {step === 3 && (
                <TouchableOpacity
                  onPress={() => this.setState({showAssets: false}, () => {
                    this.refreshList();
                  })}
                >
                  <Block style={styles.title} row center>

                    <Text bold center size={theme.SIZES.BASE} style={{paddingBottom: 5}}>
                      Selected Assets ({this.state.assets.length})
                    </Text>
                    <Icon
                      size={24}
                      style={{marginTop: -5, marginLeft: 15}}
                      family="font-awesome"
                      name="chevron-circle-down"
                      color={theme.COLORS['ICON']}
                    />
                  </Block>
                  <Block>
                    <Text size={13} center>
                      (Tap to remove)
                    </Text>
                  </Block>
                </TouchableOpacity>
              )}
            </React.Fragment>
          }
        />
      </SafeAreaView>

    );
  }

}

const styles = StyleSheet.create({
  settings: {
    paddingVertical: theme.SIZES.BASE / 3,
  },
  title: {
    paddingTop: theme.SIZES.BASE / 8,
    paddingBottom: theme.SIZES.BASE / 8,
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
