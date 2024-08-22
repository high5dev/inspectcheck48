import React from 'react';
import {Dimensions, Image, StyleSheet} from 'react-native';
import {Block, Button, Input, theme} from 'galio-framework';
import logo from "../../assets/images/Logo.png";
import {materialTheme} from "../../constants";
import {postData} from "../../api/api";
import * as SecureStore from "expo-secure-store";

const {width} = Dimensions.get('screen');

export default class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: ""
    }
  }

  checkLogin() {
    let self = this;
    if (this.state.username.length < 4 || this.state.password.length < 4) {
      alert("Bad username/password");
      return;
    }
    postData("login", {username: this.state.username, password: this.state.password})
      .then((data) => {
        if (data.status === "success") {
          // console.log(data);
          let fetchedValue = {
            isLoggedIn: true,
            username: self.state.username,
            password: self.state.password,
            token: data.data.token,
            expiresAt: data.data.expiresAt,
            needsLogin: false,
            profile: data.data.profile,
            perms: data.data.perms
          };
          global.configData = fetchedValue;
          try {
            SecureStore.setItemAsync("config", JSON.stringify(global.configData), {});
          } catch (e) {
            console.log(e.message);
            console.log("error writing");
          }
          self.props.onSuccess();

        } else {
          alert(data.message);
        }
      })
      .catch((error) => {

      });
  }

  render() {
    const {navigation} = this.props;
    return (
      <Block flex center style={styles.home}>
        <Image
          source={logo}
          style={{marginRight: 'auto', marginLeft: 'auto'}}/>
        <Block>
          <Input
            right
            placeholder="User Name"
            placeholderTextColor={materialTheme.COLORS.DARK_TEXT}
            style={{
              borderRadius: 3,
              borderColor: materialTheme.COLORS.DARK_TEXT,
              marginTop: 40,
              color: materialTheme.COLORS.DARK_TEXT
            }}
            onChangeText={text => this.setState({username: text})}
          />
          <Input
            right
            password
            placeholder="Password"
            placeholderTextColor={materialTheme.COLORS.DARK_TEXT}
            style={{
              borderRadius: 3,
              borderColor: materialTheme.COLORS.DARK_TEXT,
              color: materialTheme.COLORS.DARK_TEXT
            }}
            onChangeText={text => this.setState({password: text})}
          />
          <Block flex row>
            <Button style={{width: width / 3, marginRight: 5}} onPress={() => this.checkLogin()}>Login</Button>
            <Button style={{width: width / 3}}>Forgot</Button>
          </Block>
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  home: {
    width: width,
    paddingTop: 50
  },
  search: {
    height: 48,
    width: width - 32,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 3,
  },
  header: {
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    elevation: 4,
    zIndex: 2,
  },
  tabs: {
    marginBottom: 24,
    marginTop: 10,
    elevation: 4,
  },
  tab: {
    backgroundColor: theme.COLORS.TRANSPARENT,
    width: width * 0.50,
    borderRadius: 0,
    borderWidth: 0,
    height: 24,
    elevation: 0,
  },
  tabTitle: {
    lineHeight: 19,
    fontWeight: '300'
  },
  divider: {
    borderRightWidth: 0.3,
    borderRightColor: theme.COLORS.MUTED,
  },
  products: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE * 2,
  },
});
