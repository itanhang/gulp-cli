## 关于

#### gulp-cli 前端自动化构建 Web 项目。

- 监听文件更改打包，并自动刷新页面
- 使用babel编译器，将ES6代码转为ES5代码
- include 公共 html 模板文件
- less 样式预处理编译成 css 文件
- jpg、png 图片自动压缩，合成雪碧图

## 开始

```bash
# install dependencies
npm install

# serve with hot reload at localhost:3000
gulp
```

## 目录 & 说明

```
├── src                       根目录
│   ├── include               公共 html
│   ├── pages                 html 静态文件
│   ├── sprite                合成雪碧图的图片
│   └── static                静态资源
│       ├── css               css
│       ├── images            images
│       └── js                js
├── gulpfile.js               GulpJS 配置文件
└── package.json              package.json
```
