"use strict";

(function BlurHash() {
  /**
   * Minified by jsDelivr using Terser v5.19.2.
   * Original file: /npm/fast-blurhash@1.1.2/index.js
   *
   * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
   */
  var digit =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~",
    decode83 = function decode83(o, r, e) {
      var n = 0;
      for (; r < e; ) (n *= 83), (n += digit.indexOf(o[r++]));
      return n;
    },
    pow = Math.pow,
    PI = Math.PI,
    PI2 = 2 * PI,
    d = 3294.6,
    e = 269.025,
    sRGBToLinear = function sRGBToLinear(o) {
      return o > 10.31475 ? pow(o / e + 0.052132, 2.4) : o / d;
    },
    linearTosRGB = function linearTosRGB(o) {
      return ~~(o > 1227e-8 ? e * pow(o, 0.416666) - 13.025 : o * d + 1);
    },
    signSqr = function signSqr(o) {
      return (o < 0 ? -1 : 1) * o * o;
    },
    fastCos = function fastCos(o) {
      for (o += PI / 2; o > PI; ) o -= PI2;
      var r = 1.27323954 * o - 0.405284735 * signSqr(o);
      return 0.225 * (signSqr(r) - r) + r;
    };
  function getBlurHashAverageColor(o) {
    var r = decode83(o, 2, 6);
    return [r >> 16, (r >> 8) & 255, 255 & r];
  }
  function decodeBlurHash(o, r, e, n) {
    var s = decode83(o, 0, 1),
      t = (s % 9) + 1,
      a = 1 + ~~(s / 9),
      i = t * a;
    var d = 0,
      c = 0,
      f = 0,
      l = 0,
      g = 0,
      u = 0,
      B = 0,
      I = 0,
      P = 0,
      p = 0,
      q = 0,
      w = 0,
      C = 0,
      G = 0;
    var R = ((decode83(o, 1, 2) + 1) / 13446) * (1 | n),
      S = new Float64Array(3 * i),
      T = getBlurHashAverageColor(o);
    for (d = 0; d < 3; d++) S[d] = sRGBToLinear(T[d]);
    for (d = 1; d < i; d++)
      (G = decode83(o, 4 + 2 * d, 6 + 2 * d)),
        (S[3 * d] = signSqr(~~(G / 361) - 9) * R),
        (S[3 * d + 1] = signSqr((~~(G / 19) % 19) - 9) * R),
        (S[3 * d + 2] = signSqr((G % 19) - 9) * R);
    var h = 4 * r,
      A = new Uint8ClampedArray(h * e);
    for (l = 0; l < e; l++)
      for (w = (PI * l) / e, f = 0; f < r; f++) {
        for (g = 0, u = 0, B = 0, C = (PI * f) / r, c = 0; c < a; c++)
          for (P = fastCos(w * c), d = 0; d < t; d++)
            (I = fastCos(C * d) * P),
              (p = 3 * (d + c * t)),
              (g += S[p] * I),
              (u += S[p + 1] * I),
              (B += S[p + 2] * I);
        (q = 4 * f + l * h),
          (A[q] = linearTosRGB(g)),
          (A[q + 1] = linearTosRGB(u)),
          (A[q + 2] = linearTosRGB(B)),
          (A[q + 3] = 255);
      }
    return A;
  }
  if (typeof window !== "undefined") {
    window.blurhash = {
      decodeBlurHash: decodeBlurHash,
    };
  }
})();
(function () {
  if (typeof window === "undefined") {
    return;
  }
  var appendStyles = function appendStyles(element, styles) {
    var currentStyle = element.getAttribute("style");
    var newStyles = "";
    if (currentStyle) {
      var hasSemicolon = currentStyle.endsWith(";");
      newStyles = currentStyle + hasSemicolon ? "" : ";";
    }
    newStyles += styles;
    element.setAttribute("style", newStyles);
  };
  var createResourceElement = function createResourceElement(contentStr) {
    var nElement = document.createElement("div");
    nElement.innerHTML = contentStr;
    nElement.classList.add("inner-wrap");
    return nElement;
  };
  var restore_fallback = function restore_fallback(element) {
    var contentStr = decodeURIComponent(element.dataset.content);
    element.appendChild(createResourceElement(contentStr));
  };
  var parseAltAttributes = function parseAltAttributes(string) {
    var obj = {};
    if (!string) {
      return "";
    }
    try {
      var placeholderImageRes = /\$placeholder=(\S+)=placeholder/gi.exec(
        string
      );
      if (placeholderImageRes && placeholderImageRes[1]) {
        obj.placeholderImage = placeholderImageRes[1];
      }
    } catch (e) {
      console.log(e);
    }
    return obj;
  };
  var initPlaceholder = function initPlaceholder(element) {
    var wrap = document.createElement("div");
    // prevent triggering load event
    var contentStr = decodeURIComponent(element.dataset.content).replace(
      "<img",
      "<div"
    );
    wrap.innerHTML = contentStr;
    var resourceElement = wrap.children[0];
    var altAttributes = parseAltAttributes(resourceElement.getAttribute("alt"));
    var placeholderImage =
      resourceElement.dataset.placeholderimg || altAttributes.placeholderImage;
    if (placeholderImage && /blurhash:/.test(placeholderImage)) {
      var createCanvas = function createCanvas() {
        var canvas = document.createElement("canvas");
        var width = 32;
        var height = 32;
        var pixels = blurhash.decodeBlurHash(
          placeholderImage.replace("blurhash:", ""),
          width,
          height
        );
        var ctx = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;
        var imageData = ctx.createImageData(width, height);
        imageData.data.set(pixels);
        ctx.putImageData(imageData, 0, 0);
        return canvas;
      };
      var cv = createCanvas();
      element.children[0].appendChild(cv);
    }
    element.dataset.content = element.dataset.content
      .replace(/%24placeholder%3D(\S+)%3Dplaceholder/gi, "")
      .replace(/%24aspect-ratio%3D(\S+)%3Daspect-ratio/gi, "");
  };
  var restoreContent = function restoreContent(element) {
    var contentStr = decodeURIComponent(element.dataset.content);
    var newElement = createResourceElement(contentStr);
    var initOnLoadEvent = function initOnLoadEvent(resourceElement) {
      resourceElement.children[0].onload = function () {
        setTimeout(function () {
          element.classList.add("loaded");
        }, 100);
        var errorElement = element.querySelectorAll(".error-wrap")[0];
        if (errorElement) {
          element.removeChild(errorElement);
        }
      };
      resourceElement.ontransitionend = function () {
        element.children[0].classList.add("loaded");
      };
      if (/<video/.test(contentStr)) {
        setTimeout(function () {
          element.classList.add("loaded");
        }, 100);
      }
    };
    var retry = function retry(e) {
      element.classList.remove("loaded");
      e.preventDefault();
      e.stopPropagation();
      var errorElement = element.querySelectorAll(".error-wrap")[0];
      if (errorElement) {
        element.removeChild(errorElement);
      }
      var resourceElement = element.children[1];
      element.removeChild(resourceElement);
      var regeneratedElement = createResourceElement(contentStr);
      initOnLoadEvent(regeneratedElement);
      initOnErrorEvent(regeneratedElement);
      element.appendChild(regeneratedElement);
    };
    var initOnErrorEvent = function initOnErrorEvent(resourceElement) {
      resourceElement.children[0].onerror = function () {
        var errorWrap = document.createElement("div");
        errorWrap.classList.add("error-wrap");
        var errorTip = document.createElement("span");
        errorTip.classList.add("error-tip");
        errorWrap.appendChild(errorTip);
        var button = document.createElement("button");
        button.innerText = "Retry";
        button.classList.add("retry-btn");
        button.onclick = retry;
        errorWrap.appendChild(button);
        element.appendChild(errorWrap);
      };
    };
    initOnLoadEvent(newElement);
    initOnErrorEvent(newElement);
    element.appendChild(newElement);
  };
  var createObserver = function createObserver(element) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.intersectionRatio >= window.$lazyload.intersectionRatio) {
            restoreContent(element);
            observer.disconnect();
          }
        });
      },
      {
        root: document,
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
      }
    );
    observer.observe(element);
  };
  var lazyloadItems = document.querySelectorAll(".lazyload-wrap");
  if (!window.IntersectionObserver) {
    for (var i = 0; i < lazyloadItems.length; i++) {
      var item = lazyloadItems[i];
      restore_fallback(item);
    }
    return;
  }
  for (var _i = 0; _i < lazyloadItems.length; _i++) {
    var item = lazyloadItems[_i];
    initPlaceholder(item);
    createObserver(item);
  }
})();
