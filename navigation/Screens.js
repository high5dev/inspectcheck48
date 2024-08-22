import React from 'react';
import {createAppContainer} from 'react-navigation';
import {createDrawerNavigator} from 'react-navigation-drawer';
import {createStackNavigator} from 'react-navigation-stack';
import HomeScreen from '../screens/Home';
import AgenciesScreen from '../screens/agencies/Agencies';
import SettingsScreen from '../screens/Settings';

import Menu from './Menu';
import Header from '../components/Header';
import {Drawer} from '../components';
import Login from "../screens/login/Login";
import Playgrounds from "../screens/playgrounds/Playgrounds";
import Assets from "../screens/assets/Assets";
import AgencyAddEdit from "../screens/agencies/AgencyAddEdit";
import PlaygroundAddEdit from "../screens/playgrounds/PlaygroundAddEdit";
import AssetAddEdit from "../screens/assets/AssetAddEdit";
import CameraView from "../screens/CameraView";
import Inspections from "../screens/inspections/Inspections";
import InspectionAdd from "../screens/inspections/InspectionAdd";
import HFInspection from "../screens/inspections/HFI/HFInspection";
import ImportAssets from "../screens/assets/import/ImportAssets";
import ChangeLog from "../screens/ChangeLog";
import ChangeLogEntry from "../screens/ChangeLogEntry";
import {Block, Text} from "galio-framework";
import QuickInspection from "../screens/inspections/Quick/QuickInspection";
import Debug from "../screens/debug/Debug";

// const transitionConfig = (transitionProps, prevTransitionProps) => ({
//   transitionSpec: {
//     duration: 400,
//     easing: Easing.out(Easing.poly(4)),
//     timing: Animated.timing,
//   },
//   screenInterpolator: sceneProps => {
//     const {layout, position, scene} = sceneProps;
//     const thisSceneIndex = scene.index
//     const width = layout.initWidth
//     console.log("got here2")
//     const scale = position.interpolate({
//       inputRange: [thisSceneIndex - 1, thisSceneIndex, thisSceneIndex + 1],
//       outputRange: [4, 1, 1]
//     })
//     const opacity = position.interpolate({
//       inputRange: [thisSceneIndex - 1, thisSceneIndex, thisSceneIndex + 1],
//       outputRange: [0, 1, 1],
//     })
//     const translateX = position.interpolate({
//       inputRange: [thisSceneIndex - 1, thisSceneIndex],
//       outputRange: [width, 0],
//     })
//
//     const scaleWithOpacity = {opacity}
//     const screenName = "Search"
//
//     if (screenName === transitionProps.scene.route.routeName ||
//       (prevTransitionProps && screenName === prevTransitionProps.scene.route.routeName)) {
//       return scaleWithOpacity;
//     }
//     return {transform: [{translateX}]}
//   }
// })

// const ProfileStack = createStackNavigator({
//   Profile: {
//     screen: ProfileScreen,
//     navigationOptions: ({navigation}) => ({
//       header: () => <Header white transparent title="Profile" navigation={navigation}/>,
//       headerTransparent: true,
//     })
//   },
// }, {
//   navigationOptions: ({navigation}) => ({
//     cardStyle: {
//       backgroundColor: '#EEEEEE', //this is the backgroundColor for the app
//     },
//   }),
// });

const SettingsStack = createStackNavigator({
  Settings: {
    screen: SettingsScreen,
    navigationOptions: ({navigation}) => ({
      header: () => <Header title="Settings" navigation={navigation}/>,
    })
  },
}, {
  navigationOptions: ({navigation}) => ({
    cardStyle: {
      backgroundColor: '#EEEEEE', //this is the backgroundColor for the app
    },
  }),
});

