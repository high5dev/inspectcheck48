import React from "react";
import {Block, Button, Text, theme} from "galio-framework";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {materialTheme} from "../../../constants";
import * as ImagePicker from 'expo-image-picker';
// import * as Permissions from 'expo-permissions';
import {Camera} from 'expo-camera';
import {Feather, Ionicons} from '@expo/vector-icons';

const {height, width} = Dimensions.get('screen');

const thumbMeasure = (width - 48 - 32) / 3;

export default class InspectionCard extends React.Component {

  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
    useCamera: false
  }

  static WIDTH = width;

  openImagePickerAsync = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync();
    if (pickerResult && !pickerResult.cancelled) {
      this.addImage(pickerResult);
    }
  }

  openCamera = async () => {
    const {status} = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({hasCameraPermission: status === 'granted', useCamera: status === 'granted'});
  }

  onValue(value) {
    this.props.onUpdate("response", value);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const response = (nextProps.mediaList !== this.props.mediaList ||
      nextProps.comments !== this.props.comments ||
      nextProps.response !== this.props.response || nextState !== this.state);
    return response;
  }

  snap = async () => {
    if (this.camera) {
      let photo = await this.camera.takePictureAsync({quality: 0.5, skipProcessing: true, exif: true});
      this.addImage(photo);
    }
  };

  addImage(image) {
    const list = this.props.mediaList || [];
    list.push(image);
    this.props.onUpdate("mediaList", list);
    this.setState({useCamera: false});
  }

  render() {
    return <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.settings}>
        {/*<FlatList*/}
        {/*  data={[]}*/}
        {/*  keyExtractor={(item, index) => String(item.id)}*/}
        {/*  // renderItem={this.renderItem}*/}
        {/*  ListHeaderComponent={*/}
        <Block style={styles.card}>
          <Text left size={18} style={{paddingLeft: 10}}>
            {this.props.long_display}
          </Text>
          <Text left size={16} style={{padding: 10}}>
            {this.props.display}
          </Text>
          {this.props.response === null && (
            <Text>
              Please Choose:
            </Text>
          )}
          {this.displayResponse(this.props.anstype, this.props.response)}
          {this.props.response !== null && this.props.response !== "N/A" && (
            <>
              <TextInput
                multiline={true}
                numberOfLines={4}
                value={this.props.comments || ""}
                id={"comments"}
                placeholder={"Comments..."}
                onChange={(evt) => this.props.onUpdate("comments", evt.nativeEvent.text)}
                style={{
                  height: 80,
                  borderWidth: 1,
                  borderColor: materialTheme.COLORS.DARK_TEXT,
                  padding: 5,
                  textAlignVertical: "top"
                }}

              />
              {!this.state.useCamera || !this.state.hasCameraPermission ?
                <>
                  {this.renderMedia(this.props.mediaList)}
                </>
                :
                <Camera style={{flex: 1}} type={this.state.type} ref={ref => {
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
                        this.setState({
                          useCamera: false
                        });
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
                      <Ionicons name={"md-reverse-camera"} size={36} color={"white"}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        flex: 0.1,
                        alignSelf: 'flex-end',
                        alignItems: 'center',
                        marginBottom: 10
                      }}
                      onPress={async () => {
                        this.snap();
                      }}>
                      <Ionicons name={"md-camera"} size={48} color={"white"}/>
                    </TouchableOpacity>
                  </View>
                </Camera>
              }
            </>
          )}
        </Block>
        {/*  }*/}
        {/*/>*/}
      </ScrollView>
    </KeyboardAvoidingView>
  }

  renderMedia = (mediaList) => {
    const {navigation} = this.props;

    return (
      <Block flex style={[{paddingBottom: theme.SIZES.BASE * 5}]}>
        <Text bold size={16} style={styles.title}>Images</Text>
        <Block style={{marginHorizontal: theme.SIZES.BASE * 2}}>
          {/*<Block flex right>*/}
          {/*  <Text*/}
          {/*    size={12}*/}
          {/*    color={theme.COLORS.PRIMARY}*/}
          {/*    onPress={() => navigation.navigate('Home')}>*/}
          {/*    View All*/}
          {/*  </Text>*/}
          {/*</Block>*/}
          <Block row space="between" style={{marginTop: theme.SIZES.BASE, flexWrap: 'wrap'}}>
            {(mediaList || []).map((img, index) => (
              <Block key={`viewed-${index}`} style={styles.shadow}>
                <Image
                  resizeMode="cover"
                  source={img}
                  style={styles.albumThumb}
                />
              </Block>
            ))}
            <Block key={`viewed-new`} style={[styles.albumThumb]}>
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
                  <Ionicons name={"md-images"} size={16} color={"white"}/>
                  <Text style={styles.addPhoto}>Select Photo</Text>
                </Block>
              </TouchableOpacity>
            </Block>
          </Block>
        </Block>
      </Block>
    )
  }

  displayResponse(ansType, value) {
    switch (ansType) {
      case "noyesna":
        return this.displayNoYesNA(value);
      default:
        return <Text>Answer Type Not Implemented</Text>
    }

  }

  displayNoYesNA(value) {
    return <Block row top space={"between"} style={{height: 120}}>
      <Button
        style={value === "No" ? styles.buttonSelected : styles.buttonUnselected}
        onPress={() => this.onValue("No")}
      >
        No
      </Button>
      <Button
        onPress={() => this.onValue("Yes")}
        style={value === "Yes" ? styles.buttonSelected : styles.buttonUnselected}>
        Yes
      </Button>
      <Button
        onPress={() => this.onValue("N/A")}
        style={value === "N/A" ? styles.buttonSelected : styles.buttonUnselected}>
        N/A
      </Button>
    </Block>
  }
}

const styles = StyleSheet.create({
  settings: {
    paddingVertical: theme.SIZES.BASE / 3,
  },
  card: {
    width: width - 20,
    height: height - 200,
    backgroundColor: '#fff',
    margin: 10,
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
