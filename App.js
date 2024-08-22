import 'react-native-get-random-values';
import {StatusBar} from 'expo-status-bar';
import {Image, Platform, StyleSheet, Text, TextInput} from 'react-native';
import {Asset} from 'expo-asset';
import {Block, GalioProvider} from 'galio-framework';
import * as Sentry from 'sentry-expo';
import * as SecureStore from "expo-secure-store";

import AppContainer from './navigation/Screens';
import {Images, materialTheme, products} from './constants';
import Database from "./db/db";
import Login from "./screens/login/Login";
import {captureException} from "@sentry/react-native";
import {useEffect, useState} from "react";
import ExpoSplashScreen from "expo-splash-screen/src/ExpoSplashScreen";
import {ClientEvent} from "clientevent";

Sentry.init({
  dsn: "https://a2c08391c1f74e0a8e246e513329218e@sentry.hostedapp.cloud/14",
  enableInExpoDevelopment: true,
  debug: true
});

if (Text.defaultProps == null) {
  Text.defaultProps = {};
  Text.defaultProps.allowFontScaling = false;
}
if (TextInput.defaultProps == null) {
  TextInput.defaultProps = {};
  TextInput.defaultProps.allowFontScaling = false;
}

const assetImages = [
  Images.Pro,
  Images.Profile,
  Images.Avatar,
  Images.Onboarding,
];

const fetchedValue = {
  isLoggedIn: false,
  username: '',
  password: '',
  token: '',
  expiresAt: 0,
  lastUpdate: "0000-00-00 00:00:00",
  needsLogin: true,
  profile: {
    id: 0,
    username: '',
    fname: '',
    lname: ''
  },
  perms: {}
};

// cache product images
products.map(product => assetImages.push(product.image));

ExpoSplashScreen.preventAutoHideAsync();

function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

export default function App() {
  const [thisState, setThisState] = useState({
    isLoadingComplete: false,
    dbReady: false,
    userData: false,
    lastUpdate: 0
  });

  const setThisPartialState = (newState) => {
    setThisState(prev => ({
      ...prev,
      ...newState
    }));
  }

  const _loadResourcesAsync = async () => {
    return Promise.all([
      ...cacheImages(assetImages)
    ]);
  };

  const _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
    captureException(error);
  };

  const _handleFinishLoading = () => {
    setThisPartialState({isLoadingComplete: true});
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("config");
    global.configData = fetchedValue;
    setThisPartialState({userData: true, lastUpdate: (new Date()).getTime()});
  }

  const loadConfig = async () => {
    try {
      let returnedValue = await SecureStore.getItemAsync("config", {});
      if (typeof (returnedValue) === "undefined" || returnedValue === null || returnedValue === "null") {
        global.configData = fetchedValue;
      } else {
        global.configData = JSON.parse(returnedValue);
      }

    } catch (e) {
      global.configData = fetchedValue;
    }
    setThisPartialState({userData: true, lastUpdate: (new Date()).getTime()});
  }

  useEffect(() => {
    ClientEvent.on('LOGOUT', "App", () => logout());
    Database().init(() => {
      loadConfig().then(() => {
        _loadResourcesAsync().then(() => {
          _handleFinishLoading();
          ExpoSplashScreen.hideAsync();
        });
      });
    });
    return () => {
      ClientEvent.off('LOGOUT', "App");
    }
  }, [])

  return (<>
      {!thisState.isLoadingComplete || !thisState.userData ? (
        <></>
      ) : (
        <GalioProvider theme={materialTheme}>
          <Block flex>
            {Platform.OS === 'ios' && <StatusBar barStyle="default"/>}
            {global && global.configData && global.configData.isLoggedIn && thisState.lastUpdate > 0 ?
              <AppContainer onLogout={() => logout()}/>
              :
              <Login onSuccess={() => loadConfig()}/>
            }
          </Block>
        </GalioProvider>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

