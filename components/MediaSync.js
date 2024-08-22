import React from 'react';
import * as FileSystem from "expo-file-system";
import {ClientEvent} from "clientevent";
import Database from "../db/db";
import {uploadFile} from "../api/api";
import {v4} from "uuid";
import mime from "mime";
import Tile from "./Tile";
import {Text} from "galio-framework";
import {captureException, captureMessage, Severity} from "@sentry/react-native";

export class MediaSync extends React.Component {
  state = {
    mediaLeft: 0,
    running: false
  };

  constructor(props) {
    super(props);
    this.deviceId = "";
    this.database = Database();
  }

  UNSAFE_componentWillMount() {
    ClientEvent.on("MEDIA_UPLOAD", "MediaSync", () => this.startUpload());
    this.database.getConfig("deviceId", "", (deviceId) => {
      if (deviceId === "") {
        this.deviceId = v4();
        this.database.setConfig("deviceId", this.deviceId, () => {
          setTimeout(() => this.startUpload(), 100);
        });
      } else {
        setTimeout(() => this.startUpload(), 100);
        this.deviceId = deviceId
      }
    });
  }

  componentWillUnmount() {
    ClientEvent.off("MEDIA_UPLOAD", "MediaSync");
  }

  startUpload() {
    // console.log(this.state.running)
    if (this.state.running) return;
    this.database.query("UPDATE media SET uploaded = 0 WHERE uploaded < 0;", [], (error, results) => {
      this.setState({running: true}, () => {
        setTimeout(() => {
          this.getNextFile();
        }, 10);
      })
    });
  }

  getNextFile() {
    this.database.query("SELECT * FROM media WHERE uploaded = 0;", [], (error, results) => {
      console.log("Media Sync", results);
      if (results && results.length > 0) {
        // Sentry.capture(`Media Sync Files: ${results.length}`);
        this.setState({mediaLeft: results.length}, () => {

          let fileDB = results[0];
          // alert(JSON.stringify(fileDB));
          let localUri = `${FileSystem.documentDirectory}${fileDB.uri}`;
          let filename = localUri.split('/').pop();
          // let match = /\.(\w+)$/.exec(filename);
          // let type = match ? `image/${match[1]}` : `image`;
          let type = mime.getType(filename);
          let formData = new FormData();
          formData.append('file', {uri: localUri, name: filename, type});
          formData.append("data", JSON.stringify(fileDB));
          // Sentry.Native.captureMessage(`Filename: ${filename}`);
          uploadFile("mobile/file", formData, this.deviceId, global.configData.username, global.configData.password).then((response) => {
            if (response['status'] && response['status'] === "Success") {
              // Sentry.Native.captureMessage(`Response:${JSON.stringify(response)}`)
              this.database.updateExec("media", {uploaded: 1}, "id", fileDB.id, () => {
                setTimeout(() => this.getNextFile(), 250);
              });
            } else {
              captureMessage(`Response:${JSON.stringify(response)}`, Severity.Error);
              // this.setState({running: false}, () => {
              //   alert(JSON.stringify(response));
              // })
              this.database.updateExec("media", {uploaded: -1}, "id", fileDB.id, () => {
                //alert(JSON.stringify(response));
                setTimeout(() => this.getNextFile(), 250);
              });
            }
          }).catch((reason) => {
            captureException(reason);
            // alert(reason);
            if (reason.message === "Aborted") {
              // alert(`File ${filename} aborted. Skipping for now. Try later.`);
              // alert(JSON.stringify(fileDB));
              this.database.updateExec("media", {uploaded: -1}, "id", fileDB.id, () => {
                setTimeout(() => this.getNextFile(), 250);
              });
            } else {
              this.setState({running: false}, () => {
                alert(reason);
              });
            }
          });
        });

      } else {
        // Sentry.Native.sendEvent(`Media Sync Done`);
        this.setState({running: false, mediaLeft: 0});
      }

    });
  }

  uploader(arrayList) {

  }

  render() {
    if (this.state.mediaLeft === 0) {
      return null;
    } else {
      return (
        <Tile icon="upload" family="font-awesome" onPress={() => this.startUpload()} spin={this.state.running}>
          <Text center>
            Media Uploads
            {`${this.state.mediaLeft > 0 ? ` \n${this.state.running ? "working " : ""}(${this.state.mediaLeft} left)` : ''}`}
          </Text>
        </Tile>
      );
    }
  }

}