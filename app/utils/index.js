import ENV from 'papermerge/config/environment';


function group_perms_by_model(permissions) {
  /*
    Groups an array of permissions objects by model.

    `permissions` is an array of objects, each of which contains `content_type` attribute
    which in turn has a `model` attribute.
    Example:
      Input: [
        {attr_1x, attr_2x, content_type: {model: m1}},
        {attr_1y, attr_2y, content_type: {model: m1}},
        {attr_1z, attr_2z, content_type: {model: m1}},
        {attr_1w, attr_2w, content_type: {model: m2}}
      ]

      Output:
        [
          {
            model: m1,
            perms: [
              {attr_1x, attr_2x, content_type: {model: m1}},
              {attr_1y, attr_2y, content_type: {model: m1}},
              {attr_1z, attr_2z, content_type: {model: m1}},
            ]
          },
          {
            model: m2,
            perms: [
              {attr_1w, attr_2w, content_type: {model: m2}},
            ]
          },
        ]
  */
  let groups = permissions.map((item) => item.content_type.get('model')),
    result = [];

  groups = new Set(groups);

  groups.forEach((model) => {
    let perms = permissions.filter(
      (item) => item.content_type.get('model') === model
    );
    result.push({ model, perms }); // same as result.push({mode: model, perms: perms})
  });

  return result;
}

function are_sets_equal(set1, set2) {
  /*
    Returns `true` if given sets are equal and `false` otherwise.

    `set1` and `set2` are expected to be instances of javascript `Set`
    class.
  */
  let same_size, same_values;

  same_size = (a, b) => a.size === b.size;
  same_values = (a, b) => [...a].every((value) => b.has(value));

  return same_size(set1, set2) && same_values(set1, set2);
}

function base_url() {
  /*
  Returns backend's REST API base url

  Notice there is no `/` at the end of returned string.
  */
  let base = `${window.location.protocol}:/${window.location.host}`;

  if (!ENV.APP.HOST) {

    if (!ENV.APP.NAMESPACE) {
      return base;
    }

    return `${base}/${ENV.APP.NAMESPACE}`;
  }

  if (!ENV.APP.NAMESPACE) {
    return `${ENV.APP.HOST}`;
  }

  return `${ENV.APP.HOST}/${ENV.APP.NAMESPACE}`;
}

function ws_base_url() {
  /*
  websockets base url
  */
  let base = `ws://${window.location.host}`;

  if (window.location.protocol == "https:") {
    base = `wss://${window.location.host}`;
  }

  if (!ENV.APP.WS_HOST) {

    if (!ENV.APP.WS_NAMESPACE) {
      return base;
    }

    return `${base}/${ENV.APP.WS_NAMESPACE}`;
  }

  if (!ENV.APP.WS_NAMESPACE) {
    return `${ENV.APP.WS_HOST}`;
  }

  return `${ENV.APP.WS_HOST}/${ENV.APP.WS_NAMESPACE}`;
}

/**
 * Extracts file name from a response with accessible Content-Disposition header
 */
function extract_file_name(response, fallback) {
  let file_name = fallback,
    content_disp,
    match;

  content_disp = response.headers.get('content-disposition');

  if (content_disp) {
    match = content_disp.match('filename=(.*)$');
    if (match) {
      file_name = match[1];
    }
  } else {
    console.warn('Could not read content disposition header');
    console.warn('Returning default file name');
  }

  return file_name;
}

/**
 * Insert a blob data into DOM and prompt use to download it
 */
function insert_blob(file_name, blob) {
  let url, a;

  url = window.URL.createObjectURL(blob);
  a = document.createElement('a');
  a.href = url;
  a.download = file_name;
  // we need to append the element to the dom -> otherwise it will not
  // work in firefox
  document.body.appendChild(a);
  a.click();
  //afterwards we remove the element again
  a.remove();
}

export {
  group_perms_by_model,
  are_sets_equal,
  base_url,
  ws_base_url,
  insert_blob,
  extract_file_name
};
