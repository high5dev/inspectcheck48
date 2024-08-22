import React from 'react';
import {Dimensions, KeyboardAvoidingView, ScrollView, StyleSheet} from 'react-native';
import {Block} from 'galio-framework';

const {width} = Dimensions.get('screen');

const thumbMeasure = (width - 48 - 32) / 3;

export default class Components extends React.Component {

  render() {
    return (
      <Block flex center>
        <ScrollView
          style={styles.components}
          showsVerticalScrollIndicator={false}>
          <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>



          </KeyboardAvoidingView>
        </ScrollView>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  components: {}
});
