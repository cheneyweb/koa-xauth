// 认证路由
const jwt = require('jsonwebtoken')
const log = require('tracer').colorConsole()

const xauth = {
    async init(router, authConfig) {
        router.use(async function (ctx, next) {
            try {
                // 非白名单，进入TOKEN校验
                if (authConfig.pass.indexOf(ctx.url) == -1) {
                    const tokenVerify = await jwt.verify(ctx.header.token, authConfig.secret)
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
