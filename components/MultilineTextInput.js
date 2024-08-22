import React from "react";
import {TextInput} from "react-native";

// https://github.com/facebook/react-native/issues/36494
export function MultilineTextInput(props) {
  const initRef = React.useRef(false);
  const {onChange, ...rest} = props;
  const onChangeNew = (evt) => {
    if (onChange) {
      if (!initRef.current) {
        initRef.current = true;
        return;
      }
      onChange(evt);
    }

  }

  return <TextInput {...rest} onChange={onChangeNew}/>
}