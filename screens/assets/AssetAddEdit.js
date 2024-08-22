import React from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import {Block, theme} from 'galio-framework';
import CustomTextInput from "../../components/CustomTextInput";
import Database from "../../db/db";
import {v1} from "uuid";
import {ClientEvent} from "clientevent";
import {ImageAsset} from "../../components/ImageAsset";
import CustomSelect from "../../components/CustomSelect";
import {captureException} from "@sentry/react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";

const {width} = Dimensions.get('screen');

const thumbMeasure = (width - 48 - 32) / 3;

export default class AssetAddEdit extends React.Component {
  state = {
    id: null,
    data: {},
    inspection: false,
    needSave: false,
    originalData: {},
    updatedPhoto: {},
    assetCategoryList: [],
    assetTypeList: [],
  };

  componentDidMount() {
    const id = this.props.navigation.getParam('id', "");
    const playground_id = this.props.navigation.getParam('playground_id', "");
    const inspection_id = this.props.navigation.getParam('inspection_id', null);
    if (!!inspection_id) {
      ClientEvent.on("HEADER_CANCEL_HFINSPECTIONADDASSET", "AssetAddEdit", () => this.cancelCall());
      ClientEvent.on("HEADER_SAVE_HFINSPECTIONADDASSET", "AssetAddEdit", () => this.saveCall());
    } else {
      ClientEvent.on("HEADER_CANCEL_ASSETADDEDIT", "AssetAddEdit", () => this.cancelCall());
      ClientEvent.on("HEADER_SAVE_ASSETADDEDIT", "AssetAddEdit", () => this.saveCall());
    }
    if (playground_id.length > 0) {
      this.getCategories();
      if (id.length > 0) {
        this.getPlayground(id, playground_id);
      } else {
        this.setState({data: {playground_id: playground_id}, inspection: !!inspection_id});
      }
    } else {
      alert("Playground ID not specified");
      this.props.navigation.pop();
    }
  }

  componentWillUnmount() {
    if (!!this.state.inspection) {
      ClientEvent.off("HEADER_CANCEL_HFINSPECTIONADDASSET", "AssetAddEdit");
      ClientEvent.off("HEADER_SAVE_HFINSPECTIONADDASSET", "AssetAddEdit");
      ClientEvent.off("CAMERA_SNAP", "AssetAddEdit");
    } else {
      ClientEvent.off("HEADER_CANCEL_ASSETADDEDIT", "AssetAddEdit");
      ClientEvent.off("HEADER_SAVE_ASSETADDEDIT", "AssetAddEdit");
      ClientEvent.off("CAMERA_SNAP", "AssetAddEdit");
    }
  }

  getPlayground(id, playground_id) {
    Database().query("SELECT * FROM assets WHERE id=? AND playground_id=?", [id, playground_id], (err, results) => {
      if (results.length > 0) {
        const minusKey = {...results[0]};
        delete minusKey['id'];
        this.getTypesCategory(minusKey.type, (type, category_id) => {
          // console.log({...minusKey, type:String(type), category_id: String(category_id)});
          this.setState({
              id: id,
              data: {...minusKey, type: String(type), category_id: String(category_id)},
              originalData: {...minusKey, type: String(type), category_id: String(category_id)}
            },
            () => {
              // console.log(this.state.data)
            });
        });
      } else {
        alert("Unable to find ID");
        this.props.navigation.goBack();
      }
    });
  }

  getCategories() {
    Database().query("SELECT display, id as `value` FROM asset_categories ORDER BY display ASC;", [], (err, results) => {
      if (!err) {
        this.setState({assetCategoryList: results});
      }
    });
  }

  getTypes(category_id) {
    Database().query("SELECT name as display, id as `value` FROM asset_types WHERE category_id=? ORDER BY name ASC;", [category_id], (err, results) => {
      if (!err) {
        this.setState({assetTypeList: results});
      }
    });
  }


  getTypesCategory(type_id, callback) {
    Database().query("SELECT category_id FROM asset_types WHERE id=?", [String(type_id)], (err, results) => {
      if (results && results.length > 0) {
        // this.setState({data: {type: type_id, category_id: results.category_id}}, () => {
        this.getTypes(results[0].category_id);
        callback(type_id, results[0].category_id);
        // });
      } else {
        console.log(err);
        callback(0, 0);
      }
    });
  }

