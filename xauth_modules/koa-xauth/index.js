// 认证路由
const jwt = require('jsonwebtoken')
const log = require('tracer').colorConsole()

const xauth = {
    /**
     * 初始化认证
     * @param {*} router 需要保护的路由
     * @param {*} authConfig 认证配置
     * @param {*} tokenRule 解析TOKEN方法
     */
    init(router, authConfig, tokenRule) {
        router.use(function (ctx, next) {
            try {
                let token = ctx.header[authConfig.tokenname] || ctx.header.token
                if (tokenRule) {
                    token = tokenRule(token)
                }
                // 非白名单，进入TOKEN校验
                if (authConfig.pass.indexOf(ctx.url) == -1) {
                    const tokenVerify = jwt.verify(token, authConfig.secret)
                    if (tokenVerify) {
                        ctx.tokenVerify = tokenVerify
                        return next()
                    } else {
                        ctx.status = 401
                        ctx.body = errRes(authConfig.errMsg || '未认证')
                    }
                }
                // 白名单内，直接返回
                else {
                    return next()
                }
            } catch (error) {
                log.error(error)
                ctx.status = 401
                ctx.body = error
            }
        })
    }
}
function errRes(res) {
    return { err: true, res: res }
}

module.exports = xauth
