import React from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import {Block, theme} from 'galio-framework';
import CustomTextInput from "../../components/CustomTextInput";
import Database from "../../db/db";
import {v1} from "uuid";
import {ClientEvent} from "clientevent";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";

const {width} = Dimensions.get('screen');

const thumbMeasure = (width - 48 - 32) / 3;

export default class PlaygroundAddEdit extends React.Component {
  state = {
    id: null,
    data: {},
    needSave: false,
    originalData: {}
  };

  componentDidMount() {
    // console.log("AddEdit Mount");
    ClientEvent.on("HEADER_CANCEL_PLAYGROUNDADDEDIT", "PlaygroundAddEdit", () => this.cancelCall());
    ClientEvent.on("HEADER_SAVE_PLAYGROUNDADDEDIT", "PlaygroundAddEdit", () => this.saveCall());
    const id = this.props.navigation.getParam('id', "");
    const agency_id = this.props.navigation.getParam('agency_id', "");
    if (agency_id.length > 0) {
      if (id.length > 0) {
        this.getPlayground(id, agency_id);
      } else {
        this.setState({data: {agency_id: agency_id}});
      }
    } else {
      alert("Agency ID not specified");
      this.props.navigation.pop();
    }
  }

  componentWillUnmount() {
    // console.log("AddEdit Unmount");
    ClientEvent.off("HEADER_CANCEL_PLAYGROUNDADDEDIT", "PlaygroundAddEdit");
    ClientEvent.off("HEADER_SAVE_PLAYGROUNDADDEDIT", "PlaygroundAddEdit");
  }

  getPlayground(id, agency_id) {
    Database().query("SELECT * FROM playgrounds WHERE id=? AND agency_id=?", [id, agency_id], (err, results) => {
      if (results.length > 0) {
        const minusKey = {...results[0]};
        delete minusKey['id'];
        this.setState({id: id, data: minusKey, originalData: minusKey});
      } else {
        alert("Unable to find ID");
        this.props.navigation.goBack();
      }
    });
  }

  updateFormData(id, value) {
    this.setState({data: {...this.state.data, [id]: value}, needSave: true});
  }

  saveCall() {
    let thisId = this.state.id;
    const thisData = {...this.state.data};
    if (thisId === null) {
      thisId = v1();
      thisData['id'] = thisId;
      Database().addSyncExec("playgrounds", thisData, this.dbResponse);
    } else {
      Database().updateSyncExec("playgrounds", this.state.originalData, thisData, "id", thisId, this.dbResponse);
    }
  }

  dbResponse = (err, results) => {
    if (!err) {
      ClientEvent.emit("HEADER_REFRESH_PLAYGROUNDS");
      ClientEvent.emit("HEADER_REFRESH_AGENCIES");
      this.props.navigation.pop();
    } else {
      alert(err);
    }
  }

  cancelCall() {
    this.props.navigation.goBack();
  }

  render() {
    return (
      <Block flex center style={{paddingVertical: theme.SIZES.BASE * 2}}>
        <KeyboardAwareScrollView>
          <CustomTextInput id={"name"}
                           title={"Name"}
                           placeHolder={"Enter Playground Name"}
                           value={this.state.data.name}
                           onChange={(id, value) => this.updateFormData(id, value)}
          />

          <CustomTextInput id={"location_notes"}
                           title={"Location Notes"}
                           placeHolder={"Enter notes about it's location"}
                           value={this.state.data.location_notes}
                           multiline={true}
                           numberOfLines={4}
                           onChange={(id, value) => this.updateFormData(id, value)}
          />
        </KeyboardAwareScrollView>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  components: {
    padding: 24,
    flex: 1,
    // justifyContent: "flex-end"
  },
  group: {
    paddingTop: theme.SIZES.BASE,
    width: (width / theme.SIZES.BASE) * 8
  },
  inner: {
    padding: 24,
    flex: 1,
    justifyContent: "flex-end",
  },
});
