import * as SQLite from 'expo-sqlite';
import migration from "./migration";
import {captureException} from "@sentry/react-native";

const appData = SQLite.openDatabase('appData.db');

// db.exec([{ sql: 'PRAGMA foreign_keys = ON;', args: [] }], false, () =>
//   console.log('Foreign keys turned on')
// );
export default function Database() {

  function exec(str, arg, callback) {
    appData.transaction(tx => {
      tx.executeSql(str, arg, (tranx, results) => callback(null, results), (tranx, error) => callback(error, null)
        // "create table if not exists items (id integer primary key not null, done int, value text);"
      );
    });
  }

  function query(sql, args, callback) {
    // console.log(sql, args);
    appData.transaction(tx => {
      tx.executeSql(sql, args, (tranx, results) => callback(null, results.rows['_array']), (tranx, error) => callback(error, null)
        // "create table if not exists items (id integer primary key not null, done int, value text);"
      );
    });
  }

  function queryAll(objectOfQuerys, callback) {
    const responseObject = {};
    const totalLength = Object.keys(objectOfQuerys).length;
    Object.keys(objectOfQuerys).forEach((dbObj, index) => {
      const obj = objectOfQuerys[dbObj];
      query(obj.sql, obj.args, (err, results) => {
        responseObject[dbObj] = results || [];
        if (Object.keys(responseObject).length === totalLength) {
          callback(responseObject);
        }
      });
    });
  }

  function init(callback) {
    //check if migrations table exist:
    query("SELECT name FROM sqlite_master WHERE type='table' AND name='migrations_schema_history';", [], (error, results) => {
      if (error) {
        captureException(error);
        console.log("Error reading sqlite DB", error);
      }
      if (results.length === 0) {
        exec("CREATE TABLE `migrations_schema_history` (`id` INTEGER PRIMARY KEY,`version` INTEGER NOT NULL DEFAULT 0,`description` TEXT NOT NULL DEFAULT '',`script` TEXT NOT NULL DEFAULT '',`hash` TEXT NOT NULL DEFAULT '',`installed_on` datetime NOT NULL,`success` tinyint(1) NOT NULL DEFAULT 0);", [], (error, results) => {
          if (error) {
            console.error("Error creating migrations table", error);
            captureException(error);
          } else {
            console.log("created migrations table... continuing");
            migration(exec, query, callback);
          }
        });
      } else {
        migration(exec, query, callback);
      }
    });

  }

  function objectAddToSql(table, dataObject, variables) {
    const mapColumns = [];
    const mapValues = [];
    const objKeys = Object.keys(dataObject);
    if (objKeys.length === 0) {
      return "";
    }
    objKeys.forEach((keyName, index) => {
      mapColumns.push("\"" + keyName + "\"");
      mapValues.push(addVariable(dataObject[keyName], variables));
    });
    return "INSERT INTO " + table + " (" + mapColumns.join(",") + ") VALUES (" + mapValues.join(",") + ")"
  }

  function objectReplaceToSql(table, dataObject, variables) {
    const mapColumns = [];
    const mapValues = [];
    const objKeys = Object.keys(dataObject);
    if (objKeys.length === 0) {
      return "";
    }
    objKeys.forEach((keyName, index) => {
      mapColumns.push("\"" + keyName + "\"");
      mapValues.push(addVariable(dataObject[keyName], variables));
    });
    return "REPLACE INTO " + table + " (" + mapColumns.join(",") + ") VALUES (" + mapValues.join(",") + ")"
  }

  function objectUpdateToSql(table, dataObject, variables, keyColumn, keyValue) {
    const mapColumns = [];
    const objKeys = Object.keys(dataObject);
    if (objKeys.length === 0) {
      return "";
    }
    objKeys.forEach((keyName, index) => {
      if (keyName !== keyColumn) {
        mapColumns.push(addNamedVariableEquals(keyName, dataObject[keyName], variables));
      }
    });
    return "UPDATE " + table + " SET " + mapColumns.join(",") + " WHERE " + addNamedVariableEquals(keyColumn, keyValue, variables);
  }

  function addVariable(value, variables) {
    variables.push(value);
    return "?"
  }

  function addNamedVariableEquals(name, value, variables) {
    variables.push(value);
    return "\"" + name + "\"=?"
  }

  function addNamedVariableCompare(name, comparison, value, variables) {
    variables.push(value);
    return "\"" + name + "\"" + comparison + "?"
  }

  function addSyncData(type, dataObject, table, pkCol, pkVal, callback) {
    exec("INSERT INTO sync_data (`type`, `data`, `table`, `pkVal`) VALUES (?,?,?,?)", [type, JSON.stringify(dataObject), table, (pkCol !== null ? [pkCol, pkVal].join("=") : null)], () => callback());
  }

  function addExec(table, dataObject, callback) {
    const vars = [];
    const sql = objectAddToSql(table, dataObject, vars);
    exec(sql, vars, (err, results) => callback(err, results));
  }

  function addSyncExec(table, dataObject, callback) {
    addExec(table, dataObject, (err, results) => {
      addSyncData("ADD", dataObject, table, null, null, () => {
        callback(err, results);
      });
    });
  }

  function replaceExec(table, dataObject, callback) {
    const vars = [];
    const sql = objectReplaceToSql(table, dataObject, vars);
    exec(sql, vars, (err, results) => callback(err, results));
  }

  function updateExec(table, dataObject, keyColumn, keyValue, callback) {
    const vars = [];
    const sql = objectUpdateToSql(table, dataObject, vars, keyColumn, keyValue);
    exec(sql, vars, (err, results) => callback(err, results));
  }


  function updateSyncExec(table, originalData, dataObject, keyColumn, keyValue, callback) {
    updateExec(table, dataObject, keyColumn, keyValue, (err, results) => {
      const newObj = objReturnDifference(originalData, dataObject);
      if (Object.keys(newObj).length === 0) {
        callback(err, results);
        return;
      }
      addSyncData("UPDATE", newObj, table, keyColumn, keyValue, () => {
        callback(err, results);
      });
    });
  }

  function updateSyncEntityExec(table, dataObject, keyColumn, keyValue, callback) {
    if (Object.keys(dataObject).length === 0) {
      callback(null, []);
      return;
    }
    updateExec(table, dataObject, keyColumn, keyValue, (err, results) => {
      addSyncData("UPDATE", dataObject, table, keyColumn, keyValue, () => {
        callback(err, results);
      });
    });
  }

  function getDBVersion(callback) {
    query("SELECT IFNULL(max(version),0) as version FROM migrations_schema_history LIMIT 1;", [], (err, data) => {
      if (err || data.length === 0) {
        callback(0);
      } else {
        callback(data[0]['version']);
      }
    });
  }

  function getConfig(key, defaultValue, callback) {
    query("SELECT value FROM configs WHERE key=?", [key], (err, data) => {
      if (err || data.length === 0) {
        callback(defaultValue);
      } else {
        callback(data[0]['value']);
      }
    });
  }

  function setConfig(key, value, callback) {
    exec("REPLACE INTO configs (`key`, `value`) VALUES (?,?);", [key, value], (err, results) => callback(err));
  }

  function objReturnDifference(oldObj, newObj) {
    const responseObj = {};
    Object.keys(newObj).forEach(objKey => {
      if (oldObj.hasOwnProperty(objKey)) {
        if (oldObj[objKey] !== newObj[objKey]) {
          responseObj[objKey] = newObj[objKey];
        }
      } else {
        responseObj[objKey] = newObj[objKey];
      }
    });
    return responseObj;
  }

  function getSyncData(callback) {
    query("SELECT * FROM sync_data WHERE processed=0", [], (err, results) => {
      callback(err, results);
    });
  }

  function removeSyncedData(callback) {
    query("DELETE FROM sync_data WHERE processed=1", [], (err, results) => {
      callback(err, results);
    });
  }

  return {
    init: init,
    query: query,
    exec: exec,
    addExec: addExec,
    addSyncExec: addSyncExec,
    updateExec: updateExec,
    updateSyncExec: updateSyncExec,
    updateSyncEntityExec: updateSyncEntityExec,
    replaceExec: replaceExec,
    objectAddToSql: objectAddToSql,
    objectUpdateToSql: objectUpdateToSql,
    objectReplaceToSql: objectReplaceToSql,
    getDBVersion: getDBVersion,
    getConfig: getConfig,
    setConfig: setConfig,
    objReturnDifference: objReturnDifference,
    getSyncData: getSyncData,
    removeSyncedData: removeSyncedData
  }
}