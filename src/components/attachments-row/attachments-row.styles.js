import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';

export default EStyleSheet.create({
  attachesScroll: {
    paddingLeft: UNIT * 2,
    marginLeft: -UNIT * 2,
    marginRight: -UNIT * 2,
  },
  attachmentThumbContainer: {
    marginRight: UNIT,
    borderWidth: 1,
    borderColor: '$separator',
    borderRadius: UNIT / 2,
    width: UNIT * 12,
    height: UNIT * 8,
    overflow: 'hidden',
  },
  attachmentFile: {
    marginRight: UNIT * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentFileText: {
    fontSize: 10,
    color: '$text',
  },
  attachmentTypeContainer: {
    position: 'absolute',
    top: UNIT,
    left: UNIT,
  },
  attachmentType: {
    borderRadius: 3,
    paddingVertical: 1,
    paddingHorizontal: UNIT / 2,
    backgroundColor: '$icon',
  },
  attachmentText: {
    textTransform: 'uppercase',
    color: '$textButton',
    fontSize: 12,
    fontWeight: '500',
  },
  attachmentName: {
    width: '100%',
    flexGrow: 1,
    padding: UNIT,
    justifyContent: 'flex-end',
  },
  imageActivityIndicator: {
    backgroundColor: '$mask',
    position: 'absolute',
    top: 0,
    left: 0,
    right: UNIT,
    bottom: 0,
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: UNIT,
    padding: UNIT / 2,
  },
  removingAttach: {
    opacity: 0.3,
  },

  attachmentDefault: {
    color: '$greyColor',
    backgroundColor: '$greyBackground',
    borderColor: 'transparent',
  },
  attachmentDoc: {
    color: '$redColor',
    backgroundColor: '$redBackground',
    borderColor: 'transparent',
  },
  attachmentSheet: {
    color: '$greenColor',
    backgroundColor: '$greenBackground',
    borderColor: 'transparent',
  },
  attachmentSketch: {
    color: '$yellowColor',
    backgroundColor: '$yellowBackground',
    borderColor: 'transparent',
  },
  attachmentMedia: {
    color: '$blueColor',
    backgroundColor: '$blueBackground',
    borderColor: 'transparent',
  },
  link: {
    color: '$link',
  },
});