const ChangeStack = createStackNavigator({
  ChangeLog: {
    screen: ChangeLog,
    navigationOptions: ({navigation}) => ({
      header: () => <Header title="What's New..." navigation={navigation}/>,
    })
  },
  ChangeLogEntry: {
    screen: ChangeLogEntry,
    navigationOptions: ({navigation}) => ({
      header: () => <Header back={true} title="Read all about it" navigation={navigation}/>,
    })
  },
}, {
  headerMode: 'screen',
  navigationOptions: ({navigation}) => ({
    cardStyle: {
      backgroundColor: '#EEEEEE', //this is the backgroundColor for the app
    },
  }),
});

// const ComponentsStack = createStackNavigator({
//   Components: {
//     screen: ComponentsScreen,
//     navigationOptions: ({navigation}) => ({
//       header: () => <Header title="Components" navigation={navigation}/>,
//     })
//   },
// }, {
//   navigationOptions: ({navigation}) => ({
//     cardStyle: {
//       backgroundColor: '#EEEEEE', //this is the backgroundColor for the app
//     },
//   }),
// });

const InspectionsStack = createStackNavigator({
  Inspections: {
    screen: Inspections,
    navigationOptions: ({navigation}) => ({
      header: () => <Header title="Inspections" navigation={navigation}/>,
    })
  },
  InspectionAdd: {
    screen: InspectionAdd,
    navigationOptions: ({navigation}) => ({
      header: () => <Header title="Add Inspection" navigation={navigation}/>,
      gestureEnabled: false,
    })
  },
  HFInspection: {
    screen: HFInspection,
    navigationOptions: ({navigation}) => ({
      header: () => <Header title="HF Inspection" back={true} confirmUnsaved={true} navigation={navigation} hfiTabs/>,
      gestureEnabled: false,
    })
  },
  HFInspectionAddAsset: {
    screen: AssetAddEdit,
    navigationOptions: ({navigation}) => ({
      header: () => <Header title="Add Asset" noback={true} confirmUnsaved={true} navigation={navigation}/>,
      gestureEnabled: false,
    })
  },
  QUICKInspection: {
    screen: QuickInspection,
    navigationOptions: ({navigation}) => ({
      header: () => <Header title="Quick Inspection" back={true} confirmUnsaved={true} navigation={navigation}/>,
      gestureEnabled: false,
    })
  },
  CameraViewInspections: {
    screen: CameraView,
    navigationOptions: ({navigation, onLogout}) => ({
      headerShown: false,
      gestureEnabled: false,
    })
  },
}, {
  // detachInactiveScreens: false,
  headerMode: 'screen',
  navigationOptions: ({navigation}) => ({
    cardStyle: {
      backgroundColor: '#EEEEEE', //this is the backgroundColor for the app,
    },
  }),
});

const AgenciesStack = createStackNavigator({
    Agencies: {
      screen: AgenciesScreen,
      navigationOptions: ({navigation}) => ({
        header: () => <Header title="Agencies" navigation={navigation}/>,
        gestureEnabled: false,
      })
    },
    AgencyAddEdit: {
      screen: AgencyAddEdit,
      navigationOptions: ({navigation}) => ({
        header: () => <Header back={true} title="Add/Edit Agency" navigation={navigation}/>,
        gestureEnabled: false,
      })
    },
    Playgrounds: {
      screen: Playgrounds,
      navigationOptions: ({navigation}) => ({
        header: () => <Header back={true} title="Playgrounds" navigation={navigation}/>,
        gestureEnabled: false,
      })
    },
    PlaygroundAddEdit: {
      screen: PlaygroundAddEdit,
      navigationOptions: ({navigation}) => ({
        header: () => <Header back={true} title="Add/Edit Playground" navigation={navigation}/>,
        gestureEnabled: false,
      })
    },
    Assets: {
      screen: Assets,
      navigationOptions: ({navigation}) => ({
        header: () => <Header back={true} title="Assets" navigation={navigation}/>,
        gestureEnabled: false,
      })
    },
    AssetAddEdit: {
      screen: AssetAddEdit,
      navigationOptions: ({navigation}) => ({
        header: () => <Header back={true} title="Add/Edit Asset" navigation={navigation}/>,
        gestureEnabled: false,
      })
    },
    ImportAssets: {
      screen: ImportAssets,
      navigationOptions: ({navigation}) => ({
        header: () => <Header title="Import Assets" noback={true} confirmUnsaved={true} navigation={navigation}/>,
        gestureEnabled: false,
      })
    },
    CameraViewAsset: {
      screen: CameraView,
      navigationOptions: ({navigation, onLogout}) => ({
        headerShown: false,
        gestureEnabled: false,
      })
    },
  },
  {
    // detachInactiveScreens: false,
    headerMode: 'screen',
    navigationOptions: ({navigation}) => ({
      cardStyle: {
        backgroundColor: '#EEEEEE', //this is the backgroundColor for the app
      },
    }),
  });

