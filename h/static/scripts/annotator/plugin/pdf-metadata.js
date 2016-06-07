'use strict';

function PDFMetadata(PDFViewerApplication) {
  this._documentLoaded = new Promise(function(resolve) {
    var finish;
    finish = function(evt) {
      window.removeEventListener('documentload', finish);
      return resolve();
    };
    return window.addEventListener('documentload', finish);
  });
}

PDFMetadata.prototype.urn = function() {
  return this._documentLoaded.then(function() {
    return "urn:x-pdf:" + PDFViewerApplication.documentFingerprint;
  });
}

PDFMetadata.prototype.metadata = function() {
  return this._documentLoaded.then(function() {
    info = PDFViewerApplication.documentInfo
    metadata = PDFViewerApplication.metadata

    if ((typeof metadata !== "undefined" && metadata !== null ? metadata.has('dc:title') : void 0) && metadata.get('dc:title') !== 'Untitled') {
      title = metadata.get('dc:title');
    } else if (typeof info !== "undefined" && info !== null ? info['Title'] : void 0) {
      title = info['Title'];
    } else {
      title = document.title;
    }

    urn = "urn:x-pdf:" + PDFViewerApplication.documentFingerprint;
    link = [{href: urn}, {href: PDFViewerApplication.url}]
    documentFingerprint = PDFViewerApplication.documentFingerprint

    return {title, link, documentFingerprint}
  });
}

module.exports = PDFMetadata;
