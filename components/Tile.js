import React from 'react';
import {ActivityIndicator, StyleSheet, TouchableOpacity} from 'react-native';
import {Block, Text, theme} from 'galio-framework';
import {Icon} from '../components';
import materialTheme from '../constants/Theme';

export default class Tile extends React.Component {
  render() {
    const {children, style, family, icon, ...props} = this.props;

    return (
      <TouchableOpacity
        style={styles.button}
        onPress={props.onPress}
      >
        {!!this.props.spin ?
          <Block style={{height: 100}} middle>
            <ActivityIndicator size={"large"} color={theme.COLORS.WARNING}/>
          </Block>
          :
          <Icon
            size={100}
            name={icon}
            family={family}
            color={materialTheme.COLORS.MUTED}
            style={styles.icon}/>
        }

        {typeof children === "string" ?
          <Text style={styles.text}>{children}</Text>
          :
          <Block>{children}</Block>
        }
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  gradient: {
    borderWidth: 0,
    borderRadius: theme.SIZES.BASE * 2,
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderColor: materialTheme.COLORS.BORDER_COLOR,
    borderWidth: 2,
    textAlign: 'center',
    height: 150,
    width: 150,
    margin: 10
  },
  icon: {
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  text: {
    marginLeft: 'auto',
    marginRight: 'auto'
  }
});