const LoginStack = createStackNavigator({
    Login: {
      screen: Login,
      navigationOptions: ({navigation}) => ({
        header: () => <Header title="Login" navigation={navigation}/>,
        headerTransparent: true,
      })
    }
  },
  {
    navigationOptions: ({navigation}) => ({
      cardStyle: {
        backgroundColor: '#EEEEEE', //this is the backgroundColor for the app
      },
    }),
  });

const DebugStack = createStackNavigator({
    Debug: {
      screen: Debug,
      navigationOptions: ({navigation}) => ({
        header: () => <Header title="Debug" navigation={navigation}/>,
        gestureEnabled: false,
      })
    },
    CameraViewAsset: {
      screen: CameraView,
      navigationOptions: ({navigation, onLogout}) => ({
        headerShown: false,
        gestureEnabled: false,
      })
    },
  },
  {
    // detachInactiveScreens: false,
    headerMode: 'screen',
    navigationOptions: ({navigation}) => ({
      cardStyle: {
        backgroundColor: '#EEEEEE', //this is the backgroundColor for the app
      },
    }),
  });

// Home Stack Navigator for the app. This is the first screen that will be shown after login
const HomeStack = createStackNavigator({
    // Agencies: {
    //   screen: AgenciesScreen,
    //   navigationOptions: ({navigation}) => ({
    //     header: <Header title="Agencies" navigation={navigation}/>,
    //   })
    // },

    Home: {
      screen: HomeScreen,
      navigationOptions: ({navigation, onLogout}) => ({
        header: () => <Header title="Home" navigation={navigation}/>,
      })
    },

    // AgencyManagement: {
    //   screen: AgencyManagement,
    //   navigationOptions: ({navigation}) => ({
    //     header: <Header title="Agency Management" navigation={navigation}/>,
    //   })
    // },
    // Agencies: {
    //   screen: AgenciesScreen,
    //   navigationOptions: ({navigation}) => ({
    //     header: <Header title="Agencies" navigation={navigation}/>,
    //   })
    // },
    // Pro: {
    //   screen: ProScreen,
    //   navigationOptions: ({navigation}) => ({
    //     header: <Header back white transparent title="" navigation={navigation}/>,
    //     headerTransparent: true,
    //   })
    // },
    CameraViewHome: {
      screen: CameraView,
      navigationOptions: ({navigation, onLogout}) => ({
        headerShown: false,
      })
    },
  },
  {
    navigationOptions: ({navigation}) => ({
      cardStyle: {
        backgroundColor: '#EEEEEE', //this is the backgroundColor for the app
      },
    }),
  });

