# koa-xauth
Node后端微服务框架，基于koa-xauth中间件，TOKEN令牌式身份认证集成

[传送门：XServer官网文档](http://xserver.top)

框架目录结构
>
    ├── app.js
    ├── config
    │   ├── default.json
    │   ├── develop.json
    │   └── production.json
    ├── node_modules
    ├── package.json
    └── xauth_modules
        └── koa-xauth

快速上手
>
    1、const xauth = require('xauth')
    2、app.use(xauth())

帮助联系
>
	作者:cheneyxu
	邮箱:457299596@qq.com
	QQ:457299596

更新日志
>
	2017.12.08:初版
    2017.12.09:修改中间件实现方式