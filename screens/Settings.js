import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Switch,
  TouchableOpacity
} from "react-native";
import {Block, Icon, Text, theme} from "galio-framework";

import materialTheme from '../constants/Theme';
import {ClientEvent} from "clientevent";
import * as FileSystem from "expo-file-system/src/FileSystem";
import Database from "../db/db";
// import * as Permissions from "expo-permissions";
import {addBreadcrumb, captureException, captureMessage} from "@sentry/react-native";
import * as MediaLibrary from "expo-media-library";
import {callbackEach, zLen} from "../util/shared";
import {uploadFile} from "../api/api";
import mime from "mime";

export default class Settings extends React.Component {
  state = {syncMessage: ""};

  componentWillUnmount() {
    ClientEvent.off("CONFIG_RESET_RESPONSE", "Settings");
    ClientEvent.off("DB_SYNC_MESSAGE", "Settings");
    ClientEvent.off("DB_SYNC_DONE", "Settings");
  }

  toggleSwitch = switchNumber => this.setState({[switchNumber]: !this.state[switchNumber]});

  renderItem = ({item}) => {
    const {navigate} = this.props.navigation;

    switch (item.type) {
      case 'switch':
        return (
          <Block row middle space="between" style={styles.rows}>
            <Text size={14}>{item.title}</Text>
            <Switch
              onValueChange={() => this.toggleSwitch(item.id)}
              ios_backgroundColor={materialTheme.COLORS.SWITCH_OFF}
              thumbColor={Platform.OS === 'android' ? materialTheme.COLORS.SWITCH_OFF : null}
              trackColor={{false: materialTheme.COLORS.SWITCH_OFF, true: materialTheme.COLORS.SWITCH_ON}}
              value={this.state[item.id]}
            />
          </Block>
        );
      case 'button':
        return (
          <Block style={styles.rows}>
            <TouchableOpacity onPress={() => item.onPress && item.onPress(this, item.id, item.description)}>
              <Block row middle space="between" style={{paddingTop: 7}}>
                <Text size={14}>{item.title}</Text>
                <Icon name="angle-right" family="font-awesome" style={{paddingRight: 5}}/>
              </Block>
            </TouchableOpacity>
          </Block>);
      default:
        break;
    }
  }

