# 身份认证

本篇我们对常用的身份认证协议做简要的梳理，包括主流的 HTTP 相关认证协议以及证书密钥对、新兴的 WebAuthn 认证。

## HTTP 协议认证

[RFC 7235](https://datatracker.ietf.org/doc/html/rfc7235) 中定义了 HTTP 协议的认证框架，要求在支持 HTTP 协议的服务器，如果访问服务的身份验证失败，需要返回 401 Unauthorized 或 407 Proxy Authentication Required 状态码，并告知客户端应该采用何种方案提供凭证信息，收到响应后客户端按要求加入认证凭据信息后才能继续访问。

```code
# 响应头
WWW-Authenticate: <认证方案> realm=<保护区域的描述信息>
Proxy-Authenticate: <认证方案> realm=<保护区域的描述信息>

# 请求头
Authorization: <认证方案> <凭证内容>
Proxy-Authorization: <认证方案> <凭证内容>
```
整个认证流程如下：

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/http-auth-01.png)

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/http-auth-02.png)

在上述认证框架的基础上，HTTP 提出了不同的认证方式。

### HTTP Basic & 摘要认证

[RFC 2617](https://datatracker.ietf.org/doc/html/rfc2617) 提出了 Basic 和 Digest Access（摘要认证）两种方式，我们先来看下 Basic，其认证流程如下：

- 将用户名密码用冒号间隔做拼接，格式为 ``username:password``。
- 对拼接后的字符串进行 Base64 编码，比如 ``Base64(admin:12345)`` 得到 ``YWRtaW46MTIzNDU=``。
- 将编码后的字符串添加 ``Basic`` 标识后放到 HTTP 头 [Authorization](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Authorization) 中，最终结果为 ``Authorization: Basic YWRtaW46MTIzNDU=``，然后向服务端请求。
- 如果认证通过，则返回 200 响应码。否则按照上述框架要求的，响应 401 并且返回响应头 ``WWW-Authenticate: Basic realm="Dev", charset="UTF-8"``。

可以看到 Basic 认证对密码只是做了编码，并没有加密处理，因此使用 Basic 认证时必须结合 TLS 加密传输一起使用。Basic 更多用于系统内部之间一些组件的访问，在实际生产系统中很少使用。

[RFC2069](https://datatracker.ietf.org/doc/html/rfc2069) 提出了 Digest Access 摘要认证，后续由 [RFC 2617](https://datatracker.ietf.org/doc/html/rfc2617) 做了一系列的增强，算是对 Basic 的改进，其认证流程如下：


- 认证失败，服务端返回 401 以及 ``WWW-Authenticate`` 头如下。
```sh
WWW-Authenticate: Digest realm="testrealm@host.com",
                        qop="auth,auth-int",
                        nonce="dcd98b7102dd2f0e8b11d0f600bfb0c093",
                        opaque="5ccc069c403ebaf9f0171e9517f40e41"
```

如果没有特殊要求，其计算的流程如下：

```
HA1 = MD5(username:realm:password)
HA2 = MD5(method:digestURI)
response = MD5(HA1:nonce:HA2)
```

其中，nonce 是服务端返回的盐值，method 是请求方法，digestURI 为请求 URI。[RFC 2617](https://datatracker.ietf.org/doc/html/rfc2617) 提出了
qop(quality of protection，保护质量) 对计算方式提出了更复杂的要求，改进后的计算流程如下：

- 客户端生成自己的盐值，然后做哈希操作 ``HA1 = MD5(MD5(username:realm:password):nonce:cnonce)``。
  
- 如果 qop 包含了 ``auth-init``，则 ``HA2 = MD5(method:digestURI:MD5(entityBody))``，entityBody 代表整个请求体。
  
- 最后``response = MD5(HA1:nonce:nonceCount:cnonce:qop:HA2)``。计算完成后客户端将值加入到 ``Authorization`` 请求头中，示例如下：

```sh
GET /dir/index.html HTTP/1.0
Host: localhost
Authorization: Digest username="Mufasa",
                     realm="testrealm@host.com",
                     nonce="dcd98b7102dd2f0e8b11d0f600bfb0c093",
                     uri="/dir/index.html",
                     qop=auth,
                     nc=00000001,
                     cnonce="0a4f113b",
                     response="6629fae49393a05397450978507c4ef1",
                     opaque="5ccc069c403ebaf9f0171e9517f40e41"
```
  
可以看到摘要认证通过盐值、MD5 哈希的方式对用户名密码传输做了一定程度的加密，但其实最终加密后的强度还是取决于密码的强度，如果密码强度较弱其依然有泄露的风险，另外这里也没有办法避免中间人攻击。

#### Bearer（OAuth 2.0）认证

[RFC 6750](https://datatracker.ietf.org/doc/html/rfc6750) 描述了基于 OAuth 2.0 的认证授权方式，它要求使用 ``Bearer Token（承载令牌）`` 的方式进行认证。

客户端在获取令牌成功后，需要将令牌放到 ``Authorization`` 请求头中，格式如下：

```
Authorization: Bearer <token>
```

OAuth 2.0 协议当初主要是为了对第三方授权而实现的，其同时设计身份认证和授权，这个我们后面在详细介绍。


## Form 认证

因为身份认证通常是应用系统的业务逻辑的一部分，虽然 HTTP 协议提供了基本的认证框架，但在大多数情况下，我们需要自行实现认证流程。最常见的方式就是通过 HTML 表单提交用户名和密码，然后服务端验证成功后返回一个凭据给客户端，客户端在后续的请求中将凭据放到 HTTP 请求头中。这在万维网中被称为 Web 认证，因为最常见的方式就是通过表单登录，也叫做表单认证（Form-based Authentication）。

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/form-login.png)

表单认证并没有一个标准的规范规范，因此通常由产品和工程师根据业务需求自行设计实现，在设计方案时可以参考 [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) 中的建议。

## Web WebAuthn 认证


## 证书密钥对

上述认证方式都是基于用户名密码或者用户生物特征等方式进行认证的，这在ToC（面向消费者）场景下是比较常见的方式，但在其他场景下，比如系统内部的服务间通信、API 调用，机构和机构之前的通信，则需要其他的解决方案。最常用的就是数字证书和密钥对认证。

通过非对称加密的方式，我们可以生成公钥和私钥，我们将私钥安全保存，然后将公钥分发出去。通过私钥加密的数据只有使用公钥才能解密，这样同时解决了身份认证和数据加密的问题。但这种方式无法避免中间人攻击，因此通常需要结合**数字证书**来使用。

我们需要一个权威证书机构（CA，Certificate Authority）来颁发证书，证书中包含了公钥和一些其他信息，比如证书的有效期、颁发者等。通信双方在拿到证书后，可以向 CA 机构验证证书的合法性，验证通过后就可以使用公钥进行加密通信，从而保证通信的安全性。

目前网站和应用系统中使用的 HTTPS 通信以及云原生的下的 mTLS（双向 TLS）认证都是基于证书密钥对的方式。

传统网站的 HTTPS 单向认证流程如下：

1. 我们在浏览器访问网站，发起 HTTPS 请求。
2. 服务端收到请求后，返回自己的证书给浏览器。
3. 浏览器验证证书的合法性，如果合法则继续请求，否则返回错误。
4. 浏览器使用证书中的公钥加密请求数据，并发送给服务端。

可以看到这里主要是浏览器客户端去验证服务端的证书是否合法，也就是验证我们访问的网站是否是真实合法的。而在 mTLS 双向认证中，除了客户端验证服务端的证书外，服务端也会验证客户端的证书是否合法，流程如下：

1. 客户端请求服务端
2. 服务端返回其 TLS 证书
3. 客户端验证服务端证书合法性
4. 客户端提供其 TLS 证书
5. 服务端验证客户端证书合法性
6. 验证成功，双方使用各自的公钥进行加密通信。

在云原生环境以及 Zero Trust 安全架构理念的指导下，mTLS 几乎已经成为服务间通信的的必备安全认证方式。通常在企业内部，我们可以通过自签名证书的方式来生成 CA 和证书密钥对，下面我们用 OpenSSL 命令工具来演示这个过程：

- 生成 CA 私钥和证书

```bash
openssl genrsa -out ca.key 2048
openssl req -x509 -new -nodes -key ca.key -sha256 -days 365 -out ca.crt
```

- 生成服务端私钥和证书签名请求（CSR）

```bash
openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr
```

- 生成服务端证书

```bash
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days 365 -sha256
```

- 生成客户端私钥和证书签名请求（CSR）

```bash
openssl genrsa -out client.key 2048
openssl req -new -key client.key -out client.csr
```
- 生成客户端证书

```bash
openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out client.crt -days 365 -sha256
```


