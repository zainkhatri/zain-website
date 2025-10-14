(function () {
  if (typeof window === 'undefined') {
    return;
  }

  var key = '%REACT_APP_UNSPLASH_ACCESS_KEY%';

  if (!key || key === '%REACT_APP_UNSPLASH_ACCESS_KEY%') {
    return;
  }

  window.REACT_APP_UNSPLASH_ACCESS_KEY = key;
  window.VITE_UNSPLASH_ACCESS_KEY = key;
  window.UNSPLASH_ACCESS_KEY = key;
})();
