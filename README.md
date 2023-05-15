# iconfont-extract

## usage 

Install with npm:
```shell
npm install --save-dev iconfont-extract
```

add **iconfont-extract-config.js**

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

## options 
+ **url**: icontfont js address of the generated icon library.
+ **outDir**: output dir.
+ **prefix**: The prefix of the generated components.