/* @flow */

import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

import IconTag from '@jetbrains/icons/tag.svg';

import {HIT_SLOP} from '../common-styles/button';

import styles from './tags.styles';

type Props = {
  disabled?: boolean,
  onAdd: () => any
}


const TagAddPanel = (props: Props) => {
  const iconTag: any = <IconTag
    style={styles.tagIcon}
    width={21}
    height={21}
    fill={props.disabled ? styles.buttonTextDisabled.color : styles.buttonText.color}
  />;
  return (
    <TouchableOpacity
      disabled={props.disabled}
      style={styles.button}
      hitSlop={HIT_SLOP}
      onPress={props.onAdd}
    >
      {iconTag}
      <Text
        style={[styles.buttonText, props.disabled && styles.buttonTextDisabled]}>
        Add Tag
      </Text>
    </TouchableOpacity>
  );
};

export default (React.memo<Props>(TagAddPanel): React$AbstractComponent<Props, mixed>);

