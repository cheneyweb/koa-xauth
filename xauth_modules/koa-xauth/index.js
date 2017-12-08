const jwt = require('jsonwebtoken')
const log = require('tracer').colorConsole()

module.exports = function (authConfig = {}, tokenRule) {
    return function xauth(ctx, next) {
        authConfig.tokenname = authConfig.tokenname || 'token'
        authConfig.pass = authConfig.pass || []
        authConfig.errMsg = authConfig.errMsg || '未认证'
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
                    ctx.body = { err: true, res: authConfig.errMsg }
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
    }
}