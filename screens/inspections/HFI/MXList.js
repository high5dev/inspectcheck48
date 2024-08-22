import React from 'react';
import {Dimensions, FlatList, KeyboardAvoidingView, ScrollView, StyleSheet, TouchableOpacity} from "react-native";
import {Block, Button, Text, theme} from "galio-framework";
import CustomSelect from "../../../components/CustomSelect";
import CustomTextInput from "../../../components/CustomTextInput";
import {ClientEvent} from "clientevent";
import Database from "../../../db/db";
import {ImageAsset} from "../../../components/ImageAsset";
import {Ionicons} from '@expo/vector-icons';
import {Icon} from "galio-framework";
import * as ImagePicker from "expo-image-picker";
import {v1} from "uuid";
import * as FileSystem from "expo-file-system";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {getNowEpoch} from "../../../util/shared";
import RefLookup from "../../../components/RefLookup";

const {height, width} = Dimensions.get('screen');

const thumbMeasure = (width - 48 - 32) / 3;

export default class MXList extends React.Component {
  // state = {data: []};
  // navigation = props.navigation;
  state = {
    data: {},
    editMode: false,
    btnLabel: "Add"
  };

  componentWillUnmount() {
    ClientEvent.off("CAMERA_SNAP", "MXList");
  }

  renderItem = ({item}) => {

    const imageCount = (mediaList) => {
      return mediaList &&
        mediaList.filter((img) => (!(img.action && img.action === "remove"))).length // filter out removed
        || 0;
    }

    return (
      <Block style={styles.rows} row>
        <TouchableOpacity
          onPress={() => {
            if (!!this.props.completed) return;
            this.setState({data: item, editMode: true, btnLabel: "Edit"});
          }}
          style={{height: 30, width: "100%"}}
        >
          <Block flex top row space={"between"} style={{paddingTop: 10}}>
            <Text size={12} style={{width: "90%", height: theme.SIZES.BASE * 4}}>
              {item.title ? `${item.title} - ` : ""}{item.notes || ""}
            </Text>
            <Block flex row middle style={{height: theme.SIZES.BASE * 4}}>
              <Text bold
                    size={10}
                    style={{
                      marginBottom: 0,
                      paddingBottom: 0,
                      marginRight: 5
                    }}>{imageCount(item.mediaList)}</Text>
              <Icon family="font-awesome" name="camera" size={10}/>
            </Block>
          </Block>
        </TouchableOpacity>
      </Block>
    );
  }

  save() {
    if ((this.state.data.notes || "").length > 0) {
      this.props.onSave && this.props.onSave(this.state.btnLabel, this.state.data);
      this.cancel();
    }
  }

  cancel() {
    this.setState({data: {}, editMode: false});
  }

  openCamera() {
    ClientEvent.on("CAMERA_SNAP", "MXList", (photo) => this.addImage(photo));
    this.props.navigateCamera();
  }

  addImage(image) {
    const self = this;
    ClientEvent.off("CAMERA_SNAP", "MXList");
    setTimeout(() => ClientEvent.emit('HEADER_HFITAB', 2), 400);
    // console.log(image);
    if (image === null) return;
    Database().addExec("media", image, (error, results) => console.log(error));
    // Database().addExec("media", this.state.updatedPhoto, (error, results) => console.log(error));
    // ClientEvent.emit("MEDIA_UPLOAD", this.state.updatedPhoto);
    const mediaList = self.state.data.mediaList || [];
    setTimeout(() => self.updateValue("mediaList", mediaList.concat(image)), 500);
  }

