const jwt = require('jsonwebtoken')
const log = require('tracer').colorConsole()

global._tokenMap = {}

module.exports = function (authConfig = {}, tokenRule, errorProcess) {
    return function xauth(ctx, next) {
        authConfig.tokenname = authConfig.tokenname || 'token'
        authConfig.pass = authConfig.pass || []
        authConfig.errMsg = authConfig.errMsg || '未认证'
        authConfig.errStatus = authConfig.errStatus || 401
        authConfig.errMutexMsg = authConfig.errMutexMsg || '身份已过期，请重新登录'

        // 是否放行跨域OPTIONS请求
        if (authConfig.pass.cors && ctx.method == 'OPTIONS') {
            return next()
        }
        // 白名单内，进行标记
        let isPass = false
        if (authConfig.pass && authConfig.pass instanceof Array && authConfig.pass.length > 0) {
            for (let p of authConfig.pass) {
                const rep = new RegExp(p)
                if (rep.test(ctx.url)) {
                    isPass = true
                    break
                }
            }
        }
        // 从请求中获取TOKEN令牌
        let token = ctx.header[authConfig.tokenname] || ctx.header.token
        if (tokenRule) {
            token = tokenRule(token)
        }
        // 白名单，且无token，直接通过返回
        if (isPass && !token) {
            return next()
        }
        // 进行校验
        try {
            const tokenVerify = jwt.verify(token, authConfig.secret)
            if (isPass) {
                ctx.tokenVerify = tokenVerify
                return next()
            }
            if (tokenVerify) {
                // 判断是否单点登录
                if (authConfig.mutex) {
                    let tokenKey = `${tokenVerify.role}${tokenVerify.id}`
                    // 内存中没有这个TOKEN，则直接赋值
                    if (!_tokenMap[tokenKey] || _tokenMap[tokenKey].iat < tokenVerify.iat) {
                        _tokenMap[tokenKey] = tokenVerify
                    }
                    // 检查传入TOKEN和内存中的TOKEN是否一致
                    if (_tokenMap[tokenKey].iat > tokenVerify.iat) {
                        ctx.status = authConfig.errStatus
                        throw { res: authConfig.errMutexMsg }
                    }
                }
                // 未配置角色控制，跳过
                if (!authConfig.role) {
                    ctx.tokenVerify = tokenVerify
                    return next()
                }
                // 已配置角色控制，则进一步进行角色身份检查，遍历角色所拥有的路由规则
                let roleRegArr = tokenVerify.role ? authConfig.role[tokenVerify.role] : null
                if (roleRegArr && roleRegArr instanceof Array && roleRegArr.length > 0) {
                    for (let item of roleRegArr) {
                        // 首先判断请求method是否匹配
                        if (item.indexOf(':') > 0) {
                            let itemArr = item.split(':')
                            if (itemArr[0] != ctx.method) {
                                continue
                            }
                            item = itemArr[1]
                        }
                        // 其次判断请求url是否匹配
                        const re = new RegExp(item)
                        if (re.test(ctx.url)) {
                            ctx.tokenVerify = tokenVerify
                            return next()
                        }
                    }
                    // 失败：所有路由规则循环完毕均不能匹配
                    throw { res: `角色[${tokenVerify.role}]未拥有访问权限` }
                }
                // 失败：角色拥有路由规则为空
                else {
                    throw { res: `角色[${tokenVerify.role}]未配置访问权限` }
                }
            }
            // 失败：TOKEN解析失败
            else {
                throw { res: authConfig.errMsg }
            }
        } catch (error) {
            // 白名单接口忽略错误
            if (isPass) {
                return next()
            }
            ctx.status = authConfig.errStatus
            ctx.body = { err: true, ...error }
            log.error(error)
            // 额外可选错误处理
            if (errorProcess && typeof (errorProcess) == 'function') {
                errorProcess(ctx)
            }
        }
    }
}