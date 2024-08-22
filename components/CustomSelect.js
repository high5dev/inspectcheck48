import {Block, Text, theme} from "galio-framework";
import {Dimensions, StyleSheet} from "react-native";
import React from "react";
import {Select} from "./index";

const {width} = Dimensions.get('screen');

const thumbMeasure = (width - 48 - 32) / 3;

export default class CustomSelect extends React.Component {

  constructor(props) {
    super(props);
    // console.log("customselect constructor", props)
  }

  render() {
    return <Block flex style={styles.group}>
      {this.props.title && (
        <Text bold size={16} style={styles.title}>{this.props.title || ""}</Text>
      )}
      <Block style={{paddingHorizontal: theme.SIZES.BASE}}>
        {!this.props.default ? null
          :
          <Select
            default={this.props.default}
            disabled={this.props.disabled}
            data={this.props.data}
            placeHolder={this.props.placeHolder}
            onSelect={(index, value) => this.props.onChange && this.props.onChange(this.props.id, value)}
            style={this.props.style || {
              padding: 5,
              width: "100%",
            }}
          />
        }
      </Block>
    </Block>;
  }
}

const styles = StyleSheet.create({
  components: {},
  group: {
    paddingTop: theme.SIZES.BASE,
    width: (width / theme.SIZES.BASE) * 14
  },
});