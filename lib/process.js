"use strict";

function getElemAttributes(elemText) {
  // Regex to pick out start tag from start of element's HTML.
  var re_start_tag =
    /^<\w+\b(?:\s+[\w\-.:]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[\w\-.:]+))?)*\s*\/?>/;
  var start_tag = elemText.match(re_start_tag);
  start_tag = start_tag ? start_tag[0] : "";
  // Regex to pick out attribute name and (optional) value from start tag.
  var re_attribs =
    /\s+([\w\-.:]+)(\s*=\s*(?:"([^"]*)"|'([^']*)'|([\w\-.:]+)))?/g;
  var attribs = {}; // Store attribute name=value pairs in object.
  var match = re_attribs.exec(start_tag);
  while (match != null) {
    var attrib = match[1]; // Attribute name in $1.
    var value = match[1]; // Assume no value specified.
    if (match[2]) {
      // If match[2] is set, then attribute has a value.
      value = match[3]
        ? match[3] // Attribute value is in $3, $4 or $5.
        : match[4]
        ? match[4]
        : match[5];
    }
    attribs[attrib] = value;
    match = re_attribs.exec(start_tag);
  }
  return attribs;
}

function formatAttributes(str) {
  let res = {};
  let attributesObj = getElemAttributes(str);
  const styleAttr = attributesObj.style || "";

  const styleStringToObject = (input) => {
    var result = {},
      attributes = input.split(";");
    for (var i = 0; i < attributes.length; i++) {
      var entry = attributes[i].split(":");
      result[entry.splice(0, 1)[0].trim()] = entry.join(":").trim();
    }
    return result;
  };

  const getAspectRatio = (returnStr) => {
    let aspectRatio = "";
    let percentage = "";
    if (styleAttr) {
      const styleObj = styleStringToObject(
        styleAttr.replace(/style="(.*?)"/gi, "$1")
      );
      if (styleObj["aspect-ratio"]) {
        aspectRatio = styleObj["aspect-ratio"];
      }
    }
    const aspectRatioRes = /aspect-ratio=(\S+)=aspect-ratio/gi.exec(
      attributesObj.alt
    );
    if (aspectRatioRes && aspectRatioRes[1]) {
      aspectRatio = aspectRatioRes[1];
    }
    if (returnStr) {
      return aspectRatio;
    }
    if (aspectRatio) {
      if (/\//.test(aspectRatio)) {
        percentage =
          (
            (Number(aspectRatio.split("/")[1]) /
              Number(aspectRatio.split("/")[0])) *
            100
          ).toFixed(5) + "%";
      } else {
        percentage = 100 / Number(aspectRatio) + "%";
      }
    }
    return percentage;
  };

  const getPlaceholderImage = (returnStr) => {
    let placeholderImage = attributesObj["data-placeholderimg"] || "";
    var placeholderImageRes = /placeholder=(\S+)=placeholder/gi.exec(
      attributesObj.alt
    );
    if (placeholderImageRes && placeholderImageRes[1]) {
      placeholderImage = placeholderImageRes[1];
    }

    const isBlurHash = placeholderImage.startsWith("blurhash:");

    if (returnStr) {
      return isBlurHash ? "" : placeholderImage;
    }

    return isBlurHash
      ? ""
      : /http|data:image/.test(placeholderImage)
      ? `url(${placeholderImage})`
      : placeholderImage;
  };

  const getAltText = () => {
    let alt = (attributesObj.alt || "").trim().replace(/^alt$/, "");
    if (alt) {
      alt = alt
        .replace(/\$placeholder=(\S+)=placeholder/gi, "")
        .replace(/\$aspect-ratio=(\S+)=aspect-ratio/gi, "")
        .replace(/(\$)?no-lazy/, "");
    }
    return alt.trim();
  };

  res.alt = getAltText();
  res.paddingBottom = getAspectRatio();
  res.aspectRatioStr = getAspectRatio(true);
  res.placeholderImage = getPlaceholderImage();
  res.placeholderImageStr = getPlaceholderImage(true);
  res.style = styleAttr;
  return res;
}

const getformatedStr = (str, attrs) => {
  let formatedStr = str;
  let noScriptElementStr = str
    .replace(/\$placeholder=(\S+)=placeholder/gi, "")
    .replace(/\$aspect-ratio=(\S+)=aspect-ratio/gi, "")
    .replace(/(\$)?no-lazy/, "");

  const { placeholderImageStr, aspectRatioStr, style } = attrs;

  if (placeholderImageStr) {
    if (/data-placeholderimg/.test(formatedStr)) {
      formatedStr = formatedStr.replace(
        `data-placeholderimg="${placeholderImageStr}"`,
        ""
      );
      noScriptElementStr = noScriptElementStr.replace(
        `data-placeholderimg="${placeholderImageStr}"`,
        ""
      );
    }
    if (/\$placeholder=/.test(formatedStr)) {
      formatedStr = formatedStr.replace(
        `$placeholder=${placeholderImageStr}=placeholder`,
        ""
      );
      noScriptElementStr = noScriptElementStr.replace(
        `$placeholder=${placeholderImageStr}=placeholder`,
        ""
      );
    }
  }
  if (aspectRatioStr) {
    if (/\$aspect-ratio=/.test(formatedStr)) {
      formatedStr = formatedStr.replace(
        `$aspect-ratio=${aspectRatioStr}=aspect-ratio`,
        ""
      );
    }
  }
  if (style) {
    formatedStr = formatedStr.replace(`style="${style}"`, "");
  }
  return { formatedStr, noScriptElementStr };
};