  openImagePickerAsync = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({allowsMultipleSelection: false}).catch((reason => {
      alert("Error retrieving image from library");
      return null;
    }));
    if (pickerResult && !pickerResult.canceled && pickerResult.assets.length > 0) {
      this.addSelectedImage(pickerResult.assets[0]);
    }
  }

  addSelectedImage(image) {
    const uuid = v1();
    FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}media/`, {intermediates: true}).then((uri => {
      FileSystem.moveAsync({
        from: image.uri,
        to: `${FileSystem.documentDirectory}media/${uuid}.jpg`,
      }).then(() => {
        const photoObj = {
          id: uuid,
          exif: JSON.stringify(image.exif),
          height: image.height,
          width: image.width,
          takenAt: image.takenAt || getNowEpoch(),
          uri: `media/${uuid}.jpg`,
        };
        // const list = this.props.mediaList || [];
        // this.props.onUpdate("mediaList", list.concat(photoObj));
        // this.setState({useCamera: false});
        this.addImage(photoObj);
      });
    })).catch((reason => alert(reason)));

  }

  removeImage(mediaId) {
    const list = this.state.data.mediaList || [];
    const newList = list.map((pic) => {
      if (pic.id && pic.id === mediaId && !(pic.action && pic.action === "remove")) {
        return null;
      }
      if (pic.action && pic.action === "replace" && pic.replacement && pic.replacement.id === mediaId) {
        return {
          id: pic.id,
          action: "remove"
        };
      }
      if ((pic === mediaId) || (pic.id === mediaId)) {
        return {
          id: pic,
          action: "remove"
        }
      }
      return pic;
    }).filter((value) => value !== null);
    this.setState({data: {...this.state.data, mediaList: newList}});
  }

  replaceImage(mediaId, newImage) {
    const list = this.state.data.mediaList || [];
    const newList = list.map((pic) => {
      if (pic.id && pic.id === mediaId && !pic.action) {
        return {
          id: pic,
          action: "replace",
          replacement: newImage
        };
      }
      if (pic.action && pic.action === "replace" && pic.replacement && pic.replacement.id === mediaId) {
        return {
          id: pic.id,
          action: "replace",
          replacement: newImage
        };
      }
      if (!pic.id && pic === mediaId) {
        return {
          id: pic,
          action: "replace",
          replacement: newImage
        }
      }
      return pic;
    }).filter((value) => value !== null);
    this.setState({data: {...this.state.data, mediaList: newList}});
  }

  updateValue(id, value, callback) {
    this.setState({
      data: {
        ...this.state.data,
        [id]: value
      }
    }, () => {
      callback && callback();
    });
  }

  getQuickListValue(value, defVal) {
    if (value === -1) {
      return "";
    }
    let response = defVal || "";
    this.props.mxQuickList.forEach(mx => {
      if (mx.value === value) {
        response = mx.template;
      }
    });
    return response;
  }

  renderMedia = (mediaList) => {
    const {navigation} = this.props;
    return (
      <Block flex style={[{paddingBottom: theme.SIZES.BASE * 5}]}>
        <Text bold size={16} style={styles.title}>Images</Text>
        <Block style={{marginHorizontal: theme.SIZES.BASE * 2}}>
          <Block row space="between" style={{marginTop: theme.SIZES.BASE, flexWrap: 'wrap'}}>
            {(mediaList || [])
              .filter((img) => (!(img.action && img.action === "remove"))) // filter out removed
              .map(img1 => (img1.replacement && img1.replacement.id) || img1.id || img1) // normalize to standard string IDs
              .map((img, index) => (
                <Block key={`viewed-${index}`} style={styles.shadow}>
                  <ImageAsset
                    style={{
                      borderRadius: 5,
                      height: 75,
                      width: 75
                    }}
                    // canReplace={!this.props.completed}
                    canDelete={!this.props.completed}
                    onDelete={() => this.removeImage(img)}
                    onReplace={(newImage) => this.replaceImage(img, newImage)}
                    mediaId={img || ""}
                    updated={Math.round(new Date().getTime() / 1000)}
                    placeholderColor='#b3e5fc'
                  />
                </Block>
              ))}
            {!this.props.completed && (
              <Block key={`viewed-new`} style={[styles.albumThumb]}>
                <TouchableOpacity
                  onPress={() => this.openCamera()}
                  style={styles.addCameraButton}>
                  <Block row middle>
                    <Ionicons name={"md-camera"} size={16} color={"white"}/>
                    <Text style={styles.addCamera}>Take Picture</Text>
                  </Block>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={this.openImagePickerAsync}
                  style={styles.addPhotoButton}>
                  <Block row middle>
                    <Ionicons name={"md-image"} size={16} color={"white"}/>
                    <Text style={styles.addPhoto}>Select Photo</Text>
                  </Block>
                </TouchableOpacity>
              </Block>
            )}

          </Block>
        </Block>
      </Block>
    )
  }

  render() {
    const {width} = Dimensions.get('window');
    if (this.state.editMode) {
      return (
        <Block flex center>
          <KeyboardAwareScrollView enableResetScrollToCoords={false}>

            <CustomSelect id={"asset_id"}
                          title={"Asset"}
                          placeHolder={"N/A"}
                          default={this.state.data.asset_id || "0"}
                          data={[{display: "N/A", value: null}, ...this.props.mxAssets || []]}
                          onChange={(id, value) => {
                            this.updateValue(id, value, () => {
                              const display = this.props.mxAssets.find(mx => mx.value === value);
                              this.updateValue("title", display && display.display || "");
                            });
                          }}
            />
            {(!this.state.data.asset_id || this.state.data.asset_id === "N/A") && (

              <CustomTextInput id={"title"}
                               title={"Item"}
                               placeHolder={"Enter Item Name or Subject"}
                               value={this.state.data.title}
                               onChange={(id, value) => this.updateValue(id, value)}
              />
            )}

            <CustomSelect id={"mx_id"}
                          title={"Quick Action"}
                          placeHolder={"None"}
                          default={this.state.data.mx_id || -1}
                          data={[{display: "None", value: -1}, ...this.props.mxQuickList || []]}
                          onChange={(id, value) => {
                            this.updateValue(id, value === -1 ? undefined : value, () => {
                              this.updateValue("notes", this.getQuickListValue(value));
                            });
                          }}
            />

            <CustomTextInput id={"notes"}
                             title={"Action"}
                             placeHolder={"Enter notes on maintenance action or choose from the Quick Action menu above"}
                             value={this.state.data.notes || ""}
                             multiline={true}
                             numberOfLines={4}
                             onChange={(id, value) => {
                               this.updateValue(id, value)
                             }}
            />
            <RefLookup onSelect={(data) => this.updateValue("notes", `${this.state.data.notes || ""} ${data}`.trim())}/>
            <Block row middle style={{marginBottom: 5}}>
              {this.renderMedia(this.state.data.mediaList || [])}
            </Block>
            <Block row middle style={{marginBottom: 5}}>
              <Button onPress={() => this.save()}
                      style={[styles.riskButtonSelected, styles.green]}>
                Save
              </Button>
              <Button onPress={() => this.cancel()}
                      style={[styles.riskButtonSelected, styles.darkYellow]}>
                Cancel
              </Button>
            </Block>
          </KeyboardAwareScrollView>
        </Block>
      );
    }

    return (
      <Block flex center style={{width: width}}>
        <KeyboardAvoidingView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.settings}
        >
          <FlatList
            style={{width: width}}
            data={this.props.mxItems}
            keyExtractor={(item, index) => String(item.id)}
            renderItem={this.renderItem}
            ListHeaderComponent={
              <Block style={styles.title}>

                {!this.props.completed && (
                  <Text center muted size={12}>
                    Tap to Edit or Add below
                  </Text>
                )}


              </Block>
            }
          />
          <Block row middle style={{marginBottom: 5}}>

            {!this.props.completed && (
              <Button onPress={() => this.setState({btnLabel: "Add", data: {}, editMode: true})}
                      style={[styles.riskButtonSelected]}>
                Add
              </Button>
            )}

          </Block>
          {/*{this.state.data.length === 0 && (*/}
          {/*  <Block style={styles.title}>*/}
          {/*    <Text bold center size={theme.SIZES.BASE} style={{paddingBottom: 5}}>*/}
          {/*      Maintenance Actions*/}
          {/*    </Text>*/}
          {/*  </Block>*/}
          {/*)}*/}
        </KeyboardAvoidingView>
      </Block>
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
  },
  actions: {
    width: theme.SIZES.BASE
  },
  actionOption: {
    height: theme.SIZES.BASE * 4.5
  },
  green: {
    backgroundColor: "#00aa0a",
  },
  red: {
    backgroundColor: "#aa0000",
  },
  darkYellow: {
    backgroundColor: "#aa8606",
  },
  riskButtonUnselected: {
    width: 100,
    height: 30,
    backgroundColor: "#aaa",
    color: "#111",
    margin: 3,
  },
  riskButtonSelected: {
    width: 100,
    height: 30,
    margin: 3,
  },
  mediaTitle: {
    paddingVertical: theme.SIZES.BASE,
    paddingHorizontal: theme.SIZES.BASE * 2,
  },
  mediaList: {},
  mediaImage: {
    width: 100,
    height: 100,
  },
  mediaBlock: {
    width: 100,
    height: 100,
    margin: 10,
    borderRadius: 5,
  },
  albumThumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: 'center',
    width: thumbMeasure,
    height: thumbMeasure
  },
  addCamera: {
    margin: 5,
    padding: 5,
    fontSize: 10,
    color: '#fff',
  },
  addCameraButton: {
    margin: 5,
    padding: 2,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  addPhoto: {
    margin: 5,
    padding: 5,
    fontSize: 10,
    color: '#fff',
  },
  addPhotoButton: {
    margin: 5,
    padding: 2,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  shadow: {
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    shadowOpacity: 0.2,
    elevation: 2,
  },
});
