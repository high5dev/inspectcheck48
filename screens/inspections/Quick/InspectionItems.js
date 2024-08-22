import React, {Fragment} from "react";
import {Block, Button, Text, theme} from "galio-framework";
import {Dimensions, StyleSheet, TouchableOpacity} from "react-native";
import {Ionicons} from '@expo/vector-icons';
import {ClientEvent} from "clientevent";
import {ImageAsset} from "../../../components/ImageAsset";
import {v1} from "uuid";
import Database from "../../../db/db";
import materialTheme from "../../../constants/Theme";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import {MultilineTextInput} from "../../../components/MultilineTextInput";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {getNowEpoch} from "../../../util/shared";
import RefLookup from "../../../components/RefLookup";

const {height, width} = Dimensions.get('screen');

const thumbMeasure = (width - 48 - 32) / 2 - 5;

export default class InspectionItems extends React.Component {

  state = {}


  componentWillUnmount() {
    ClientEvent.off("CAMERA_SNAP", "InspectionItems");
  }

  openCamera = () => {
    ClientEvent.on("CAMERA_SNAP", "InspectionItems", (photo) => this.addImage(photo));
    this.props.navigateCamera();
  }

  navigateCamera() {
    setTimeout(() => this.props.navigation.navigate('CameraViewInspections'), 200);
  }

  onChange(id, name, value) {
    const list = this.props.data || [];
    this.props.onUpdate(list.map((media) => {
      if (media.id === id) {
        return {
          ...media,
          [name]: value
        }
      }
      return media;
    }))
  }

  openImagePickerAsync = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({allowsMultipleSelection: false}).catch(() => {
      alert("Error selecting image from picker");
      return null;
    });
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
          uri: `media/${uuid}.jpg`,
          takenAt: image.takenAt || getNowEpoch(),
        };
        // const list = this.props.mediaList || [];
        // this.props.onUpdate("mediaList", list.concat(photoObj));
        // this.setState({useCamera: false});
        this.addImage(photoObj);
      });
    })).catch((reason => alert(reason)));

  }

  addImage(image) {
    ClientEvent.off("CAMERA_SNAP", "InspectionItems");
    // setTimeout(() => ClientEvent.emit('HEADER_QUICKTAB', 0), 400);
    if (image === null) return;
    Database().addExec("media", image, (error, results) => console.log(error));
    const list = this.props.data || [];
    const self = this;
    setTimeout(() => self.props.onUpdate(list.concat({
      id: v1(),
      pre: image.id,
      preAt: image.takenAt || getNowEpoch(),
      inspection_id: self.props.inspectionId
    })), 500);
  }

  removeImage(mediaId) {
    const list = this.props.data || [];
    const self = this;
    const newList = list.map((cond) => {
      if (cond.pre && cond.pre === mediaId) {
        return {...cond, pre: null, deleted: true};
      } else {
        return cond;
      }
    });
    setTimeout(() => self.props.onUpdate(newList), 250);
  }

  replaceImage(mediaId, newImage) {
    const list = this.props.data || [];
    const self = this;
    const newList = list.map((cond) => {
      if (cond.pre && cond.pre === mediaId) {
        return {...cond, pre: newImage.id, preAt: newImage.takenAt};
      } else {
        return cond;
      }
    });
    setTimeout(() => self.props.onUpdate(newList), 250);
  }

  render() {
    return <KeyboardAwareScrollView enableResetScrollToCoords={false}>
      {/*<Block style={styles.card}>*/}
      <Text left size={16} style={{padding: 10}}>
        {this.props.display}
      </Text>

      {this.renderMedia(this.props.data)}

      {!!this.props.canedit && (
        <Block row middle style={{marginBottom: 5, marginTop: 15}}>
          <Button onPress={() => this.props.markComplete()}
                  disabled={!this.props.allDone}
                  style={[styles.riskButtonSelected, (this.props.allDone ? styles.green : styles.gray)]}>
            Inspection Complete
          </Button>
        </Block>
      )}
    </KeyboardAwareScrollView>
  }

  renderMedia = (mediaList) => {
    return (
      <Block flex style={[{paddingBottom: theme.SIZES.BASE / 10}]}>
        <Text bold size={16} style={styles.title}>Images</Text>
        <Block style={{marginHorizontal: theme.SIZES.BASE * 2}}>
          <Block row space="between" style={{marginTop: theme.SIZES.BASE, flexWrap: 'wrap'}}>
            {(mediaList || []).map((img, index) => (
              <Fragment key={`imagee-${index}`}>

                <Block style={{...styles.shadow, marginBottom: 5}}>
                  {!img.deleted && (
                    <ImageAsset
                      style={{
                        borderRadius: 5,
                        height: thumbMeasure,
                        width: thumbMeasure,
                        margin: 0,
                        padding: 0
                      }}
                      mediaId={img.pre || ""}
                      canReplace={this.props.canedit && true}
                      canDelete={this.props.canedit && true}
                      onDelete={() => this.removeImage(img.pre)}
                      onReplace={(newImage) => this.replaceImage(img.pre, newImage)}
                      updated={Math.round(new Date().getTime() / 1000)}
                      placeholderColor='#b3e5fc'
                    />
                  )}

                </Block>
                <Block style={{...styles.shadow, marginBottom: 5}}>
                  <Text>Notes</Text>
                  <MultilineTextInput
                    multiline={true}
                    numberOfLines={4}
                    value={img.preNotes}
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
                  <RefLookup
                    onSelect={(data) => this.onChange(img.id, "preNotes", `${img.preNotes || ""} ${data}`.trim())}/>
                </Block>
              </Fragment>
            ))}
            {this.props.canedit && (
              <Block key={`viewed-new`} style={[styles.albumThumb]} middle>
                <TouchableOpacity
                  onPress={this.openCamera}
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
}

const styles = StyleSheet.create({
  settings: {
    paddingVertical: theme.SIZES.BASE / 3,
  },
  card: {
    width: width - 20,
    backgroundColor: '#fff',
    margin: 50,
    borderRadius: 5,
    padding: 5
  },
  buttonUnselected: {
    width: 100,
    height: 100,
    backgroundColor: "#aaa",
    color: "#111",
    marginLeft: 3,
    marginRight: 3
  },
  buttonSelected: {
    width: 100,
    height: 100,
    marginLeft: 3,
    marginRight: 3
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
  group: {
    paddingTop: theme.SIZES.BASE * 3.75,
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
  green: {
    backgroundColor: "#00aa0a",
  },
  gray: {
    backgroundColor: "#9baaa8",
  },
});
