# iconfont-extract

## usage 

```shell
npm install --save-dev iconfont-extract
```

create iconfont-extract-config.js

```js
module.exports = {
    url: "http://at.alicdn.com/t/c/font_3216871_4g87m8dpt9c.js",
}
```

add script
```json
{
  "scripts": {
    "icons": "iconfont-extract"
  },
}
```

execute command

```shell
npm run icons
```