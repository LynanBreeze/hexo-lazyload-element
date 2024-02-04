"use strict";

function lazyProcess(htmlContent) {
  const theme = this.config.theme;
  const showAltText = !!this.config.lazyload.showAltText;

  return htmlContent
    .replace(
      /<img(.*?)src="(.*?)"(.*?)(>|<\/img>)/gi,
      function (str, p1, src, attrStr) {
        if (/no-lazy/gi.test(str)) {
          return str.replace(/\$?no-lazy/, "");
        }

        let alt = "";
        if (showAltText) {
          const attributesArr = str.match(
            /([\w|data-|no-]+)(=["']?((?:.(?!["']?\s+(?:\S+)=|\s*\/?[>"']))+.)["']?)?/gi
          );
          alt = attributesArr.find(
            (attr) => attr.startsWith("alt") && attr !== "alt"
          );
          if (alt) {
            alt = alt
              .replace(/alt="(.*?)"/gi, "$1")
              .replace(/alt="(.*?)/gi, "$1")
              .replace(/\$placeholder=(\S+)=placeholder/gi, "")
              .replace(/\$aspect-ratio=(\S+)=aspect-ratio/gi, "")
              .replace(/(\$)?no-lazy/, "");
          }
        }

        const noScriptElement = str
          .replace(/\$placeholder=(\S+)=placeholder/gi, "")
          .replace(/\$aspect-ratio=(\S+)=aspect-ratio/gi, "")
          .replace(/(\$)?no-lazy/, "");

        return `<span class="lazyload-outer-wrap" style="width: 100%;"><a class="gallery-item" href="${src}" target="_blank" rel="noopener" ${
          theme === "landscape" ? 'data-fancybox="gallery"' : ""
        }><noscript>${noScriptElement}</noscript><span class="lazyload-wrap" data-content="${encodeURIComponent(
          str
        )}"><span class="placeholder"></span></span></a>${
          showAltText && alt ? `<span class="caption">${alt}</span>` : ``
        }</span>`;
      }
    )
    .replace(/<iframe(.*?)src="(.*?)"(.*?)<\/iframe>/gi, function (str) {
      if (/no-lazy/gi.test(str)) {
        return str;
      }
      return `<span class="lazyload-outer-wrap" style="width: 100%;"><span class="lazyload-wrap" data-content="${encodeURIComponent(
        str
      )}"><span class="placeholder"></span></span><noscript>This iframe content need to be loaded by JavaScript.</noscript></span>`;
    })
    .replace(/<video([\S\s]*?)(<\/video>|\/>)/gi, function (str) {
      if (/no-lazy/gi.test(str)) {
        return str;
      }
      return `<span class="lazyload-outer-wrap" style="width: 100%;"><span class="lazyload-wrap" data-content="${encodeURIComponent(
        str
      )}"><span class="placeholder"></span></span><noscript>${str}</noscript></span>`;
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
