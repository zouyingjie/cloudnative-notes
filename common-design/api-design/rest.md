# WEB API 设计规范

## REST API 简介

REST 是 Representational State Transfer 的缩写，它将资源作为核心概念，通过 HTTP 方法对资源进行操作。其本身是一套围绕资源进行操作的架构规范。在实际应用中，更多的是体现在 API 的设计上。

企业在进行产品设计开发时，通常首先由业务专家和技术专家一起梳理出业务模型，然后根据领域驱动设计（DDD）的方法论进行建模，设计出领域模型以及针对领域模型的操作。最终，这些领域模型会映射为数据存储的数据模型以及 REST API 的资源模型，而针对领域模型的操作会映射为 HTTP 方法以及 REST API 的 Action。

REST API 几乎已经是互联网服务 Web API 设计的事实标准，根据 Google 的 [API 设计指南](https://cloud.google.com/apis/design?hl=zh-cn)，早在 2010 年，就有大约 74% 的公共网络 API 是 HTTP REST（或类似 REST）风格的设计，大多数 API 均使用 JSON 作为传输格式。

### RESTful 设计原则

满足 REST 要求的架构需遵循以下6个设计原则：

**1. 客户端与服务端分离**

目的是将客户端和服务端的关注点分离。在 Web 应用中，将用户界面所关注的逻辑和服务端数据存储所关注的逻辑分离开来，有助于提高客户端的跨平台的可移植性；也有助于提高服务端的可扩展性。

随着前端技术的发展，前后端分离已经是主流的开发方式，传统的 Spring MVC/Django 的前端模板渲染已经被逐渐弃用了。

**2. 无状态**

服务端不保存客户端的上下文信息，会话信息由客户端保存，服务端根据客户端的请求信息处理请求。

在实际开发中，服务端通常会保存一些状态信息，比如会话信息、认证信息等，这些信息一般是保存在服务端的数据库或者缓存中。

**3. 可缓存**

这一条算是上一条的延伸，无状态服务提升了系统的可靠性、可扩展性，但也会造成不必要的网络开销。为了缓解这个问题，REST 要求客户端或者中间代理（网关）能缓存服务端的响应数据。服务端的响应信息必须明确表示是否可以被缓存以及缓存的时长，以避免客户端请求到过期数据。

管理良好的缓存机制可以有效减少客户端-服务器之间的交互，甚至完全避免客户端-服务器交互，从而提升了系统的性能和可扩展性。

**4. 分层系统**

对于客户端来说，中间代理是透明的。客户端无需知道请求路径中代理、网关、负载均衡等中间件的存在，这样可以提高系统的可扩展性和安全性。

**5. 统一接口**

REST 要求开发者面向资源来设计系统，有下面四个约束：

- **每次请求中都包含资源 ID**
  
- **所有操作均等通过资源 ID 进行**
  
- **消息是自描述的**：每条消息包含足够的信息来描述如何处理这条消息。比如 mime 标识媒体类型，content-type 标识编码格式，language 标识语言，charset 标识字符集，encoding 标识压缩格式等。
- **用超媒体驱动应用状态（HATEOAS，Hypermedia as the Engine of Application State）**：客户端在访问了最初的 REST API 后，服务端会返回后续操作的链接，客户端使用服务端提供的链接动态的发现可用资源和可执行操作。

**6. 按需编码（可选）**

这是一条可选约束，指的是服务端可以根据客户端需求，将可执行代码发送给客户端，从而实现临时性的功能扩展或定制功能，比如以前的 Java Applet。

### REST API 成熟度模型

上述约束读起来还是有些抽象，鉴于在实际开发中，我们更多是聚焦在 API 设计上。为了衡量一个系统是否符合 REST 风格，《RESTful Web APIs》和《RESTful Web Services》的作者 Leonard Richardson 提出了 REST 成熟度模型，根据 API 的设计风格将其分为了 4 级。

#### 第 0 级: 完全不符合 REST 风格

比如 RPC 面向过程的 API 设计基本是围绕操作过程来设计的，完全没有资源的概念。

下面是 Martin Fowler 在介绍成熟度模型的 blog [Richardson Maturity Model](https://martinfowler.com/articles/richardsonMaturityModel.html#level0) 中举的病人预约的例子，病人首先需要查询医生可预约的时间表，然后提交预约。

查询预约服务时提交的请求为

```json
POST /appointmentService?action=query HTTP/1.1

{
    "date": "2020-03-04",
    "doctor": "mjones"
}

```
请求成功后响应如下
```
HTTP/1.1 200 OK
[
    {
        "start": "14:00",
        "end": "14:50",
        "doctor": "mjones"
    },
    {
        "start": "16:00",
        "end": "16:50",
        "doctor": "mjones"
    }
]
```

然后病人选择时段提交预约

```json
POST /appointmentService?action=confirm HTTP/1.1

{
    "slot": {
        "start": "14:00",
        "end": "14:50",
        "doctor": "mjones"
    },
    "patient": {
        "id": "jsmith"
    }
}
```
预定成功时响应如下

```json
HTTP/1.1 200 OK

{
    "slot": {
        "start": "14:00",
        "end": "14:50",
        "doctor": "mjones"
    },
    "patient": {
        "id": "jsmith"
    }
}
```

预定失败时响应如下

```json
HTTP/1.1 200 OK

{
    "slot": {
        "start": "14:00",
        "end": "14:50",
        "doctor": "mjones"
    },
    "patient": {
        "id": "jsmith"
    },
    "reason": "Slot not available"
}
```
可以看到整个请求过程没有涉及到资源的概念，并且请求也比较简洁明了。但如果操作越来越多，接口也越来越多，随之而来的维护、沟通成本也会越来越高。



####  第 1 级：引入资源概念

引入资源后，对服务端的访问都是围绕资源，通过资源 ID 进行。此时的查询和预约请求如下：


查询预约：以医生为资源，通过 ID查询

```json
POST /doctors/mjones HTTP/1.1

{date: "2020-03-04"}

// 请求响应

[
  {"slot_id": 1234, doctor: "mjones", start: "14:00", end: "14:50"},
  {"slot_id": 5678, doctor: "mjones", start: "16:00", end: "16:50"}
]
```
提交预约时，以时间表 slot 为资源，通过 ID 预约

```json
POST /slots/1234 HTTP/1.1

{ "patient_id": "jsmith" }

```

#### 第 2 级：操作映射到 HTTP 方法

上面的例子中所有请求都是用的 POST 方法，Level2 要求将操作映射到 HTTP 方法。对于资源的操作无非就是增删改查，HTTP 对应的 POST、DELETE、PUT/PATCH、GET 可以很好的表达这些操作。

- 查询档期，使用 GET 方法

```json
GET /doctors/mjones/schedule?date=2020-03-04&status=open HTTP/1.

[
  {"slot_id": 1234, doctor: "mjones", start: "14:00", end: "14:50"},
  {"slot_id": 5678, doctor: "mjones", start: "16:00", end: "16:50"}
]
```

- 创建预约，使用 POST 方法

```json
POST /schedules/1234 HTTP/1.1

{ "patient_id": "jsmith" }
```

```json
// 预定成功响应
HTTP/1.1 201 Created
Location: slots/1234/appointment

{
    "slot": {
        "id": 1234,
        "doctor": "mjones",
        "start": "14:00",
        "end": "14:50"
    },
    "patient": {
        "id": "jsmith"
    }
}
```

预定失败时，需要返回能表达错误原因的响应码，而不是像之前一样返回 200。

```json
HTTP/1.1 409 Conflict

[
  {"slot_id": 5678, doctor: "mjones", start: "16:00", end: "16:50"}  
]
```

第2级是目前绝大多数系统所达到的级别。

#### 第 3 级：状态转移完全由后端驱动

在实际开发中，通常是客户端和服务端约定好 API 后进行各自的实现。客户端在代码中已经编写了 API 相关的调用，但 REST 认为这是多余的，客户端应该根据服务端返回的链接进行后续操作，返回的资源信息以及操作链接信息能够描述自身以及后续可能发生的状态转移，从而实现超文本驱动应用状态。

依然是查询预约的 API，此时后端返回的预约列表，除了基本信息外还带有预约所需 link，由此客户端知晓后续的预约操作，并请求服务端返回的 link 进行操作。
```
GET /doctors/mjones/slots?date=20100104&status=open HTTP/1.1

[
  {"slot_id": 1234, doctor: "mjones", start: "14:00", end: "14:50", links: [{"rel": "book", "href": "/slots/1234"}]},
  {"slot_id": 5678, doctor: "mjones", start: "16:00", end: "16:50", links: [{"rel": "book", "href": "/slots/5678"}]}
]
```
可以看到返回的数据中包含了支持的预约操作以及操作所对应的链接。

### REST VS RPC

API 的设计通常有 RPC 和 REST 两种形式。虽然两者并不是一回事，但因为都是面向服务端和客户端的通信制定规范，所以经常被混为一谈。

REST 本身一套面向资源的架构设计思想，而 RPC 的初衷是希望能在分布式系统之间，像调用本地方法一样调用远程方法，围绕通信过程实现进行的一系列实现。RPC 协议也是层出不穷，针对数据的编码、传输以及方法的表达提供不同的解决方案。关于 RPC 更多的讲解可以参考[凤凰架构：远程服务调用](https://icyfenix.cn/architect-perspective/general-architecture/api-style/rpc.html)。

具体到 API 设计上，其主要区别在于：**REST 是面向资源的，而 RPC 是面向过程的**。以一个用户的增删改查为例，REST 的 API 设计如下

```
# 创建用户
POST /users
# 查询用户列表
GET /users  
# 查询用户详情
GET /users/{id}
# 更新用户信息
PUT /users/{id}
# 删除用户
DELETE /users/{id}
```

而 RPC 的 API 设计如下：

```
# 创建用户
POST /createUser
# 查询用户列表
GET /getUserList
# 查询用户详情
GET /getUserById
# 更新用户信息
PUT /updateUser
# 删除用户
DELETE /deleteUser
```

 
## URI 的设计规范

了解了 REST API 的一些基本概念，下面我们看下可以在实践中应用的 URI设计规范。

根据 [RFC 3986 - - Uniform Resource Identifier (URI): Generic Syntax](https://www.rfc-editor.org/rfc/rfc3986.html) 中的定义，一个 URI 的结构如下所示：

```
       foo://example.com:8042/over/there?name=ferret#nose
       \_/   \______________/\_________/ \_________/\__/
        |        |              |          |          |
scheme（协议）authority（域名） path（路径） query（查询参数）fragment（片段）
```

我们这里主要针对 path 和 query 部分进行讨论，对于 PATH 我们可以使用如下规范形式:

```
{domain}/{version}/{appid}/{resource}
{domain}/{version}/{appid}/{resource}/{sub-resource}/
{domain}/{version}/{appid}/{resource}/{action}
```
### URI 主体字段含义

首先来看下 URL 中各个字段的含义与设计规范。

- `{domain}` 表示 API 的域名。可以使用统一的域名，也可以针对不同的业务线使用不同的域名。
- `{version}` 表示 API 的版本。形式是 v + 数字，比如 v1, v2，有特殊需求是也可以进一步区分主版本和子版本，比如 v1.1, v1.2。一般只有在接口不兼容时才会升级。
- `{appid}` 服务的唯一标识。比如 `order` 表示订单服务，`user` 表示用户服务，`payment` 表示支付服务。
- `{resource}` 具体的资源，要用名词且为复数形式。比如 `orders` 表示订单资源，`users` 表示用户资源，`payments` 表示支付资源。
- `{sub-resource}` 子资源，操作场景下和资源有依赖关系，要用名词且为复数形式。比如购物车和购物车项。
- `{action}` 针对资源或子资源的行为操作，用动词或者动词短语表示，用来弥补 HTTP 方法表达上的不足。


### URI 路径规范

#### 1. URI 中所有命名必须是小写英文

下面是一个不规范的实例，使用了大写字或非英文字母。
```
https://api.server.com/v1/订单/orders 
https://api.server.com/v1/PAYMENT/records
https://api.server.com/v1/order/orders/REFUND
```

#### 2. URI 路径分隔符推荐使用中划线 `-`

下面是一个使用 `_` 的不规范实例
```java
https://api.server.com/v1/marketing/coupons/get_by_code
```

##### 3. URI 路径中查询参数命名必须统一使用 snake_case 或 camelCase 风格

在实践中笔者通常倾向于统一使用 snake_case 风格，但有的团队也会使用驼峰命名法。这里重要的是保持统一，避免在进行 API 设计时因为风格不一致导致不必要的沟通成本。

下面是一个使用 snake_case 风格的 URI：
```
https://api.server.com/v1/marketing/coupons/get-by-merchants?merchant_id=123456
```

下面是一个使用 camelCase 风格的 URI：
```
https://api.server.com/v1/marketing/coupons/getByMerchants?merchantId=123456
```

下面是一个使用驼峰命名法的不规范 URI，首字母用了大写：
```
https://api.server.com/v1/marketing/coupons/get-by-merchants?MerchantId=123456
```

#### 4. URI 中禁止出现 CURD 动词，应该映射到 HTTP 方法

下面是一个不合法的 URI 示例，使用了 CURD 动词：
```
GET /doctors/mjones/get-schedules
```

如果有特殊需求，应该有更明确的语义表达，但 Get、List、Update、Delete 这些 CURD 应该尽量避免。

#### 5. URI 的路径和参数必须以标准 [UTF-8](https://en.wikipedia.org/wiki/Percent-encoding) 编码

比如出现汉字、空格、特殊符号等字符时，需要进行编码。


#### 6. URI 长度限制

RFC7230 中并没有对 URI 的长度进行限制，但在实际开发中，最好限制在 2048 以内。如果 URI 过程，需要返回 HTTP 414 状态码（URI Too Long）。[[参考 Stackoverflow]](https://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers/417184#417184)。


#### 7. 资源 ID 规范

资源 ID 必须放到资源的后面，并且尽可能使用 UUID、HMAC 等类型的 ID，而不是数据库的自增主键 ID，避免被人通过主键 ID 爬数据。比如

```
https://api.server.com/v1/payment/orders/298f37e-a538-11e9-93e8-0b39560ac73d
```

#### 7. 子资源使用规范

只有在 API 操作场景下，子资源和资源有依赖关系时，才使用子资源。大致有两类情况：

- 子资源不能独立存在，必须依附于上级主资源访问。比如某个用户的简历信息，必须依附在某个用户下。
- 子资源不能独立表达含义。比如社交系统用的用户和好友资源。可能最终访问的是同一张数据表，但在用户操作场景下可以独立存在，而在好友场景下是依附于用户存在的。

- 查询用户信息

```json
# 查询用户详情
GET .../users/1

# 查询用户简历信息
GET .../users/1/resume

# 查询用户好友
GET .../users/1/friends
```

在使用子资源时需要注意嵌套层级，尽可能不要使用超过 3 层的嵌套。

- 过多的嵌套会导致 API 过于复杂，不易理解
- 多级资源容易导致 URI 过长，引起一些兼容性问题。

#### 8. 动词使用规范

对资源的增删改查应该使用标准的 HTTP 方法，比如 GET、POST、PUT、DELETE。下面是 HTTP 方法于操作的映射关系：

REST API 要求对资源的操作应该与 HTTP 方法对应，下面是资源操作的标准方法与映射关系。

|资源操作|HTTP 方法|描述|是否幂等| 是否支持 Body | 响应格式 |
|---|---|---|---|---|---|
|List|GET|用于查询操作，对应数据库的 select 操作|✔︎|✘|资源列表，无数据时返回空列表|
|Get|GET|用于查询操作，对应数据库的 select 操作|✔︎|✘|资源详情，无数据时返回 404|
|Update|PUT|用于所有的信息更新，对应数据库的 update 操作|✔︎|✔︎|资料详情|
|Delete|DELETE|用于更新操作，对应数据库的 delete 操作|✔︎|✘|空|
|Create|POST|用于新增操作，对应数据库的 insert 操作|✘|✔︎|资源详情|
||HEAD|用于返回一个资源对象的“元数据”，或是用于探测API是否健康|✔︎|✘|资源详情|
|UPDATE|PATCH|用于局部信息的更新，对应于数据库的 update 操作|✘|✘|资源详情|
||OPTIONS|获取API的相关的信息。|✔︎|✘|空|

以下是基本的 API 示例

```
// 创建用户
POST /users

//查询用户列表
GET /users

// 查询用户详情
GET /users/1

// 更新用户信息
PUT /users/1

// 删除用户
DELETE /users/1
```
如果有特殊的动作可以在路径中使用 action 来标识，action 必须是动词性质的单词或短语。比如

```
# 实名认证
POST /users/1/real-name-auth

# 取消订单
PUT /orders/123456/cancel

# 激活优惠券
PUT /coupons/123456/activate
```

### 常用标准字段

API 中通常有许多通用字段，比如名称，排序，分页，时间戳等，下面是一些常用的标准字段和相关规范。

| 字段名 | 类型 | 说明 |
| ------------ | --- | --- |
| name         | string | 资源名称 |
| parent       | string | 父资源名称 |
| create_time  | timestamp | 创建时间 |
| create_by    | string | 创建者 |
| update_time  | timestamp | 更新时间 |
| update_by    | string | 更新者 |
| delete_time | timestamp | 删除时间 |
| delete_by | string | 删除者 |
| expire_time | timestamp | 过期时间 |
| start_time | timestamp | 开始时间 |
| end_time | timestamp | 结束时间 |
| time_zone | string |时区名称， 取值应遵从 [Time Zone Database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) 中给出的时区名称|
| region_code| string | 地区编码，取值应遵从 [unicode_region_subtag](https://www.unicode.org/reports/tr35/#unicode_region_subtag) 标准|
| language_code | string | 语言编码，取值应遵从 [Unicode_Language_and_Locale_Identifiers ](http://www.unicode.org/reports/tr35/#Unicode_Language_and_Locale_Identifiers) |
| currency_code | string | 货币编码，取值应遵从 [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) 标准|
| mime_type | string | 媒体类型，取值应遵从 [Mime 类型](https://www.iana.org/assignments/media-types/media-types.xhtml) 标准|
| page_size | int32 | 分页大小|
| page_number | int32 | 分页页码|
| total_size | int32 | 数据总数|
| total_page | int32 | 数据总页数|
| sort/order_by | string | 排序字段|
| asc/desc | string | 排序顺序
| filter | string | 过滤器参数|
| and、or、not | | 过滤器表达式要支持的逻辑操作符
| =，!=，>，<，>=，<=| | 过滤器表达式要支持的比较操作符，实际使用中有时也用单词表示：eq，ne，gt，lt，ge，le 表示
| search/query | string | 搜索参数|
| sort_order | string | 排序顺序，取值为 asc 或 desc|
| create_by | string | 创建者 |
| update_by | string | 更新者 |
| status | string | 状态 |
| remark | string | 备注 |

### HTTP 规范

#### Header 规范

应该尽可能使用标准的请求/响应头。以下是一些常用的标准请求头：

| 字段名 | 类型 | 说明 |
| --- | --- | --- |
| Content-Type | string | 请求体格式，比如 application/json |
| Accept | string | 告诉服务器可以接收的内容类型，如：application/xml, text/xml, application/json, text/javascript (for JSONP， 大多数时候都是选择选择application/json)
| Accept-Language | string | 告诉服务器可以接收的语言，如：zh-CN, en-US |
| Accept-Encoding | string | 告诉服务器可以接收的编码，如：gzip, deflate |
| Accept-Charset | string | 告诉服务器可以接收的字符集，如：utf-8, utf-16 |
| Authorization | string | 认证信息，取值为 Bearer token |
| Date | string | 客户端的时间戳，最好是 UTC 时间。但服务端不能依赖这个字段，因为客户端的时间可能不准确。 |


**缓存相关 Header**

| 字段名 | 类型 | 说明 |
| --- | --- | --- |
| Expires | string | 告知客户端缓存过期时间，如果与 Cache-Control 同时出现，则以 Cache-Control 为准。|
| Cache-Control | string | 缓存控制 |
| Last-Modified | string | 告知客户端资源最后修改时间 |
| If-Modified-Since | string | 将 Last-Modified 的值发送给服务器，服务器判断资源是否被修改，如果被修改，则返回 200 状态码，否则返回 304（Not Modified） 状态码 |
| ETag | string | 告知客户端资源的唯一标识 |
| If-None-Match | string | 将 ETag 的值发送给服务器，服务器判断资源是否被修改，如果被修改，则返回 200 状态码，否则返回 304 状态码 |

**同源策略相关 Header**

| 字段名 | 类型 | 说明 |
| --- | --- | --- |
| Access-Control-Allow-Origin | string | 告知客户端可以访问的源，如：* |
| Access-Control-Allow-Methods | string | 告知客户端可以访问的方法，如：GET, POST, PUT, DELETE |
| Access-Control-Allow-Headers | string | 告知客户端可以发送的请求头，如果有自定义 header，则需要在这里声明 |
| Access-Control-Expose-Headers | string | 告知浏览器可以访问的响应头，默认情况下，只有 6 个基本字段可以被浏览器访问：Cache-Control, Content-Language, Content-Type, Expires, Last-Modified, Pragma |
| Access-Control-Max-Age | integer | 指定预检请求的结果可以缓存多久（以秒为单位）。|
| Access-Control-Allow-Credentials | string | 告知客户端是否可以发送 cookie，如：true |

对于 POST、PUT、DELETE 等“高危”方法或者带有自定义请求头的方法，通常需要发送一个预检请求（OPTIONS）进行检查。

#### 响应码规范


必须使用正确的 HTTP 状态码。HTTP 协议定义的状态码分类如下：

| 状态码 | 分类 | 说明 |
| --- | --- | --- |
| 1xx | 信息性状态码 | 表示临时响应，需要客户端进一步操作 |
| 2xx | 成功状态码 | 表示请求成功 |
| 3xx | 重定向状态码 | 表示需要客户端进一步操作 |
| 4xx | 客户端错误状态码 | 表示客户端请求错误，比如 400 错误请求，401 未认证，403 禁止访问，404 未找到资源，405 方法不允许，429 请求过多 |
| 5xx | 服务器错误状态码 | 表示服务器处理请求错误，比如 500 服务器错误，502 网关错误，503 服务不可用，504 网关超时 |

- 在 API 设计开发时，至少需要区分 2xx、 4xx、5xx 三种状态码。
- 在必要时可以细化状态码
  - 创建成功：201 Created
  - 查询成功：200 OK
  - 更新成功：200 OK，或 204 No Content，表示执行成功但不返回数据
  - 删除成功：200 OK；未找到资源：404 Not Found，资源已被删除或不可用 410

#### 响应体规范

- 对于 List 操作，返回的是资源数组；如果没有资源，则返回空数组。
- 对于 GET/POST/PUT，通常返回资源详情对象
- 对于失败的请求，除了 HTTP 状态码外，需要有更详细的错误信息。下面是常用字段：

| 字段名 | 类型 | 是否必填 | 说明 |
| --- | --- | --- | --- |
| code | string | 是 | 业务自定义的错误码 |
| message | string | 是 | 用户能读懂的出错信息 |
| target | string | 否 | 出错目标对象 |
| details | Error[] | 否 | 错误列表 |
| help | string | 否 | 帮助文档地址 |

需要注意不要在 details 中异常调用栈信息，这个应该在服务日志中打印。


### 向后兼容规范

#### 1. 不能减少现有参数

API 的修改或升级，必须是做加法，不能是减法。

#### 2. 新增参数或请求数据必须有默认值

新增参数时，必须有默认值，不能是必选参数。否则会导致现有的客户端调用失败。

#### 3. 不能修改原 API 的语义和签名

已经发布的 API 有用户在使用，因此任何对 API 的改动都不能对使用方造成负面影响。为此必须做到：

- 新增的查询参数不能是必选的。
- HTTP 头和状态码不能修改，可以增加，但必须有默认值。
- 请求数据中，必选参数不能有任何修改，包括参数名、类型、值范围（可以扩大，但不能缩小）。
- 响应数据中，必选参数不能有任何修改，包括参数名、类型、值范围（可以扩大，但不能缩小）。

如果做不到兼容，则需要升级 API 版本。

### 文档规范

API 必须有文档说明，最佳实践是使用 Swagger 生成 API 文档。内部应该有统一的 API 文档管理平台，对外提供 API 文档的访问。


