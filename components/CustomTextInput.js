import {Block, Text, theme} from "galio-framework";
import {Dimensions, StyleSheet, TextInput} from "react-native";
import {materialTheme} from "../constants";
import React from "react";

const {width} = Dimensions.get('screen');

const thumbMeasure = (width - 48 - 32) / 3;

export default class CustomTextInput extends React.Component {

  constructor(props){
    super(props);

  }


  render() {

    return <Block flex style={styles.group}>
      <Text bold size={16} style={styles.title}>{this.props.title || ""}</Text>
      <Block style={{paddingHorizontal: theme.SIZES.BASE}}>
        <TextInput
          multiline={this.props.multiline || false}
          numberOfLines={this.props.numberOfLines || 1}
          value={this.props.value || ""}
          id={this.props.id || "id"}
          placeholder={this.props.placeHolder || ""}
          onChange={(evt) => this.props.onChange(this.props.id || "id", evt.nativeEvent.text)}
          editable={!this.props.disabled}
          style={{
            borderWidth: 1,
            borderColor: materialTheme.COLORS.DARK_TEXT,
            padding: 5,
            textAlignVertical: "top",
            height: this.props.numberOfLines * 30 || 30
          }}

        />
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