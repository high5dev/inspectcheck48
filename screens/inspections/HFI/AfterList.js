import React from "react";
import {Block, Text, theme} from "galio-framework";
import {Dimensions, KeyboardAvoidingView, ScrollView, StyleSheet, TouchableOpacity} from "react-native";
import {Ionicons} from '@expo/vector-icons';
import {ClientEvent} from "clientevent";
import {ImageAsset} from "../../../components/ImageAsset";
import Database from "../../../db/db";
import * as ImagePicker from "expo-image-picker";
import {v1} from "uuid";
import * as FileSystem from "expo-file-system";
import {getNowEpoch} from "../../../util/shared";

const {height, width} = Dimensions.get('screen');

const thumbMeasure = (width - 48 - 32) / 2 - 5;

export default class AfterList extends React.Component {

  state = {}

  static WIDTH = width;

  componentWillUnmount() {
    ClientEvent.off("CAMERA_SNAP", "AfterList");
  }

  openCamera = () => {
    ClientEvent.on("CAMERA_SNAP", "AfterList", (photo) => this.addImage(photo));
    this.props.navigateCamera();
  }

  navigateCamera() {
    setTimeout(() => this.props.navigation.navigate('CameraViewInspections'), 200);
  }

  addImage(image) {
    // console.log("here shall");
    ClientEvent.off("CAMERA_SNAP", "AfterList");
    setTimeout(() => ClientEvent.emit('HEADER_HFITAB', 3), 400);
    const self = this;
    const afterIndex = this.state.afterIndex || 0;
    this.setState({afterIndex: undefined}, () => {
      if (image === null) return;
      Database().addExec("media", image, (error, results) => console.log(error));
      const list = self.props.data.map((condition, index) => {
        if (index === afterIndex) {
          return {...condition, post: image.id, postAt: image.takenAt};
        } else {
          return condition;
        }
      });
      setTimeout(() => self.props.onUpdate(list), 500);

    });
  }

  openImagePickerAsync = async (index) => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({allowsMultipleSelection: false}).catch((err) => {
      alert('There was an error reading the image. Please try again.');
      return null;
    })
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
    const list = this.props.data || [];
    const self = this;
    const newList = list.map((cond) => {
      if (cond.post && cond.post === mediaId) {
        return {...cond, post: null};
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
      if (cond.post && cond.post === mediaId) {
        return {...cond, post: newImage.id, postAt: newImage.takenAt};
      } else {
        return cond;
      }
    });
    setTimeout(() => self.props.onUpdate(newList), 250);
  }

  render() {
    return <KeyboardAvoidingView style={{margin: 10}} behavior="padding" enabled>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.settings}>
        {/*<Block style={styles.card}>*/}
        <Text left size={16} style={{padding: 10}}>
          {this.props.display}
        </Text>

        {this.renderMedia(this.props.data)}
        {/*</Block>*/}
        {/*  }*/}
        {/*/>*/}
      </ScrollView>
    </KeyboardAvoidingView>
  }

  renderMedia = (mediaList) => {
    return (
      <Block flex style={[{paddingBottom: theme.SIZES.BASE * 5}]}>
        <Block row space={"evenly"}>
          <Text bold size={16} style={styles.title}>Before</Text>
          <Text bold size={16} style={styles.title}>After</Text>
        </Block>
        <Block style={{marginHorizontal: theme.SIZES.BASE * 2}}>
          <Block space="between" style={{marginTop: theme.SIZES.BASE}}>
            {(mediaList || []).map((img, index) => (
              <Block key={`viewed-${index}`} style={styles.shadow} row space="between">
                {!img.deleted && (
                  <ImageAsset
                    style={{
                      borderRadius: 5,
                      height: thumbMeasure,
                      width: thumbMeasure,
                      margin: 5,
                      padding: 0
                    }}
                    mediaId={img.pre || ""}
                    updated={Math.round(new Date().getTime() / 1000)}
                    placeholderColor='#b3e5fc'
                  />
                )}
                {!!img.post ?
                  <ImageAsset
                    style={{
                      borderRadius: 5,
                      height: thumbMeasure,
                      width: thumbMeasure,
                      margin: 5,
                      padding: 0
                    }}
                    mediaId={img.post || ""}
                    canReplace={this.props.canedit && true}
                    canDelete={this.props.canedit && true}
                    onDelete={() => this.removeImage(img.post)}
                    onReplace={(newImage) => this.replaceImage(img.post, newImage)}
                    updated={Math.round(new Date().getTime() / 1000)}
                    placeholderColor='#b3e5fc'
                  />
                  :
                  <Block key={`viewed-new`} style={[styles.albumThumb]} middle>
                    {this.props.canedit && (
                      <>
                        <TouchableOpacity
                          onPress={() => {
                            this.setState({afterIndex: index}, this.openCamera);
                          }}
                          style={styles.addCameraButton}>
                          <Block row middle>
                            <Ionicons name={"md-camera"} size={16} color={"white"}/>
                            <Text style={styles.addCamera}>Take Picture</Text>
                          </Block>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => this.setState({afterIndex: index}, this.openImagePickerAsync)}
                          style={styles.addPhotoButton}>
                          <Block row middle>
                            <Ionicons name={"md-image"} size={16} color={"white"}/>
                            <Text style={styles.addPhoto}>Select Photo</Text>
                          </Block>
                        </TouchableOpacity>
                      </>
                    )}
                  </Block>
                }
              </Block>
            ))}
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
});