function lazyProcess(htmlContent) {
  const theme = this.config.theme;
  const showAltText =
    this.config.lazyload.showAltText === undefined
      ? true
      : !!this.config.lazyload.showAltText;

  return htmlContent
    .replace(
      /<img(.*?)src="(.*?)"(.*?)(>|<\/img>)/gi,
      function (str, p1, src, attrStr) {
        if (/no-lazy/gi.test(str)) {
          return str.replace(/\$?no-lazy/, "");
        }

        const formatedAttributes = formatAttributes(str);
        const wrapStyle = formatedAttributes.style;

        let placeholerStyle = "";
        if (
          formatedAttributes.paddingBottom ||
          formatedAttributes.placeholderImage
        ) {
          placeholerStyle = `style="${
            formatedAttributes.paddingBottom
              ? `padding-bottom: ${formatedAttributes.paddingBottom};`
              : ""
          }${
            formatedAttributes.placeholderImage
              ? `background-image: ${formatedAttributes.placeholderImage}`
              : ""
          }"`;
        }

        const { formatedStr, noScriptElementStr } = getformatedStr(
          str,
          formatedAttributes
        );

        return `<span class="lazyload-outer-wrap" style="width: 100%;"><a class="gallery-item" href="${src}" target="_blank" rel="noopener" ${
          theme === "landscape" ? 'data-fancybox="gallery"' : ""
        }><noscript>${noScriptElementStr}</noscript><span class="lazyload-wrap" data-content="${encodeURIComponent(
          formatedStr
        )}" ${
          wrapStyle ? `style="${wrapStyle}"` : ""
        }><span class="placeholder" ${placeholerStyle}></span></span></a>${
          showAltText && formatedAttributes.alt
            ? `<span class="caption">${formatedAttributes.alt}</span>`
            : ``
        }</span>`;
      }
    )
    .replace(/<iframe(.*?)src="(.*?)"(.*?)<\/iframe>/gi, function (str) {
      if (/no-lazy/gi.test(str)) {
        return str;
      }
      const formatedAttributes = formatAttributes(str);
      const wrapStyle = formatedAttributes.style;
      let placeholerStyle = "";
      if (
        formatedAttributes.paddingBottom ||
        formatedAttributes.placeholderImage
      ) {
        placeholerStyle = `style="${
          formatedAttributes.paddingBottom
            ? `padding-bottom: ${formatedAttributes.paddingBottom};`
            : ""
        }${
          formatedAttributes.placeholderImage
            ? `background-image: ${formatedAttributes.placeholderImage}`
            : ""
        }"`;
      }
      const { formatedStr } = getformatedStr(
        str,
        formatedAttributes
      );

      return `<span class="lazyload-outer-wrap" style="width: 100%;"><span class="lazyload-wrap" data-content="${encodeURIComponent(
        formatedStr
      )}" ${wrapStyle ? `style="${wrapStyle}"` : ""}><span class="placeholder" ${placeholerStyle}></span></span><noscript>[This iframe content need to be loaded by JavaScript.]</noscript></span>`;
    })
    .replace(/<video([\S\s]*?)(<\/video>|\/>)/gi, function (str) {
      if (/no-lazy/gi.test(str)) {
        return str;
      }
      const formatedAttributes = formatAttributes(str);
      const wrapStyle = formatedAttributes.style;
      let placeholerStyle = "";
      if (
        formatedAttributes.paddingBottom ||
        formatedAttributes.placeholderImage
      ) {
        placeholerStyle = `style="${
          formatedAttributes.paddingBottom
            ? `padding-bottom: ${formatedAttributes.paddingBottom};`
            : ""
        }${
          formatedAttributes.placeholderImage
            ? `background-image: ${formatedAttributes.placeholderImage}`
            : ""
        }"`;
      }
      const { formatedStr, noScriptElementStr } = getformatedStr(
        str,
        formatedAttributes
      );

      return `<span class="lazyload-outer-wrap" style="width: 100%;"><span class="lazyload-wrap" data-content="${encodeURIComponent(
        formatedStr
      )}" ${wrapStyle ? `style="${wrapStyle}"` : ""}><span class="placeholder" ${placeholerStyle}></span></span><noscript>${noScriptElementStr}</noscript></span>`;
    });
}

module.exports.processPost = function (data) {
  data.content = lazyProcess.call(this, data.content);
  return data;
};

module.exports.processAll = function (data) {
  data = lazyProcess.call(this, data);
  return data;
};
