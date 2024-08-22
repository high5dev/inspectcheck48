import {ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, View} from 'react-native';
import SideSwipe from 'react-native-sideswipe';
import React from "react";
import InspectionCard from "./inspectionCard";
import Database from "../../../db/db";
import HFInspectionCard from "./HFInspectionCard";
import {ClientEvent} from "clientevent";
import {v1} from "uuid";
import MXList from "./MXList";
import {Block, Button, Text} from "galio-framework";
import {callbackEach, dbDate, objArraySortByKey} from "../../../util/shared";
import {Select} from "../../../components";
import BeforeConditions from "./BeforeConditions";
import AfterList from "./AfterList";
import {captureException} from "@sentry/react-native";

export default class HFInspection extends React.Component {
  state = {
    currentIndex: 0,
    cards: null,
    inspection_id: this.props.navigation.getParam('inspection_id', ""),
    playground_id: this.props.navigation.getParam('playground_id', ""),
    playground_name: this.props.navigation.getParam('playground_name', ""),
    agency_name: this.props.navigation.getParam('agency_name', ""),
    completed: this.props.navigation.getParam('completed', null),
    requireSave: false,
    mxQuickList: [],
    mxAssets: [],
    mxItems: [],
    condition: [],
    page: 0
  };
  originals = [];
  originalMxItems = [];
  originalCondition = [];

  UNSAFE_componentWillMount() {
    ClientEvent.on("HEADER_BACK_HFINSPECTION", "HFInspection", () => this.confirmSave());
    ClientEvent.on("HEADER_SAVE_HFINSPECTION", "HFInspection", () => this.saveData());
    ClientEvent.on("HEADER_HFITAB", "HFInspection", (page) => this.showPage(page));
    ClientEvent.on("HEADER_REFRESH_INSPECTION", "HFInspection", () => this.getInpectionData(() => {
      // this.showPage(0);
      ClientEvent.emit('HEADER_HFITAB', 2);
    }));

    // const inspection_id = this.props.navigation.getParam('inspection_id', "");
    // console.log(this.state.inspection_id);
    // console.log(this.state.playground_id);
    this.getInpectionData(() => {
      // setTimeout(() => ClientEvent.emit('HEADER_HFITAB', 1));
      setTimeout(() => ClientEvent.emit('HEADER_HFITAB', 0), 10);
    });
  }

  componentWillUnmount() {
    ClientEvent.emit("DYNAMIC_SHOW_SAVE", false);
    ClientEvent.off("HEADER_BACK_HFINSPECTION", "HFInspection");
    ClientEvent.off("HEADER_SAVE_HFINSPECTION", "HFInspection");
    ClientEvent.off("HEADER_HFITAB", "HFInspection");
    ClientEvent.off("HEADER_REFRESH_INSPECTION", "HFInspection");
    ClientEvent.off("CAMERA_SNAP", "HFInspection");
  }

  showPage(index) {
    if (this.state.requireSave) {
      this.saveData();
    }
    this.setState({page: index});
  }

  navigateCamera() {
    setTimeout(() => this.props.navigation.navigate('CameraViewInspections'), 200);
  }

