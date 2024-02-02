## hexo-lazyload-element

## Description

**hexo-lazyload-image** is a plugin for lazyloading elements in post. Implement lazyloading with `Intersection Observer`.

\*for browsers not support `Intersection Observer` , lazy load is not woking due to I did not integrate polyfill in this plugin to avoid unnecessary script size.

**[DEMO](https://lynanbreeze.github.io/hexo-lazyload-element/)**

## Features

1. Lazy load for img, video, and iframe
2. Support Blurhash/Gradient CSS attribute for a placeholder image
3. Error tip and retry button to reload the resource
4. Different syntaxes supported
5. Support for RSS readers
6. Support for JavaScript-disabled browsers

## Install

```
npm intsall hexo-lazyload-element -S
```

## Usage

### 1. Enable lazyload in `_config.yml`

```yml _config.yml
lazyload:
  enable: true
  # loadingImg: http://xxx.xxx.com/xxx.jpg, optional, default is https://i.loli.wiki/public/240201/loading.svg
  # intersectionRatio: 0.33 # optional, default is 0.25
  # placeholderRatio: 1.5 # optional, default is 1.5 (3/2)
  #	showTransition: false # optional, default is true
  #	errorTipImage: http://xxx.xxx.com/xxx.jpg # optional, default is https://i.loli.wiki/public/240201/error-tip.svg
```

### 2. Rebuild && Deploy

```
npm run clean && npm run build
```

## Elements syntax for lazy loading

### 1. Standard markdown image

```markdown
![](https://abc.com/def.jpg)
```

### 2. Img element

```markdown
<img src="https://abc.com/def.jpg" alt="def">
```

### 3. Video Element

```markdown
<video src="https://abc.com/def.mp4">
```

### 4. Iframe element

```markdown
<iframe src="htttps://baidu.com"></iframe>
```

### Attributes

### no lazyload

`no-lazy` or `$no-lazy` in alt attribute.

```markdown
![no-lazy](https://abc.com/def.jpg)
```

```markdown
![This is a image $no-lazy](https://abc.com/def.jpg)
```

Or

```markdown
<img no-lazy src="https://abc.com/def.jpg" alt="def">
```

### Placeholder image

Supports <url>/<gradient>/blurhash.

`$placeholder=...=placeholder` in `[]`

```markdown
![$placeholder=blurhash:Lb0V#qelf,flg+e-f6flg4g4f5fl=placeholder](https://pic.imgdb.cn/item/65558655c458853aef97be96.jpg)
```

Or use `placeholderimg` attribute

```markdown
<img src="https://pic.imgdb.cn/item/65558655c458853aef97be96.jpg" data-placeholderimg="blurhash:Lb0V#qelf,flg+e-f6flg4g4f5fl">
```

### Aspect-ratio

`$aspect-ratio=...=aspect-ratio` in `[]`

```markdown
![$aspect-ratio=3/2=aspect-ratio](https://pic.imgdb.cn/item/65558655c458853aef97be96.jpg)
```

Or use `style`

```markdown
<img src="https://pic.imgdb.cn/item/65558655c458853aef97be96.jpg" style="aspect-ratio: 3/2">
```
