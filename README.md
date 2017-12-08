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

预置安装
>
    1、[npm](https://www.npmjs.com)

    2、[up](https://up.docs.apex.sh)

快速上手
>
    1、配置./aws/credentials文件，以接入AWS平台
    2、使用【npm install】后，进一步执行【up】命令部署
    3、在aws云端控制台上调整由up创建的role的策略，以提供dynamodb等数据库资源的访问权限
    ps：若是对于AWS或UP的具体开发细节不清楚，请移至其官网进一步了解
    
功能特性
>
    1、集成koa服务
    2、集成koa-router路由中间件
    3、集成koa-body解析中间件，可解析JSON入参
    4、集成koa-xauth认证中间件，基于jwt令牌身份识别
    5、集成config配置，配置文件位于/config目录
    6、集成dynamodb操作基类，位于/model目录
    7、集成node8运行环境构建，ES7代码，部署后可兼容AWS的Lambda运行时(Node V6.1.0)

帮助联系
>
	作者:cheneyxu
	邮箱:457299596@qq.com
	QQ:457299596

更新日志
>
	2017.12.08:初版