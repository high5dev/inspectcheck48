import React from 'react';
import {withNavigation} from 'react-navigation';
import {Dimensions, Platform, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {Block, Button, Input, NavBar, Text, theme} from 'galio-framework';

import Icon from './Icon';
import materialTheme from '../constants/Theme';
import {ClientEvent} from "clientevent";
import HFIINSPECTION_VARS from "../constants/HFIINSPECTION_VARS";
import CustomNavBar from "./CustomNavBar";

const {height, width} = Dimensions.get('window');
const iPhoneX = () => Platform.OS === 'ios' && (height === 812 || width === 812 || height === 896 || width === 896);

const ChatButton = ({isWhite, style, navigation}) => (
  <TouchableOpacity style={[styles.button, style]} onPress={() => navigation.navigate('Pro')}>
    <Icon
      family="GalioExtra"
      size={16}
      name="chat-33"
      color={theme.COLORS[isWhite ? 'WHITE' : 'ICON']}
    />
    <Block middle style={styles.notify}/>
  </TouchableOpacity>
);

const SyncButton = ({isWhite, style, navigation, routeName}) => (
  <TouchableOpacity style={[styles.button, style]}
                    onPress={() => {
                      ClientEvent.emit(`HEADER_SYNC_${routeName.toUpperCase()}`);
                      ClientEvent.emit('MEDIA_UPLOAD', null);
                    }}>
    <Icon
      family="font-awesome"
      size={24}
      name="refresh"
      color={theme.COLORS[isWhite ? 'WHITE' : 'ICON']}
    />
    {/*<Block middle style={styles.notify} />*/}
  </TouchableOpacity>
);

const BasketButton = ({isWhite, style, navigation}) => (
  <TouchableOpacity style={[styles.button, style]} onPress={() => navigation.navigate('Pro')}>
    <Icon
      family="GalioExtra"
      size={16}
      name="basket-simple"
      color={theme.COLORS[isWhite ? 'WHITE' : 'ICON']}
    />
    <Block middle style={styles.notify}/>
  </TouchableOpacity>
);

const SearchButton = ({isWhite, style, navigation}) => (
  <TouchableOpacity style={[styles.button, style]} onPress={() => navigation.navigate('Pro')}>
    <Icon
      size={16}
      family="entypo"
      name="magnifying-glass"
      color={theme.COLORS[isWhite ? 'WHITE' : 'ICON']}
    />
  </TouchableOpacity>
);

const AddButton = ({isWhite, style, navigation, routeName}) => (
  <TouchableOpacity style={[styles.button, style]}
                    onPress={() => ClientEvent.emit(`HEADER_ADD_${routeName.toUpperCase()}`)}>
    <Icon
      size={24}
      family="entype"
      name="add-circle-outline"
      color={theme.COLORS[isWhite ? 'WHITE' : 'ICON']}
    />
  </TouchableOpacity>
);

const CancelButton = ({isWhite, style, navigation, routeName}) => (
  <TouchableOpacity style={[styles.button, style]}
                    onPress={() => ClientEvent.emit(`HEADER_CANCEL_${routeName.toUpperCase()}`)}>
    <Icon
      size={24}
      family="material-icons"
      name="cancel"
      color={theme.COLORS[isWhite ? 'WHITE' : 'ICON']}
    />
  </TouchableOpacity>
);

const CloneButton = ({isWhite, style, navigation, routeName}) => (
  <TouchableOpacity style={[styles.button, style]}
                    onPress={() => ClientEvent.emit(`HEADER_CLONE_${routeName.toUpperCase()}`)}>
    <Icon
      size={24}
      family="font-awesome"
      name="clone"
      color={theme.COLORS[isWhite ? 'WHITE' : 'ICON']}
    />
  </TouchableOpacity>
);

const SaveButton = ({isWhite, style, navigation, routeName}) => (
  <TouchableOpacity style={[styles.button, style]}
                    onPress={() => ClientEvent.emit(`HEADER_SAVE_${routeName.toUpperCase()}`)}>
    <Icon
      size={24}
      family="material-icons"
      name="save"
      color={theme.COLORS[isWhite ? 'WHITE' : 'ICON']}
    />
  </TouchableOpacity>
);

class Header extends React.Component {
  state = {
    show_save: false,
    hfi_tab_page: 0
  }

  componentDidMount() {
    ClientEvent.on("DYNAMIC_SHOW_SAVE", "Header", (show) => {
      if (this.state.show_save !== show) {
        this.setState({show_save: show})
      }
    });
    ClientEvent.on("HEADER_HFITAB", "Header", (page) => {
      if (this.state.hfi_tab_page !== page) {
        this.setState({hfi_tab_page: page});
      }
    });
    ClientEvent.on("NAVIGATE", "Inspections", (nav) => this.props.navigation.navigate(nav.to, nav.props));
  }

  componentWillUnmount() {
    ClientEvent.off("DYNAMIC_SHOW_SAVE", "Header");
    ClientEvent.off("HEADER_HFITAB", "Header");
    ClientEvent.off("NAVIGATE", "Header");
  }

  handleLeftPress = () => {
    const {back, navigation, confirmUnsaved, noback} = this.props;
    if (!!noback) return null;
    const {routeName} = navigation.state;
    if (confirmUnsaved) {
      ClientEvent.emit(`HEADER_BACK_${routeName.toUpperCase()}`)
      return;
    }
    return (back ? navigation.goBack() : navigation.openDrawer());
  }

  renderRight = () => {
    const {white, title, navigation} = this.props;
    const {routeName} = navigation.state;

    switch (routeName) {
      case "Assets":
        return [
          <AddButton key="add-button" navigation={navigation} isWhite={white} title={title} routeName={routeName}/>,
          <CloneButton key="clone-button" navigation={navigation} isWhite={white} title={title} routeName={routeName}/>
        ];
      case "Agencies":
      case "Playgrounds":
      case "Inspections":
        return [
          <AddButton key="add-button" navigation={navigation} isWhite={white} title={title} routeName={routeName}/>
        ];
      case 'Home':
        return ([
          <SyncButton key='chat-home' navigation={navigation} isWhite={white} routeName={routeName}/>
        ]);
      case 'Deals':
        return ([
          <ChatButton key='chat-categories' navigation={navigation}/>,
          <BasketButton key='basket-categories' navigation={navigation}/>
        ]);
      case 'Categories':
        return ([
          <ChatButton key='chat-categories' navigation={navigation} isWhite={white}/>,
          <BasketButton key='basket-categories' navigation={navigation} isWhite={white}/>
        ]);
      case 'Category':
        return ([
          <ChatButton key='chat-deals' navigation={navigation} isWhite={white}/>,
          <BasketButton key='basket-deals' navigation={navigation} isWhite={white}/>
        ]);
      case 'Profile':
        return ([
          <ChatButton key='chat-profile' navigation={navigation} isWhite={white}/>,
          <BasketButton key='basket-deals' navigation={navigation} isWhite={white}/>
        ]);
      case 'Product':
        return ([
          <SearchButton key='search-product' navigation={navigation} isWhite={white}/>,
          <BasketButton key='basket-product' navigation={navigation} isWhite={white}/>
        ]);
      case 'Search':
      case 'Settings':
        return ([]);
      case 'InspectionAdd':
        return ([
          <CancelButton key='addedit-cancel' navigation={navigation} isWhite={white} routeName={routeName}/>
        ]);
      case 'AgencyAddEdit':
      case 'PlaygroundAddEdit':
      case 'HFInspectionAddAsset':
      case 'ImportAssets':
        return ([
          <SaveButton key='addedit-save' navigation={navigation} isWhite={white} routeName={routeName}/>,
          <CancelButton key='addedit-cancel' navigation={navigation} isWhite={white} routeName={routeName}/>
        ]);
      case 'AssetAddEdit':
        return ([
          <SaveButton key='addedit-save' navigation={navigation} isWhite={white} routeName={routeName}/>,
          <CancelButton key='addedit-cancel' navigation={navigation} isWhite={white} routeName={routeName}/>,
        ]);
      // <CloneButton key="clone-button" navigation={navigation} isWhite={white} title={title} routeName={routeName}/>/**/
      case 'HFInspection':
      case 'QUICKInspection':
        const buttons = [];
        if (this.state.show_save) {
          buttons.push(<SaveButton key='addedit-save' navigation={navigation} isWhite={white} routeName={routeName}/>);
        }
        return (buttons);
      default:
        break;
    }
  }

  renderSearch = () => {
    const {navigation} = this.props;
    return (
      <Input
        right
        color="black"
        style={styles.search}
        placeholder="What are you looking for?"
        onFocus={() => navigation.navigate('Pro')}
        iconContent={<Icon size={16} color={theme.COLORS.MUTED} name="magnifying-glass" family="entypo"/>}
      />
    )
  }

  renderTabs = () => {
    const {navigation, tabTitleLeft, tabTitleRight} = this.props;

    return (
      <Block style={styles.tabs} row>
        <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
                    style={{paddingBottom: 0, marginBottom: 0}} horizontal={true}>

          <Button shadowless style={[styles.tab, styles.divider]} onPress={() => navigation.navigate('Pro')}>
            <Block row middle>
              <Icon name="grid" family="feather" style={{paddingRight: 8}}/>
              <Text size={16} style={styles.tabTitle}>{tabTitleLeft || 'Categories'}</Text>
            </Block>
          </Button>

          <Button shadowless style={styles.tab} onPress={() => navigation.navigate('Pro')}>
            <Block row middle>
              <Icon size={16} name="camera-18" family="GalioExtra" style={{paddingRight: 8}}/>
              <Text size={16} style={styles.tabTitle}>{tabTitleRight || 'Best Deals'}</Text>
            </Block>
          </Button>

          <Button shadowless style={styles.tab} onPress={() => navigation.navigate('Pro')}>
            <Block row middle>
              <Icon size={16} name="camera-18" family="GalioExtra" style={{paddingRight: 8}}/>
              <Text size={16} style={styles.tabTitle}>{tabTitleRight || 'Best Deals'}</Text>
            </Block>
          </Button>

          <Button shadowless style={styles.tab} onPress={() => navigation.navigate('Pro')}>
            <Block row middle>
              <Icon size={16} name="camera-18" family="GalioExtra" style={{paddingRight: 8}}/>
              <Text size={16} style={styles.tabTitle}>{tabTitleRight || 'Best Deals'}</Text>
            </Block>
          </Button>

        </ScrollView>
      </Block>
    )
  }

  renderHomeTabs = () => {
    const {navigation, tabTitleLeft, tabTitleRight} = this.props;

    return (
      <Block row style={styles.tabs}>

        <Button shadowless style={[styles.tab3, styles.divider]} onPress={() => navigation.navigate('Home')}>
          <Block row middle>
            <Icon size={24} name="md-home" family="ionicon" style={{paddingRight: 8}}/>
            <Text size={16} style={styles.tabTitle}>{tabTitleLeft || 'Home'}</Text>
          </Block>
        </Button>

        <Button shadowless style={[styles.tab3, styles.divider]} onPress={() => navigation.navigate('Inspections')}>
          <Block row middle>
            <Icon size={24} name="clipboard-notes" family="foundation" style={{paddingRight: 8}}/>
            <Text size={16} style={styles.tabTitle}>{tabTitleRight || 'Inspections'}</Text>
          </Block>
        </Button>

        <Button shadowless style={styles.tab3} onPress={() => navigation.navigate('Agencies')}>
          <Block row middle>
            <Icon size={24} name="md-business" family="ionicon" style={{paddingRight: 8}}/>
            <Text size={16} style={styles.tabTitle}>{tabTitleRight || 'Agencies'}</Text>
          </Block>
        </Button>

      </Block>
    )
  }

  renderHFITabs = () => {
    return (
      <Block row style={styles.tabs}>
        <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
                    style={{paddingBottom: 0, marginBottom: 0}} horizontal={true}>

          {HFIINSPECTION_VARS.map((hfi, index) => {
            const buttonStyle = [styles.tab3, this.state.hfi_tab_page === hfi.id ? styles.selectedTab : {}];
            if (index + 1 !== HFIINSPECTION_VARS.length) buttonStyle.push(styles.divider);
            return (
              <Button key={index} shadowless
                      style={buttonStyle}
                      onPress={() => ClientEvent.emit(`HEADER_HFITAB`, hfi.id)}>
                <Block row middle style={[this.state.hfi_tab_page === hfi.id ? styles.selectedBox : {}]}>
                  <Icon name={hfi.header.iconName} family={hfi.header.iconFamily}
                        style={[{paddingRight: 8}, this.state.hfi_tab_page === hfi.id ? styles.selectedTab : {}]}/>
                  <Text size={16}
                        style={[styles.tabTitle, this.state.hfi_tab_page === hfi.id ? {...styles.selectedTab} : {}]}>{hfi.header.display}</Text>
                </Block>
              </Button>
            )
          })}

        </ScrollView>
      </Block>
    )
  }

  renderHeader = () => {
    const {search, tabs, hfiTabs, homeTabs} = this.props;
    if (search || tabs || hfiTabs || homeTabs) {
      return (
        <Block center>
          {search ? this.renderSearch() : null}
          {tabs ? this.renderTabs() : null}
          {homeTabs ? this.renderHomeTabs() : null}
          {hfiTabs ? this.renderHFITabs() : null}
        </Block>
      )
    }
    return null;
  }

  render() {
    const {back, title, white, transparent, navigation, noback} = this.props;
    const {routeName} = navigation.state;
    const noShadow = ["Search", "Categories", "Deals", "Pro", "Profile"].includes(routeName);
    const headerStyles = [
      !noShadow ? styles.shadow : null,
      transparent ? {backgroundColor: 'rgba(0,0,0,0)'} : null,
    ];

    return (
      <Block style={headerStyles}>
        <CustomNavBar
          back={back}
          title={title}
          style={styles.navbar}
          transparent={transparent}
          right={this.renderRight()}
          rightStyle={{alignItems: 'center'}}
          leftStyle={{flex: 0.3, paddingTop: 2, paddingBottom: 2,paddingRight: 5, fontSize: 24}}
          leftIconName={noback ? null : back ? 'arrow-left' : 'navicon'}
          leftIconColor={white ? theme.COLORS.WHITE : theme.COLORS.ICON}
          titleStyle={[
            styles.title,
            {color: theme.COLORS[white ? 'WHITE' : 'ICON']},
          ]}
          onLeftPress={this.handleLeftPress}
        />
        {this.renderHeader()}
      </Block>
    );
  }
}

export default withNavigation(Header);

const styles = StyleSheet.create({
  button: {
    padding: 12,
    position: 'relative',
  },
  title: {
    width: '100%',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navbar: {
    paddingVertical: 0,
    paddingBottom: theme.SIZES.BASE * 1.5,
    paddingTop: iPhoneX ? theme.SIZES.BASE * 4 : theme.SIZES.BASE,
    zIndex: 5,
  },
  shadow: {
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
    shadowOpacity: 0.2,
    elevation: 3,
  },
  notify: {
    backgroundColor: materialTheme.COLORS.LABEL,
    borderRadius: 4,
    height: theme.SIZES.BASE / 2,
    width: theme.SIZES.BASE / 2,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  header: {
    backgroundColor: theme.COLORS.WHITE,
  },
  divider: {
    borderRightWidth: 0.3,
    borderRightColor: theme.COLORS.MUTED,
  },
  search: {
    height: 48,
    width: width - 32,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 3,
  },
  tabs: {
    marginBottom: 15,
    marginTop: 5,
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
  tab3: {
    backgroundColor: theme.COLORS.TRANSPARENT,
    width: width * 0.32,
    borderRadius: 0,
    borderWidth: 0,
    height: 24,
    elevation: 0,
  },
  tabTitle: {
    lineHeight: 19,
    fontWeight: '300'
  },
  selectedTab: {
    color: "#FF0000",
  },
  selectedBox: {
    borderBottomWidth: 1,
    borderBottomColor: "#FF0000"
  }
})