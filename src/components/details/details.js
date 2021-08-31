/* @flow */

import React, {useState} from 'react';
import {Text, TouchableOpacity} from 'react-native';

import {HIT_SLOP} from '../common-styles/button';
import {IconChevronDownUp} from '../icon/icon';

import styles from './details.styles';

import type {Node} from 'React';
import type {TextStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  renderer: () => any,
  style?: TextStyleProp,
  title?: ?string,
  toggler?:?string,
}


const Details = (props: Props): Node => {
  const {toggler = 'Details'} = props;
  const [expanded, updateExpanded] = useState(false);

  return (
    <>
      <TouchableOpacity
        testID="details"
        style={styles.button}
        onPress={() => updateExpanded(!expanded)}
        hitSlop={HIT_SLOP}
      >
        {!!props.title && <Text style={styles.title}>
          {`${props.title}: `}
        </Text>}
        <Text style={[styles.toggle, props.style]}>
          {toggler}
          <IconChevronDownUp size={13} isDown={!expanded} color={props?.style?.color || styles.toggle.color}/>
        </Text>
      </TouchableOpacity>

    {expanded && props.renderer()}
    </>
);
};

export default (React.memo<Props>(Details): React$AbstractComponent<Props, mixed>);
