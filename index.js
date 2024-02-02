"use strict";
if (!hexo.config.lazyload || !hexo.config.lazyload.enable) {
  return;
}
hexo.extend.filter.register(
  "after_post_render",
  require("./lib/process").processPost
);
hexo.extend.filter.register(
  "after_render:html",
  require("./lib/inject").injectScript
);
