import React, {Fragment} from "react";
import {Dimensions, StyleSheet, TouchableOpacity} from "react-native";
import {Block, Text, theme} from "galio-framework";
import {Button, Select} from "./index";
import Database from "../db/db";

const {height, width} = Dimensions.get('screen');

const thumbMeasure = (width - 48 - 32) / 2 - 5;


export default class RefLookup extends React.Component {
  state = {
    quickPickShow: false,
    quickPickCategory: 0,
    quickPickCategories: [],
    quickPickItem: 0,
    quickPickItems: [],
    quickPickItemsRaw: [],
    showItems: true,
    previewText: null,
  }

  openRefQuickPick() {
    this.refreshList(() => {
      this.setState({quickPickShow: true});
    })
  }

  refreshList(cb) {
    Database().query("SELECT * FROM quick_list_categories WHERE display <> '' AND EXISTS(SELECT 1 FROM quick_list_items WHERE quick_list_categories.id=quick_list_items.category_id) ORDER BY display ASC", [], (error, results) => {
      if (error) {
        console.log(error);
      } else {
        let data = [{display: "None", value: 0}, ...this.extractDropDownDataCategory(results)];
        this.setState({
          quickPickCategory: 0,
          quickPickCategories: data,
          quickPickItem: 0,
          quickPickItems: [],
          quickPickItemsRaw: [],
          previewText: null
        }, cb);
      }
    })
  }

  onChangeCategory(id, value) {
    this.resetItems(() => {
      if (id === 0) {
        this.setState({quickPickItems: [], quickPickItemsRaw: [], quickPickCategory: 0});
        return;
      }
      Database().query("SELECT * FROM quick_list_items WHERE category_id=? AND title <> '' ORDER BY title ASC", [value], (error, results) => {
        if (error) {
          console.log(error);
        } else {
          let data = [{display: "None", value: 0}, ...this.extractDropDownDataItem(results)];
          this.setState({quickPickItemsRaw: results, quickPickItems: data, quickPickCategory: value, quickPickItem: 0});
        }
      })
    });
  }

  resetCategory(cb) {
    if (this.state.quickPickCategory !== 0) {
      this.setState({quickPickCategory: 0, quickPickItem: 0, showItems: false, previewText: null}, () => {
        this.setState({showItems: true}, cb);
      });
    } else {
      cb && cb();
    }
  }

  resetItems(cb) {
    if (this.state.quickPickItem !== 0) {
      this.setState({quickPickItem: 0, showItems: false, previewText: null}, () => {
        this.setState({showItems: true}, cb);
      });
    } else {
      cb && cb();
    }
  }

  fetchItem(item_id) {
    if (!this.state.quickPickItemsRaw || this.state.quickPickItemsRaw.length === 0) return undefined;
    return this.state.quickPickItemsRaw.find((item) => String(item.id) === String(item_id));
  }

  extractDropDownDataCategory(data) {
    return (data || []).map((item) => ({display: item.display, value: item.id}));
  }

  extractDropDownDataItem(data) {
    return (data || []).map((item) => ({display: item.title, value: item.id}));
  }

  render() {
    return <Fragment>
      {!this.state.quickPickShow ?
        <TouchableOpacity onPress={() => this.openRefQuickPick()}>
          <Text>Ref Lookup</Text>
        </TouchableOpacity>
        :
        <Block style={styles.group}>
          <Select
            id={"quick_pick_category"}
            default={this.state.quickPickCategory}
            disabled={false}
            data={this.state.quickPickCategories}
            placeHolder={"None"}
            onSelect={(index, value) => {
              this.onChangeCategory(index, value)
            }}
            style={{
              padding: 5,
              width: "100%",
            }}
          />
          {this.state.showItems && (
            <Select
              id={"quick_pick_item"}
              default={this.state.quickPickItem}
              disabled={this.state.quickPickItems.length === 0}
              data={this.state.quickPickItems}
              placeHolder={this.state.quickPickItems.length === 0 ? "Pick Above" : "None"}
              // dropDownSize={12}
              // textSize={10}
              onSelect={(index, value) => {
                this.setState({quickPickItem: value === "None" ? 0 : value, previewText: null}, () => {
                  let item = this.fetchItem(value)
                  if (item) {
                    let references = item.references ? `(${item.references})` : "";
                    let previewText = `${item.template} ${references}`.trim();
                    this.setState({previewText});
                  }
                })
              }}
              style={{
                marginTop: 5,
                padding: 5,
                width: "100%",
              }}
            />
          )}
          {this.state.previewText && (
            <Block>
              <Text>{this.state.previewText}</Text>
            </Block>
          )}
          <Block flex center row>
            <Button onlyIcon
                    iconFamily={"fontawesome"}
                    icon={"cancel"}
                    color={"secondary"}
                    onPress={() => this.resetCategory(() => {
                      this.setState({quickPickShow: false});
                    })}>Close</Button>
            {this.state.previewText && (
              <Button onlyIcon
                      iconFamily={"fontawesome"}
                      icon={"check"}
                      color={"primary"}
                      onPress={() => {
                        let returnText = this.state.previewText;
                        this.resetCategory(() => {
                          this.resetCategory(() => {
                            this.setState({quickPickShow: false}, () => {
                              this.props.onSelect(returnText);
                            });
                          });
                        });
                      }}>Save</Button>
            )}
          </Block>
        </Block>
      }
    </Fragment>
  }

}

const styles = StyleSheet.create({
  group: {
    paddingTop: theme.SIZES.BASE,
    width: (width / theme.SIZES.BASE) * 14
  },
});