  render() {
    const recommended = [
      // { title: "Use FaceID to sign in", id: "face", type: "switch" },
      // { title: "Auto-Lock security", id: "autolock", type: "switch" },
      // { title: "Notifications", id: "Notifications", type: "button" },
    ];

    const payment = [
      // { title: "Manage Payment Options", id: "Payment", type: "button" },
      // { title: "Manage Gift Cards", id: "gift", type: "button" },
    ];

    const settings = [
      {
        title: "Grab Statistics",
        id: "grabStatistics",
        type: "button",
        onPress: this.confirmAdvanced,
        description: "This will perform some statistic calculations. This might take a while to run."
      },
      {
        title: "Upload Files for Debug",
        id: "uploadDebug",
        type: "button",
        onPress: this.confirmAdvanced,
        description: "This will upload all files you have on your system to the debug upload platform for analysis. This WILL take a while. Make sure your device stays on and connected."
      },
      {
        title: "Reset Server Sync Time",
        id: "resetSyncTime",
        type: "button",
        onPress: this.confirmAdvanced,
        description: "This will reset the last known sync time on the server."
      },
      {
        title: "Clear Device Media Only",
        id: "deviceClearMedia",
        type: "button",
        onPress: this.confirmAdvanced,
        description: "This will clear the Image Cache from your Device."
      },
      {
        title: "Clear Device Data/Media",
        id: "deviceClear",
        type: "button",
        onPress: this.confirmAdvanced,
        description: "This will clear the Database and Image Cache from your Device."
      },
      {
        title: "Force Pull/Match Server Data",
        id: "forcePull",
        type: "button",
        onPress: this.confirmAdvanced,
        description: "This will clear local data, reset the last sync time on server, and re-pull all from server."
      },
      {
        title: "Extract Upload Failed Media",
        id: "extractFailedImages",
        type: "button",
        onPress: this.confirmAdvanced,
        description: "This will take all failed-to-upload images and add them to your media library for manual upload."
      },
    ];

    return (
      <SafeAreaView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.settings}>
        {/*<FlatList*/}
        {/*  data={recommended}*/}
        {/*  keyExtractor={(item, index) => item.id}*/}
        {/*  renderItem={this.renderItem}*/}
        {/*  ListHeaderComponent={*/}
        {/*    <Block style={styles.title}>*/}
        {/*      <Text bold center size={theme.SIZES.BASE} style={{ paddingBottom: 5 }}>*/}
        {/*        Recommended Settings*/}
        {/*      </Text>*/}
        {/*      <Text center muted size={12}>*/}
        {/*        These are the most important settings*/}
        {/*      </Text>*/}
        {/*    </Block>*/}
        {/*  }*/}
        {/*/>*/}
        {/*<Block style={styles.title}>*/}
        {/*  <Text bold center size={theme.SIZES.BASE} style={{ paddingBottom: 5 }}>*/}
        {/*  Payment Settings*/}
        {/*  </Text>*/}
        {/*  <Text center muted size={12}>*/}
        {/*  These are also important settings*/}
        {/*  </Text>*/}
        {/*</Block>*/}
        {/*<FlatList*/}
        {/*  data={payment}*/}
        {/*  keyExtractor={(item, index) => item.id}*/}
        {/*  renderItem={this.renderItem}*/}
        {/*/>*/}
        {this.state.syncMessage.length > 0 && (
          <Block center style={{paddingTop: 10}}>
            <ActivityIndicator size={"large"} color={theme.COLORS.WARNING}/>
            <Text>{this.state.syncMessage}</Text>
          </Block>
        )}
        <Block style={styles.title}>
          <Text bold center size={theme.SIZES.BASE} style={{paddingBottom: 5}}>
            Advanced Settings
          </Text>
          <Text center muted size={12}>
            Only use these if you know what you are doing
          </Text>
        </Block>
        <FlatList
          data={settings}
          keyExtractor={(item, index) => item.id}
          renderItem={this.renderItem}
        />
      </SafeAreaView>

    );
  }

  confirmAdvanced(context, settingId, settingDescr) {
    const self = context;
    Alert.alert(
      'Advanced Confirmation',
      `${settingDescr} Are you sure?`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            self.startAdvancedSetting(settingId);
          }
        },
      ],
      {cancelable: false}
    );
  }

  startAdvancedSetting(settingId) {
    switch (settingId) {
      case "resetSyncTime":
        this.resetDB();
        break;
      case "forcePull":
        this.forcePull();
        break;
      case "deviceClearMedia":
        this.deviceClearMedia();
        break;
      case "deviceClear":
        this.deviceClear();
        break;
      case "extractFailedImages":
        this.exportFailedImages();
        break;
      case "grabStatistics":
        this.grabStatistics();
        break;
      case "uploadDebug":
        this.uploadDebug();
        break;
    }

  }

  //grabStatistics
  async grabStatistics() {
    const self = this;
    await self.setState({syncMessage: "Recording details"});
    const docDir = FileSystem.documentDirectory;
    const cacheDir = FileSystem.cacheDirectory;
    const capacity = await FileSystem.getTotalDiskCapacityAsync();
    const freeSpace = await FileSystem.getFreeDiskStorageAsync();
    const dbDetails = await FileSystem.getInfoAsync(`${docDir}SQLite/appData.db`, {size: true});
    const mediaDetails = await FileSystem.getInfoAsync(`${docDir}media/`, {size: true});
    const cacheContents = await FileSystem.readDirectoryAsync(`${cacheDir}`);
    const imagePickerContents = await FileSystem.readDirectoryAsync(`${cacheDir}ImagePicker/`);
    const cameraContents = await FileSystem.readDirectoryAsync(`${cacheDir}Camera/`);
    const sessionId = new Date().getTime();
    const object = {
      docDir,
      cacheDir,
      capacity,
      freeSpace,
      dbDetails,
      mediaDetails,
      cacheContents,
      cacheCount: cacheContents.length,
      imagePickerContents,
      imagePickerCount: imagePickerContents.length,
      cameraContents,
      cameraCount: cameraContents.length
    }
    if (mediaDetails.exists) {
      const media = await FileSystem.readDirectoryAsync(`${docDir}media/`);
      object.media = media;
      object.mediaCount = media.length;
    }

    await addBreadcrumb({data: object});
    await captureMessage(`Grabbed Statistics ${sessionId}`, object);
    await self.setState({syncMessage: "Done"});
    await setTimeout(() => self.setState({syncMessage: ""}), 1000);
  }

  async uploadDebug() {
    const self = this;


    const docDir = FileSystem.documentDirectory;
    const cacheDir = FileSystem.cacheDirectory;

    const sessionId = new Date().getTime();
    const uploadDocs = [];
    const uploadCache = [];

    await self.setState({syncMessage: "Generating Documents..."});
    await this.traverseOrUpload(docDir, [], "", uploadDocs).catch((err) => captureException(err));
    uploadDocs.forEach((up) => up.path = ["document", ...up.path]);

    await self.setState({syncMessage: "Generating Cache..."});

    await this.traverseOrUpload(cacheDir, [], "", uploadCache).catch((err) => captureException(err));

    uploadCache.forEach((up) => up.path = ["cache", ...up.path]);

    await self.setState({syncMessage: "Uploading..."});
    await this.uploadFiles(uploadDocs.concat(uploadCache), sessionId, self);

    await captureMessage(`Debug Data saved @ ${global.configData.username}/${sessionId}`);
    await self.setState({syncMessage: "Done"});
    await setTimeout(() => self.setState({syncMessage: ""}), 1000);
  }

  async uploadFiles(files, sessionId, self) {
    // return this.runPromisesSequentially([...files].map(async (up) => await this.uploadTheFileUri(up.uri, up.path, sessionId).catch((e)=>console.error(e))));
    const tmpFiles = [...files];
    const totalFiles = tmpFiles.length;
    let currentAt = 0;
    return new Promise((resolve, reject) => {
      callbackEach(tmpFiles, async (file, callback) => {
        this.uploadTheFileUri(file.uri, file.path, sessionId).then(() => {
          currentAt++;
          if (currentAt > totalFiles) currentAt = totalFiles;
          self.setState({syncMessage: `Uploading... (${Math.floor((currentAt / totalFiles) * 100)}%)`});
          return callback(file)
        }).catch((err) => {
          currentAt++;
          if (currentAt > totalFiles) currentAt = totalFiles;
          self.setState({syncMessage: `Uploading... (${Math.floor((currentAt / totalFiles) * 100)}%)`});
          console.error(err);
          return callback(null);
        });
      }, async () => {
        await self.setState({syncMessage: "Uploading... (100%)"});
        resolve();
      });
    });
  }

  async traverseOrUpload(basePath, addPath, file, upload) {
    // console.log("Got in", file);
    const info = await FileSystem.getInfoAsync(`${basePath}${addPath.length > 0 ? addPath.join('/').concat("/") : ""}${file}`);
    if (info.exists) {
      if (info.isDirectory) {
        const additionalPath = [...addPath];
        if (file.length > 0) additionalPath.push(file);
        const dirContents = await FileSystem.readDirectoryAsync(`${basePath}${additionalPath.length > 0 ? additionalPath.join('/').concat("/") : ""}`);
        // console.log(additionalPath, dirContents);
        await this.runPromisesSequentially([...dirContents.map(async (contents) => await this.traverseOrUpload(basePath, additionalPath, contents, upload))])
      } else {
        // console.log(info);
        upload.push({
          uri: info.uri,
          basePath,
          path: addPath
        })
      }
    }
  }

  async runPromisesSequentially(promises) {
    if (promises.length === 0) return [];
    const [firstElement, ...rest] = promises;
    return [await firstElement, ...(await this.runPromisesSequentially(rest))];
  }

  async uploadTheFileUri(fileUri, path, sessionId) {
    console.log(fileUri, path, sessionId);

    // return wait(1000).then(() => Promise.reject(new Error("test")));
    try {
      let filename = fileUri.split('/').pop();
      let type = mime.getType(filename);
      let formData = new FormData();
      formData.append('file', {uri: fileUri, name: filename, type});
      formData.append("data", JSON.stringify({sessionId, path}));
      const customHeader = {
        path: path.join("/")
      }
      return await uploadFile(`mobile/debug/${sessionId}`, formData, global.configData.token, global.configData.username, global.configData.password, customHeader);
    } catch (err) {
      console.log(err)
      captureException(err);
      return Promise.reject(err);
    }
  }

  // resetSyncTime
  resetDB(syncToo) {
    const self = this;
    ClientEvent.on("DB_SYNC_MESSAGE", "Settings", (data) => self.setState({syncMessage: data}));
    if (syncToo) {
      console.log("sync too");
      ClientEvent.on("CONFIG_RESET_RESPONSE", "Settings", (response) => this.resetDBResponseDoSync(response));
    } else {
      ClientEvent.on("CONFIG_RESET_RESPONSE", "Settings", (response) => this.resetDBResponse(response));
    }
    ClientEvent.emit("HOME_RESET_DB");
  }

  resetDBResponse() {
    const self = this;
    setTimeout(() => self.setState({syncMessage: ""}), 1000);
    ClientEvent.off("CONFIG_RESET_RESPONSE", "Settings");
    ClientEvent.off("DB_SYNC_MESSAGE", "Settings");
  }

  resetDBResponseDoSync() {
    const self = this;
    ClientEvent.off("CONFIG_RESET_RESPONSE", "Settings");
    ClientEvent.off("DB_SYNC_MESSAGE", "Settings");
    ClientEvent.on("DB_SYNC_DONE", "Settings", () => self.syncDBResponse());
    self.setState({syncMessage: "Initiating Sync..."});
    setTimeout(() => {
      ClientEvent.on("DB_SYNC_MESSAGE", "Settings", (data) => self.setState({syncMessage: data}));
      ClientEvent.emit("HEADER_SYNC_HOME");
    }, 1500);
  }

  syncDBResponse() {
    const self = this;
    setTimeout(() => self.setState({syncMessage: ""}), 1000);
    ClientEvent.off("CONFIG_RESET_RESPONSE", "Settings");
    ClientEvent.off("DB_SYNC_MESSAGE", "Settings");
    ClientEvent.off("DB_SYNC_DONE", "Settings");
  }

  //forcePull
  forcePull() {
    const self = this;
    this.setState({syncMessage: "Clearing Media Folder"});
    this.deleteFolder().then(() => {
      self.setState({syncMessage: "Deleting Table Data"});
      self.deleteDBTableData();
      self.setState({syncMessage: "Resetting Server Date/Time"});
      setTimeout(() => self.resetDB(true), 1000);
    }).catch((error) => {
      alert(error);
      self.setState({syncMessage: ""});
    });
  }

  //deviceClearMedia
  deviceClearMedia() {
    const self = this;
    this.setState({syncMessage: "Clearing Media Folder"});
    this.deleteFolder().then(() => {
      self.setState({syncMessage: ""});
    }).catch(() => {
      self.setState({syncMessage: ""});
    });
  }

  async deleteFolder() {
    await FileSystem.deleteAsync(`${FileSystem.documentDirectory}media/`, {idempotent: true});
  }

  //deviceClear
  deviceClear() {
    const self = this;
    this.setState({syncMessage: "Clearing Media Folder"});
    this.deleteFolder().then(() => {
      self.deleteDBTableData();
      self.setState({syncMessage: ""});
    }).catch((error) => {
      alert(error);
      self.setState({syncMessage: ""});
    });
  }

  deleteDBTableData() {
    const tables = [
      "agencies", "asset_categories", "asset_types", "assets", "finding_asset", "finding_asset_media", "inspection_mx_items",
      "inspection_types", "inspections", "media", "mx_item_media", "mx_quick_list", "playgrounds", "sync_data", "inspection_conditions"
    ];
    tables.forEach(table => {
      Database().query(`DELETE
                        FROM ${table};`, [], () => {
      });
    });
  }

  exportFailedImages = () => {
    const self = this;
    self.setState({syncMessage: "Exporting Failed Media"});
    MediaLibrary.requestPermissionsAsync().then(({status}) => {
      // Permissions.askAsync(Permissions.CAMERA_ROLL).then(({status}) => {
      if (status === "granted") {
        self.setState({syncMessage: "Exporting Failed Media"});
        Database().query(`SELECT *
                          FROM media
                          WHERE uploaded < 0;`, [], (err, results) => {
          if (err) {
            captureException(err);
            self.setState({syncMessage: "Error: Admin notified"});
            setTimeout(() => {
              self.setState({syncMessage: ""});
            }, 2000);
            return;
          }
          if (!results || results.length === 0) {
            self.setState({syncMessage: "No Media to export"});
            setTimeout(() => {
              self.setState({syncMessage: ""});
            }, 2000);
            return;
          }
          let now = new Date();
          const datePart = [now.getFullYear(), zLen(String(now.getMonth() + 1), 2), zLen(String(now.getDate()), 2)].join("-");
          const timePart = [zLen(String(now.getHours()), 2), zLen(String(now.getMinutes()), 2), zLen(String(now.getSeconds()), 2)].join(":");
          const albumPart = `${datePart} ${timePart}`;
          self.exportMedia(self, results, albumPart, () => {
            self.setState({syncMessage: "Successful"});
            setTimeout(() => {
              self.setState({syncMessage: ""});
            }, 2000);
          });
        });
      } else {
        self.setState({syncMessage: "Error: No permissions"});
        setTimeout(() => {
          self.setState({syncMessage: ""});
        }, 2000);
      }
    }).catch(() => {
      self.setState({syncMessage: ""});

    });
  }

  exportMedia(self, arrMedia, albumPart, callback) {
    const fileDB = arrMedia.shift();
    if (!fileDB) {
      return callback();
    }
    let localUri = `${FileSystem.documentDirectory}${fileDB.uri}`;

    MediaLibrary.createAssetAsync(localUri).then((asset) => {
      MediaLibrary.getAlbumAsync(albumPart).then((album) => {
        if (!album) {
          MediaLibrary.createAlbumAsync(albumPart, asset).then(() => {
            Database().query(`UPDATE media
                              SET uploaded = ?
                              WHERE id = ?;`, [2, fileDB.id], (err, results) => {
              self.exportMedia(self, arrMedia, albumPart, callback);
            });
          }).catch((err) => {
            captureException(err);
            self.exportMedia(self, arrMedia, albumPart, callback);
          })
        } else {
          MediaLibrary.addAssetsToAlbumAsync(asset, album).then(() => {
            Database().query(`UPDATE media
                              SET uploaded = ?
                              WHERE id = ?;`, [2, fileDB.id], (err, results) => {
              self.exportMedia(self, arrMedia, albumPart, callback);
            });
          }).catch((err) => {
            captureException(err);
            self.exportMedia(self, arrMedia, albumPart, callback);
          })
        }
      }).catch((err) => {
        captureException(err);
        self.exportMedia(self, arrMedia, albumPart, callback);
      });
    }).catch((err) => {
      captureException(err);
      self.exportMedia(self, arrMedia, albumPart, callback);
    })
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
    height: theme.SIZES.BASE * 2,
    paddingHorizontal: theme.SIZES.BASE,
    marginBottom: theme.SIZES.BASE / 2,
  }
});
