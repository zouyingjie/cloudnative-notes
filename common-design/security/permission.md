# 授权

## ACL

## RBAC

## OAuth 2.0

OAuth 协议最初由 Twitter 和 Google 的员工成立了一个 OAuth 小组开发并完善了协议，最终在 2010 年 4 月发布了 [RFC 5849](https://datatracker.ietf.org/doc/html/rfc5849) 定义了 OAuth 1.0 协议，之后在 2012 年又发布了 [RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749) 推出了 OAuth2.0 协议来取代 1.0。 OAuth 2.0 是不兼容 1.0 的，目前主流的服务都支持 2.0 协议。

RFC 6749 开头就说明了，该协议旨在解决面向第三方应用应用的认证授权问题：

> The OAuth 2.0 authorization framework enables a third-party
   application to obtain limited access to an HTTP service, either on
   behalf of a resource owner by orchestrating an approval interaction
   between the resource owner and the HTTP service, or by allowing the
   third-party application to obtain access on its own behalf.

不过 OAuth2 定义了多种形式的授权方式，其不仅包含了授权管理，也涉及到身份认证的处理，对于“第三方”的要求也逐渐变得模糊。因此在实际工程中，我们完全可以将自己的系统作为“第三方”，使用 OAuth2 来实现系统的身份认证和授权管理。

在详细了解 OAuth2 各种授权方式之前，我们先来看下 该协议的认证授权有哪些角色参与。举个简单的例子，现在有一个照片打印网站（PhotoPrinter），我们希望将存储在某个网盘的照片打印出来，此时需要对打印网站授权，让他能访问我们网盘里的照片这时候如果直接提供用户名密码给打印网站肯定是不安全的，因此我们其他方式需要做一次授权，然后向第三方提供一个令牌，允许照片打印网站持有令牌访问我们的网盘。这里的打印网站就是第三方应用，我们是资源所有者，

- **资源所有者**：拥有资源和授权权限的对象，这里就是我们，拥有网盘里的照片。
- **三方应用**：需要得到授权访问资源的应用。
- **资源服务器**：能够向第三方提供资源的服务，这里就是网盘服务。
- **授权服务器**：对第三方应用进行授权的服务，通常和资源服务器隶属于相同组织。比如这里就是由网盘提供授权。

这样，打印服务获取网盘照片访问权限的基本流程如下：

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/oauth-01.png)

OAuth2 最初提供了 4 种授权模式，用于解决不同场景下的认证授权，后续又不断改进，目前支持的授权模式有如下几种，我们来分别看下。

- 授权码模式 （Authorization Code）
- PKCE 授权码模式（Proof Key for Code Exchange）
- 客户端模式（Client Credentials）
- 设备码模式 （Device Code）
- 刷新令牌模式 （Refresh Token）
- 隐式授权模式（Implicit Flow），已不推荐
- 密码模式（Password Grant），已不推荐


### 授权码模式

该模式是 OAuth2 最复杂的模式，站在第三方应用的视角，其整个流程如下：

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/auth-02.png)

1. 第三方应用首先需要向授权服务注册，通常是在目标网站创建一个新的“应用”。作为开发者如果我们的服务作为第三方去访问目标资源，通常第一步就是要去注册应用。在注册时通常需要提供如下信息：

- 应用名称
- 回调地址（授权成功后的回调地址，也可以不填，转而在请求授权时提供）
- 服务主页（可选）

下面是 Github 注册 App 的界面示例：

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/oauth-auth-code-01.png)

注册成功后会得到 appID 和 appSecret，作为请求授权时的身份凭证。

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/oauth-auth-code-02.png)

2. 用户需要第三方访问资源时，第三方应用将用户导向授权界面，此时需要带上第一步申请到的 appID 以及回调地址等信息。下面是一个示例：

```
GET https://openapi.xxx.com/oauth2.authorize?
response_type=code&
client_id=应用的 appID&
redirect_uri=您应用的授权回调地址&
scope=aaa
```

3. 授权服务器校验第三方应用的 appID，如果合法则向用户展示授权界面。

4. 用户同意授权，授权服务器重定向至第二步传递的回调地址，并带上授权码（code）。

5. 第三方服务获取到 code 后，在服务端重新请求授权服务器，获取访问令牌（Access Token）。下面是一个示例：

```
GET https://openapi.xxx.com/oauth2/token?
grant_type=authorization_code&
code=第三步获取的 code值&
client_id= 应用的 appID&
client_secret=应用的 appSecret
redirect_uri=回调地址
```

6. 授权服务器确认 code、appID 等信息正确后，向第三方应用颁发令牌。其中包括访问令牌（Access Token）、刷新令牌（Refresh Token，可选）。访问令牌用来获取资源，通常有效期较短，以分钟或小时计；刷新令牌用来在访问令牌失效后重新获取，通常有效期较长，以天或者月计。


#### 刷新令牌模式（Refresh Token）

上面提到授权码模式获取访问令牌时，授权服务器还可以返回刷新令牌（Refresh Token），在这种情况下，如果后续访问令牌过去，我们不需要在执行一次繁琐的授权码授权过程，而是可以直接拿着刷新令牌去获取新的访问令牌，整个过程对用户是无感的。下面是一个示例：

