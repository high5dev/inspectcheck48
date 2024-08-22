import {Alert, Dimensions, StyleSheet} from 'react-native';
import React, {Fragment} from "react";
import Database from "../../../db/db";
import {ClientEvent} from "clientevent";
import {dbDate} from "../../../util/shared";
import InspectionItems from "./InspectionItems";
import Block from "galio-framework/src/Block";
import {Text} from "galio-framework";

export default class QuickInspection extends React.Component {
  constructor(props) {
    super(props);
    //Debug Info
    // if (global.__fbBatchedBridge) {
    //   console.log("yes")
    //   const origMessageQueue = global.__fbBatchedBridge;
    //   const modules = origMessageQueue._remoteModuleTable;
    //   const methods = origMessageQueue._remoteMethodTable;
    //   console.log(modules)
    //   console.log(methods[28])
    //   global.findModuleByModuleAndMethodIds = (moduleId, methodId) => {
    //     console.log(`The problematic line code is in: ${modules[moduleId]}.${methods[moduleId][methodId]}`)
    //   }
    // }

    // global.findModuleByModuleAndMethodIds(28, 50);
    // global.findModuleByModuleAndMethodIds(12, 0);
// global.findModuleByModuleAndMethodIds(32, 1);
// global.findModuleByModuleAndMethodIds(32, 0);
  }
  state = {
    currentIndex: 0,
    cards: null,
    inspection_id: this.props.navigation.getParam('inspection_id', ""),
    playground_id: this.props.navigation.getParam('playground_id', ""),
    playground_name: this.props.navigation.getParam('playground_name', ""),
    agency_name: this.props.navigation.getParam('agency_name', ""),
    completed: this.props.navigation.getParam('completed', null),
    requireSave: false,
    mxQuickList: [],
    mxAssets: [],
    mxItems: [],
    condition: [],
    page: 0
  };
  originalCondition = [];

  UNSAFE_componentWillMount() {
    ClientEvent.on("HEADER_BACK_QUICKINSPECTION", "QuickInspection", () => this.confirmSave());
    ClientEvent.on("HEADER_SAVE_QUICKINSPECTION", "QuickInspection", () => this.saveData());
    // ClientEvent.on("HEADER_QUICKTAB", "QuickInspection", (page) => this.showPage(page));
    ClientEvent.on("HEADER_REFRESH_INSPECTION", "QuickInspection", () => this.getInpectionData(() => {
      // this.showPage(0);
      // ClientEvent.emit('HEADER_QUICKTAB', 2);
    }));

    // const inspection_id = this.props.navigation.getParam('inspection_id', "");
    // console.log(this.state.inspection_id);
    // console.log(this.state.playground_id);
    this.getInpectionData(() => {
      // setTimeout(() => ClientEvent.emit('HEADER_QUICKTAB', 0), 10);
    });
  }

  componentWillUnmount() {
    ClientEvent.emit("DYNAMIC_SHOW_SAVE", false);
    ClientEvent.off("HEADER_BACK_QUICKINSPECTION", "QuickInspection");
    ClientEvent.off("HEADER_SAVE_QUICKINSPECTION", "QuickInspection");
    // ClientEvent.off("HEADER_QUICKTAB", "QuickInspection");
    ClientEvent.off("HEADER_REFRESH_INSPECTION", "QuickInspection");
    ClientEvent.off("CAMERA_SNAP", "QuickInspection");
  }

  navigateCamera() {
    setTimeout(() => this.props.navigation.navigate('CameraViewInspections'), 200);
  }