  confirmSave() {
    if (this.state.requireSave) {

      const self = this;
      Alert.alert(
        'Discard Unsaved Changes?',
        'If you proceed this pages changes will be lost',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: () => {
              ClientEvent.emit("HEADER_REFRESH_INSPECTIONS");
              ClientEvent.emit("MEDIA_UPLOAD");

              self.props.navigation.goBack()
            }
          },
        ],
        {cancelable: false}
      );
    } else {
      ClientEvent.emit("HEADER_REFRESH_INSPECTIONS");
      this.props.navigation.goBack();
    }
  }

  saveData() {
    if (!!this.state.completed) return;

    if (this.state.page === 1) {
      //HFInspectionCard
      let currentIndex = this.state.currentIndex;
      const saveData = [...this.state.cards[currentIndex].findings];

      this.saveFinding(saveData, this.originals[currentIndex].findings, () => {
        this.doneSave(this.state.cards);
      });
    }

    if (this.state.page === 2) {
      //MXList
      const updatedList = [];
      this.saveMxItems([...this.state.mxItems], updatedList, this.originalMxItems, () => {
        // console.log("Final list", updatedList);
        this.setState({requireSave: false, mxItems: updatedList}, () => {
          ClientEvent.emit("DYNAMIC_SHOW_SAVE", false);
          this.originalMxItems = updatedList;
        });
      });
    }

    if (this.state.page === 0 || this.state.page === 3) {
      const updatedList = [];
      this.saveConditionItems([...this.state.condition], updatedList, this.originalCondition, () => {
        // console.log("Final list", updatedList);
        this.setState({requireSave: false}, () => {
          ClientEvent.emit("DYNAMIC_SHOW_SAVE", false);
          this.originalCondition = [...updatedList];
        });
      });
    }

  }

  doneSave(cards) {
    this.setState({requireSave: false, cards}, () => {
      ClientEvent.emit("DYNAMIC_SHOW_SAVE", false);
      this.originals = this.state.cards;
    });
  }

  saveFinding(findingData, originalData, callback) {
    let saveData = findingData.shift();
    if (!saveData) {
      callback();
    } else {
      const originalFinding = originalData.find(data => data.id === saveData.id);
      if (!originalFinding) {
        Database().addSyncExec("finding_asset", this.conditionData(saveData), (err, results) => {
          this.addInspMediaArray(saveData.mediaList ? saveData.mediaList.map(media => !!media.id ? media : {id: media}) : [], saveData.id, () => {
            setTimeout(() => {
              this.saveFinding(findingData, originalData, callback);
            }, 1);
          });
        });
      } else {
        // console.log(this.conditionData(originalFinding), this.conditionData(saveData));
        Database().updateSyncExec("finding_asset", this.conditionData(originalFinding), this.conditionData(saveData), "id", saveData.id, (err) => {
          if (err) {
            console.log(err);
          }
          this.editInspMediaArray(saveData.mediaList ? saveData.mediaList.map(media => !!media.id ? media : {id: media}) : [], saveData.id, () => {
            setTimeout(() => {
              this.saveFinding(findingData, originalData, callback);
            }, 1);
          });
        });
      }
    }
  }

  // Media savings
  addInspMediaArray(arrayList, finding_id, callback) {
    arrayList.forEach(photoId => {
      this.addMediaToDb(finding_id, photoId, "finding_asset");
    });
    callback();
  }

  editInspMediaArray(arrayList, finding_id, callback) {
    var tokens = new Array(arrayList.length).fill('?').join(',');
    Database().query("SELECT media_id, notes FROM main.finding_asset_media WHERE finding_id=? AND media_id IN (" + tokens + ")", [finding_id, ...(arrayList.map(media => media.id))], (err, results) => {
      arrayList.forEach(photoId => {
        if (results.map((row) => row.media_id).indexOf(photoId.id) === -1) {
          this.addMediaToDb(finding_id, photoId, "finding_asset");
        }
      });
      callback();
    });
  }

  saveMxItems(mxItems, updatedList, originalItems, callback) {
    if (mxItems.length > 0) {
      this.saveEachMxItem(mxItems, updatedList, originalItems, () => {
        callback();
      });
    } else {
      callback();
    }
  }

  saveEachMxItem(mxItems, updatedList, originalItems, callback) {
    const mxItem = mxItems.shift();
    if (!mxItem) {
      callback();
    } else {
      // Do with each item calling saveEachMxItem
      const original = originalItems.find((item) => item.id === mxItem.id);
      if (!!original) {
        //existing
        Database().updateSyncExec("inspection_mx_items", this.conditionMxData(original), this.conditionMxData(mxItem), "id", original.id, (err) => {
          if (!!err) {
            console.log(err);
          }
          this.editMxMediaArray(mxItem.mediaList.map(media => !!media.id ? media : {id: media}) || [], mxItem.id, (savedMedia) => {
            updatedList.push({
              ...mxItem,
              mediaList: savedMedia,
              media: savedMedia.join(",")
            });
            setTimeout(() => this.saveEachMxItem(mxItems, updatedList, originalItems, callback));
          });
        });
      } else {
        //new
        Database().addSyncExec("inspection_mx_items", this.conditionMxData(mxItem), (err) => {
          if (!!err) {
            console.log(err);
          }
          this.addMxMediaArray(mxItem.mediaList.map(media => !!media.id ? media : {id: media}) || [], mxItem.id, () => {
            updatedList.push(mxItem);
            setTimeout(() => this.saveEachMxItem(mxItems, updatedList, originalItems, callback));
          });
        });
      }
    }
  }

  addMxMediaArray(arrayList, mx_id, callback) {
    if (arrayList && arrayList.length > 0) {
      this.addEachMxMedia([...arrayList], mx_id, () => {
        callback();
      })
    } else {
      callback();
    }
  }

  addEachMxMedia(arrayList, mx_id, callback) {
    const photoId = arrayList.shift();
    if (!photoId) {
      callback();
    } else {
      this.addMediaToDb(mx_id, photoId, "mx_item", () => {
        setTimeout(() => this.addEachMxMedia(arrayList, mx_id, callback));
      });
    }
  }

  editMxMediaArray(arrayList, mx_id, callback) {
    var tokens = new Array(arrayList.length).fill('?').join(',');
    if (arrayList.length > 0) {
      Database().query("SELECT media_id, notes FROM mx_item_media WHERE mx_id=? AND media_id IN (" + tokens + ")", [mx_id, ...(arrayList.map(media => media.id))], (err, results) => {
        if (err) {
          console.log(err);
        }
        // console.log("arrayList", arrayList);
        this.editEachMxMedia([...arrayList], results.map((row) => row.media_id) || [], mx_id, () => {
          callback([...arrayList].map((item) => {
            if (item.action === "remove") {
              return null;
            }
            if (item.action === "replace") {
              return item.replacement?.id || item.id
            }
            return item.id;
          }).filter((item) => item !== null));
        });
      });
    } else {
      callback([]);
    }
  }

  editEachMxMedia(tokens, dbResults, mx_id, callback) {
    const result = tokens.shift();
    if (!result) {
      callback();
    } else {
      if (dbResults.indexOf(result.id) === -1) {
        this.addMediaToDb(mx_id, result, "mx_item", () => {
          this.editEachMxMedia(tokens, dbResults, mx_id, callback);
        });
      } else {
        this.editMediaOnDb(mx_id, result, "mx_item", () => {
          this.editEachMxMedia(tokens, dbResults, mx_id, callback);
        });
      }
    }
  }

  addMediaToDb(finding_id, media, type, callback) {
    if (type === "finding_asset") {
      Database().addSyncExec("finding_asset_media", {
        id: v1(),
        finding_id: finding_id,
        media_id: media.id,
        takenAt: media.takenAt
      }, (err) => {
        if (err) {
          console.log(err);
        }
        callback && callback();
      });
      return;
    }
    if (type === "mx_item") {
      Database().addSyncExec("mx_item_media", {
        id: v1(),
        mx_id: finding_id,
        media_id: media.id,
        takenAt: media.takenAt
      }, (err) => {
        if (err) {
          console.log("addMediaToDb-mx_item error", err);
        }
        callback && callback();
      });
      return;
    }
    callback && callback();
  }

  editMediaOnDb(finding_id, media, type, callback) {
    // console.log("editMediaOnDb", finding_id, media, type);
    if (!media.action) return callback && callback();
    // if (type === "finding_asset") {
    //   Database().updateSyncExec("finding_asset_media", {
    //     id: v1(),
    //     finding_id: finding_id,
    //     media_id: media.id,
    //     takenAt: media.takenAt
    //   }, (err) => {
    //     if (err) {
    //       console.log(err);
    //     }
    //     callback && callback();
    //   });
    //   return;
    // }

    /*
    editMediaOnDb ddca76b0-93e5-11ec-990f-ed0a4eed4bf7 Object {
  "action": "remove",
  "id": "e83bcdb0-93e5-11ec-990f-ed0a4eed4bf7",
} mx_item

editMediaOnDb ddca76b0-93e5-11ec-990f-ed0a4eed4bf7 Object {
  "action": "replace",
  "id": "d9743bf0-93e5-11ec-990f-ed0a4eed4bf7",
  "replacement": Object {
    "exif": undefined,
    "height": 2002,
    "id": "2e499d40-9563-11ec-aa2d-01d9adcd540f",
    "uri": "media/2e499d40-9563-11ec-aa2d-01d9adcd540f.jpg",
    "width": 3000,
  },
} mx_item

WHERE IS TAKENAT COME FROM ?
GET ID from finding_id and media.id and do update to remove image
can we edit media_id?

     */

    if (type === "mx_item") {
      Database().query("SELECT * FROM mx_item_media WHERE mx_id=? AND media_id=?;", [finding_id, media.id], (err, results) => {
        if (!!err || results.length === 0) {
          captureException(err || new Error("mx_item_media Edit result empty"));
          return callback && callback();
        }
        // console.log("results", results);
        switch (media.action) {
          case "remove":
            Database().updateSyncExec("mx_item_media",
              {deleted: 0},
              {deleted: 1},
              "id",
              results[0].id,
              (err) => {
                if (err) {
                  console.log("editMediaOnDb-mx_item error", err);
                }
                callback && callback();
              });
            break;
          default:
            callback && callback();
        }
      });
      return;
    }
    callback && callback();
  }

  saveConditionItems(items, updatedList, originalItems, callback) {
    if (items.length > 0) {
      this.saveEachConditionItem(items, updatedList, originalItems, () => {
        callback();
      });
    } else {
      callback();
    }
  }

  saveEachConditionItem(conditionItems, updatedList, originalItems, callback) {
    const conditionItem = conditionItems.shift();
    if (!conditionItem) {
      callback();
    } else {
      // Do with each item calling saveEachConditionItem
      const original = originalItems.find((item) => item.id === conditionItem.id);
      if (!!original) {
        //existing
        Database().updateSyncExec("inspection_conditions", this.conditionConditionData(original), this.conditionConditionData(conditionItem), "id", conditionItem.id, (err) => {
          if (!!err) {
            console.log(err);
          }
          updatedList.push(conditionItem);
          setTimeout(() => this.saveEachConditionItem(conditionItems, updatedList, originalItems, callback));
        });
      } else {
        //new
        Database().addSyncExec("inspection_conditions", this.conditionConditionData(conditionItem, true), (err) => {
          if (!!err) {
            console.log(err);
          }
          updatedList.push(conditionItem);
          setTimeout(() => this.saveEachConditionItem(conditionItems, updatedList, originalItems, callback));
        });
      }
    }
  }

  // End of Media savings

  conditionData(raw) {
    let response = {
      inspection_id: raw.inspection_id || this.state.inspection_id,
      asset_id: raw.asset_id || raw.assetId,
    };
    if (raw.hasOwnProperty('compliant') && raw.compliant) {
      response.compliant = raw.compliant;
    }
    if (raw.hasOwnProperty('risk_level') && raw.risk_level) {
      response.risk_level = raw.risk_level;
    }
    if (raw.hasOwnProperty('notes')) {
      response.notes = raw.notes;
    }
    if (raw.hasOwnProperty('id')) {
      response.id = raw.id;
    }
    if (raw.hasOwnProperty('discovered_date') && !!raw.discovered_date) {
      response.discovered_date = dbDate(raw.discovered_date);
    }
    console.log(response);
    return response;
  }

  conditionMxData(raw) {
    let response = {
      inspection_id: raw.inspection_id || this.state.inspection_id,
    };
    if (raw.hasOwnProperty('asset_id') && raw.asset_id) {
      response.asset_id = raw.asset_id;
    }
    if (raw.hasOwnProperty('mx_id') && raw.mx_id) {
      response.mx_id = raw.mx_id;
    }
    if (raw.hasOwnProperty('notes')) {
      response.notes = raw.notes;
    }
    if (raw.hasOwnProperty('title')) {
      response.title = raw.title;
    }
    if (raw.hasOwnProperty('id')) {
      response.id = raw.id;
    }
    if (raw.hasOwnProperty('deleted')) {
      response.deleted = raw.deleted;
    }
    return response;
  }

  conditionConditionData(raw, withId) {
    let response = {
      inspection_id: raw.inspection_id || this.state.inspection_id,
    };
    if (raw.hasOwnProperty('pre')) {
      response.pre = raw.pre;
    }
    if (raw.hasOwnProperty('preAt')) {
      response.preAt = raw.preAt;
    }
    if (raw.hasOwnProperty('post')) {
      response.post = raw.post;
    }
    if (raw.hasOwnProperty('postAt')) {
      response.postAt = raw.postAt;
    }
    if (raw.hasOwnProperty('id') && !!withId) {
      response.id = raw.id;
    }
    if (raw.hasOwnProperty('deleted')) {
      response.deleted = raw.deleted;
    }
    // console.log("condition", response);
    return response;
  }

  updateValue(id, value, index) {
    this.setState({
      cards: this.state.cards.map((card, i) => {
        if (i === index) {
          return {...card, [id]: value};
        } else {
          return card;
        }
      }),
      requireSave: true
    }, () => {
      ClientEvent.emit("DYNAMIC_SHOW_SAVE", true);
    });
  }

  saveMxItem(method, data) {
    if (!data.id) {
      //Add
      this.setState({
        mxItems: this.state.mxItems.concat({
          ...data,
          id: v1(),
          inspection_id: this.state.inspection_id
        }).sort(this.mxSort),
        requireSave: true
      }, () => {
        ClientEvent.emit("DYNAMIC_SHOW_SAVE", true);
      });
    } else {
      //Edit
      this.setState({
        mxItems: this.state.mxItems.map(entry => {
          if (entry.id === data.id) {
            return {...entry, ...data};
          } else {
            return entry;
          }
        }).sort(this.mxSort),
        requireSave: true
      }, () => {
        ClientEvent.emit("DYNAMIC_SHOW_SAVE", true);
      });
    }
  }

  getInpectionData(callback) {
    Database().query("SELECT a.id as assetId, a.playground_id, a.name, a.thumbnail_url, a.part_number, a.notes as asset_notes, fa.id,\n" +
      "    fa.inspection_id, fa.asset_id, fa.compliant, fa.risk_level, fa.notes,\n" +
      "    fa.discovered_date, fa.resolve_by_date, fa.resolved_date,\n" +
      "    GROUP_CONCAT(DISTINCT fam.media_id) as media FROM assets a\n" +
      "    LEFT JOIN finding_asset fa ON fa.asset_id=a.id AND fa.inspection_id=?\n" +
      "    LEFT JOIN finding_asset_media fam ON fam.finding_id=fa.id AND fam.deleted=false\n" +
      "    WHERE playground_id=? AND a.deleted=false\n" +
      "    GROUP BY a.id,fa.id ORDER BY a.name ASC;", [this.state.inspection_id, this.state.playground_id], (error, results) => {
      //console.log(results[0]);
      // console.log(this.makeInspectionsWithSubFindings(results));
      results = this.makeInspectionsWithSubFindings(objArraySortByKey(results, "name"));
      this.originals = results;
      this.setState({
        cards: results,
        mxAssets: results.map(result => {
          return {
            display: result['name'],
            value: result['asset_id']
          }
        })
      }, () => {
        this.getMxList(this.state.inspection_id, () => {
          this.getMxQuickList(() => {
            this.getConditionData(this.state.inspection_id, callback);
          });
        });
      });
    });
  }

  makeInspectionsWithSubFindings(results) {
    const newCards = [];
    results && results.forEach((result) => {
      const assetIndex = newCards.findIndex((asset) => asset.assetId === result.assetId);
      if (assetIndex > -1) {
        if (!!result.id) {
          newCards[assetIndex].findings.push({
            id: result.id,
            inspection_id: result.inspection_id,
            asset_id: result.asset_id,
            compliant: result.compliant,
            risk_level: result.risk_level,
            notes: result.notes,
            discovered_date: result.discovered_date,
            resolve_by_date: result.resolve_by_date,
            resolved_date: result.resolved_date,
            media: result.media,
            mediaList: result.media && result.media.split(",") || []
          });
        }
      } else {
        const baseObject = {
          assetId: result.assetId,
          playground_id: result.playground_id,
          name: result.name,
          thumbnail_url: result.thumbnail_url,
          part_number: result.part_number,
          asset_notes: result.asset_notes,
          findings: []
        };
        if (!!result.id) {
          baseObject.findings.push({
            id: result.id,
            inspection_id: result.inspection_id,
            asset_id: result.asset_id,
            compliant: result.compliant,
            risk_level: result.risk_level,
            notes: result.notes,
            discovered_date: result.discovered_date,
            resolve_by_date: result.resolve_by_date,
            resolved_date: result.resolved_date,
            media: result.media,
            mediaList: result.media && result.media.split(",") || []
          });
        }
        newCards.push(baseObject);
      }
    });
    return newCards;
  }

  getMxQuickList(callback) {
    Database().query("SELECT id as `value`, display, template FROM main.mx_quick_list ORDER BY display ASC", [], (error, results) => {
      this.setState({mxQuickList: results});
      callback && callback();
    });
  }

  getMxList(inspection_id, callback) {
    Database().query("SELECT inspection_mx_items.id, inspection_id, asset_id, inspection_mx_items.mx_id," +
      " inspection_mx_items.notes, title,GROUP_CONCAT(DISTINCT mim.media_id) as media\n" +
      " FROM inspection_mx_items LEFT JOIN mx_item_media mim ON mim.mx_id=inspection_mx_items.id AND mim.deleted=false" +
      " WHERE inspection_id=? AND inspection_mx_items.deleted=false GROUP BY mim.mx_id;", [inspection_id], (error, results) => { //ORDER BY title, inspection_mx_items.notes ASC;
      const newResults = results && results.sort(this.mxSort).map(row => {
        return {...row, mediaList: row.media && row.media.split(",") || []}
      }) || [];
      this.setState({mxItems: newResults}, () => {
        this.originalMxItems = newResults;
        callback();
      });
    });
  }

  getConditionData(inspection_id, callback) {
    Database().query("SELECT id, inspection_id, pre, preAt, post, postAt " +
      "FROM inspection_conditions WHERE inspection_id=? AND deleted=false ORDER BY preAt ASC;", [inspection_id], (error, results) => {
      this.setState({condition: results}, () => {
        this.originalCondition = results;
        callback && callback();
      });
    });
  }

  mxSort(a, b) {
    const nameA = `${a.title || ""}${a.notes || ""}`.toLowerCase();
    const nameB = `${b.title || ""}${b.notes || ""}`.toLowerCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  }

  markRemainingCompliant() {
    const newCards = this.state.cards.filter((card) => card.findings.length === 0).map((card) => {
      card.findings.push({
        asset_id: card.assetId,
        inspection_id: this.state.inspection_id,
        compliant: 1,
        discovered_date: new Date(),
        id: v1(),
        media: null,
        mediaList: [],
        notes: null,
        resolve_by_date: null,
        resolved_date: null,
        risk_level: "0"
      });

      return card;
    });

    callbackEach(newCards, (newCard, success) => {
      // console.log(newCard);
      this.saveFinding([...newCard.findings], [], () => {
        success(newCard);
      });
      // success(newCard);
    }, (savedCards) => {
      let newCardsList = this.state.cards.map((card) => {
        if (card.findings.length === 0) {
          const found = savedCards.find((findingC) => findingC.assetId === card.assetId);
          if (!!found) {
            return found;
          }
        }
        return card;
      });
      // console.log(newCardsList);
      this.setState({cards: newCardsList}, () => {
        this.doneSave(newCardsList);
      });
    });
  }

  markComplete() {
    const self = this;
    Alert.alert(
      'Complete Inspection?',
      'Inspection will be converted to read-only. Remember to do a database sync to update server.',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            Database().updateSyncEntityExec("inspections", {
              completed: dbDate(new Date())
            }, "id", self.state.inspection_id, () => {
              ClientEvent.emit("HEADER_REFRESH_INSPECTIONS");
              self.props.navigation.pop();
            });
          }
        },
      ],
      {cancelable: false}
    );
  }

  indexChange(index) {
    // console.log(index);
    if (index !== this.state.currentIndex) {

      // console.log(`Changing from ${this.state.currentIndex} to ${index}`);
      if (this.state.requireSave) {
        this.saveData();
      }
      this.setState(() => ({currentIndex: index}));
    }
  }

  swipe(targetIndex) {
    this.swiper.setState({currentIndex: parseInt(targetIndex)}, () => {
      this.swiper.list.scrollToIndex({
        index: parseInt(targetIndex),
        animated: true,
        viewOffset: 0,
      });
      this.indexChange(targetIndex);
    });
    // this.swiper.current.scrollBy(1);
  }

  /*
  as alternate, switch to https://github.com/leecade/react-native-swiper
  */

  render = () => {
    // center items on screen
    const {width} = Dimensions.get('window');
    const contentOffset = (InspectionCard.WIDTH);
    if (!this.state.cards) {
      return <View style={[styles.container, styles.horizontal]}>
        <ActivityIndicator size="large" color="#0000ff"/>
      </View>;
    }
    if (this.state.page === 0) { //Arrival
      return <BeforeConditions data={this.state.condition}
                               canedit={!this.state.completed}
                               navigateCamera={() => this.navigateCamera()}
                               inspectionId={this.state.inspection_id}
                               onUpdate={(media) => {
                                 this.setState({condition: media, requireSave: true}, () => {
                                   ClientEvent.emit("DYNAMIC_SHOW_SAVE", true);
                                 });
                               }}
                               display={"Take pictures to depict the state of the playground upon arrival"}
      />
    }

    if (this.state.page === 1) { // Asset
      const assetList = this.state.cards.map((card, index) => {
        return {
          display: card.name,
          value: card.assetId,
        }
      }) || [];
      // console.log(assetList);
      return (
        <Block width={width}>
          <Block flex center>
            <Select
              default={this.state.cards[this.state.currentIndex].assetId}
              disabled={false}
              data={assetList}
              placeHolder={"Select..."}
              onSelect={(index, value) => {
                this.swipe(index)
              }}
              dropDownSize={18}
              textSize={16}
              style={this.props.style || {
                paddingTop: 5,
                marginTop: 10,
                width: "100%",
                height: 35
              }}
            />
          </Block>
          <SideSwipe
            index={this.state.currentIndex}
            itemWidth={width}
            style={{width, marginTop: 30, paddingTop: 5}}
            data={this.state.cards}
            contentOffset={0}
            onIndexChange={(index) => this.indexChange(index)}
            useVelocityForIndex={false}
            ref={component => this.swiper = component}
            renderItem={({itemIndex, currentIndex, item, animatedValue}) => {
              // console.log(item);
              return (
                <HFInspectionCard
                  {...item}
                  completed={this.state.completed}
                  totalItems={this.state.cards.length}
                  index={itemIndex}
                  currentIndex={currentIndex}
                  animatedValue={animatedValue}
                  onCamera={() => this.navigateCamera()}
                  onUpdate={(id, value) => this.updateValue(id, value, currentIndex)}
                />
              )
            }}
          />
        </Block>
      );
    }

    if (this.state.page === 2) {
      return (
        <MXList
          mxQuickList={this.state.mxQuickList}
          mxAssets={this.state.mxAssets}
          mxItems={this.state.mxItems}
          onSave={(method, data) => this.saveMxItem(method, data)}
          completed={this.state.completed}
          navigateCamera={() => this.navigateCamera()}
        />
      );
    }

    if (this.state.page === 3) { //Arrival
      return <AfterList data={this.state.condition}
                        canedit={!this.state.completed}
                        navigateCamera={() => this.navigateCamera()}
                        onUpdate={(media) => {
                          this.setState({condition: media, requireSave: true}, () => {
                            ClientEvent.emit("DYNAMIC_SHOW_SAVE", true);
                          });
                        }}
                        display={"Show the side-by-side state upon inspection completion"}
      />
    }

    if (this.state.page === 4) {
      // console.log(this.originals);
      const allFindings = [];
      const doneCards = this.originals.filter(card => {
          allFindings.push(...card.findings);
          return card.findings && (card.findings.length > 0);
        }
      );

      const countCompliant = allFindings.filter(finding => finding.compliant === 1).length;
      const countNonCompliant = allFindings.filter(finding => finding.compliant === 2).length;
      const countNonCompliant1 = allFindings.filter(finding => finding.compliant === 2 && finding.risk_level === 1).length;
      const countNonCompliant2 = allFindings.filter(finding => finding.compliant === 2 && finding.risk_level === 2).length;
      const countNonCompliant3 = allFindings.filter(finding => finding.compliant === 2 && finding.risk_level === 3).length;
      const countNA = allFindings.filter(finding => finding.compliant === 3).length;
      const donePostImages = this.state.condition.filter(cond => !cond.deleted && !!cond.pre && !!cond.post);

      const allDone = doneCards.length === this.originals.length && donePostImages.length === this.state.condition.filter(cond => !cond.deleted).length;

      const percentComplete = function (completed, total) {
        if (total === 0) return 0;
        return Math.floor((completed / total) * 100);
      }
      return (
        <Block flex center style={{width: width, marginTop: 20}}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.settings}
          >
            <Block row middle style={{marginBottom: 10}}>
              <Block>
                <Text>Summary Report</Text>
              </Block>
            </Block>
            {this.reportLine("Playground", this.state.playground_name)}
            {this.reportLine("Agency", this.state.agency_name, 30)}
            {this.reportLine("Assets Inspected", `${doneCards.length} of ${this.state.cards.length} (${percentComplete(doneCards.length, this.state.cards.length)}%)`)}
            {countCompliant > 0 && this.reportLine("Compliant", `${countCompliant}`)}
            {countNonCompliant > 0 && this.reportLine("Non-Compliant", `${countNonCompliant}`)}
            {countNonCompliant > 0 && this.report3ColLine(width, "High Risk", countNonCompliant1, "Med Risk", countNonCompliant2, "Low Risk", countNonCompliant3)}
            {countNA > 0 && this.reportLine("N/A", `${countNA}`, 15)}
            {this.reportLine("Maintenance Items", `${this.state.mxItems.length}`)}
            {this.reportLine("Arrival/Departure Pictures", `${donePostImages.length} of ${this.state.condition.filter(cond => !cond.deleted).length} (${percentComplete(donePostImages.length, this.state.condition.filter(cond => !cond.deleted).length)}%)`)}
            {!!this.state.completed && this.reportLine("Completed", this.state.completed)}
            {!this.state.completed && doneCards.length !== this.originals.length && (
              <Block row middle style={{marginBottom: 5, marginTop: 15}}>
                <Button onPress={() => this.markRemainingCompliant()}
                        disabled={allDone}
                        style={[styles.riskButtonSelected, (doneCards.length !== this.originals.length ? styles.green : styles.gray)]}>
                  Mark Remaining Assets Compliant
                </Button>
              </Block>
            )}
            {!this.state.completed && (
              <Block row middle style={{marginBottom: 5, marginTop: 15}}>
                <Button onPress={() => this.markComplete()}
                        disabled={!allDone}
                        style={[styles.riskButtonSelected, (allDone ? styles.green : styles.gray)]}>
                  Inspection Complete
                </Button>
              </Block>
            )}
            {!this.state.completed && (
              <Block row middle style={{marginTop: 30}}>
                <Block>
                  <Text>Other Options</Text>
                </Block>
              </Block>
            )}
            {!this.state.completed && (
              <Block row middle style={{marginBottom: 15, marginTop: 15}}>
                <Button
                  onPress={() => this.props.navigation.navigate('HFInspectionAddAsset', {
                    playground_id: this.state.playground_id,
                    inspection_id: this.state.inspection_id
                  })}
                  style={[styles.riskButtonSelected, styles.darkYellow]}>
                  + Add Asset
                </Button>
              </Block>
            )}
          </ScrollView>
        </Block>
      );
    }

    return null;
  };

  reportLine(name, value, bottom) {
    return (
      <Block row left style={{marginBottom: bottom || 3, marginLeft: 5}}>
        <Block>
          <Text>{name}:</Text>
        </Block>
        <Block style={{marginLeft: 10}}>
          <Text>{value}</Text>
        </Block>
      </Block>
    )
  }

  report3ColLine(width, name1, value1, name2, value2, name3, value3) {
    return (
      <Block row left style={{marginBottom: 3, marginLeft: 5}}>

        {((typeof value1 === "number" && value1 > 0) || (typeof value1 === "string" && value1.length > 0)) && (
          <Block style={{width: width / 3}}>
            <Block>
              <Text center>{name1}:</Text>
            </Block>
            <Block style={{marginLeft: 10}}>
              <Text center>{value1}</Text>
            </Block>
          </Block>
        )}
        {((typeof value2 === "number" && value2 > 0) || (typeof value2 === "string" && value2.length > 0)) && (
          <Block style={{width: width / 3}}>
            <Block>
              <Text center>{name2}:</Text>
            </Block>
            <Block style={{marginLeft: 10}}>
              <Text center>{value2}</Text>
            </Block>
          </Block>
        )}
        {((typeof value3 === "number" && value3 > 0) || (typeof value3 === "string" && value3.length > 0)) && (
          <Block style={{width: width / 3}}>
            <Block>
              <Text center>{name3}:</Text>
            </Block>
            <Block style={{marginLeft: 10}}>
              <Text center>{value3}</Text>
            </Block>
          </Block>
        )}
      </Block>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  green: {
    backgroundColor: "#00aa0a",
  },
  gray: {
    backgroundColor: "#9baaa8",
  },
  red: {
    backgroundColor: "#aa0000",
  },
  darkYellow: {
    backgroundColor: "#aa8606",
  },
});