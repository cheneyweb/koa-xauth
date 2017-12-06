// 认证路由
const jwt = require('jsonwebtoken')
const log = require('tracer').colorConsole()

const xauth = {
    init(router, authConfig) {
        router.use(function (ctx, next) {
            try {
                // 非白名单，进入TOKEN校验
                if (authConfig.pass.indexOf(ctx.url) == -1) {
                    const tokenVerify = jwt.verify(ctx.header.token, authConfig.secret)
                    if (tokenVerify) {
                        ctx.tokenVerify = tokenVerify
                        next()
                    } else {
                        ctx.status = 401
                        ctx.body = errRes(authConfig.errMsg || '未认证')
                    }
                } else {
                    next()
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
