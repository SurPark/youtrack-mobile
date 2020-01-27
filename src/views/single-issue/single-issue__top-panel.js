/* @flow */

import {View, Text} from 'react-native';
import React, {PureComponent} from 'react';

import {formatDate, shortRelativeDate, getEntityPresentation} from '../../components/issue-formatter/issue-formatter';

import styles from './single-issue.styles';

import type {User} from '../../flow/User';


type Props = {
  reporter: User,
  created: number,
  updater: User,
  updated: number
}


export default class TopPanel extends PureComponent<Props, void> {

  _getUserName(user: User) {
    return user ? getEntityPresentation(user) : '';
  }

  _getDate(timestamp: number, isRelative?: boolean) {
    const formatter = isRelative ? shortRelativeDate : formatDate;
    return timestamp ? formatter(timestamp) : '';
  }

  render() {
    const {reporter, created, updater, updated} = this.props;

    return (
      <View style={styles.issueTopPanel}>

        <Text
          style={styles.issueTopPanelText}
          selectable={true}
        >
          Created by {this._getUserName(reporter)} {this._getDate(created, true)}
        </Text>

        <Text
          style={[styles.issueTopPanelText, styles.topPanelUpdatedInformation]}
          selectable={true}
        >
          Updated by {this._getUserName(updater)} {this._getDate(updated, true)}
        </Text>

      </View>
    );
  }
}
