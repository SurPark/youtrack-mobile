/* @flow */

import React, {memo, useContext, useEffect, useState} from 'react';
import {ActivityIndicator, Text, TextInput, TouchableOpacity, View} from 'react-native';

import debounce from 'lodash.debounce';
import InputScrollView from 'react-native-input-scroll-view';

import DatePicker from 'components/date-picker/date-picker';
import Header from 'components/header/header';
import ModalPortal from 'components/modal-view/modal-portal';
import Router from 'components/router/router';
import Select from 'components/select/select';
import usage from 'components/usage/usage';
import {ANALYTICS_ISSUE_STREAM_SECTION} from 'components/analytics/analytics-ids';
import {confirmation} from 'components/confirmation/confirmation';
import {createIssueActivityActions} from './issue-activity__actions';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {hasType} from 'components/api/api__resource-types';
import {HIT_SLOP} from 'components/common-styles/button';
import {i18n} from 'components/i18n/i18n';
import {IconAngleRight, IconCheck, IconClose} from 'components/icon/icon';
import {isSplitView} from 'components/responsive/responsive-helper';
import {logEvent} from 'components/log/log-helper';
import {ThemeContext} from 'components/theme/theme-context';
import {useDispatch, useSelector} from 'react-redux';
import {ytDate} from 'components/date/date';

import styles from './activity__add-spent-time.styles';

import type {AppState} from '../../../reducers';
import type {IssueFull} from 'flow/Issue';
import type {IssueProject} from 'flow/CustomFields';
import type {SelectProps} from 'components/select/select';
import type {Theme} from 'flow/Theme';
import type {User} from 'flow/User';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import type {WorkItem, TimeTracking, WorkItemType} from 'flow/Work';

type Props = {
  issue?: IssueFull,
  workItem?: WorkItem,
  onAdd?: () => any,
  onHide: () => any,
  canCreateNotOwn?: boolean,
}

