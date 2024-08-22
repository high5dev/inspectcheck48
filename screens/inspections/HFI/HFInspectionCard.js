import React, {Fragment} from "react";
import {Block, Button, Text, theme} from "galio-framework";
import Icon from '../../../components/Icon';
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from "react-native";
import {materialTheme} from "../../../constants";
import * as ImagePicker from 'expo-image-picker';
import {Camera} from 'expo-camera';
import {Ionicons} from '@expo/vector-icons';
import {ImageAsset} from "../../../components/ImageAsset";
import {v1} from "uuid";
import * as FileSystem from "expo-file-system";
import {ClientEvent} from "clientevent";
import Database from "../../../db/db";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import RefLookup from "../../../components/RefLookup";

const {height, width} = Dimensions.get('screen');

const thumbMeasure = (width - 48 - 32) / 3;

export default class HFInspectionCard extends React.Component {

  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
    useCamera: false,
    viewFinding: null,
    adding: false
  }
  self = this;

  static WIDTH = width;

  openImagePickerAsync = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync();
    if (pickerResult && !pickerResult.cancelled) {
      this.addSelectedImage(pickerResult);
    }
  }

  onValue(name, value) {
    if (!!this.props.completed) return;
    this.setState({
      viewFinding: {
        ...this.state.viewFinding,
        [name]: value
      }
    })
  }

  onSave() {
    if (!!this.props.completed) return;
    let savedFindings;
    if (this.state.adding) {
      savedFindings = this.props.findings.concat(this.state.viewFinding);
    } else {
      savedFindings = this.props.findings.map((finding) => {
        if (finding.id === this.state.viewFinding.id) {
          return this.state.viewFinding;
        }
        return finding;
      });
    }
    this.setState({viewFinding: null, adding: false}, () => {
      this.props.onUpdate("findings", savedFindings);
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const response = (nextProps.findings !== this.props.findings || nextState !== this.state);
    return response;
  }

  openCamera() {
    ClientEvent.on("CAMERA_SNAP", "HFInspectionCard", (photo) => this.addImage(photo));
    this.props.onCamera();
  }

  addImage(image) {
    const self = this;
    ClientEvent.off("CAMERA_SNAP", "HFInspectionCard");
    // console.log(image);
    if (image === null) return;
    Database().addExec("media", image, (error, results) => console.log(error));
    // Database().addExec("media", this.state.updatedPhoto, (error, results) => console.log(error));
    // ClientEvent.emit("MEDIA_UPLOAD", this.state.updatedPhoto);
    const mediaList = self.state.viewFinding.mediaList || [];
    setTimeout(() => self.onValue("mediaList", mediaList.concat(image)), 500);
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
        this.addImage(photoObj);
      });
    })).catch((reason => alert(reason)));

  }

  renderFinding({item}, context) {
    const getShade = function (compliant) {
      switch (compliant) {
        case 1:
          return styles.greenShade;
        case 2:
          return styles.redShade;
        default:
          return styles.greyShade;
      }
    }
    const getRisk = function (compliant, risk_level) {
      if (compliant === 2) {
        switch (risk_level) {
          case 1:
            return "1 - HIGH";
          case 2:
            return "2 - MED";
          case 3:
            return "3 - LOW";
          default:
        }
      }
      return "";
    }
    const getRiskColor = function (compliant, risk_level) {
      if (compliant === 2) {
        switch (risk_level) {
          case 1:
            return styles.red;
          case 2:
            return styles.orange;
          case 3:
            return styles.darkYellow;
          default:
        }
      }
      return "";
    }
    const getFormats = function (compliant, risk_level) {
      return {
        shading: getShade(compliant),
        riskText: getRisk(compliant, risk_level),
        riskBox: getRiskColor(compliant, risk_level)
      }
    }
    const itemFormat = getFormats(item.compliant || 0, item.risk_level || 0);
    const noteLength = function (str) {
      if (!str) return;
      if (str.length > 80) {
        return str.substr(0, 80) + "...";
      }
      return str;
    }
    return (
      <Block style={[styles.rows, itemFormat.shading]}>
        <Block style={styles.agency}>
          <TouchableOpacity
            onPress={() => {
              context.setState({viewFinding: item});
            }}
          >
            <Block row space={"between"} style={{marginTop: 10}}>
              <Block left style={{maxWidth: "80%"}}>
                <Text bold left style={{paddingBottom: 5}}>
                  {noteLength(item.notes || "(NO INFO SUBMITTED - TAP HERE TO EDIT COMMENTS)")}
                </Text>
                <Text size={10} left>
                  {String(item.discovered_date || "")}
                </Text>
                <Block row>
                  <Text bold
                        size={10}
                        style={{
                          marginBottom: 0,
                          paddingBottom: 0,
                          marginRight: 5
                        }}>{item.mediaList && item.mediaList.length || 0}</Text>
                  <Icon family="font-awesome" name="camera" size={10}/>
                </Block>
              </Block>
              {itemFormat.riskText.length > 0 && (
                <Block style={[{width: 70, height: 50, borderRadius: 20}, itemFormat.riskBox]} middle>
                  <Text size={12} left style={{color: "#ffffff", fontWeight: "bold"}}>
                    {itemFormat.riskText}
                  </Text>
                </Block>
              )}

            </Block>
          </TouchableOpacity>
        </Block>
      </Block>
    )
  }

  render() {
    const totalFindings = this.props.findings.length;
    const compliantFindins = this.props.findings.filter(finding => finding.compliant === 1).length;
    const nonCompliantFindins = this.props.findings.filter(finding => finding.compliant === 2).length;
    const naFindings = this.props.findings.filter(finding => finding.compliant === 3).length;
    return <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.settings}>

        <Block style={styles.card}>
          <Block row space={"between"}>
            <Block>
              <Text left size={20} style={{paddingLeft: 10}}>
                {this.props.name}
              </Text>
              <Text left size={16} style={{padding: 10}}>
                PN: {this.props.part_number || "N/A"}
              </Text>
            </Block>
            {!!this.state.viewFinding && (

              <Block row style={{width: 70}}>
                <TouchableOpacity
                  onPress={() => this.onSave()}
                >
                  <Icon
                    size={30}
                    family="material-icons"
                    name="save"
                    color={theme.COLORS['ICON']}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => this.setState({viewFinding: null, adding: false})}
                  style={{marginLeft: 10}}
                >
                  <Icon
                    size={30}
                    family="material-icons"
                    name="cancel"
                    color={theme.COLORS['ICON']}
                  />
                </TouchableOpacity>
              </Block>
            )}

          </Block>
          {!this.state.viewFinding ?
            <Fragment>
              <Block row top space={"between"} style={{marginBottom: 10}}>
                <Block>
                  <ImageAsset
                    style={{
                      borderRadius: 5,
                      height: 250,
                      width: 250
                    }}
                    mediaId={this.props.thumbnail_url || ""}
                    updated={Math.round(new Date().getTime() / 1000)}
                    placeholderColor='#b3e5fc'
                  />
                </Block>
                <Block middle center space={"around"} style={{marginLeft: 20}}>
                  <Text style={{fontWeight: "bold"}}>Findings</Text>
                  <Text style={{marginBottom: 40}}>{totalFindings}</Text>
                  <Text style={{fontWeight: "bold"}}>Compliant</Text>
                  <Text style={{marginBottom: 10}}>{compliantFindins}</Text>
                  <Text style={{fontWeight: "bold"}}>Non-Compliant</Text>
                  <Text style={{marginBottom: 10}}>{nonCompliantFindins}</Text>
                  <Text style={{fontWeight: "bold"}}>N/A</Text>
                  <Text>{naFindings}</Text>
                </Block>
              </Block>

              <FlatList
                data={this.props.findings}
                keyExtractor={(item) => String(item.id)}
                renderItem={(item) => this.renderFinding(item, this)}
                ListHeaderComponent={
                  <Block>

                    <Block row middle style={styles.title}>
                      <Text center muted size={16}>
                        Inspections/Findings
                      </Text>

                      {!this.props.completed && (
                        <TouchableOpacity style={{marginLeft: 100}}
                                          onPress={() => this.setState({
                                            viewFinding: {
                                              id: v1(),
                                              inspection_id: this.props.inspection_id,
                                              asset_id: this.props.assetId,
                                              new: true,
                                              // compliant: result.compliant,
                                              // risk_level: result.risk_level,
                                              // notes: result.notes,
                                              discovered_date: new Date(),
                                              // resolve_by_date: result.resolve_by_date,
                                              // resolved_date: result.resolved_date,
                                              media: "",
                                              mediaList: []
                                            }, adding: true
                                          })}>
                          <Icon
                            size={24}
                            family="entype"
                            name="add-circle-outline"
                            color={theme.COLORS['ICON']}
                          />
                        </TouchableOpacity>
                      )}

                    </Block>
                    {this.props.findings.length === 0 && (
                      <Block style={styles.title}>
                        <Text bold center size={theme.SIZES.BASE} style={{paddingBottom: 5}}>
                          Not Inspected and No Findings
                        </Text>
                        <Text size={13} center>
                          Record Inspection using the Plus button. Additional findings can be recorded by tapping the
                          add button again.
                        </Text>
                      </Block>
                    )}
                  </Block>
                }
              />


            </Fragment>
            :
            <KeyboardAwareScrollView enableResetScrollToCoords={false}>

              <Block row top space={"between"} style={{marginBottom: 10}}>
                <Block>
                  <ImageAsset
                    style={{
                      borderRadius: 5,
                      height: 250,
                      width: 250
                    }}
                    mediaId={this.props.thumbnail_url || ""}
                    updated={Math.round(new Date().getTime() / 1000)}
                    placeholderColor='#b3e5fc'
                  />
                </Block>
                <Block middle space={"around"} style={{marginLeft: 10}}>
                  <Button
                    onPress={() => this.onValue("compliant", 1)}
                    style={this.state.viewFinding.compliant === 1 ? [styles.buttonSelected, styles.green] : styles.buttonUnselected}>
                    <Text color={"#fff"}>
                      <Icon
                        size={16}
                        family="material-icons"
                        name="check"
                        color={'#fff'}
                      />
                      &nbsp;Compliant
                    </Text>
                  </Button>
                  <Button
                    style={this.state.viewFinding.compliant === 2 ? [styles.buttonSelected, styles.red] : styles.buttonUnselected}
                    onPress={() => this.onValue("compliant", 2)}
                  >
                    <Text color={"#fff"}>
                      <Icon
                        size={14}
                        family="foundation"
                        name="x"
                        color={'#fff'}
                      />
                      &nbsp;Non-Compliant
                    </Text>
                  </Button>
                  <Button
                    onPress={() => this.onValue("compliant", 3)}
                    style={this.state.viewFinding.compliant === 3 ? styles.buttonSelected : styles.buttonUnselected}>
                    N/A
                  </Button>
                  {this.state.viewFinding.compliant === null && (
                    <Text style={{marginTop: 10, textAlign: "center"}}>
                      Choose above
                    </Text>
                  )}
                </Block>
              </Block>

              {this.state.viewFinding.compliant !== null && this.state.viewFinding.compliant === 2 && (
                <Block row middle style={{marginBottom: 5}}>
                  <Text style={{marginRight: 5}}>Risk</Text>
                  <Button onPress={() => this.onValue("risk_level", 1)}
                          style={this.state.viewFinding.risk_level === 1 ? [styles.riskButtonSelected, styles.red] : styles.riskButtonUnselected}>
                    1 - High
                  </Button>
                  <Button onPress={() => this.onValue("risk_level", 2)}
                          style={this.state.viewFinding.risk_level === 2 ? styles.riskButtonSelected : styles.riskButtonUnselected}>
                    2 - Med
                  </Button>
                  <Button onPress={() => this.onValue("risk_level", 3)}
                          style={this.state.viewFinding.risk_level === 3 ? [styles.riskButtonSelected, styles.darkYellow] : styles.riskButtonUnselected}>
                    3 - Low
                  </Button>
                </Block>
              )}

              {this.state.viewFinding.compliant !== null && (
                <>
                  <TextInput
                    multiline={true}
                    numberOfLines={4}
                    value={this.state.viewFinding.notes || ""}
                    id={"notes"}
                    placeholder={"Comments..."}
                    onChange={(evt) => this.onValue("notes", evt.nativeEvent.text)}
                    style={{
                      height: 80,
                      borderWidth: 1,
                      borderColor: materialTheme.COLORS.DARK_TEXT,
                      padding: 5,
                      textAlignVertical: "top"
                    }}

                  />
                  <RefLookup
                    onSelect={(data) => this.onValue("notes", `${this.state.viewFinding.notes || ""} ${data}`.trim())}/>

                  <>
                    {this.renderMedia(this.state.viewFinding.mediaList)}
                  </>
                </>
              )}
            </KeyboardAwareScrollView>
          }
        </Block>
        {/*  }*/}
        {/*/>*/}
      </ScrollView>
    </KeyboardAvoidingView>
  }

  removeImage(mediaId) {
    console.log(this.state.viewFinding);
    return;
    const list = this.props.data || [];
    const self = this;
    const newList = list.map((cond) => {
      if (cond.post && cond.post === mediaId) {
        return {...cond, post: null};
      } else {
        return cond;
      }
    });
    // setTimeout(() => self.props.onUpdate(newList), 250);
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
    // setTimeout(() => self.props.onUpdate(newList), 250);
  }

  renderMedia = (mediaList) => {
    const {navigation} = this.props;
    // console.log(mediaList);
    return (
      <Block flex style={[{paddingBottom: theme.SIZES.BASE * 5}]}>
        <Text bold size={16} style={styles.title}>Images</Text>
        <Block style={{marginHorizontal: theme.SIZES.BASE * 2}}>
          <Block row space="between" style={{marginTop: theme.SIZES.BASE, flexWrap: 'wrap'}}>
            {(mediaList || []).map(img1 => img1.id || img1).map((img, index) => (
              <Block key={`viewed-${index}`} style={styles.shadow}>
                <ImageAsset
                  style={{
                    borderRadius: 5,
                    height: 75,
                    width: 75
                  }}
                  // canReplace={!this.props.completed && false}
                  // canDelete={!this.props.completed && false}
                  // onDelete={() => this.removeImage(img.id)}
                  // onReplace={(newImage) => this.replaceImage(img.id, newImage)}
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
    height: 75,
    backgroundColor: "#aaa",
    color: "#111",
    margin: 3,
  },
  buttonSelected: {
    width: 100,
    height: 75,
    margin: 3,
  },
  green: {
    backgroundColor: "#00aa0a",
  },
  greenShade: {
    backgroundColor: "#80ca8e",
  },
  red: {
    backgroundColor: "#aa0000",
  },
  redShade: {
    backgroundColor: "#e28a92",
  },
  orange: {
    backgroundColor: "#f86328",
  },
  darkYellow: {
    backgroundColor: "#aa8606",
  },
  darkYellowShade: {
    backgroundColor: "#aaa276",
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
  title: {
    paddingTop: theme.SIZES.BASE,
    paddingBottom: theme.SIZES.BASE / 2,
  },

  rows: {
    height: theme.SIZES.BASE * 5,
    paddingHorizontal: theme.SIZES.BASE,
    marginBottom: theme.SIZES.BASE / 2,
  },
  greyShade: {
    backgroundColor: '#dadada'
  },
  agency: {
    // width: theme.SIZES.BASE,
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
