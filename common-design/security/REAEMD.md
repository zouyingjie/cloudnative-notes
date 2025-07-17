

架构安全是一个非常宏大的话题。无论是云原生环境下 4C Security（Cloud, Clusters, Containers, and Code），还是 Google 提出的 Zero Trust 零信任架构，或者是 [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/index.html) 中定义的一系列 Web 安全的设计要求，都可以归结于安全的话题之下。

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/4c-security.webp)

安全领域的话题虽然非常宏大，但业界都提供了相对成熟的解决方案。对于架构师或开发人员来说，我们不需要成为安全、密码学等领域的专家，但对这些业界成熟的解决方案，还是需要做到基本的掌握与运用，从而构建出一个安全可靠的系统。

抛开基础设施层面的安全管理，几乎任何系统都会有用户注册、用户登录等功能，系统在为用户提供服务时，总是需要先搞清楚几个问题：你是谁（身份认证），你能做什么（权限管理）、拿什么证明（会话凭据），同时我们还需要保证用户的证明信息不被人窃取（加密传输）。身份认证、权限管理、会话凭据管理、通信加密传输通常是一个系统最基本的安全需求，本部分主要针对这几个主题做简要介绍。


---

相关参考资料：

**书籍**
- [the Copenhagen Book](https://thecopenhagenbook.com/)
- 《Distributed Systems》第 9 章
  
**认证与授权**

- [凤凰架构：架构安全性](https://icyfenix.cn/architect-perspective/general-architecture/system-security/)
- [HTTP API 认证授权术](https://coolshell.cn/articles/19395.html)
- [网络数字身份认证术](https://coolshell.cn/articles/21708.html)
- [分布式系统下的认证与授权](https://www.bmpi.dev/dev/distributed-system/authentication-and-authorization/)

**TLS**

- [有关 TLS/SSL 证书的一切](https://www.kawabangga.com/posts/5330)
- [HTTPS 隐私安全的一些实践](https://blog.laisky.com/p/https-in-action/)
- [Everything you should know about certificates and PKI](https://smallstep.com/blog/everything-pki/)

**密码学**

- [写给开发人员的实用密码学（一）—— 概览](https://thiscute.world/posts/practical-cryptography-basics-1/)

**SpringSecurity**

- [课程：Spring Security 入门](https://www.udemy.com/course/spring-security-zero-to-master/)
- [读源码剖析 Spring Security 的实现原理](https://www.aneasystone.com/archives/2023/05/dive-into-spring-security-sources.html)
- [一文带你读懂Spring Security 6.0的实现原理](https://juejin.cn/post/7260000714788896828)