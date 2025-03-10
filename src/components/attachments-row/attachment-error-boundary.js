/* @flow */

import type {Node} from 'react';
import React, {PureComponent} from 'react';
import {Text, View} from 'react-native';
import log from '../log/log';

import styles from './attachments-row.styles';

type Props = {
  attachName: string,
  children: React$Element<any>
}

type State = {
  hasError: boolean
}


export default class AttachmentErrorBoundary extends PureComponent<Props, State> {
  state: State = { hasError: false };

  componentDidCatch(error: Error) {
    this.setState({hasError: true});
    log.warn('Could not render attach', error);
  }

  render(): Node {
    if (this.state.hasError) {
      return (
        <View
          testID="attachmentErrorBoundaryPlaceholder"
          style={[styles.attachmentImage, styles.attachmentFile]}
        >
          <Text>{this.props.attachName}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}
