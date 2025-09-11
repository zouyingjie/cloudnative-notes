# WEB API 设计规范

## REST API 简介

REST 是 Representational State Transfer 的缩写，它将资源作为核心概念，其本身是一套围绕资源进行操作的架构规范。在实际应用中，更多的是体现在 API 的设计上。

企业在进行产品设计开发时，通常首先由业务专家和技术专家一起梳理出业务逻辑和业务模型，然后根据领域驱动设计（DDD）的方法论进行数据建模，设计出领域模型以及针对领域模型的操作。最终，这些领域模型会映射为数据存储的数据模型以及 REST API 的资源模型，而针对领域模型的操作会映射为 HTTP 方法以及 REST API 的 Action。

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

这是一条可选约束，指的是服务端可以根据客户端需求，将可执行代码发送给客户端，从而实现临时性的功能扩展或定制功能，比如以前的 Java Applet、现在新兴的 WebAssembly。

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

在实际开发中，通常是客户端和服务端约定好 API 后进行各自的开发实现。客户端在代码中已经编写了 API 相关的调用，只等服务端开发完成进行联调测试即可。但 REST 认为这是多余的，客户端应该根据服务端返回的链接进行后续操作，返回的资源信息以及操作链接信息能够描述自身以及后续可能发生的状态转移，从而实现超文本驱动应用状态。

依然是查询预约的 API，此时后端返回的预约列表，除了基本信息外还带有预约所需 link，由此客户端知晓后续的预约操作，并请求服务端返回的 link 进行操作。
```
GET /doctors/mjones/slots?date=20100104&status=open HTTP/1.1

[
  {"slot_id": 1234, doctor: "mjones", start: "14:00", end: "14:50", links: [{"rel": "book", "href": "/slots/1234"}]},
  {"slot_id": 5678, doctor: "mjones", start: "16:00", end: "16:50", links: [{"rel": "book", "href": "/slots/5678"}]}
]
```
可以看到返回的数据中包含了支持的预约操作以及操作所对应的链接。笔者在实际工作中很少遇到满足 Level 3 的系统，通常都是 Level 2 的系统。

### REST VS RPC

API 的设计通常有 RPC 和 REST 两种形式。虽然两者并不是一回事，但因为都是面向服务端和客户端的通信制定规范，所以经常被混为一谈。

