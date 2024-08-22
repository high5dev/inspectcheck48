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

export default class AgencyAddEdit extends React.Component {
  state = {
    id: null,
    data: {},
    needSave: false,
    originalData: {}
  }

  componentDidMount() {
    // console.log("AddEdit Mount");
    ClientEvent.on("HEADER_CANCEL_AGENCYADDEDIT", "AgencyAddEdit", () => this.cancelCall());
    ClientEvent.on("HEADER_SAVE_AGENCYADDEDIT", "AgencyAddEdit", () => this.saveCall());
    const id = this.props.navigation.getParam('id', "");
    if (id.length > 0) {
      this.getAgency(id);
    }
  }

  componentWillUnmount() {
    // console.log("AddEdit Unmount");
    ClientEvent.off("HEADER_CANCEL_AGENCYADDEDIT", "AgencyAddEdit");
    ClientEvent.off("HEADER_SAVE_AGENCYADDEDIT", "AgencyAddEdit");
  }

  getAgency(id) {
    Database().query("SELECT * FROM agencies WHERE id=?", [id], (err, results) => {
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
      Database().addSyncExec("agencies", thisData, this.dbResponse);
    } else {
      Database().updateSyncExec("agencies", this.state.originalData, thisData, "id", thisId, this.dbResponse);
    }
  }

  dbResponse = (err, results) => {
    if (!err) {
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
                           placeHolder={"Enter Agency Name"}
                           value={this.state.data.name}
                           onChange={(id, value) => this.updateFormData(id, value)}
          />

          <CustomTextInput id={"poc"}
                           title={"POC"}
                           placeHolder={"Point of Contact"}
                           value={this.state.data.poc}
                           onChange={(id, value) => this.updateFormData(id, value)}
          />

          <CustomTextInput id={"address1"}
                           title={"Address1"}
                           placeHolder={"Address 1"}
                           value={this.state.data.address1}
                           onChange={(id, value) => this.updateFormData(id, value)}
          />

          <CustomTextInput id={"address2"}
                           title={"Address 2"}
                           placeHolder={"Optional..."}
                           value={this.state.data.address2}
                           onChange={(id, value) => this.updateFormData(id, value)}
          />

          <CustomTextInput id={"city"}
                           title={"City"}
                           placeHolder={"City"}
                           value={this.state.data.city}
                           onChange={(id, value) => this.updateFormData(id, value)}
          />

          <CustomTextInput id={"state"}
                           title={"State"}
                           placeHolder={"State"}
                           value={this.state.data.state}
                           onChange={(id, value) => this.updateFormData(id, value)}
          />

          <CustomTextInput id={"zip"}
                           title={"Zip"}
                           placeHolder={"Zip"}
                           value={this.state.data.zip}
                           onChange={(id, value) => this.updateFormData(id, value)}
          />

          <CustomTextInput id={"phone"}
                           title={"Phone"}
                           placeHolder={"Phone"}
                           value={this.state.data.phone}
                           onChange={(id, value) => this.updateFormData(id, value)}
          />

          <CustomTextInput id={"email"}
                           title={"Email"}
                           placeHolder={"Email"}
                           value={this.state.data.email}
                           onChange={(id, value) => this.updateFormData(id, value)}
          />

          <CustomTextInput id={"notes"}
                           title={"Notes"}
                           placeHolder={"Enter Agency Notes here..."}
                           value={this.state.data.notes}
                           multiline={true}
                           numberOfLines={10}
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
