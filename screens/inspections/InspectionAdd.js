import React from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import {Block, Button, theme} from 'galio-framework';
import CustomTextInput from "../../components/CustomTextInput";
import Database from "../../db/db";
import {v1} from "uuid";
import {ClientEvent} from "clientevent";
import CustomSelect from "../../components/CustomSelect";
import {containsKeys, dbDate} from "../../util/shared";
import materialTheme from "../../constants/Theme";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";

const {width} = Dimensions.get('screen');

const thumbMeasure = (width - 48 - 32) / 3;

export default class InspectionAdd extends React.Component {

  firstName = global.configData && global.configData.profile && global.configData.profile.fname;
  lastName = global.configData && global.configData.profile && global.configData.profile.lname;
  fullName = [this.firstName, this.lastName].filter(item => item.length > 0).join(" ");

  state = {
    id: null,
    data: {
      inspected_by: this.fullName || ""
    },
    needSave: false,
    originalData: {},
    agencyList: [],
    playgroundList: [],
    inspectionTypeList: [],
  };

  componentDidMount() {
    // console.log(dbDate(new Date()));
    // console.log(this.firstName, this.lastName);
    // console.log("AddEdit Mount");
    ClientEvent.on("HEADER_CANCEL_INSPECTIONADD", "InspectionAdd", () => this.cancelCall());
    // ClientEvent.on("HEADER_SAVE_INSPECTIONADD", "InspectionAdd", () => this.saveCall());
    this.getAgencies();
    this.getInspectionTypes();
    const id = this.props.navigation.getParam('id', "");
    if (id.length > 0) {
      this.getAgency(id);
    }
  }

  componentWillUnmount() {
    // console.log("AddEdit Unmount");
    ClientEvent.off("HEADER_CANCEL_INSPECTIONADD", "InspectionAdd");
    // ClientEvent.off("HEADER_SAVE_INSPECTIONADD", "InspectionAdd");
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

  getAgencies() {
    Database().query("SELECT name as display, id as `value` FROM agencies ORDER BY name ASC;", [], (err, results) => {
      if (!err) {
        this.setState({agencyList: results});
      }
    });
  }

  getPlaygrounds(agency_id) {
    Database().query("SELECT name as display, id as `value` FROM playgrounds WHERE agency_id=? ORDER BY name ASC;", [agency_id], (err, results) => {
      if (!err) {
        this.setState({playgroundList: results});
      }
    });
  }

  getInspectionTypes() {
    Database().query("SELECT description as display, id as `value` FROM inspection_types WHERE visible=1 ORDER BY description ASC;", [], (err, results) => {
      if (!err) {
        this.setState({inspectionTypeList: results});
      }
    });
  }

  updateFormData(id, value, cb) {
    this.setState({data: {...this.state.data, [id]: value}, needSave: true}, cb && cb());
  }

  saveCall() {
    let thisId = this.state.id;
    const thisData = {...this.state.data};
    delete thisData['agency_id'];
    if (thisId === null) {
      thisId = v1();
      thisData['id'] = thisId;
      thisData['dated'] = dbDate(new Date());
      thisData['user_id'] = global.configData.profile.id;
      Database().addSyncExec("inspections", thisData, this.dbResponse);
    } else {
      Database().updateSyncExec("inspections", this.state.originalData, thisData, "id", thisId, this.dbResponse);
    }
  }

  dbResponse = (err, results) => {
    if (!err) {
      ClientEvent.emit("HEADER_REFRESH_INSPECTIONS");
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
      <Block flex center style={{paddingVertical: theme.SIZES.BASE * 2, paddingHorizontal: theme.SIZES.BASE}}>
        <KeyboardAwareScrollView>

          <CustomSelect id={"agency_id"}
                        title={"Agency"}
                        placeHolder={"Choose..."}
                        default={1}
                        data={this.state.agencyList || []}
                        style={{width: "100%"}}
                        onChange={(id, value) => {
                          this.updateFormData(id, value);
                          this.getPlaygrounds(value);
                        }}
          />

          <CustomSelect id={"playground_id"}
                        title={"Playground"}
                        placeHolder={!this.state.data.agency_id ? "Select Agency Above" : "Choose..."}
                        default={1}
                        data={this.state.playgroundList || []}
                        disabled={!this.state.data.agency_id}
                        onChange={(id, value) => this.updateFormData(id, value)}
          />

          <CustomSelect id={"type"}
                        title={"Inspection Type"}
                        placeHolder={"Choose..."}
                        default={1}
                        data={this.state.inspectionTypeList || []}
                        onChange={(id, value) => this.updateFormData(id, value)}
          />

          <CustomTextInput id={"inspected_by"}
                           title={"Inspected By"}
                           placeHolder={"Inspector's name"}
                           value={this.state.data.inspected_by}
                           onChange={(id, value) => this.updateFormData(id, value)}
          />

          <Block style={{marginTop: 20}}>
            <Button shadowless
                    color={containsKeys(this.state.data, ['agency_id', 'playground_id', 'type', 'inspected_by']) ? "success" : materialTheme.COLORS.DEFAULT}
                    style={[styles.button, styles.shadow]}
                    disabled={!containsKeys(this.state.data, ['agency_id', 'playground_id', 'type', 'inspected_by'])}
                    onPress={() => this.saveCall()}
            >
              Add >>
            </Button>
          </Block>
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
  shadow: {
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    shadowOpacity: 0.2,
    elevation: 2,
  },
});