```
GET https://openapi.xxx.com/oauth2/token?
grant_type=refresh_token&
refresh_token=之前获取的 Refresh Token的值&
client_id= 应用的 appID&
client_secret=应用的 appSecret
```

### 隐式授权模式（Implicit Type）

授权码模式需要有服务端运行提供回调 URL 的请求入口才行，对于某些网页应用、移动 APP 或者公共客户端，是没有服务端可用的，另外此时存储 appSecret 信息也会被泄露。为了解决这种类型应用的授权，OAuth2 提出了隐式授权的模式。不过这种模式已经被下文提到的 PKCE 模式代替，我们这里处于完整性考虑只做简要介绍。

隐式授权模式流程如下，三方应用请求授权，用户同意后不再通过重定向返回授权码，而是直接将 Access Token 在 URI 的 fragment 中带回，下面是一个例子，# 后面的就是 [Fragment](https://en.wikipedia.org/wiki/URI_fragment) 部分。

```
http://xxx.app.cn/oauth2/callback/##access_token=LbtIKbg-YzWooT-1PfVM4PmrfWybL6MRucjEhLbIQUIAnTbi_fV9xuWgGkFP8Ikq3zIEQAqE&token_type=Bearer&expires_in=86400&scope=photos&state=ffYZBQl-ve-pLRqK
```

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/oauth-auth-code-04.png)

可以看到隐式授权模式直接返回了 Access Token，虽然其也做了一定程度的防范，比如不允许返回 Refresh Token；回调 URL 必须与注册时的域名一致，但其安全程度相对于授权码模式是较低的，尤其是可能存在




### PKCE（Proof Key for Code Exchange） 模式  

在上面授权码模式的地 5 步，第三方应用在获取访问令牌时，需要将事先申请到的 appID 和 appSecret 带上。

在有服务端程序运行的情况下，我们可以将 appID 和 appSecret 存储在服务端，泄露风险很小。但对于很多网页、移动端 APP 等没有服务端的应用，appID 和 appSecret 只能被存储在客户端，此时就会有泄漏的风险，如果恶意攻击者获取到这些数据，并且拦截到授权码，那就可以伪造请求获取访问令牌。

为了解决上述问题，OAuth2 提出了另一种形式的授权码认证模式 PCKE，其核心思想是通常让客户端每次请求授权时都生成一个唯一的验证码，请求授权和后续的获取令牌必须所携带的验证码必须一致才可以执行成功，否则没办法获取到访问令牌。具体流程如下：

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/oauth-auth-code-03.png)

1. 三方应用生成一个长度为 43 ~ 18 的随机字符串作为 **code_verifier**，比如 ``m2RT_kGfICxLDaa9tghw_4E9282dn-oCc7u9i8ShcgYNs-fE``，然后对其进行哈希和编码 ``base64url(sha256(code_verifier))`` 生成 **code_challenge**。

2. 三方应用请求授权，此时需要将 code_challenge 和使用的哈希方法带上，示例如下：

```
https://authorization-server.com/authorize?
  response_type=code
  &client_id=5ihfa_tm9Vfkyj1pi2Lu5fSv
  &redirect_uri=https://www.oauth.com/playground/authorization-code-with-pkce.html
  &scope=photo+offline_access
  &state=to7Blsi5CAcXRIA8
  &code_challenge=jfUpPTZ9iU6HlPU95o-DgvziP_7guPMzZdWgQPTlHVw
  &code_challenge_method=S256
```

3. 认证成功后，授权服务器重定向至回调 URL，返回授权码。

4. 三方应用请求获取访问令牌，此时需要带上授权码和 code_verifier。示例如下：

```
POST https://authorization-server.com/token

grant_type=authorization_code
&client_id=5ihfa_tm9Vfkyj1pi2Lu5fSv
&client_secret=MVBZ0ubad0XavIf8hLkSx0duNzfN_deSxLC7BE5mZXDpplXc
&redirect_uri=https://www.oauth.com/playground/authorization-code-with-pkce.html
&code=IbJDR8wZBAZfMgr9m03TMJBjyFtTVIrb4-SviJYvx1ZZ3Ycn
&code_verifier=m2RT_kGfICxLDaa9tghw_4E9282dn-oCc7u9i8ShcgYNs-fE
```

5. 授权服务器校验授权码，并根据之前传递的哈希方法对 code_verifier 进行编码，检查是否与请求授权时传递的 **code_challenge** 一致。

6. 如果一致，则返回请求令牌、刷新令牌等信息。

可以看到，通过这种方式，OAuth2 保证了只有发起原始授权请求的客户端才能完成整个授权流程。这样只要恶意攻击者无法获取用户的用户名密码，即使 appID/appSecret 或者授权码泄露，也无法获取相应的访问令牌。


### 客户端模式

### 

关于 OAuth2 的最佳实践可以参考 2025 年 1 月最新发布的 RFC 9700 [Best Current Practice for OAuth 2.0 Security](https://datatracker.ietf.org/doc/html/rfc9700)。

### OpenID Connect
