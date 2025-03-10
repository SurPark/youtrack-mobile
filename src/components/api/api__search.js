/* @flow */

import qs from 'qs';

import ApiBase from './api__base';
import ApiHelper from './api__helper';

import type Auth from '../auth/oauth2';
import type {Folder} from 'flow/User';
import type {ServersideSuggestion, ServersideSuggestionLegacy, TransformedSuggestion} from 'flow/Issue';


export default class SearchAPI extends ApiBase {
  constructor(auth: Auth) {
    super(auth);
  }

  async getSearchSuggestions(payload: ?Object = null): Promise<any> {
    const queryString: string = ApiBase.createFieldsQuery(
      {
        query: '',
        sortProperties: [
          '$type',
          'id',
          'asc',
          'readOnly',
          'localizedName',
          {sortField: ['$type', 'id', 'localizedName', 'name', 'defaultSortAsc', 'sortablePresentation']},
          {folder: ['id']},
        ],
      },
      null,
      {encode: false}
    );
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/search/assist/?${queryString}`,
      'POST',
      payload
    );
  }


  async getQueryAssistSuggestions(query: string, caret: number, folders: Array<Folder> | null = null): Promise<Array<TransformedSuggestion>> {
    const response: { suggestions: Array<ServersideSuggestion> } = await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/search/assist?fields=caret,query,suggestions(auxiliaryIcon,caret,className,completionEnd,completionStart,description,group,icon,matchingEnd,matchingStart,option,prefix,suffix)`,
      'POST',
      {
        caret,
        folders,
        query,
      }
    );
    return ApiHelper.convertQueryAssistSuggestions(response.suggestions);
  }

  async getQueryAssistSuggestionsLegacy(query: string, caret: number): Promise<Array<TransformedSuggestion>> {
    const queryString = qs.stringify({
      query,
      caret,
    });
    const response: { suggest: { items: Array<ServersideSuggestionLegacy> } } = await this.makeAuthorizedRequest(
      `${this.youTrackUrl}/rest/search/underlineAndSuggest?${queryString}`
    );
    return ApiHelper.convertQueryAssistSuggestionsLegacy(response.suggest.items);
  }
}