REST 本身一套面向资源的架构设计思想，而 RPC 的初衷是希望能在分布式系统之间，像调用本地方法一样调用远程方法，围绕通信过程实现进行的一系列实现。RPC 协议也是层出不穷，针对数据的编码、传输以及方法的表达提供不同的解决方案。

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
scheme（协议）domain（域名） path（路径） query（查询参数）fragment（片段）
```

我们这里主要针对 path 和 query 部分进行讨论，对于 PATH 我们可以使用如下规范形式:

```
{domain}/{version}/{serviceId}/{resource}
{domain}/{version}/{serviceId}/{resource}/{id}/{sub-resource}/
{domain}/{version}/{serviceId}/{resource}/{id}/{action}
```
### URI 主体字段含义

首先来看下 URL 中各个字段的含义与设计规范。

- `{domain}` 域名。可以使用统一的域名，也可以针对不同的业务线使用不同的域名。
- `{version}` 表示 API 的版本。形式是 v + 数字，比如 v1， v2。
- `{service}` 服务的唯一标识。比如 `order` 表示订单服务，`user` 表示用户服务，`payment` 表示支付服务。
- `{resource}` 具体的资源，要用名词且为复数形式。比如 `orders` 表示订单资源，`users` 表示用户资源，`payments` 表示支付资源。
- `{id}`：某个资源的唯一标识。
- `{sub-resource}` 子资源，操作场景下和资源有依赖关系，要用名词且为复数形式。比如购物车和购物车项。
- `{action}` 针对资源或子资源的行为操作，用动词或者动词短语表示，用来弥补 HTTP 方法表达上的不足。

### URI 路径规范


- 使用名词表示资源，尽量复数形式，比如 `/users`, `/orders`, `/invoices`。

- 层次表示资源关系（不做动作）：/users/{userId}/orders/{orderId}。
- 避免动词，比如 `/getUser`、`/createOrder`，动作由 HTTP 方法决定。
- 使用短横线 `- `做单词分隔（比下划线或驼峰更友好），比如/user-profiles。
- 小写统一：路径全小写。
- 字符编码：路径和参数必须以标准 UTF-8 编码，如果有汉字、空格等特殊字符，需要进行编码。
- 资源标识尽量使用稳定的 ID（uuid/numeric），不要暴露可变业务字段。
- 如果必须表示特定操作，用子资源或动词作为子资源，比如 `POST /orders/{id}/cancel`。


#### HTTP 方法使用规范

对资源的增删改查应该使用标准的 HTTP 方法，比如 GET、POST、PUT、DELETE。下面是 HTTP 方法于操作的映射关系：

REST API 要求对资源的操作应该与 HTTP 方法对应，下面是资源操作的标准方法与映射关系。

| 资源操作 | HTTP 方法 | 描述                                                    | 是否幂等 | 是否支持 Body | 响应格式                     |
| -------- | --------- | ------------------------------------------------------- | -------- | ------------- | ---------------------------- |
| List     | GET       | 查询资源集合                  | ✅        |  ❌             | 资源列表，无数据时返回空列表 |
| Get      | GET       | 查询单个资源                 | ✅         | ❌              | 资源详情，无数据时返回 404   |
| Update   | PUT       | 对某个资源资源的全量更新            | ✅         | ✅              | 资料详情                     |
| Delete   | DELETE    |   删除某个资源            | ✅         | ❌               | 空                           |
| Create   | POST      | 新建资源                  | ❌          | ✅              | 资源详情                     |
|          | HEAD      | 和 GET 类似，但一般只返回HTTP响应和空消息，可以用来检查元信息 | ✅         | ✘             | 资源详情                     |
| UPDATE   | PATCH     | 对某个资源的局部更新          | ❌          | ❌               | 资源详情                     |
|          | OPTIONS   | 获取API的相关的信息。                                   | ✅         | ✘             | 空                           |

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

### 分页、过滤、排序

分页参数常用两类：`offset/limit` 或 `cursor（基于游标）`。
- offset/limit 简单：GET /items?limit=20&offset=40。
- cursor 更高效于大数据集或实时数据：GET /items?limit=50&cursor=abc123。

尽量设置默认分页大小，如果客户端未指定，服务端应有合理的默认值（如 20 或 50），并设置最大限制（如 100 或 200）。

- 过滤使用明确字段：`GET /users?status=active&role=admin`。复杂过滤可以用 filter 表达式或 POST /search。
- 排序：sort 参数，可带方向：`GET /items?sort=createdAt:desc,name:asc` 或 `sort=-createdAt,name`。
- 在返回中包含 links 和 meta 可以帮助客户端分页。


### 响应码

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

尽量使用 JSON 作为默认格式默认响应格式支持 application/json。对于其他格式，需要支持 content negotiation（Accept header），仅在必要时实现。

对于响应体，推荐使用统一的响应 envelope 结构，比如：

```json
{
    "code": 0, // 业务状态码，0 表示成功，非0表示失败
    "message": "success", // 业务状态描述
    "data": {...}, // 业务数据
}
```

对于错误响应，也尽量保持统一的响应结构，比如：

```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found",
    "details": [
      { "field": "userId", "message": "no user with given id" }
    ],
    "requestId": "abc-123"
  }
}
```
以上结构包含：
-  code：机器可读的错误码
-  message：人类可读的错误描述
-  details：可选的错误详情列表
-  requestId：可选的请求 ID，便于追踪日志
但是要注意生产环境避免泄露堆栈或敏感内部信息。



### 兼容规范


在大型系统中，保持 API 的前向兼容和后向兼容非常关键。

1. 禁止删除或修改已有字段语义

比如将 status 字段类型从 int 改为 string，是不允许的。可以通过新增 status_text 的方式解决。

2. 新增字段时，允许客户端忽略未知字段。

3. 通过 X-Feature-Flag / Prefer 等可选头控制新特性。

4. 如果做不到兼容或者兼容成本非常高，则需要对 API 做版本升级，使用新旧两个版本做兼容。