// Main Stack Navigator for the app. This is the first screen that will be shown
const AppStack = createDrawerNavigator(
  {
    // Onboarding: {
    //   screen: OnboardingScreen,
    //   navigationOptions: {
    //     drawerLabel: () => {},
    //   },
    // },
    // Login: {
    //   screen: LoginStack,
    //   navigationOptions: {
    //     drawerLabel: () => {},
    //   }
    // },

    Home: {
      screen: HomeStack,
      navigationOptions: {
        drawerLabel: ({focused, onLogout}) => (
          <Drawer focused={focused} screen="Home" title="Home"/>
        )
      }
    },

    Agencies: {
      screen: AgenciesStack,
      navigationOptions: {
        drawerLabel: ({focused}) => (
          <Drawer focused={focused} screen="Agencies" title="Agencies"/>
        )
      }
    },
    Inspections: {
      screen: InspectionsStack,
      navigationOptions: {
        drawerLabel: ({focused}) => (
          <Drawer focused={focused} screen="Inspections" title="Inspections"/>
        )
      }
    },
    Debug: {
      screen: DebugStack,
      navigationOptions: {
        drawerLabel: ({focused}) => (
          <Drawer focused={focused} screen="Debug" title="Debug Options" hidden/>
        )
      }
    },
    // Advanced: {
    //   screen: AdvancedStack,
    //   navigationOptions: {
    //     drawerLabel: ({focused}) => (
    //       <Drawer focused={focused} screen="Inspections" title="Inspections"/>
    //     )
    //   }
    // },

    // Woman: {
    //   screen: ProScreen,
    //   navigationOptions: (navOpt) => ({
    //     drawerLabel: ({focused}) => (
    //       <Drawer focused={focused} screen="Pro" title="Woman" />
    //     ),
    //   }),
    // },
    // Man: {
    //   screen: ProScreen,
    //   navigationOptions: (navOpt) => ({
    //     drawerLabel: ({focused}) => (
    //       <Drawer focused={focused} screen="Pro" title="Man" />
    //     ),
    //   }),
    // },
    // Kids: {
    //   screen: ProScreen,
    //   navigationOptions: (navOpt) => ({
    //     drawerLabel: ({focused}) => (
    //       <Drawer focused={focused} screen="Pro" title="Kids" />
    //     ),
    //   }),
    // },
    // NewCollection: {
    //   screen: ProScreen,
    //   navigationOptions: (navOpt) => ({
    //     drawerLabel: ({focused}) => (
    //       <Drawer focused={focused} screen="Pro" title="New Collection" />
    //     ),
    //   }),
    // },

    // Profile: {
    //   screen: ProfileStack,
    //   navigationOptions: (navOpt) => ({
    //     drawerLabel: ({focused}) => (
    //       <Drawer focused={focused} screen="Profile" title="Profile" />
    //     ),
    //   }),
    // },
    MenuDivider: {
      screen: HomeStack,
      navigationOptions: {
        drawerLabel: () => <Block style={{marginVertical: 8}}><Text>{` `}</Text></Block>,
      },
    },
    ChangeLog: {
      screen: ChangeStack,
      navigationOptions: (navOpt) => ({
        drawerLabel: ({focused}) => (
          <Drawer focused={focused} screen="ChangeLog" title="What's New..."/>
        ),
      }),
    },
    Settings: {
      screen: SettingsStack,
      navigationOptions: (navOpt) => ({
        drawerLabel: ({focused}) => (
          <Drawer focused={focused} screen="Settings" title="Settings"/>
        ),
      }),
    },
    // Components: {
    //   screen: ComponentsStack,
    //   navigationOptions: (navOpt) => ({
    //     drawerLabel: ({focused}) => (
    //       <Drawer focused={focused} screen="Components" title="Components" />
    //     ),
    //   }),
    // },

    // MenuDivider: {
    //   screen: HomeStack,
    //   navigationOptions: {
    //     drawerLabel: () => <Block style={{marginVertical: 8}}><Text>{` `}</Text></Block>,
    //   },
    // },
    // SignIn: {
    //   screen: ProScreen,
    //   navigationOptions: (navOpt) => ({
    //     drawerLabel: ({focused}) => (
    //       <Drawer focused={focused} screen="Pro" title="Sign In" />
    //     ),
    //   }),
    // },
    // SignUp: {
    //   screen: ProScreen,
    //   navigationOptions: (navOpt) => ({
    //     drawerLabel: ({focused}) => (
    //       <Drawer focused={focused} screen="Pro" title="Sign Up" />
    //     ),
    //   }),
    // },
  },
  Menu
);

const AppContainer = createAppContainer(AppStack);
export default AppContainer;