const AddSpentTimeForm = (props: Props) => {
  const currentUser: User = useSelector((state: AppState) => state.app.user);
  const draftDefault: $Shape<WorkItem> = Object.freeze(({
    date: new Date().getTime(),
    author: currentUser,
    duration: {
      presentation: '1d',
    },
    type: {
      id: null,
      name: i18n('No type'),
    },
    text: null,
    usesMarkdown: true,
    issue: {project: {}},
  }: any));

  const theme: Theme = useContext(ThemeContext);
  const dispatch = useDispatch();

  const [isProgress, updateProgress] = useState(false);
  const [isSelectVisible, updateSelectVisibility] = useState(false);
  const [draft, updateDraftWorkItem] = useState(props.workItem || draftDefault);
  const [selectProps, updateSelectProps] = useState(null);
  const [error, updateError] = useState(false);
  const [modalChildren, updateModalChildren] = useState(null);


  const issueActivityActions = createIssueActivityActions();

  const doHide: () => void = (): void => {
    if (props.onHide) {
      props.onHide();
    } else {
      Router.pop(true);
    }
  };

  const getIssueId: () => string = (): string => ((props.issue || (props.workItem?.issue): any): IssueFull).id;
  const getProjectRingId: () => string = (): string => ((props?.issue?.project || (props.workItem?.issue?.project: any)): IssueProject).ringId;

  const getDraft = (draftItem: WorkItem): WorkItem => ({
    ...draftItem,
    type: !draftItem.type || draftItem.type?.id === null ? null : draftItem.type,
  });

  const updateDraft = async (draftItem: WorkItem) => {
    const draftWithType: WorkItem = getDraft(draftItem);
    dispatch(
      issueActivityActions.updateWorkItemDraft(draftWithType, getIssueId())
    ).then((updatedDraft: WorkItem | null) => {
      if (updatedDraft) {
        updateDraftWorkItem({
          ...draftItem,
          $type: updatedDraft.$type,
          type: updatedDraft.type,
          id: updatedDraft.id,
        });
      }
    }).catch(() => {});
  };

  const delayedUpdate = debounce(updateDraft, 300);

  useEffect(() => {
    if (props.workItem) {
      updateDraftWorkItem(props.workItem);
    } else {
      loadTimeTracking();
    }

    async function loadTimeTracking() {
      updateProgress(true);
      const timeTracking: TimeTracking = await dispatch(issueActivityActions.getTimeTracking(getIssueId()));
      updateDraftWorkItem({
        ...draftDefault,
        ...timeTracking?.workItemTemplate,
        ...timeTracking?.draftWorkItem,
        $type: undefined,
        type: timeTracking?.draftWorkItem?.type || timeTracking?.workItemTemplate?.type || draftDefault.type,
        usesMarkdown: true,
      });
      updateProgress(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.workItem, dispatch]);


  const update = (data: $Shape<WorkItem>) => {
    updateError(false);
    const updatedDraft: WorkItem = {
      ...draft,
      ...data,
    };
    updateDraftWorkItem(updatedDraft);
    if (!props.workItem) {
      delayedUpdate(updatedDraft);
    }
  };

  const renderSelect = (selectProps: SelectProps) => {
    const defaultSelectProps: SelectProps = {
      multi: false,
      dataSource: () => Promise.resolve([]),
      selectedItems: [],
      getTitle: (it: Object) => getEntityPresentation(it),
      onCancel: () => updateSelectVisibility(false),
      onChangeSelection: () => null,
      onSelect: () => {
        usage.trackEvent(ANALYTICS_ISSUE_STREAM_SECTION, 'SpentTime: visibility update');
        updateSelectVisibility(false);
      },
    };
    return <Select {...Object.assign({}, defaultSelectProps, selectProps)}/>;
  };

  const getUserSelectProps = (): $Shape<SelectProps> => {
    return {
      dataSource: async () => await dispatch(issueActivityActions.getWorkItemAuthors(getProjectRingId())),
      onSelect: (author: User) => {
        logEvent({
          message: 'SpentTime: form:set-author',
          analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
        });
        update({author});
        updateSelectVisibility(false);
      },
    };
  };

  const getWorkTypeSelectProps = (): $Shape<SelectProps> => {
    return {
      dataSource: async () => {
        const types: Array<WorkItemType> = await dispatch(issueActivityActions.getWorkItemTypes(draft.issue.project.id));
        return [draftDefault.type].concat(types);
      },
      onSelect: async (type: WorkItemType) => {
        logEvent({
          message: 'SpentTime: form:set-work-type',
          analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
        });
        update({type});
        updateSelectVisibility(false);
      },
    };
  };

  const onClose = () => {
    confirmation(i18n('Discard draft and close?'), i18n('Discard and close'))
      .then(() => {
        logEvent({
          message: 'SpentTime: form:cancel',
          analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
        });
        dispatch(issueActivityActions.deleteWorkItemDraft(getIssueId()));
        doHide();
      }).catch(() => null);
  };

  const onCreate = async () => {
    const {onAdd = () => {}} = props;
    logEvent({
      message: 'SpentTime: form:submit',
      analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
    });
    updateProgress(true);
    const updatedDraft: WorkItem = getDraft(draft);
    const item: ?WorkItem = await dispatch(issueActivityActions.createWorkItem(
      {
        ...updatedDraft,
        $type: props.workItem ? updatedDraft.$type : undefined,
      },
      getIssueId()
    ));
    updateProgress(false);
    const isWorkItem = hasType.work(item);
    if (isWorkItem) {
      onAdd();
      doHide();
    } else {
      updateError(true);
    }
  };

  const renderHeader = () => {
    const isSubmitDisabled: boolean = (
      !draft.date ||
      !draft.duration ||
      !draft.author ||
      !draft?.duration?.presentation
    );
    const submitIcon = (isProgress
      ? <ActivityIndicator color={styles.link.color}/>
      : <IconCheck size={20} color={isSubmitDisabled ? styles.disabled.color : styles.link.color}/>);

    return (
      <Header
        style={styles.elevation1}
        title={i18n('Spent time')}
        leftButton={<IconClose size={21} color={isProgress ? styles.disabled.color : styles.link.color}/>}
        onBack={() => !isProgress && onClose()}
        extraButton={(
          <TouchableOpacity
            hitSlop={HIT_SLOP}
            disabled={isSubmitDisabled}
            onPress={onCreate}
          >
            {submitIcon}
          </TouchableOpacity>
        )}
      />
    );
  };

  const buttonStyle: Array<ViewStyleProp> = [styles.feedbackFormInput, styles.feedbackFormType];
  const iconAngleRight = <IconAngleRight size={20} color={styles.icon.color}/>;
  const author: ?User = draft?.author || currentUser;

  const commonInputProps: Object = {
    autoCapitalize: 'none',
    selectTextOnFocus: true,
    autoCorrect: false,
    placeholderTextColor: styles.icon.color,
    keyboardAppearance: theme.uiTheme.name,
  };

  const renderDatePicker: () => void = (): void => {
    const isSplitModeView: boolean = isSplitView();
    const datePicker: any = <DatePicker
      current={draft.date}
      onDateSelect={(date: Date) => {
        update({date: date.getTime()});
        if (isSplitModeView) {
          updateModalChildren(null);
        } else {
          doHide();
        }
      }}
    />;

    if (isSplitModeView) {
      updateModalChildren(datePicker);
    } else {
      Router.PageModal({children: datePicker});
    }
  };

  return (
    <View style={styles.container}>
      {renderHeader()}

      <InputScrollView
        topOffset={styles.feedbackFormBottomIndent.height}
        multilineInputStyle={styles.feedbackFormText}
        style={styles.feedbackContainer}
      >
        <View style={styles.feedbackForm}>
          <TouchableOpacity
            style={buttonStyle}
            disabled={!props.canCreateNotOwn}
            onPress={() => {
              updateSelectProps(getUserSelectProps());
              updateSelectVisibility(true);
            }}
          >
            <Text style={styles.feedbackFormTextSup}>{i18n('Author')}</Text>
            <Text
              style={[styles.feedbackFormText, styles.feedbackFormTextMain]}
            >
              {getEntityPresentation(author)}
            </Text>
            {props.canCreateNotOwn && iconAngleRight}
          </TouchableOpacity>

          <TouchableOpacity
            style={buttonStyle}
            onPress={renderDatePicker}
          >
            <Text style={styles.feedbackFormTextSup}>{i18n('Date')}</Text>
            <Text
              style={[styles.feedbackFormText, styles.feedbackFormTextMain]}
            >
              {ytDate(draft.date, true)}
            </Text>
            {iconAngleRight}
          </TouchableOpacity>

          <View style={buttonStyle}>
            <Text style={[
              styles.feedbackFormTextSup,
              error && styles.feedbackFormTextError,
            ]}>{i18n('Spent time')}</Text>
            <TextInput
              {...commonInputProps}
              style={[styles.feedbackInput, styles.feedbackFormTextMain]}
              placeholder={i18n('1w 1d 1h 1m')}
              value={draft?.duration?.presentation}
              onChangeText={(periodValue: string) => updateDraftWorkItem(
                {...draft, duration: {presentation: periodValue}}
              )}
            />
          </View>
          {error && <Text style={styles.feedbackInputErrorHint}>{i18n('1w 1d 1h 1m')}</Text>}

          <TouchableOpacity
            style={buttonStyle}
            onPress={() => {
              updateSelectProps(getWorkTypeSelectProps());
              updateSelectVisibility(true);
            }}
          >
            <Text style={styles.feedbackFormTextSup}>{i18n('Type')}</Text>
            <Text
              style={[styles.feedbackFormText, styles.feedbackFormTextMain]}
              numberOfLines={1}
            >{draft?.type?.name || draftDefault.type?.name}</Text>
            {iconAngleRight}
          </TouchableOpacity>

          <TextInput
            {...commonInputProps}
            multiline
            textAlignVertical="top"
            style={[styles.feedbackFormInputDescription]}
            placeholder={i18n('Write a comment, @mention people')}
            value={draft?.text}
            onChangeText={(comment: string) => updateDraftWorkItem({...draft, text: comment})}
          />

          <View style={styles.feedbackFormBottomIndent}/>
        </View>
      </InputScrollView>
      {isSelectVisible && !!selectProps && renderSelect(selectProps)}

      {modalChildren && <ModalPortal onHide={() => updateModalChildren(null)}>
        {modalChildren}
      </ModalPortal>}
    </View>
  );
};

export default (memo<Props>(AddSpentTimeForm): React$AbstractComponent<Props, mixed>);
