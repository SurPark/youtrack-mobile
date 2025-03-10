/* @flow */

export const hasMimeType = (function(mimeType: string): ((file: any) => any | boolean) {
  return function(file: Object) {
    return mimeType && file && file.mimeType ? file.mimeType.includes(mimeType) : false;
  };
}: any);

hasMimeType.svg = hasMimeType('image/svg+xml');

hasMimeType.image = (file) => !hasMimeType.svg(file) && hasMimeType('image/')(file) && !hasMimeType('/targa')(file);

hasMimeType.pdf = hasMimeType('application/pdf');

hasMimeType.video = hasMimeType('video/');
hasMimeType.audio = hasMimeType('audio/');

hasMimeType.previewable = (file) => hasMimeType.image(file) || hasMimeType.svg(file);
