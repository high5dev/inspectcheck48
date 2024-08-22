import React from 'react';
import {Alert, Image, TouchableOpacity, View} from 'react-native';
import noimage from "../assets/images/noimage.png";
import loadingimage from "../assets/images/loadingimage.gif";
import * as FileSystem from "expo-file-system";
import {getData} from "../api/api";
import {ClientEvent} from "clientevent";
import Database from "../db/db";
// import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import {v1} from "uuid";
import {captureException} from "@sentry/react-native";

const docDir = FileSystem.documentDirectory;

export class ImageAsset extends React.Component {

  state = {
    loaded: false,
    source: {
      uri: null
    }
  };

  componentDidMount() {
    // console.log(this.props);
    const {
      mediaId
    } = this.props;
    if (mediaId) {
      this.getLocalFile(mediaId);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.mediaId !== this.props.mediaId) {
      // console.log('assetId changed', nextProps.mediaId);
      this.getLocalFile(nextProps.mediaId);
    }
  }

  componentWillUnmount() {
    ClientEvent.off("CAMERA_SNAP_REPLACE", "ImageAsset");
    // fix Warning: Can't perform a React state update on an unmounted component
    this.setState = (state, callback) => {
      return;
    };
  }

  getLocalFile = (lookAt) => {
    if (!lookAt) {
      this.setState({source: noimage});
      return;
    }
    const self = this;
    FileSystem.makeDirectoryAsync(`${docDir}media/`, {intermediates: true}).then(() => {

      FileSystem.getInfoAsync(`${docDir}media/${lookAt}.jpg`).then((data) => {
        // console.log("data", data);
        if (data.exists) {
          self.setState({source: {uri: data.uri}});
        } else {
          // loading
          self.setState({source: loadingimage});
          setTimeout(() => {
            self.grabUri(lookAt);
          }, 1);

        }
      }).catch(reason => captureException(reason));
    }).catch((reason) => {
      self.setState({source: noimage});
      console.error(error);
      captureException(reason)
    });
  }

  grabUri(lookAt) {
    const self = this;
    getData(`mobile/file/${lookAt}`, {}, global.configData.username)
      .then((response) => {
        if (response.status === "Success") {
          self.checkForFile(response.data.uri, lookAt);
        } else {
          self.setState({source: noimage});
          // console.log(response);
        }
      }).catch((reason) => {
      self.setState({source: noimage});
      console.log(reason);
      captureException(reason)
    });
  }

  checkForFile = (uri, lookAt) => {
    const self = this;
    FileSystem.downloadAsync(
      uri,
      `${docDir}media/${lookAt}.jpg`
    ).then(({uri}) => {
      // console.log('Finished downloading to ', uri);
      self.setState({source: {uri}});

    })
      .catch(error => {
        self.setState({source: noimage});
        console.error(error);
      });
  };

  longPress() {
    this.showOptions();
  }

  replaceImage() {
    ClientEvent.on("CAMERA_SNAP_REPLACE", "ImageAsset", (photo) => this.replaceImageCallback(photo));
    let navTo = 'CameraViewInspections';
    if (!!this.props.navScreen && this.props.navScreen === "asset") {
      navTo = "CameraViewAsset";
    }
    setTimeout(() => ClientEvent.emit("NAVIGATE", {to: navTo, props: {replace: true}}), 200);

  }

  replaceImageCallback(image) {
    ClientEvent.off("CAMERA_SNAP_REPLACE", "ImageAsset");
    if (image === null) return;
    const self = this;
    Database().addExec("media", image, (error, results) => {
      if (!!error) {
        captureException(error);
        return console.log(error);
      }
      setTimeout(() => self.props.onReplace && self.props.onReplace(image), 500);
    });
  }

  openImagePickerAsync = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({allowsMultipleSelection: false}).catch((err) => {
      alert('There was an error reading the image. Please try again.');
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
        };
        // const list = this.props.mediaList || [];
        // this.props.onUpdate("mediaList", list.concat(photoObj));
        // this.setState({useCamera: false});
        this.replaceImageCallback(photoObj);
      });
    })).catch((reason => {
      captureException(reason)
      alert(reason)
    }));

  }

  showOptions() {
    const self = this;
    let options = [
      {
        text: 'Cancel',
        // onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      }]
    if (!!this.props.canReplace) {
      options.push({
        text: 'Replace w/Camera',
        onPress: () => {
          self.replaceImage();
        }
      });
      options.push({
        text: 'Replace w/Gallery',
        onPress: () => {
          self.openImagePickerAsync();
        }
      });
    }
    if (!!this.props.canDelete) {
      options.push({
        text: 'Delete',
        onPress: () => {
          self.props.onDelete && self.props.onDelete(self.props.mediaId);
        }
      });
    }
    Alert.alert(
      'Alter Image?',
      `You can ${!!this.props.canDelete && "remove" || ""}${!!this.props.canDelete && !!this.props.canReplace && " or " || ""}${!!this.props.canReplace && "replace" || ""} this image.`,
      options,
      {cancelable: false}
    );
  }


  render() {
    const {
      placeholderColor,
      style,
    } = this.props;

    return (
      <View
        style={style}>
        <TouchableOpacity onLongPress={() => this.longPress()}
                          onPress={() => {
                            if (!!this.props.menuOnPress) {
                              this.longPress();
                            }
                          }}
                          delayLongPress={750}
                          disabled={typeof (this.props.canDelete) === "undefined" && typeof (this.props.canReplace) === "undefined" ? true : !this.props.canDelete && !this.props.canReplace}
                          style={{width: style && style.width || 100, height: style && style.height || 100}}
        >
          {this.state.source && this.state.source.uri && (
            <Image
              source={this.state.source}
              resizeMode={'contain'}
              style={[
                style,
                {
                  position: 'absolute',
                  resizeMode: 'contain'
                }
              ]}
              onLoad={this._onLoad}
            />
          )}
          {!this.state.loaded &&
            <View
              style={[
                style,
                {
                  backgroundColor: placeholderColor,
                  position: 'absolute'
                }
              ]}/>
          }
        </TouchableOpacity>
      </View>
    )
  }

  _onLoad = () => {
    this.setState(() => ({loaded: true}))
  }
}