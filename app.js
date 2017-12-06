// 系统配置参数
const config = require('config')
const port = config.server.port
// 应用服务相关
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const jwt = require('jsonwebtoken')
const xauth = require(__dirname + '/xauth_modules/koa-xauth/index.js')
// 日志相关
const log = require('tracer').colorConsole({ level: config.log.level })
// 路由相关
const Router = require('koa-router')
const router = new Router()

// 初始化应用服务
const app = new Koa()
app.use(bodyParser())

// 对路由进行认证初始化
xauth.init(router, config.auth)

// ===== 开始：用户认证中间件例子，‘/auth’已经配置白名单，‘/test’路由受保护 =====
// 1、模拟用户登录，生成加密TOKEN令牌
router.use('/auth', async function (ctx, next) {
    try {
        if (true) { // 判断用户名密码等认证方式，这里默认通过
            const tokenSign = await jwt.sign({ userId: '123', iat: Date.now() }, config.auth.secret)
            ctx.tokenSign = tokenSign // 向后面的路由传递TOKEN加密令牌
            next()
        } else {
            ctx.status = 401
            ctx.body = '用户名或密码错误'
        }
    } catch (error) {
        console.error(error)
        ctx.body = error
    }
})
// 2、向前端传递TOKEN加密令牌
router.get('/auth', async function (ctx, next) {
    ctx.body = ctx.tokenSign
})
// 3、下次其余路由需要在请求时在header中加上token参数，如果没有token或者token错误，xauth中间件会提示错误
router.get('/test', async function (ctx, next) {
    ctx.body = ctx.tokenVerify // 获取TOKEN解析结果
})
app.use(router.routes())
// ===== 结束：用户认证中间件例子，‘/auth’已经配置白名单，‘/test’路由受保护 =====

// 启动应用服务
app.listen(port)
log.info(`XAuth服务启动【执行环境:${process.env.NODE_ENV},端口:${port}】`)
log.info(`用户登录认证路径【GET】【localhost:${port}/auth】`)
log.info(`受保护的路由路径【GET】【localhost:${port}/test】`)