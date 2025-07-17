# Web API 路径设计哪家强

本文档主要比较一下各家API的URL路径设计，通过学习各家API的URL路径设计，加深对 REST API 的理解，帮助我们设计出更符合 REST 风格的 API。

## Google

- API 文档地址：[https://developers.google.com/apis-explorer/#p/](https://developers.google.com/apis-explorer/#p/)

### YouTube Data API

- API 文档地址：[YouTube Data API](https://developers.google.com/apis-explorer/#p/youtube/v3/)
- API 前缀：`https://www.googleapis.com/youtube/v3`

**播放列表 API**

- 创建播放列表：`POST /playlists` 
- 查询播放列表集合：`GET /playlists`
- 更新播放列表：`PUT /playlists`
- 删除播放列表：`DELETE /playlists`

**视频 API**

- 上传视频：`POST /videos`
- 查询列表：`GET /videos`
- 更新视频信息：`PUT /videos`
- 删除视频：`DELETE /videos`
- 为视频评分：`POST /videos/rate`
- 获取视频评分：`GET /videos/getRating`

### Calendar API

- API 文档地址：[Calendar API](https://developers.google.com/apis-explorer/#p/calendar/v3/)
- API 前缀：`https://www.googleapis.com/calendar/v3`

**日历 API**

- 创建辅助日历：``POST /calendars``
- 查询日历：`GET /calendars/{calendarId}`
- 更新/补丁日历：`PUT/PATCH /calendars/{calendarId}`
- 删除服务日历：`DELETE /calendars/{calendarId}`
- 清除主日历：`POST /calendars/calendarId/clear`

**事件 API**

- 创建事件：`POST /calendars/calendarId/events`
- 查询日历中的事件：`GET /calendars/calendarId/events`
- 查询单个事件：`GET /calendars/calendarId/events/eventId`
- 更新事件：``PUT /calendars/calendarId/events/eventId`
- 删除事件：`DELETE /calendars/calendarId/events/eventId`
- 移动事件：`POST  /calendars/calendarId/events/eventId/move`

### Gmail API



- API 文档地址：[Gmail API](https://developers.google.com/apis-explorer/#p/gmail/v1/)
- API 前缀：`https://gmail.googleapis.com`

**标签 API**

- 创建标签：`POST /gmail/v1/users/{userId}/labels`
- 查询标签列表：`GET /gmail/v1/users/{userId}/labels`
- 获取指定标签：`GET /gmail/v1/users/{userId}/labels/{id}`
- 更新标签：`PUT /gmail/v1/users/{userId}/labels/{id}`
- 删除标签：`DELETE /gmail/v1/users/{userId}/labels/{id}`


**消息 API**

- 发送消息：`POST /gmail/v1/users/{userId}/messages/send`
- 查询消息列表：`GET /gmail/v1/users/{userId}/messages`
- 获取指定消息：`GET /gmail/v1/users/{userId}/messages/{id}`
- 删除消息：`DELETE /gmail/v1/users/{userId}/messages/{id}`
- 修改邮件标签：`POST /gmail/v1/users/{userId}/messages/{id}/modify`
- 批量修改邮件标签：`POST /gmail/v1/users/{userId}/messages/batchModify`
- 批量删除邮件：`POST /gmail/v1/users/{userId}/messages/batchDelete`

批量修改和批量删除的操作 API 是 `POST` 方法，略违和。

  
### 观察结果

1. 结构基本为：`/ product_line / version / {namespace} / resource / {resourceId} / action`
    - product_line：产品线，区分不同产品，比如 gmail、calendar、adsense
    - version：版本，区分不同版本，比如 v1、v2
    - namespace：命名空间（可选）。可以用来帮助组织区分 API，做不同的访问控制等处理。
    - resource：资源，比如 gmail 下的 messages、labels，使用名词。
    - resourceId：资源ID（可选），比如 gmail 下的 messageId
    - action：动作，对资源进行的操作， 使用动词。

2. 基本使用同一个域名 `www.googleapis.com`，当然也有例外，比如 Gmail API 使用 `https://gmail.googleapis.com`。
3. 使用名词表示资源，命名使用复数。
4. 使用动词或者动词短语表示操作（action）。
5. 对于多个单词的标识符使用驼峰命名。
6. YouTube API 和 Calendar API 对 resourceId 的传参处理不一样。YouTube API 是放在 URL query 或者 body中，而 Calendar API 是放在 URL path 中。（PS：我个人工作中更多的使用 Calendar API 的这种处理方式）



## PayPal

- API 文档地址：[PayPal API](https://developer.paypal.com/docs/api/)
- API 前缀：`https://api.paypal.com`
  
**API 示例**


- 查询授权：`GET /v2/payments/authorizations/{authorization_id}`
- 创建订单：`POST /v2/checkout/orders`
- 更新订单：`PATCH /v2/checkout/orders/{order_id}`
- 查询订单：`GET /v2/checkout/orders/{order_id}`

- 创建发票：`POST /v2/invoicing/invoices`
- 发送发票：`POST /v2/invoicing/invoices/{invoice_id}/send`
- 查询发票列表：`GET /v2/invoicing/invoices`
- 查询发票：`GET /v2/invoicing/invoices/{invoice_id}`
- 删除发票：`DELETE /v2/invoicing/invoices/{invoice_id}`
- 删除外部支付：`DELETE /v2/invoicing/invoices/{invoice_id}/payments/{transaction_id}`
- 生成二维码：`POST /v2/invoicing/invoices/{invoice_id}/generate-qr-code`


### 观察结果

- 域名： 生产 `https://api.paypal.com`；沙盒 `https://api-m.sandbox.paypal.com`
- 结构：`/ version / namespace / resource / {resourceId} / action`
- PayPal API 的结构相对比较干净统一
- 资源命名使用复数
- 使用动词或者动词短语表示操作（action）
- 使用中划线 `-` 作为分隔符

  
## AWS

- API 文档地址：[AWS API](https://docs.aws.amazon.com/)
  
关于域名，AWS使用了一种完全不一样的方案。不同的产品线和不同的地区（region）会有不一样的域名。

**S3 域名**

参考文档：[S3 域名](https://docs.aws.amazon.com/general/latest/gr/s3.html)

- 美国东部 (弗吉尼亚北部)：`s3.us-east-1.amazonaws.com`
- 亚太区域 (香港)：`s3.ap-east-1.amazonaws.com`
- 亚太区域 (东京)：`s3.ap-northeast-1.amazonaws.com`

**EC2 域名**

参考文档：[EC2 域名](https://docs.aws.amazon.com/general/latest/gr/ec2-service.html)

- 美国东部 (弗吉尼亚北部)：`ec2.us-east-1.amazonaws.com`
- 亚太区域 (香港)：`ec2.ap-east-1.amazonaws.com`

基本上来说，格式是：`product_name.regions_name.amazonaws.com/?Action=Function`

**API 示例**
  
- 查询实例：` /ec2.us-east-1.amazonaws.com/?Action=DescribeInstances`
- 启动实例：`https://ec2.amazonaws.com/?Action=StartInstances`
- 创建 VPC：` /ec2.us-east-1.amazonaws.com/?Action=CreateVpc`
- 创建 Volume：` /ec2.us-east-1.amazonaws.com/?Action=CreateVolume`
## Github

- API 文档地址：[Github API](https://developer.github.com/v3/)
- API 域名：`https://api.github.com`
  
**API 示例**


- 取所有 repo：`GET /orgs/{org}/repos`
- 取特定用户名的repo：`/repos/{owner}/{repo}`
- 取某个仓库所有的PR：`GET /repos/{owner}/{repo}/pulls`
- 创建 PR：`POST /repos/{owner}/{repo}/pulls`
- 查询 PR：`GET /repos/{owner}/{repo}/pulls/{pull_number}`
- 更新 PR：`PATCH /repos/{owner}/{repo}/pulls/{pull_number}`
- Merge PR：`PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge`
- 取自己的issue：`GET /user/issues`
- 取某个repo下的issue：`GET /repos/{owner}/{repo}/issues`
- 取用户：`GET /users/{username}`
- 取组织下的所有的项目：`GET /orgs/{org}/projects`
  
### 观察结果


1. 结构：`/resource/ {id} / resource`
2. Github的API没有版本号，也没有namespace，直接就是 resource 开头。
3. URL 就是在不同的 resource 下进行组合和 join。

  
## Dropbox


- API 文档地址：[Dropbox API](https://www.dropbox.com/developers/documentation/http/overview)
- API 域名：`https://api.dropboxapi.com`
  
**API 示例**

- `POST /2/file_properties/templates/add_for_user`
- `POST /2/file_properties/templates/get_for_user`
- `POST /2/file_properties/templates/remove_for_user`
- `POST /2/file_properties/templates/update_for_user`

- `POST /2/file_requests/create`
- `POST /2/files/create_folder_v2`
- `POST /2/users/get_account_batch`
- `POST /2/paper/docs/list`


### 观察结果

1. 结构：`/version / resource / actions`

2. Dropbox 的 API 是在resource 上建各种函数。除了有个总版本，函数上还可以有版本，比如 `/2/files/create_folder_v2`。
   
3. **请求方法 POST 一把梭！**

4. 对于多个单词的 action，使用了下划线 `_` 作为分隔符。关于下划线，在最初的 RFC1738 中规定不合法，但是，RFC1738 被 RFC2396更新了，RFC 2396 允许使用下划线为“unreserved character”，而2015年的时候 RFC 3986（URI现代标准） 更新了 RFC 2396，继续将下划线归类为非保留字符，可以在以下组件中可以直接使用：

- path
- query
- fragment

以下是 [RFC 3986](https://datatracker.ietf.org/doc/html/rfc3986#section-2.3) 中的相关描述：

> Characters that are allowed in a URI but do not have a reserved
   purpose are called unreserved.  These include uppercase and lowercase
   letters, decimal digits, hyphen, period, underscore, and tilde.
>
> unreserved  = ALPHA / DIGIT / "-" / "." / "_" / "~"

## Twitter

- API 文档地址：[Twitter API](https://developer.twitter.com/en/docs/api-reference-index)
- API 域名：api.twitter.com/(普通api)  ads-api.twitter.com(广告用)

**API 示例**

- 获取粉丝列表：`GET /2/users/:id/followers`
- 获取正在关注列表：`GET /2/users/:id/following`
- 关注用户：`POST /2/users/:id/following`
- 取消关注：`DELETE /2/users/:source_user_id/following/:target_user_id`

- 获取用户列表：`GET /2/users/:id/list_memberships`

- 更新列表：`PUT /2/lists/:id`
- 创建列表：`POST /2/lists`
- 删除列表：`DELETE /2/lists/:id`
  
### 观察结果

1. 结构：`/version / resource /action`。
2. Twitter 的 API 结构也很标准，版本号放在最前面。
3. 对于 resource 的命名用复数
4. 使用下划线 `_` 作为分隔符

## Stripe

- API 文档地址：[Stripe API](https://stripe.com/docs/api)
- API 域名：`https://api.stripe.com`

**API 示例**

  
- 获取余额：`GET /v1/balance`
- 获取余额交易列表：`GET /v1/balance_transactions`
- 获取余额交易：`GET /v1/balance_transactions/:id`

- 创建客户：`POST /v1/customers`
- 获取客户列表：`GET /v1/customers`
- 更新客户：`POST /v1/customers/:id`
- 获取客户详情：`GET /v1/customers/:id`
- 删除客户：`DELETE /v1/customers/:id`
- 搜索客户：`GET /v1/customers/search`

- 创建支付方式：`POST /v1/payment_methods`
- 获取支付方式详情：`GET /v1/payment_methods/:id`
- 获取客户支付方式：`GET /v1/customers/:id/payment_methods/:id`
- 创建支付意图：`POST /v1/payment_intents`
- 获取支付意图详情：`GET /v1/payment_intents/:id`


### 观察结果
  
- 结构：`/version/resource/id/action`
- 其更新操作用了 `POST` 而不是 `PUT 方法`
- 对于子资源的区分，使用下划线 `_` 作为分隔符。(PS：感觉使用 namespace + subresource 的形式区分子资源会更好一些，即 `GET /v1/payment/methods/:id`， `GET /v1/payment/intents` 这样。)
- 所有 POST 请求，通过 `Idempotency-Key` 请求头来实现幂等。

```shell
curl https://api.stripe.com/v1/customers \
  -u sk_test_Ou1w6LVt3zmVipDVJsvMeQsc: \
  -H "Idempotency-Key: KG5LxwFBepaKHyUD" \
```

## Trello

- API 文档地址：[Trello API](https://developer.atlassian.com/cloud/trello/rest/)
- API 域名：`https://api.trello.com`
  
**API 示例**
  
- 获取 Action详情：`GET /1/actions/{id}`
- 获取 Action 卡片：`GET /1/actions/{id}/card`
- 获取 Action 看板：`GET /1/actions/{id}/board`
- 更新 Action 文本：`PUT /1/actions/{id}/text`

- 创建 Action 的回应：`POST /1/actions/{idAction}/reactions`
- 获取 Action 的回应：`GET /1/actions/{idAction}/reactions/{id}`
- 删除 Action 的回应：`DELETE /1/actions/{idAction}/reactions/{id}`


- 创建卡片：`POST /1/cards`
- 获取卡片详情：`GET /1/cards/{id}`
- 更新卡片：`PUT /1/cards/{id}`
- 删除卡片：`DEL /1/cards/{id}`
- 获取卡片特定属性：`GET /1/cards/{id}/{field}`

- 获取卡片附件：`GET /1/cards/{id}/attachments`
- 创建卡片附件：`POST /1/cards/{id}/attachments`
- 获取卡片附件：`GET /1/cards/{id}/attachments/{idAttachment}`
- 删除卡片附件：`DEL /1/cards/{id}/attachments/{idAttachment}`


### 观察结果

1. 结构：`/version/resource/{id}/subResource/{subId}`
2. 非常标准的 Restful API 实现，中规中矩，**I like it ！**

## Tencent

### 微信公众号

- API 文档地址：[微信公众号 API](https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Overview.html)
- 域名：
  - 主域名：`api.weixin.qq.com`
  - 灾备域名：`api2.weixin.qq.com`
- 区域域名：`sh.api.weixin.qq.com`, `sz.api.weixin.qq.com`, `hk.api.weixin.qq.com`


**API 示例**

- 获取用户列表：`GET /cgi-bin/user/get`
- 获取用户信息：`GET /cgi-bin/user/info`
- 设置用户备注：`POST /cgi-bin/user/info/updateremark`
  
- 查询卡劵：`POST /cgi-bin/card/code/get`
- 核销卡劵：`POST /cgi-bin/card/code/consume`

- 新增永久素材：`POST /cgi-bin/material/add_material`
- 获取永久素材：`POST /cgi-bin/material/get_material`
- 删除永久素材：`POST /cgi-bin/material/del_material`
- 获取素材总数：`GET /cgi-bin/material/get_materialcount`
- 获取素材列表：`POST /cgi-bin/material/batchget_material`
  

### 微信支付


- API 文档地址：[微信支付 API](https://pay.weixin.qq.com/docs/merchant/products/jsapi-payment/introduction.html)
- 域名：`api.mch.weixin.qq.com`，备域名：`api2.mch.weixin.qq.com`

**API 示例**

- app 下单：`POST /v3/pay/transactions/app`
- h5 下单：`POST /v3/pay/transactions/h5`
- 小程序下单：`POST /v3/pay/transactions/jsapi`

- 查询订单：`GET /v3/pay/transactions/out-trade-no/{out_trade_no}`
- 关闭订单：`POST /v3/pay/transactions/out-trade-no/{out_trade_no}/close`
- 申请退款：`POST /v3/refund/domestic/refunds`

- 创建支付分订单：`POST /v3/payscore/serviceorder`
- 查询支付分订单：`GET /v3/payscore/serviceorder/`
- 取消支付分订单：`POST /v3/payscore/serviceorder/{out_order_no}/cancel`

- 核销用户券：`POST /v3/marketing/busifavor/coupons/use`

  
### 腾讯开放平台

- API 文档地址：[腾讯开放平台 API](https://open.tencent.com/)
- 域名：`graph.qq.com`
  

**API 示例**

- 获取 QQ 用户信息：`GET /user/get_user_info`

### 腾讯云

- API 文档地址：[腾讯云 API](https://cloud.tencent.com/document/api)
- 域名：`cvm.tencentcloudapi.com`
  
**API 实例**

腾讯云的 API 文档没有 API 路径，所有操作都是通过请求 body 或者 params 里的  `Action` 来区分。

- 启动实例：`GET https://cvm.tencentcloudapi.com/?Action=StartInstances`
- 关闭实例：`GET https://cvm.tencentcloudapi.com/?Action=StopInstances`

### 观察结果

1. 有多个域名，用于不同的产品线。
2. 微信、QQ 的 API 风格差不多基本都是 /resource/action 的方式
3. 腾讯云的 API 没有 URL，全部是直接请求域名即可。通过请求 body 或者 params 里的 `Action` 来区分。


## 总结

- 大部分都符合 Restful API 的设计，围绕 resource 和 action 来设计，增删改查使用对应的 HTTP 方法。
- 结构大部分使用 `/version/resource/{id}/action` 这种形式。
- resource 命名使用复数；用动词或者动词短语表示操作（action）。
- 对于多个单词的标识符使用中划线 `-` 或者下划线 `_` 作为分隔符，也有驼峰命名法。个人更喜欢中划线 `-` 作为分隔符，无论在命令行还是浏览器里，更容易识别。
- AWS 和 腾讯云的 API 设计比较特殊，没有使用 URL 来区分不同的资源，而是使用 **Action** 字段区分，是一种 RPC 风格的设计。
