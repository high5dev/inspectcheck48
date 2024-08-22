import Database from "./db";
import {postData} from "../api/api";
import {v4} from "uuid";
import {ClientEvent} from "clientevent";
import {captureException} from "@sentry/react-native";

const tableVersions = {
  agencies: 1,
  asset_categories: 1,
  asset_types: 1,
  assets: 1,
  playgrounds: 1,
}


export default class SyncDatabase {
  constructor(props) {
    this.onSync = props.onSync;
    this.onStatus = props.onStatus;
    this.onComplete = props.onComplete;
    this.onError = props.onError;
    this.deviceId = "";
    this.dbVersion = 0;
    this.database = Database();
    this.total = 1;
    this.done = 0;
  }

  reset(callback) {
    const self = this;
    this.database.getConfig("deviceId", "", (deviceId) => {
      if (deviceId === "") {
        alert('Initial Sync has not been performed. Exiting');
      } else {
        this.deviceId = deviceId;
        this.onStatus("Please wait... Resetting Device's Server Time...");
        postData("mobile/reset", {
          username: global.configData.username,
          password: global.configData.password
        }, this.deviceId)
          .then((result) => {
            // console.log(result);
            self.onStatus("Done");
            setTimeout(() => this.onComplete && this.onComplete(), 1000);
            callback && callback();
          })
          .catch((err, msg) => {
            self.onStatus("Error");
            captureException(err);
            console.log(err, msg);
            setTimeout(() => this.onComplete && this.onComplete(), 1000);
            callback && callback(msg);
          });
      }
    });
  }

  sync() {
    this.total = 1;
    this.done = 0;
    this.database.getConfig("deviceId", "", (deviceId) => {
      if (deviceId === "") {
        this.deviceId = v4();
        this.database.setConfig("deviceId", this.deviceId, () => {
          setTimeout(() => this.sendData(), 100);
        });
      } else {
        setTimeout(() => this.sendData(), 100);
        this.deviceId = deviceId
      }
    });
    this.onStatus("Please wait... Initiating Sync...");
  }

  sendData() {
    this.onStatus("Synchronizing Data...");
    // ClientEvent.emit("MEDIA_UPLOAD");
    //Post Last sync Date with objects in DB since last sync date
    //returns Lastest objects in Database since date.
    this.database.getDBVersion((version) => {
      this.dbVersion = version;
      setTimeout(() => this.syncData(), 10);
    });
  }

  syncData() {
    let self = this;
    this.database.getSyncData((err, data) => {
      postData("mobile/data", {
        lastSync: 0,
        data: data || [],
        tableVersions: tableVersions,
        dbVersion: this.dbVersion,
        username: global.configData.username,
        password: global.configData.password
      }, this.deviceId)
        .then((result) => {
          // console.log(result);
          // self.onStatus("Processing Updates...");
          if (result.status === "update_needed") {
            setTimeout(() => {
              alert("Critical Application update needed. Sync has been disabled until you update your app.");
              this.onComplete && this.onComplete()
            }, 1000);
          } else {
            setTimeout(() => this.processResponse(result), 100);
          }
        })
        .catch((err, msg) => {
          console.log(err, msg);
          captureException(err);
          alert(err);
          setTimeout(() => this.onComplete && this.onComplete(), 1000);
        });
    });

  }

  processResponse(results) {
    if (results.status === "Success") {
      const data = results.data;
      this.total = Object.keys(data).map((table) => data[table].length).reduce((a, b) => a + b, 0);
      this.done = 0;
      this.processTable({...data}, () => {
        setTimeout(() => this.syncDone(), 100);

      });
    }
  }

  percentage() {
    return this.total === 0 ? 100 : (Math.floor(this.done / this.total * 100))
  }

  processTable(results, callback) {
    if (Object.keys(results).length > 0) {
      const tableName = Object.keys(results)[0];
      this.onStatus(`Processing ${tableName}...(${this.percentage()}`);
      const tableRows = results[tableName];
      this.processRow(tableName, tableRows, () => {
        delete results[tableName];
        this.processTable(results, callback);
      });
    } else {
      callback();
    }
  }

  processRow(tableName, rows, callback) {
    if (rows.length > 0) {
      const row = rows.shift();
      this.onStatus(`Processing ${tableName}...(${this.percentage()}%)`);
      this.database.replaceExec(tableName, row, (err, result) => {
        if (err) {
          console.log('table / row', tableName, row);
          captureException(err)
          console.log(err)
        }
        this.done++
        this.processRow(tableName, rows, callback);
      });
    } else {
      callback();
    }
  }

  syncDone() {
    this.onStatus("Done");
    this.database.removeSyncedData(() => {
      ClientEvent.emit("HEADER_REFRESH_ASSETS");
      ClientEvent.emit("HEADER_REFRESH_PLAYGROUNDS");
      ClientEvent.emit("HEADER_REFRESH_AGENCIES");
      ClientEvent.emit("HEADER_REFRESH_INSPECTIONS");
      ClientEvent.emit("DB_SYNC_DONE");
      setTimeout(() => this.onComplete && this.onComplete(), 1000);
    });

  }
}