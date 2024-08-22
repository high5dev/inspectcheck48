import React from 'react';
import {StyleSheet} from 'react-native';
import ModalDropdown from '@minar-kotonoha/react-native-modal-dropdown';
import {Block, Icon, Text} from 'galio-framework';

export default class DropDown extends React.Component {
  state = {
    value: 0,
  }

  constructor(props) {
    super(props);
    // console.log("constructor",props);
    this.state = {
      value: props.default || 0
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log("prevProps", prevProps);
    // console.log("prevState", prevState);
    // console.log("snapshot", snapshot);
    // console.log("newProps", this.props);
    if (this.props.default && prevProps.default && this.props.default !== prevProps.default) {
      this.setState({value: this.props.default});
    }
  }


  handleOnSelect = (index, value) => {
    const {onSelect, ...props} = this.props;

    const newValue = props.data && props.data[index] || undefined;

    this.setState({value: newValue && newValue.value || value});
    onSelect && onSelect(index, newValue && newValue.value || value);
  }

  render() {
    const self = this;
    // console.log(this.state.value);
    const {onSelect, style, ...props} = this.props;
    const getData = function () {
      if (self.props.data[0]) {
        return self.props.data.map(obj => {
          return obj.display
        });
      } else {
        return [];
      }
    };
    const getDisplay = function (val) {
      if (props.data) {
        let filter = props.data.filter(obj => {
          // console.log(obj.value, val)
          return String(obj.value) === String(val)
        });
        // console.log(filter);
        if (filter.length === 0) return props.placeHolder || "";
        return filter[0].display || "";
      } else if (props.options) {
        return props.options.filter(opt => opt === val)[0] || ""
      } else {
        return val;
      }
    };

    return (
      <ModalDropdown
        style={[styles.qty, style]}
        onSelect={this.handleOnSelect}
        dropdownStyle={styles.dropdown}
        dropdownTextStyle={{paddingLeft: 16, fontSize: props.dropDownSize || 12}}
        options={props.options || getData()}
        {...props}>
        <Block flex middle row space={"between"}>
          <Text styles={{marginLeft: 10}} size={props.textSize || 13}>{getDisplay(this.state.value)}</Text>
          <Icon name="angle-down" family="font-awesome" size={18}/>
        </Block>
      </ModalDropdown>
    )
  }
}

const styles = StyleSheet.create({
  qty: {
    width: "100%",
    backgroundColor: '#DCDCDC',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 9.5,
    borderRadius: 3,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    shadowOpacity: 1,
  },
  dropdown: {
    marginTop: 0,
    marginLeft: -16,
    minWidth: 100,
    width: "100%",
  },
});
