import React, {Fragment} from 'react';
import {Alert, Dimensions, FlatList, KeyboardAvoidingView, StyleSheet, TouchableOpacity} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {Block, Text, theme} from "galio-framework";
import {ClientEvent} from "clientevent";
import {MultilineTextInput} from "../../components/MultilineTextInput";
import materialTheme from "../../constants/Theme";
import {Button, Select} from "../../components";
import Database from "../../db/db";
import CustomSelect from "../../components/CustomSelect";
import RefLookup from "../../components/RefLookup";

const {height, width} = Dimensions.get('screen');

const thumbMeasure = (width - 48 - 32) / 2 - 5;

export default class Debug extends React.Component {
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
    }],
    quickPickShow: false,
    quickPickCategory: 0,
    quickPickCategories: [],
    quickPickItem: 0,
    quickPickItems: [],
    quickPickItemsRaw: []
  };

  componentDidMount() {
  }

  componentWillUnmount() {

  }

  openRefQuickPick() {
    this.refreshList(() => {
      this.setState({quickPickShow: true});
    })
  }

  refreshList(cb) {
    Database().query("SELECT * FROM quick_list_categories", [], (error, results) => {
      if (error) {
        console.log(error);
      } else {
        let data = [{display: "None", value: 0}, ...this.extractDropDownDataCategory(results)];
        this.setState({
          quickPickCategory: 0,
          quickPickCategories: data,
          quickPickItem: 0,
          quickPickItems: [],
          quickPickItemsRaw: []
        }, cb);
      }
    })
  }

  onChangeCategory(id, value) {
    if (id === 0) {
      this.setState({quickPickItems: [], quickPickItemsRaw: [], quickPickCategory: 0, quickPickItem: 0});
      return;
    }
    Database().query("SELECT * FROM quick_list_items WHERE category_id=?", [value], (error, results) => {
      if (error) {
        console.log(error);
      } else {
        let data = [{display: "None", value: 0}, ...this.extractDropDownDataItem(results)];
        this.setState({quickPickItemsRaw: results, quickPickItems: data, quickPickCategory: value, quickPickItem: 0});
      }
    })
  }

  fetchItem(item_id) {
    if (!this.state.quickPickItemsRaw || this.state.quickPickItemsRaw.length === 0) return undefined;
    return this.state.quickPickItemsRaw.find((item) => String(item.id) === String(item_id));
  }

  longPress(item) {
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

  navigateTo(item) {
    // this.props.navigation.navigate(`${String(item.itemType || "").toUpperCase()}Inspection`, {
    //   inspection_id: item.id,
    //   playground_id: item.playground_id,
    //   playground_name: item.playgroundName,
    //   agency_name: item.agencyName,
    //   completed: item.completed
    // })
  }

  extractDropDownDataCategory(data) {
    return (data || []).map((item) => ({display: item.display, value: item.id}));
  }

  extractDropDownDataItem(data) {
    return (data || []).map((item) => ({display: item.title, value: item.id}));
  }

  render() {
    const {width} = Dimensions.get('window');
    console.log(this.state.quickPickItems)
    return (
      <KeyboardAwareScrollView>
        <Block style={styles.title}>
          <Text>Notes</Text>
          <Block center>
            {/*<Button size={"small"} iconFamily={"fontawesome"} style={{width:1, height:1}}>Test</Button>*/}
            <MultilineTextInput
              multiline={true}
              numberOfLines={4}
              value={""}
              id={"preNotes"}
              placeholder={""}
              onChange={(evt) => this.onChange(img.id, "preNotes", evt.nativeEvent.text)}
              editable={this.props.canedit}
              style={{
                borderWidth: 1,
                borderColor: materialTheme.COLORS.DARK_TEXT,
                padding: 5,
                textAlignVertical: "top",
                height: thumbMeasure - 18,
                width: thumbMeasure
              }}

            />
            <RefLookup onSelect={(data) => console.log(data)}/>
          </Block>
        </Block>
      </KeyboardAwareScrollView>
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
  group: {
    paddingTop: theme.SIZES.BASE,
    width: (width / theme.SIZES.BASE) * 14
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
