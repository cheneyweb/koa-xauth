# koa-xauth
Node后端微服务框架，基于koa-xauth中间件，TOKEN令牌式身份认证集成

[传送门：XServer官网文档](http://www.xserver.top)

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
```js
    1、const xauth = require('koa-xauth')
    2、app.use(xauth())
    3、router.get('/test', async (ctx, next) => {
        ctx.body = ctx.tokenVerify  // [ctx.tokenVerify]是token解析后的对象
    })
```

配置说明
>
    在/config/default.json中，有如下配置
```json
"auth": {
        "secret": "cheneyweb",  #必须，TOKEN密钥
        "tokenname": "token",   #可选，header中请求的TOKEN键名，默认为"token"
        "pass": ["/auth"],      #可选，白名单路由数组，正则匹配，默认为空
        "role":{                #可选，角色拥有路由权限数组，正则匹配（启用该功能需要在token中增加role属性），默认不开启
            "admin":[".*"],     
            "financialAdmin":["/financial/*"],
            "financialManager":["/financial/test1","/financial/test2"],
            "financialStaff":["GET:/financial/test1","POST:/financial/test2"]
        },
        "mutex": true,          #可选，是否单点登录，TOKEN的KEY默认使用token.role+token.id
        "cors": true,           #可选，是否直接放行OPTIONS跨域检测，默认false
        "errMsg": "未认证",      #可选，错误提示信息，默认“未认证”
        "errStatus": 401        #可选，认证失败返回HTTP状态码，默认401
    }
```

帮助联系
>
	作者:cheneyxu
	邮箱:457299596@qq.com
	QQ:457299596

更新日志
>
	2017.12.08:初版
    2017.12.09:修改中间件实现方式
    2017.12.12:增加角色路由权限控制
    2018.01.07:放行OPTIONS跨域请求
    2018.01.10:可配置OPTIONS跨域请求，优化白名单性能
    2018.01.29:更新依赖，丰富配置项
    2018.03.07:增加自定义错误处理
    2019.01.15:所有依赖更新
    2019.07.10:所有依赖更新
    2020.02.03:增加单点登录
    2020.07.01:更新依赖