  confirmSave() {
    if (this.state.requireSave) {

      const self = this;
      Alert.alert(
        'Discard Unsaved Changes?',
        'If you proceed this pages changes will be lost',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: () => {
              ClientEvent.emit("HEADER_REFRESH_INSPECTIONS");
              ClientEvent.emit("MEDIA_UPLOAD");

              self.props.navigation.goBack()
            }
          },
        ],
        {cancelable: false}
      );
    } else {
      ClientEvent.emit("HEADER_REFRESH_INSPECTIONS");
      this.props.navigation.goBack();
    }
  }

  saveData() {
    if (!!this.state.completed) return;
    // console.log("Got here");
    const updatedList = [];
    this.saveConditionItems([...this.state.condition], updatedList, this.originalCondition, () => {
      // console.log("Final list", updatedList);
      this.setState({requireSave: false}, () => {
        ClientEvent.emit("DYNAMIC_SHOW_SAVE", false);
        this.originalCondition = updatedList;
      });
    });
  }

  saveConditionItems(items, updatedList, originalItems, callback) {
    if (items.length > 0) {
      this.saveEachConditionItem(items, updatedList, originalItems, () => {
        callback();
      });
    } else {
      callback();
    }
  }

  saveEachConditionItem(conditionItems, updatedList, originalItems, callback) {
    const conditionItem = conditionItems.shift();
    if (!conditionItem) {
      callback();
    } else {
      // Do with each item calling saveEachConditionItem
      const original = originalItems.find((item) => item.id === conditionItem.id);
      if (!!original) {
        //existing
        Database().updateSyncExec("inspection_conditions", this.conditionConditionData(original), this.conditionConditionData(conditionItem), "id", original.id, (err) => {
          if (!!err) {
            console.log(err);
          }
          updatedList.push(conditionItem);
          setTimeout(() => this.saveEachConditionItem(conditionItems, updatedList, originalItems, callback));
        });
      } else {
        //new
        Database().addSyncExec("inspection_conditions", this.conditionConditionData(conditionItem, true), (err) => {
          if (!!err) {
            console.log(err);
          }
          updatedList.push(conditionItem);
          setTimeout(() => this.saveEachConditionItem(conditionItems, updatedList, originalItems, callback));
        });
      }
    }
  }

  // End of Media savings

  conditionConditionData(raw, withId) {
    let response = {
      inspection_id: raw.inspection_id || this.state.inspection_id,
    };
    if (raw.hasOwnProperty('pre')) {
      response.pre = raw.pre;
    }
    if (raw.hasOwnProperty('preAt')) {
      response.preAt = raw.preAt;
    }
    if (raw.hasOwnProperty('preNotes')) {
      response.preNotes = raw.preNotes;
    }
    if (raw.hasOwnProperty('id') && !!withId) {
      response.id = raw.id;
    }
    if (raw.hasOwnProperty('deleted')) {
      response.deleted = raw.deleted;
    }
    return response;
  }

  getInpectionData(callback) {
    this.getConditionData(this.state.inspection_id, callback);
  }

  getConditionData(inspection_id, callback) {
    Database().query("SELECT id, inspection_id, pre, preAt, preNotes " +
      "FROM inspection_conditions WHERE inspection_id=? AND deleted=false ORDER BY preAt ASC;", [inspection_id], (error, results) => {
      this.setState({condition: results}, () => {
        this.originalCondition = results;
        callback && callback();
      });
    });
  }

  markComplete() {
    const self = this;
    Alert.alert(
      'Complete Inspection?',
      'Inspection will be converted to read-only. Remember to do a database sync to update server.',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            Database().updateSyncEntityExec("inspections", {
              completed: dbDate(new Date())
            }, "id", self.state.inspection_id, () => {
              ClientEvent.emit("HEADER_REFRESH_INSPECTIONS");
              self.props.navigation.pop();
            });
          }
        },
      ],
      {cancelable: false}
    );
  }

  render = () => {
    // center items on screen
    const {width} = Dimensions.get('window');

    const allDone = !this.state.requireSave;
    return <Fragment>
      <InspectionItems data={this.state.condition.filter(cond => !cond.deleted)}
                       canedit={!this.state.completed}
                       navigateCamera={() => this.navigateCamera()}
                       inspectionId={this.state.inspection_id}
                       markComplete={() => this.markComplete()}
                       onUpdate={(media) => {
                         this.setState({condition: media, requireSave: true}, () => {
                           ClientEvent.emit("DYNAMIC_SHOW_SAVE", true);
                         });
                       }}
                       allDone={allDone}
                       display={!this.state.completed ? "Take pictures and optional notes of playground" : "Inspection Complete. Readonly mode"}
      />

    </Fragment>
  }

  reportLine(name, value, bottom) {
    return (
      <Block row left style={{marginBottom: bottom || 3, marginLeft: 5}}>
        <Block>
          <Text>{name}:</Text>
        </Block>
        <Block style={{marginLeft: 10}}>
          <Text>{value}</Text>
        </Block>
      </Block>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  green: {
    backgroundColor: "#00aa0a",
  },
  gray: {
    backgroundColor: "#9baaa8",
  },
  red: {
    backgroundColor: "#aa0000",
  },
  darkYellow: {
    backgroundColor: "#aa8606",
  },
});