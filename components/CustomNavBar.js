import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

// galio components
import { Block, Text, Icon } from 'galio-framework';
import GalioTheme, { withGalio } from 'galio-framework';

const { height } = Dimensions.get('screen');

function NavBar({
  back,
  hideLeft,
  hideRight,
  left,
  leftStyle,
  leftIconColor,
  leftHitSlop,
  leftIconName,
  leftIconFamily,
  onLeftPress,
  right,
  rightStyle,
  style,
  styles,
  transparent,
  theme,
  title,
  titleStyle,
}) {
  function renderTitle() {
    if (typeof title === 'string') {
      return (
        <View style={styles.title}>
          <Text style={[styles.titleTextStyle, titleStyle]}>{title}</Text>
        </View>
      );
    }

    if (!title) return null;

    return title;
  }

  function renderLeft() {
    if (!hideLeft) {
      if (leftIconName || back) {
        return (
          <View style={[styles.left, leftStyle]}>
            <TouchableOpacity onPress={() => onLeftPress && onLeftPress()} hitSlop={leftHitSlop}>
              <Icon
                family={leftIconFamily || "evilicons"}
                color={leftIconColor || theme.COLORS.ICON}
                size={24}
                name={leftIconName || (back ? 'chevron-left' : 'navicon')}
              />
            </TouchableOpacity>
          </View>
        );
      }
      return <View style={[styles.left, leftStyle]}>{left}</View>;
    }
    return <View style={[styles.left]} />;
  }

  function renderRight() {
    const hasIcons = React.Children.count(right) > 1;
    const rightStyles = [styles.right, rightStyle];
    if (!hideRight) {
      return (
        <Block right row={hasIcons} style={rightStyles}>
          {right}
        </Block>
      );
    }
    return <View style={styles.right} />;
  }

  const navStyles = [styles.navBar, transparent && styles.transparent, style];

  return (
    <Block style={navStyles}>
      {renderLeft()}
      {renderTitle()}
      {renderRight()}
    </Block>
  );
}

NavBar.defaultProps = {
  back: false,
  transparent: false,
  title: null,
  titleStyle: null,
  left: null,
  leftStyle: null,
  leftIconColor: null,
  onLeftPress: () => {},
  leftHitSlop: null,
  right: null,
  rightStyle: null,
  style: null,
  styles: {},
  theme: GalioTheme,
};

NavBar.propTypes = {
  back: PropTypes.bool,
  transparent: PropTypes.bool,
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  titleStyle: PropTypes.any,
  left: PropTypes.node,
  leftStyle: PropTypes.any,
  leftIconColor: PropTypes.string,
  onLeftPress: PropTypes.func,
  leftHitSlop: PropTypes.any,
  right: PropTypes.node,
  rightStyle: PropTypes.any,
  style: PropTypes.any,
  styles: PropTypes.any,
  theme: PropTypes.any,
  leftIconName: PropTypes.string,
  leftIconFamily: PropTypes.string,
  hideLeft: PropTypes.bool,
  hideRight: PropTypes.bool,
};

const styles = theme =>
  StyleSheet.create({
    navBar: {
      width: 'auto',
      height: theme.SIZES.BASE * 4.125,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      backgroundColor: theme.COLORS.WHITE,
      paddingVertical: theme.SIZES.BASE,
    },
    title: {
      flex: 2,
      height: height * 0.07,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleTextStyle: {
      fontWeight: '400',
      fontSize: theme.SIZES.FONT * 0.875,
      color: theme.COLORS.BLACK,
    },
    left: {
      flex: 0.5,
      height: height * 0.07,
      justifyContent: 'center',
      marginLeft: theme.SIZES.BASE,
    },
    right: {
      flex: 0.5,
      height: height * 0.07,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.SIZES.BASE,
    },
    transparent: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
    },
  });

export default withGalio(NavBar, styles);