  updateFormData(id, value) {
    this.setState({data: {...this.state.data, [id]: value}, needSave: true});
  }

  saveCall() {
    let thisId = this.state.id;
    const thisData = {...this.state.data};
    if (!!this.state.updatedPhoto && this.state.updatedPhoto.hasOwnProperty("id")) {
      Database().addExec("media", this.state.updatedPhoto, (error, results) => console.log(error));
      ClientEvent.emit("MEDIA_UPLOAD", this.state.updatedPhoto);
      thisData['takenAt'] = this.state.updatedPhoto.takenAt;
    }
    delete thisData['category_id'];
    if (thisId === null) {
      thisId = v1();
      thisData['id'] = thisId;
      Database().addSyncExec("assets", thisData, this.dbResponse);
    } else {
      Database().updateSyncExec("assets", this.state.originalData, thisData, "id", thisId, this.dbResponse);
    }
  }

  dbResponse = (err, results) => {
    if (!err) {
      ClientEvent.emit("HEADER_REFRESH_ASSETS");
      ClientEvent.emit("HEADER_REFRESH_PLAYGROUNDS");
      ClientEvent.emit("HEADER_REFRESH_AGENCIES");
      if (this.state.inspection) {
        ClientEvent.emit("HEADER_REFRESH_INSPECTION");
      }
      this.props.navigation.pop();
    } else {
      captureException(err)
      alert(err);
    }
  }

  cancelCall() {
    this.props.navigation.goBack();
  }

  openCamera() {
    ClientEvent.on("CAMERA_SNAP", "AssetAddEdit", (photo) => this.replacePhoto(photo));
    if (!!this.state.inspection) {
      setTimeout(() => this.props.navigation.navigate('CameraViewInspections'), 200);
    } else {
      setTimeout(() => this.props.navigation.navigate('CameraViewAsset'), 200);
    }
  }

  replacePhoto(photo) {
    ClientEvent.off("CAMERA_SNAP", "AssetAddEdit");
    // console.log(photo);
    if (photo === null) return;
    this.updateFormData("thumbnail_url", photo.id);
    this.setState({updatedPhoto: photo});
  }

  render() {
    // console.log("render data", this.state.data);
    return (
      <Block flex center style={{paddingVertical: theme.SIZES.BASE * 2}}>
        <KeyboardAwareScrollView>
          <ImageAsset
            style={{
              borderRadius: 50,
              height: 250,
              width: 250
            }}
            canReplace={true}
            onReplace={(newImage) => this.replacePhoto(newImage)}
            mediaId={this.state.data.thumbnail_url || ""}
            updated={Math.round(new Date().getTime() / 1000)}
            placeholderColor='#b3e5fc'
            menuOnPress={!this.state.id}
            navScreen={"asset"}
          />

          <CustomTextInput id={"name"}
                           title={"Name"}
                           placeHolder={"Enter Asset Name"}
                           value={this.state.data.name}
                           onChange={(id, value) => this.updateFormData(id, value)}
          />

          <CustomTextInput id={"part_number"}
                           title={"Part Number"}
                           placeHolder={"Enter a Part Number"}
                           value={this.state.data.part_number}
                           onChange={(id, value) => this.updateFormData(id, value)}
          />

          <CustomSelect id={"category_id"}
                        title={"Category"}
                        placeHolder={"Choose..."}
                        default={this.state.data.category_id || -1}
                        data={this.state.assetCategoryList || []}
                        onChange={(id, value) => {
                          this.updateFormData(id, value);
                          this.getTypes(value);
                        }}
          />

          <CustomSelect id={"type"}
                        title={"Type"}
                        placeHolder={"Choose..."}
                        default={this.state.data.type || -1}
                        data={this.state.assetTypeList || []}
                        onChange={(id, value) => this.updateFormData(id, value)}
          />

          <CustomTextInput id={"notes"}
                           title={"Notes"}
                           placeHolder={"Enter notes about the asset"}
                           value={this.state.data.notes}
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
