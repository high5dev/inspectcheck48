module.exports = {
  zLen: function zLen(str, len) {
    while (str.length < len) {
      str = "0" + str;
    }
    return str;
  },
  addVariable: function (value, variables) {
    variables.push(value);
    return "?"
  },
  addNamedVariableEquals: function (name, value, variables) {
    variables.push(value);
    return "" + name + "=?"
  },
  addNamedVariableCompare: function (name, comparison, value, variables) {
    variables.push(value);
    return "" + name + "" + comparison + "?"
  },
  addMonths: function (date, months) {
    date.setMonth(date.getMonth() + months);
    return date;
  },
  addHours: function (date, hours) {
    date.setHours(date.getHours() + hours);
    return date;
  },
  objectAddToSql: function (table, dataObject, variables) {
    const mapColumns = [];
    const mapValues = [];
    const objKeys = Object.keys(dataObject);
    if (objKeys.length === 0) {
      return "";
    }
    objKeys.forEach((keyName, index) => {
      mapColumns.push("" + keyName + "");
      mapValues.push(module.exports.addVariable(dataObject[keyName], variables));
    });
    return "INSERT INTO " + table + " (" + mapColumns.join(",") + ") VALUES (" + mapValues.join(",") + ")"
  },
  objectUpdateToSql: function (table, dataObject, variables, keyColumn, keyValue) {
    const mapColumns = [];
    const objKeys = Object.keys(dataObject);
    if (objKeys.length === 0) {
      return "";
    }
    objKeys.forEach((keyName, index) => {
      if (keyName !== keyColumn) {
        mapColumns.push(module.exports.addNamedVariableEquals(keyName, dataObject[keyName], variables));
      }
    });
    return "UPDATE " + table + " SET " + mapColumns.join(",") + " WHERE " + module.exports.addNamedVariableEquals(keyColumn, keyValue, variables);
  },
  containsKeys(obj, keys) {
    const actualKeys = Object.keys(obj);
    const filteredKeys = [...actualKeys].filter(thisKey => keys.indexOf(thisKey) > -1);
    return filteredKeys.length === keys.length;
  },
  dbDate(dated) {
    const dated1 = new Date(dated);
    const datePart = [
      dated1.getFullYear(),
      module.exports.zLen(String(dated1.getMonth() + 1), 2),
      module.exports.zLen(String(dated1.getDate()), 2),
    ].join("-");
    const timePart = [
      module.exports.zLen(String(dated1.getHours()), 2),
      module.exports.zLen(String(dated1.getMinutes()), 2),
      module.exports.zLen(String(dated1.getSeconds()), 2),
    ].join(":");
    return [datePart, timePart].join(" ");
  },
  dbDateOnly(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  },
  getNowEpoch() {
    const nowDate = new Date();
    return Math.floor(nowDate.getTime() / 1000);
  },
  zeroPaddingReplacer(numStr) {
    return `${numStr.charAt(0)}${module.exports.zLen(numStr.substr(1), 12)}`;
  },
  stringNumberCompare(aValue, bValue) {
    let a = aValue && aValue.toUpperCase() || "";
    let b = bValue && bValue.toUpperCase() || "";

    a = a.replace(/[\s\-]\d+/g, (str) => {
      return module.exports.zeroPaddingReplacer(str);
    });
    b = b.replace(/[\s\-]\d+/g, (str) => {
      return module.exports.zeroPaddingReplacer(str);
    });
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  },
  objArraySortByKey(objArray, sortKey) {
    if (!sortKey) return objArray;
    if (!objArray[0]) return objArray;
    if (!objArray[0][sortKey]) return objArray;
    const newArr = [...objArray];
    newArr.sort((a, b) => module.exports.stringNumberCompare(a[sortKey], b[sortKey]));
    return newArr;
  },
  callbackEach(files, eachCallback, callback) {
    const arrFiles = [...files];
    const outFiles = [];

    function _calcEach(arr, out, cb) {
      const file = arr.shift();
      if (!file) {
        return cb();
      }
      eachCallback(file, function (newFile) {
        if (newFile) {
          out.push(newFile);
        }
        setTimeout(() => _calcEach(arr, out, cb), 0);
      });
    }

    setTimeout(() => _calcEach(arrFiles, outFiles, function () {
      callback(outFiles);
    }), 0);
  },
  wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  composeAsync: (...funcs) => x => funcs.reduce(applyAsync, Promise.resolve(x))
};
const applyAsync = (acc, val) => acc.then(val);