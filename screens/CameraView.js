import React from 'react';

import {Camera} from 'expo-camera';
import {Feather, Ionicons} from '@expo/vector-icons';
import {Dimensions, ImageBackground, Text, TouchableOpacity, View} from "react-native";
import {Block} from "galio-framework";
import {ClientEvent} from "clientevent";
import * as FileSystem from "expo-file-system";
import {v1} from "uuid";
import {getNowEpoch} from "../util/shared";

const {height, width} = Dimensions.get('screen');

export default class CameraView extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
    useCamera: false,
    imageToPreview: null
  }

  static WIDTH = width;

  componentDidMount() {
    this.openCamera();
  }

  openCamera = async () => {
    const {status} = await Camera.requestCameraPermissionsAsync();
    this.setState({hasCameraPermission: status === 'granted', useCamera: status === 'granted'});
    if (status !== "granted") {
      this.close();
    }
  }

  snap = async () => {
    if (this.camera) {
      await this.camera.takePictureAsync({quality: 0.5, skipProcessing: true, exif: true}).then((photo) => {

        this.setState({imageToPreview: photo});

      }).catch((reason => {
        alert(reason);
      }));
    }
  };

  save = async () => {
    const photo = this.state.imageToPreview;
    const uuid = v1();
    // console.log(`${FileSystem.documentDirectory}`);
    FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}media/`, {intermediates: true}).then((uri => {
      FileSystem.moveAsync({
        from: photo.uri,
        to: `${FileSystem.documentDirectory}media/${uuid}.jpg`,
      }).then(() => {
        const photoObj = {
          id: uuid,
          exif: JSON.stringify(photo.exif),
          height: photo.height,
          width: photo.width,
          uri: `media/${uuid}.jpg`,
          takenAt: getNowEpoch()
        };
        ClientEvent.emit(`CAMERA_SNAP${this.props.navigation.getParam('replace', false) ? "_REPLACE" : ""}`, photoObj);
        setTimeout(() => {
          this.close();
        }, 200);
      });
    })).catch((reason => alert(reason)));
  }

  close() {
    this.setState({useCamera: false}, () => {
      this.props.navigation.goBack();
    })
  }

  render() {
    if (!this.state.hasCameraPermission || !this.state.useCamera) {
      return null;
    }
    if (!!this.state.imageToPreview) {
      return <ImageBackground source={this.state.imageToPreview} style={{width: "100%", height: "100%"}}>
        <Block flex center row style={{alignItems: "flex-end"}}>
          <TouchableOpacity
            style={{
              borderWidth: 5,
              borderRadius: 10,
              borderColor: "white",
              padding: 20,
              margin: 10,
            }}
            onPress={() => {
              this.setState({imageToPreview: null});
            }}>
            {/*<Feather name={"camera-off"} size={36} color={"white"}/>*/}
            <Text style={{color: "white", fontSize: 36}}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              borderWidth: 5,
              borderRadius: 10,
              borderColor: "white",
              padding: 20,
              margin: 10,
            }}
            onPress={() => {
              this.save();
            }}>
            {/*<Feather name={"camera-off"} size={36} color={"white"}/>*/}
            <Text style={{color: "white", fontSize: 36}}>Save</Text>
          </TouchableOpacity>
        </Block>
      </ImageBackground>

    }
    return (
      <Camera style={{flex: 1, paddingTop: 50}} type={this.state.type} ref={ref => {
        this.camera = ref;
      }}>
        <View
          style={{
            flex: 2,
            flexShrink: 0,
            backgroundColor: 'transparent',
            flexDirection: 'column',
            paddingRight: 10,
            paddingTop: 10,
          }}>
          <TouchableOpacity
            style={{
              flex: 0.1,
              alignSelf: 'flex-end',
              alignItems: 'center',
              marginBottom: 10
            }}
            onPress={() => {
              ClientEvent.emit(`CAMERA_SNAP${this.props.navigation.getParam('replace', false) ? "_REPLACE" : ""}`, null);
              this.close();
            }}>
            <Feather name={"camera-off"} size={36} color={"white"}/>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 0.1,
              alignSelf: 'flex-end',
              alignItems: 'center',
              marginBottom: 20
            }}
            onPress={() => {
              this.setState({
                type:
                  this.state.type === Camera.Constants.Type.back
                    ? Camera.Constants.Type.front
                    : Camera.Constants.Type.back,
              });
            }}>
            <Ionicons name={"md-camera-reverse"} size={36} color={"white"}/>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 0.1,
              alignSelf: 'flex-end',
              alignItems: 'center',
              marginBottom: 10
            }}
            onPress={this.snap}>
            <Ionicons name={"md-camera"} size={48} color={"white"}/>
          </TouchableOpacity>
        </View>
      </Camera>
    )
  }

}