/* @flow */

import * as types from 'actions/action-types';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import OAuth2 from 'components/auth/oauth2';
import {createReducer} from 'redux-create-reducer';
import {issuePermissionsNull} from 'components/issue-permissions/issue-permissions-helper';

import type Auth from 'components/auth/oauth2';
import type {EndUserAgreement} from 'flow/AppConfig';
import type {NetInfoState} from '@react-native-community/netinfo';
import type {PermissionsStore} from 'components/permissions-store/permissions-store';
import type {StorageState} from 'components/storage/storage';
import type {User, UserAppearanceProfile, UserArticlesProfile} from 'flow/User';
import type {WorkTimeSettings} from 'flow/Work';

export type RootState = {
  auth: OAuth2 | null,
  showMenu: boolean,
  showDebugView: boolean,
  showUserAgreement: boolean,
  endUserAgreement: ?EndUserAgreement,
  otherAccounts: ?Array<StorageState>,
  isChangingAccount: boolean,
  features: Array<string>,
  workTimeSettings: WorkTimeSettings | {},
  user: User | null,
  issuePermissions: IssuePermissions,
  networkState: NetInfoState | null,
};

const initialState: RootState = {
  auth: null,
  showMenu: false,
  showDebugView: false,
  showUserAgreement: false,
  endUserAgreement: null,
  otherAccounts: null,
  isChangingAccount: false,
  features: [],
  workTimeSettings: {},
  user: null,
  issuePermissions: issuePermissionsNull,
};

export default (createReducer(initialState, {
  [types.INITIALIZE_AUTH](state: RootState, action: {auth: Auth}) {
    const {auth} = action;
    return {...state, auth};
  },
  [types.SET_PERMISSIONS](state: RootState, action: {permissionsStore: PermissionsStore, currentUser: User}) {
    const {permissionsStore, currentUser} = action;
    return {
      ...state,
      issuePermissions: new IssuePermissions(permissionsStore, currentUser),
    };
  },
  [types.LOG_OUT](state: RootState, action: Object = {}) {
    return {...state, auth: null};
  },
  [types.OPEN_MENU](state: RootState) {
    return {
      ...state,
      showMenu: true,
    };
  },
  [types.CLOSE_MENU](state: RootState) {
    return {
      ...state,
      showMenu: false,
    };
  },
  [types.OPEN_DEBUG_VIEW](state: RootState) {
    return {
      ...state,
      showDebugView: true,
    };
  },
  [types.CLOSE_DEBUG_VIEW](state: RootState) {
    return {
      ...state,
      showDebugView: false,
    };
  },
  [types.SET_FEATURES](state: RootState, action: {features: EndUserAgreement}) {
    return {
      ...state,
      features: action.features,
    };
  },
  [types.SHOW_USER_AGREEMENT](state: RootState, action: {agreement: EndUserAgreement}) {
    return {
      ...state,
      showUserAgreement: true,
      endUserAgreement: action.agreement,
    };
  },
  [types.HIDE_USER_AGREEMENT](state: RootState) {
    return {
      ...state,
      showUserAgreement: false,
      endUserAgreement: null,
    };
  },
  [types.RECEIVE_OTHER_ACCOUNTS](state: RootState, action: {otherAccounts: Array<StorageState>}) {
    return {...state, otherAccounts: action.otherAccounts};
  },
  [types.BEGIN_ACCOUNT_CHANGE](state: RootState, action: {otherAccounts: Array<StorageState>}) {
    return {...state, isChangingAccount: true};
  },
  [types.END_ACCOUNT_CHANGE](state: RootState, action: {otherAccounts: Array<StorageState>}) {
    return {...state, isChangingAccount: false};
  },
  [types.RECEIVE_WORK_TIME_SETTINGS](state: RootState, action: {workTimeSettings: WorkTimeSettings}) {
    return {...state, workTimeSettings: action.workTimeSettings};
  },
  [types.RECEIVE_USER](state: RootState, action: {user: User}) {
    return {
      ...state,
      ...{user: action.user},
    };
  },
  [types.RECEIVE_USER_APPEARANCE_PROFILE](state: RootState, action: {appearance: UserAppearanceProfile}) {
    const {user} = state;
    const _user = user || {profiles: {}};
    const updatedProfiles = Object.assign({}, _user.profiles || {}, {appearance: action.appearance});
    const updatedUser = {...state.user, ...{profiles: updatedProfiles}};
    return {
      ...state,
      ...{user: updatedUser},
    };
  },
  [types.RECEIVE_USER_ARTICLES_PROFILE](state: RootState, action: {articles: UserArticlesProfile}) {
    const {user} = state;
    const _user = user || {profiles: {}};
    const updatedProfiles = Object.assign({}, _user.profiles || {}, {articles: action.articles});
    const updatedUser = {...state.user, ...{profiles: updatedProfiles}};
    return {
      ...state,
      ...{user: updatedUser},
    };
  },
  [types.SET_NETWORK](state: RootState, action: {networkState: NetInfoState}) {
    return {
      ...state,
      networkState: action.networkState,
    };
  },
}): any);
