/* eslint-disable no-throw-literal */
const jwt = require('jsonwebtoken')
const log = require('tracer').colorConsole()

global._tokenMap = {}

module.exports = function (authConfig = {}, tokenRule, errorProcess) {
  authConfig.tokenname = authConfig.tokenname || 'token'
  authConfig.pass = authConfig.pass || []
  authConfig.errMsg = authConfig.errMsg || '未认证'
  authConfig.errStatus = authConfig.errStatus || 401
  authConfig.errMutexMsg = authConfig.errMutexMsg || '身份已过期，请重新登录'

  /* 预先创建rules的正则表达式 */

  /**
   * @type {RegExp[]} 白名单正则表达式列表
   */
  let passRegList = []
  if (authConfig.pass && Array.isArray(authConfig.pass)) {
    passRegList = authConfig.pass.map(it => new RegExp(it))
  }

  /**
   * @type {{[role:string]: {method: string, reg: RegExp}[]}}
   * 每个角色的正则表达式列表
   */
  const roleRegMap = {}
  if (authConfig.role) {
    Reflect.ownKeys(authConfig.role).forEach(key => {
      if (Array.isArray(authConfig.role[key])) {
        const roleConf = authConfig.role[key].map(p => {
          if (p.indexOf(':') > -1) {
            const [method, path] = p.split(':')
            return { method, reg: new RegExp(path) }
          } else {
            return { method: null, reg: new RegExp(p) }
          }
        })
        roleRegMap[key] = roleConf
      }
    })
  }

  return function xauth (ctx, next) {
    // 是否放行跨域OPTIONS请求
    if (authConfig.cors && ctx.method === 'OPTIONS') {
      return next()
    }

    // 白名单内，进行标记
    let isPass = false
    if (passRegList.length > 0) {
      if (passRegList.find(reg => reg.test(ctx.url))) {
        isPass = true
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
          const tokenKey = `${tokenVerify.role}${tokenVerify.id}`
          // 内存中没有这个TOKEN，则直接赋值
          if (!global._tokenMap[tokenKey] || global._tokenMap[tokenKey].iat < tokenVerify.iat) {
            global._tokenMap[tokenKey] = tokenVerify
          }
          // 检查传入TOKEN和内存中的TOKEN是否一致
          if (global._tokenMap[tokenKey].iat > tokenVerify.iat) {
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
        const roleRegs = tokenVerify.role ? roleRegMap[tokenVerify.role] : null
        if (roleRegs && roleRegs.length > 0) {
          for (const { method, reg } of roleRegs) {
            // 首先判断请求method是否匹配
            if (method && ctx.method !== method) {
              continue
            }
            // 其次判断请求url是否匹配
            if (reg.test(ctx.url)) {
              ctx.tokenVerify = tokenVerify
              return next()
            }
          }
          // 失败：所有路由规则循环完毕均不能匹配
          throw { res: `角色[${tokenVerify.role}]未拥有访问权限` }
        } else {
          // 失败：角色拥有路由规则为空
          throw { res: `角色[${tokenVerify.role}]未配置访问权限` }
        }
      } else {
        // 失败：TOKEN解析失败
        throw { res: authConfig.errMsg }
      }
    } catch (error) {
      // 白名单接口忽略错误
      if (isPass) {
        return next()
      }
      log.error(error)
      ctx.status = authConfig.errStatus
      ctx.body = { err: true, ...error }
      // 额外可选错误处理
      if (errorProcess && typeof errorProcess === 'function') {
        errorProcess(ctx)
      }
    }
  }
}
