const fs = require("hexo-fs");
const UglifyJS = require("uglify-js");
const lazyLoadPath = __dirname + "/client.js";

module.exports.injectScript = function (htmlContent) {
  const loadingImage =
    this.config.lazyload.loadingImg ||
    "https://i.loli.wiki/public/240207/loading.svg";
  const errorTipImage =
    this.config.lazyload.errorTipImage ||
    "https://i.loli.wiki/public/240201/error-tip.svg";
  const intersectionRatio = this.config.lazyload.intersectionRatio || 0.25;
  const placeholderRatio = this.config.lazyload.placeholderRatio || 3 / 2;
  const showTransition =
    this.config.lazyload.showTransition !== undefined
      ? this.config.lazyload.showTransition
      : true;

  const placeholderImage = /http/.test(loadingImage)
    ? `url(${loadingImage})`
    : loadingImage;

  const injectedStyles = `.lazyload-outer-wrap .caption{
    width: 100%;
    text-align: center;
    display: block;
  }
  .lazyload-outer-wrap{
    display: block;
    margin-top: 1em;
    margin-bottom: 1em;
  }
  .lazyload-wrap {
    position: relative;
    display: block;
  }
  .lazyload-wrap .placeholder {
    width: 100%;
    height: 0;
    display: block;
    padding-bottom: ${(100 / Number(placeholderRatio)).toFixed(5)}%;
    background-size: 100% 100%;
    ${loadingImage ? `background-image: ${placeholderImage};` : ""}
  }
  .lazyload-wrap .placeholder canvas{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .lazyload-wrap .inner-wrap, .lazyload-wrap .error-wrap{
    opacity: 0;
    ${showTransition ? "transition: opacity ease-in-out 0.3s;" : ""}
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
  .lazyload-wrap .inner-wrap.loaded{
    opacity: 1;
  }
  .lazyload-wrap img{
    object-fit: contain;
    display: block;
    margin: 0 auto !important;
    height: 100% !important;
  }
  .lazyload-wrap img, .lazyload-wrap iframe, .lazyload-wrap video {
    border-radius: 0.1em;
  }
  .lazyload-wrap .placeholder.loaded {
    background-image: none !important;
    background-color: unset !important;
  }
  .lazyload-wrap.loaded .inner-wrap {
    opacity: 1;
  }
  .lazyload-wrap .error-wrap{
    background-color: #f5f5f5;
    opacity: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .lazyload-wrap .error-wrap .error-tip{
    width: 20em;
    height: 5.35em;
    background-size: cover;
    background-image: url(${errorTipImage});
  }
  .lazyload-wrap .error-wrap .retry-btn{
    margin-top: 2em;
    background-image: linear-gradient(#f7f8fa ,#e7e9ec);
    border-color: #adb1b8 #a2a6ac #8d9096;
    border-style: solid;
    border-width: 1px;
    border-radius: 3px;
    box-shadow: rgba(255,255,255,.6) 0 1px 0 inset;
    box-sizing: border-box;
    color: #0f1111;
    display: inline-block;
    font-family: "Amazon Ember",Arial,sans-serif;
    font-size: 14px;
    height: 29px;
    font-size: 13px;
    outline: 0;
    overflow: hidden;
    padding: 0 11px;
    text-align: center;
  }`;

  let settingsContent = `
  <script>
  var $lazyload = {
    intersectionRatio: ${intersectionRatio}
 }
 </script>
  `;

  const injectExtraScript = function (filePath) {
    if (!fs.exists(filePath)) throw new TypeError(filePath + " not found!");
    const sourceCode = fs.readFileSync(filePath, { escape: true });
    return "<script>" + UglifyJS.minify(sourceCode).code + "</script>";
  };
  const appendToHead = function (content, htmlContent) {
    const lastIndex = htmlContent.lastIndexOf("</head>");
    return (
      htmlContent.substring(0, lastIndex) +
      content +
      htmlContent.substring(lastIndex, htmlContent.length)
    );
  };
  const appendScript = function (content, htmlContent) {
    const lastIndex = htmlContent.lastIndexOf("</body>");
    return (
      htmlContent.substring(0, lastIndex) +
      content +
      htmlContent.substring(lastIndex, htmlContent.length)
    );
  };
  const appendToBody = function (content, htmlContent) {
    const lastIndex = htmlContent.indexOf("<div");
    return (
      htmlContent.substring(0, lastIndex) +
      content +
      htmlContent.substring(lastIndex, htmlContent.length)
    );
  };
  if (/<\/body>/gi.test(htmlContent)) {
    htmlContent = appendToHead(
      "<style>" + injectedStyles + "</style>",
      htmlContent
    );
    htmlContent = appendToHead(
      settingsContent,
      htmlContent
    );
    htmlContent = appendToHead(
      `<link rel="preload" as="image" href="${loadingImage}" />`,
      htmlContent
    );
    htmlContent = appendToHead(
      `<link rel="preload" as="image" href="${errorTipImage}" />`,
      htmlContent
    );
    htmlContent = appendScript(injectExtraScript(lazyLoadPath), htmlContent);
    htmlContent = appendToBody(
      "<noscript><style>.lazyload-wrap .placeholder {display: none;}</style></noscript>",
      htmlContent
    );
  }
  return htmlContent;
};
