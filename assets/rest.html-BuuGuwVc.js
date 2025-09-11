import{_ as i,r as p,c as l,o as r,b as s,a as t,d as a,e as o}from"./app-C-eiXR-Q.js";const d={},u={href:"https://cloud.google.com/apis/design?hl=zh-cn",target:"_blank",rel:"noopener noreferrer"},c={href:"https://martinfowler.com/articles/richardsonMaturityModel.html#level0",target:"_blank",rel:"noopener noreferrer"},v={href:"https://www.rfc-editor.org/rfc/rfc3986.html",target:"_blank",rel:"noopener noreferrer"};function m(k,n){const e=p("ExternalLinkIcon");return r(),l("div",null,[n[9]||(n[9]=s("h1",{id:"web-api-设计规范",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#web-api-设计规范","aria-hidden":"true"},"#"),a(" WEB API 设计规范")],-1)),n[10]||(n[10]=s("h2",{id:"rest-api-简介",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#rest-api-简介","aria-hidden":"true"},"#"),a(" REST API 简介")],-1)),n[11]||(n[11]=s("p",null,"REST 是 Representational State Transfer 的缩写，它将资源作为核心概念，其本身是一套围绕资源进行操作的架构规范。在实际应用中，更多的是体现在 API 的设计上。",-1)),n[12]||(n[12]=s("p",null,"企业在进行产品设计开发时，通常首先由业务专家和技术专家一起梳理出业务逻辑和业务模型，然后根据领域驱动设计（DDD）的方法论进行数据建模，设计出领域模型以及针对领域模型的操作。最终，这些领域模型会映射为数据存储的数据模型以及 REST API 的资源模型，而针对领域模型的操作会映射为 HTTP 方法以及 REST API 的 Action。",-1)),s("p",null,[n[1]||(n[1]=a("REST API 几乎已经是互联网服务 Web API 设计的事实标准，根据 Google 的 ",-1)),s("a",u,[n[0]||(n[0]=a("API 设计指南",-1)),o(e)]),n[2]||(n[2]=a("，早在 2010 年，就有大约 74% 的公共网络 API 是 HTTP REST（或类似 REST）风格的设计，大多数 API 均使用 JSON 作为传输格式。",-1))]),n[13]||(n[13]=t('<h3 id="restful-设计原则" tabindex="-1"><a class="header-anchor" href="#restful-设计原则" aria-hidden="true">#</a> RESTful 设计原则</h3><p>满足 REST 要求的架构需遵循以下6个设计原则：</p><p><strong>1. 客户端与服务端分离</strong></p><p>目的是将客户端和服务端的关注点分离。在 Web 应用中，将用户界面所关注的逻辑和服务端数据存储所关注的逻辑分离开来，有助于提高客户端的跨平台的可移植性；也有助于提高服务端的可扩展性。</p><p>随着前端技术的发展，前后端分离已经是主流的开发方式，传统的 Spring MVC/Django 的前端模板渲染已经被逐渐弃用了。</p><p><strong>2. 无状态</strong></p><p>服务端不保存客户端的上下文信息，会话信息由客户端保存，服务端根据客户端的请求信息处理请求。</p><p>在实际开发中，服务端通常会保存一些状态信息，比如会话信息、认证信息等，这些信息一般是保存在服务端的数据库或者缓存中。</p><p><strong>3. 可缓存</strong></p><p>这一条算是上一条的延伸，无状态服务提升了系统的可靠性、可扩展性，但也会造成不必要的网络开销。为了缓解这个问题，REST 要求客户端或者中间代理（网关）能缓存服务端的响应数据。服务端的响应信息必须明确表示是否可以被缓存以及缓存的时长，以避免客户端请求到过期数据。</p><p>管理良好的缓存机制可以有效减少客户端-服务器之间的交互，甚至完全避免客户端-服务器交互，从而提升了系统的性能和可扩展性。</p><p><strong>4. 分层系统</strong></p><p>对于客户端来说，中间代理是透明的。客户端无需知道请求路径中代理、网关、负载均衡等中间件的存在，这样可以提高系统的可扩展性和安全性。</p><p><strong>5. 统一接口</strong></p><p>REST 要求开发者面向资源来设计系统，有下面四个约束：</p><ul><li><p><strong>每次请求中都包含资源 ID</strong></p></li><li><p><strong>所有操作均等通过资源 ID 进行</strong></p></li><li><p><strong>消息是自描述的</strong>：每条消息包含足够的信息来描述如何处理这条消息。比如 mime 标识媒体类型，content-type 标识编码格式，language 标识语言，charset 标识字符集，encoding 标识压缩格式等。</p></li><li><p><strong>用超媒体驱动应用状态（HATEOAS，Hypermedia as the Engine of Application State）</strong>：客户端在访问了最初的 REST API 后，服务端会返回后续操作的链接，客户端使用服务端提供的链接动态的发现可用资源和可执行操作。</p></li></ul><p><strong>6. 按需编码（可选）</strong></p><p>这是一条可选约束，指的是服务端可以根据客户端需求，将可执行代码发送给客户端，从而实现临时性的功能扩展或定制功能，比如以前的 Java Applet、现在新兴的 WebAssembly。</p><h3 id="rest-api-成熟度模型" tabindex="-1"><a class="header-anchor" href="#rest-api-成熟度模型" aria-hidden="true">#</a> REST API 成熟度模型</h3><p>上述约束读起来还是有些抽象，鉴于在实际开发中，我们更多是聚焦在 API 设计上。为了衡量一个系统是否符合 REST 风格，《RESTful Web APIs》和《RESTful Web Services》的作者 Leonard Richardson 提出了 REST 成熟度模型，根据 API 的设计风格将其分为了 4 级。</p><h4 id="第-0-级-完全不符合-rest-风格" tabindex="-1"><a class="header-anchor" href="#第-0-级-完全不符合-rest-风格" aria-hidden="true">#</a> 第 0 级: 完全不符合 REST 风格</h4><p>比如 RPC 面向过程的 API 设计基本是围绕操作过程来设计的，完全没有资源的概念。</p>',22)),s("p",null,[n[4]||(n[4]=a("下面是 Martin Fowler 在介绍成熟度模型的 blog ",-1)),s("a",c,[n[3]||(n[3]=a("Richardson Maturity Model",-1)),o(e)]),n[5]||(n[5]=a(" 中举的病人预约的例子，病人首先需要查询医生可预约的时间表，然后提交预约。",-1))]),n[14]||(n[14]=t(`<p>查询预约服务时提交的请求为</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>POST /appointmentService?action=query HTTP/<span class="token number">1.1</span>

<span class="token punctuation">{</span>
    <span class="token property">&quot;date&quot;</span><span class="token operator">:</span> <span class="token string">&quot;2020-03-04&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;doctor&quot;</span><span class="token operator">:</span> <span class="token string">&quot;mjones&quot;</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>请求成功后响应如下</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>HTTP/1.1 200 OK
[
    {
        &quot;start&quot;: &quot;14:00&quot;,
        &quot;end&quot;: &quot;14:50&quot;,
        &quot;doctor&quot;: &quot;mjones&quot;
    },
    {
        &quot;start&quot;: &quot;16:00&quot;,
        &quot;end&quot;: &quot;16:50&quot;,
        &quot;doctor&quot;: &quot;mjones&quot;
    }
]
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>然后病人选择时段提交预约</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>POST /appointmentService?action=confirm HTTP/<span class="token number">1.1</span>

<span class="token punctuation">{</span>
    <span class="token property">&quot;slot&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;start&quot;</span><span class="token operator">:</span> <span class="token string">&quot;14:00&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;end&quot;</span><span class="token operator">:</span> <span class="token string">&quot;14:50&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;doctor&quot;</span><span class="token operator">:</span> <span class="token string">&quot;mjones&quot;</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token property">&quot;patient&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;id&quot;</span><span class="token operator">:</span> <span class="token string">&quot;jsmith&quot;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>预定成功时响应如下</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>HTTP/<span class="token number">1.1</span> <span class="token number">200</span> OK

<span class="token punctuation">{</span>
    <span class="token property">&quot;slot&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;start&quot;</span><span class="token operator">:</span> <span class="token string">&quot;14:00&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;end&quot;</span><span class="token operator">:</span> <span class="token string">&quot;14:50&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;doctor&quot;</span><span class="token operator">:</span> <span class="token string">&quot;mjones&quot;</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token property">&quot;patient&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;id&quot;</span><span class="token operator">:</span> <span class="token string">&quot;jsmith&quot;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>预定失败时响应如下</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>HTTP/<span class="token number">1.1</span> <span class="token number">200</span> OK

<span class="token punctuation">{</span>
    <span class="token property">&quot;slot&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;start&quot;</span><span class="token operator">:</span> <span class="token string">&quot;14:00&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;end&quot;</span><span class="token operator">:</span> <span class="token string">&quot;14:50&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;doctor&quot;</span><span class="token operator">:</span> <span class="token string">&quot;mjones&quot;</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token property">&quot;patient&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;id&quot;</span><span class="token operator">:</span> <span class="token string">&quot;jsmith&quot;</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token property">&quot;reason&quot;</span><span class="token operator">:</span> <span class="token string">&quot;Slot not available&quot;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到整个请求过程没有涉及到资源的概念，并且请求也比较简洁明了。但如果操作越来越多，接口也越来越多，随之而来的维护、沟通成本也会越来越高。</p><h4 id="第-1-级-引入资源概念" tabindex="-1"><a class="header-anchor" href="#第-1-级-引入资源概念" aria-hidden="true">#</a> 第 1 级：引入资源概念</h4><p>引入资源后，对服务端的访问都是围绕资源，通过资源 ID 进行。此时的查询和预约请求如下：</p><p>查询预约：以医生为资源，通过 ID查询</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>POST /doctors/mjones HTTP/<span class="token number">1.1</span>

<span class="token punctuation">{</span>date<span class="token operator">:</span> <span class="token string">&quot;2020-03-04&quot;</span><span class="token punctuation">}</span>

<span class="token comment">// 请求响应</span>

<span class="token punctuation">[</span>
  <span class="token punctuation">{</span><span class="token property">&quot;slot_id&quot;</span><span class="token operator">:</span> <span class="token number">1234</span><span class="token punctuation">,</span> doctor<span class="token operator">:</span> <span class="token string">&quot;mjones&quot;</span><span class="token punctuation">,</span> start<span class="token operator">:</span> <span class="token string">&quot;14:00&quot;</span><span class="token punctuation">,</span> end<span class="token operator">:</span> <span class="token string">&quot;14:50&quot;</span><span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token punctuation">{</span><span class="token property">&quot;slot_id&quot;</span><span class="token operator">:</span> <span class="token number">5678</span><span class="token punctuation">,</span> doctor<span class="token operator">:</span> <span class="token string">&quot;mjones&quot;</span><span class="token punctuation">,</span> start<span class="token operator">:</span> <span class="token string">&quot;16:00&quot;</span><span class="token punctuation">,</span> end<span class="token operator">:</span> <span class="token string">&quot;16:50&quot;</span><span class="token punctuation">}</span>
<span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>提交预约时，以时间表 slot 为资源，通过 ID 预约</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>POST /slots/<span class="token number">1234</span> HTTP/<span class="token number">1.1</span>

<span class="token punctuation">{</span> <span class="token property">&quot;patient_id&quot;</span><span class="token operator">:</span> <span class="token string">&quot;jsmith&quot;</span> <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="第-2-级-操作映射到-http-方法" tabindex="-1"><a class="header-anchor" href="#第-2-级-操作映射到-http-方法" aria-hidden="true">#</a> 第 2 级：操作映射到 HTTP 方法</h4><p>上面的例子中所有请求都是用的 POST 方法，Level2 要求将操作映射到 HTTP 方法。对于资源的操作无非就是增删改查，HTTP 对应的 POST、DELETE、PUT/PATCH、GET 可以很好的表达这些操作。</p><ul><li>查询档期，使用 GET 方法</li></ul><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>GET /doctors/mjones/schedule?date=<span class="token number">2020</span><span class="token number">-03</span><span class="token number">-04</span>&amp;status=open HTTP/<span class="token number">1</span>.

<span class="token punctuation">[</span>
  <span class="token punctuation">{</span><span class="token property">&quot;slot_id&quot;</span><span class="token operator">:</span> <span class="token number">1234</span><span class="token punctuation">,</span> doctor<span class="token operator">:</span> <span class="token string">&quot;mjones&quot;</span><span class="token punctuation">,</span> start<span class="token operator">:</span> <span class="token string">&quot;14:00&quot;</span><span class="token punctuation">,</span> end<span class="token operator">:</span> <span class="token string">&quot;14:50&quot;</span><span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token punctuation">{</span><span class="token property">&quot;slot_id&quot;</span><span class="token operator">:</span> <span class="token number">5678</span><span class="token punctuation">,</span> doctor<span class="token operator">:</span> <span class="token string">&quot;mjones&quot;</span><span class="token punctuation">,</span> start<span class="token operator">:</span> <span class="token string">&quot;16:00&quot;</span><span class="token punctuation">,</span> end<span class="token operator">:</span> <span class="token string">&quot;16:50&quot;</span><span class="token punctuation">}</span>
<span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>创建预约，使用 POST 方法</li></ul><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>POST /schedules/<span class="token number">1234</span> HTTP/<span class="token number">1.1</span>

<span class="token punctuation">{</span> <span class="token property">&quot;patient_id&quot;</span><span class="token operator">:</span> <span class="token string">&quot;jsmith&quot;</span> <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code><span class="token comment">// 预定成功响应</span>
HTTP/<span class="token number">1.1</span> <span class="token number">201</span> Created
Location<span class="token operator">:</span> slots/<span class="token number">1234</span>/appointment

<span class="token punctuation">{</span>
    <span class="token property">&quot;slot&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;id&quot;</span><span class="token operator">:</span> <span class="token number">1234</span><span class="token punctuation">,</span>
        <span class="token property">&quot;doctor&quot;</span><span class="token operator">:</span> <span class="token string">&quot;mjones&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;start&quot;</span><span class="token operator">:</span> <span class="token string">&quot;14:00&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;end&quot;</span><span class="token operator">:</span> <span class="token string">&quot;14:50&quot;</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token property">&quot;patient&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;id&quot;</span><span class="token operator">:</span> <span class="token string">&quot;jsmith&quot;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>预定失败时，需要返回能表达错误原因的响应码，而不是像之前一样返回 200。</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>HTTP/<span class="token number">1.1</span> <span class="token number">409</span> Conflict

<span class="token punctuation">[</span>
  <span class="token punctuation">{</span><span class="token property">&quot;slot_id&quot;</span><span class="token operator">:</span> <span class="token number">5678</span><span class="token punctuation">,</span> doctor<span class="token operator">:</span> <span class="token string">&quot;mjones&quot;</span><span class="token punctuation">,</span> start<span class="token operator">:</span> <span class="token string">&quot;16:00&quot;</span><span class="token punctuation">,</span> end<span class="token operator">:</span> <span class="token string">&quot;16:50&quot;</span><span class="token punctuation">}</span>  
<span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>第2级是目前绝大多数系统所达到的级别。</p><h4 id="第-3-级-状态转移完全由后端驱动" tabindex="-1"><a class="header-anchor" href="#第-3-级-状态转移完全由后端驱动" aria-hidden="true">#</a> 第 3 级：状态转移完全由后端驱动</h4><p>在实际开发中，通常是客户端和服务端约定好 API 后进行各自的开发实现。客户端在代码中已经编写了 API 相关的调用，只等服务端开发完成进行联调测试即可。但 REST 认为这是多余的，客户端应该根据服务端返回的链接进行后续操作，返回的资源信息以及操作链接信息能够描述自身以及后续可能发生的状态转移，从而实现超文本驱动应用状态。</p><p>依然是查询预约的 API，此时后端返回的预约列表，除了基本信息外还带有预约所需 link，由此客户端知晓后续的预约操作，并请求服务端返回的 link 进行操作。</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>GET /doctors/mjones/slots?date=20100104&amp;status=open HTTP/1.1

[
  {&quot;slot_id&quot;: 1234, doctor: &quot;mjones&quot;, start: &quot;14:00&quot;, end: &quot;14:50&quot;, links: [{&quot;rel&quot;: &quot;book&quot;, &quot;href&quot;: &quot;/slots/1234&quot;}]},
  {&quot;slot_id&quot;: 5678, doctor: &quot;mjones&quot;, start: &quot;16:00&quot;, end: &quot;16:50&quot;, links: [{&quot;rel&quot;: &quot;book&quot;, &quot;href&quot;: &quot;/slots/5678&quot;}]}
]
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到返回的数据中包含了支持的预约操作以及操作所对应的链接。笔者在实际工作中很少遇到满足 Level 3 的系统，通常都是 Level 2 的系统。</p><h3 id="rest-vs-rpc" tabindex="-1"><a class="header-anchor" href="#rest-vs-rpc" aria-hidden="true">#</a> REST VS RPC</h3><p>API 的设计通常有 RPC 和 REST 两种形式。虽然两者并不是一回事，但因为都是面向服务端和客户端的通信制定规范，所以经常被混为一谈。</p><p>REST 本身一套面向资源的架构设计思想，而 RPC 的初衷是希望能在分布式系统之间，像调用本地方法一样调用远程方法，围绕通信过程实现进行的一系列实现。RPC 协议也是层出不穷，针对数据的编码、传输以及方法的表达提供不同的解决方案。</p><p>具体到 API 设计上，其主要区别在于：<strong>REST 是面向资源的，而 RPC 是面向过程的</strong>。以一个用户的增删改查为例，REST 的 API 设计如下</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code># 创建用户
POST /users
# 查询用户列表
GET /users  
# 查询用户详情
GET /users/{id}
# 更新用户信息
PUT /users/{id}
# 删除用户
DELETE /users/{id}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>而 RPC 的 API 设计如下：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code># 创建用户
POST /createUser
# 查询用户列表
GET /getUserList
# 查询用户详情
GET /getUserById
# 更新用户信息
PUT /updateUser
# 删除用户
DELETE /deleteUser
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="uri-的设计规范" tabindex="-1"><a class="header-anchor" href="#uri-的设计规范" aria-hidden="true">#</a> URI 的设计规范</h2><p>了解了 REST API 的一些基本概念，下面我们看下可以在实践中应用的 URI设计规范。</p>`,41)),s("p",null,[n[7]||(n[7]=a("根据 ",-1)),s("a",v,[n[6]||(n[6]=a("RFC 3986 - - Uniform Resource Identifier (URI): Generic Syntax",-1)),o(e)]),n[8]||(n[8]=a(" 中的定义，一个 URI 的结构如下所示：",-1))]),n[15]||(n[15]=t(`<div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>       foo://example.com:8042/over/there?name=ferret#nose
       \\_/   \\______________/\\_________/ \\_________/\\__/
        |        |              |          |          |
scheme（协议）domain（域名） path（路径） query（查询参数）fragment（片段）
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们这里主要针对 path 和 query 部分进行讨论，对于 PATH 我们可以使用如下规范形式:</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>{domain}/{version}/{serviceId}/{resource}
{domain}/{version}/{serviceId}/{resource}/{id}/{sub-resource}/
{domain}/{version}/{serviceId}/{resource}/{id}/{action}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="uri-主体字段含义" tabindex="-1"><a class="header-anchor" href="#uri-主体字段含义" aria-hidden="true">#</a> URI 主体字段含义</h3><p>首先来看下 URL 中各个字段的含义与设计规范。</p><ul><li><code>{domain}</code> 域名。可以使用统一的域名，也可以针对不同的业务线使用不同的域名。</li><li><code>{version}</code> 表示 API 的版本。形式是 v + 数字，比如 v1， v2。</li><li><code>{service}</code> 服务的唯一标识。比如 <code>order</code> 表示订单服务，<code>user</code> 表示用户服务，<code>payment</code> 表示支付服务。</li><li><code>{resource}</code> 具体的资源，要用名词且为复数形式。比如 <code>orders</code> 表示订单资源，<code>users</code> 表示用户资源，<code>payments</code> 表示支付资源。</li><li><code>{id}</code>：某个资源的唯一标识。</li><li><code>{sub-resource}</code> 子资源，操作场景下和资源有依赖关系，要用名词且为复数形式。比如购物车和购物车项。</li><li><code>{action}</code> 针对资源或子资源的行为操作，用动词或者动词短语表示，用来弥补 HTTP 方法表达上的不足。</li></ul><h3 id="uri-路径规范" tabindex="-1"><a class="header-anchor" href="#uri-路径规范" aria-hidden="true">#</a> URI 路径规范</h3><ul><li><p>使用名词表示资源，尽量复数形式，比如 <code>/users</code>, <code>/orders</code>, <code>/invoices</code>。</p></li><li><p>层次表示资源关系（不做动作）：/users/{userId}/orders/{orderId}。</p></li><li><p>避免动词，比如 <code>/getUser</code>、<code>/createOrder</code>，动作由 HTTP 方法决定。</p></li><li><p>使用短横线 <code>- </code>做单词分隔（比下划线或驼峰更友好），比如/user-profiles。</p></li><li><p>小写统一：路径全小写。</p></li><li><p>字符编码：路径和参数必须以标准 UTF-8 编码，如果有汉字、空格等特殊字符，需要进行编码。</p></li><li><p>资源标识尽量使用稳定的 ID（uuid/numeric），不要暴露可变业务字段。</p></li><li><p>如果必须表示特定操作，用子资源或动词作为子资源，比如 <code>POST /orders/{id}/cancel</code>。</p></li></ul><h4 id="http-方法使用规范" tabindex="-1"><a class="header-anchor" href="#http-方法使用规范" aria-hidden="true">#</a> HTTP 方法使用规范</h4><p>对资源的增删改查应该使用标准的 HTTP 方法，比如 GET、POST、PUT、DELETE。下面是 HTTP 方法于操作的映射关系：</p><p>REST API 要求对资源的操作应该与 HTTP 方法对应，下面是资源操作的标准方法与映射关系。</p><table><thead><tr><th>资源操作</th><th>HTTP 方法</th><th>描述</th><th>是否幂等</th><th>是否支持 Body</th><th>响应格式</th></tr></thead><tbody><tr><td>List</td><td>GET</td><td>查询资源集合</td><td>✅</td><td>❌</td><td>资源列表，无数据时返回空列表</td></tr><tr><td>Get</td><td>GET</td><td>查询单个资源</td><td>✅</td><td>❌</td><td>资源详情，无数据时返回 404</td></tr><tr><td>Update</td><td>PUT</td><td>对某个资源资源的全量更新</td><td>✅</td><td>✅</td><td>资料详情</td></tr><tr><td>Delete</td><td>DELETE</td><td>删除某个资源</td><td>✅</td><td>❌</td><td>空</td></tr><tr><td>Create</td><td>POST</td><td>新建资源</td><td>❌</td><td>✅</td><td>资源详情</td></tr><tr><td></td><td>HEAD</td><td>和 GET 类似，但一般只返回HTTP响应和空消息，可以用来检查元信息</td><td>✅</td><td>✘</td><td>资源详情</td></tr><tr><td>UPDATE</td><td>PATCH</td><td>对某个资源的局部更新</td><td>❌</td><td>❌</td><td>资源详情</td></tr><tr><td></td><td>OPTIONS</td><td>获取API的相关的信息。</td><td>✅</td><td>✘</td><td>空</td></tr></tbody></table><p>以下是基本的 API 示例</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>// 创建用户
POST /users

//查询用户列表
GET /users

// 查询用户详情
GET /users/1

// 更新用户信息
PUT /users/1

// 删除用户
DELETE /users/1
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果有特殊的动作可以在路径中使用 action 来标识，action 必须是动词性质的单词或短语。比如</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code># 实名认证
POST /users/1/real-name-auth

# 取消订单
PUT /orders/123456/cancel

# 激活优惠券
PUT /coupons/123456/activate
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="分页、过滤、排序" tabindex="-1"><a class="header-anchor" href="#分页、过滤、排序" aria-hidden="true">#</a> 分页、过滤、排序</h3><p>分页参数常用两类：<code>offset/limit</code> 或 <code>cursor（基于游标）</code>。</p><ul><li>offset/limit 简单：GET /items?limit=20&amp;offset=40。</li><li>cursor 更高效于大数据集或实时数据：GET /items?limit=50&amp;cursor=abc123。</li></ul><p>尽量设置默认分页大小，如果客户端未指定，服务端应有合理的默认值（如 20 或 50），并设置最大限制（如 100 或 200）。</p><ul><li>过滤使用明确字段：<code>GET /users?status=active&amp;role=admin</code>。复杂过滤可以用 filter 表达式或 POST /search。</li><li>排序：sort 参数，可带方向：<code>GET /items?sort=createdAt:desc,name:asc</code> 或 <code>sort=-createdAt,name</code>。</li><li>在返回中包含 links 和 meta 可以帮助客户端分页。</li></ul><h3 id="响应码" tabindex="-1"><a class="header-anchor" href="#响应码" aria-hidden="true">#</a> 响应码</h3><p>必须使用正确的 HTTP 状态码。HTTP 协议定义的状态码分类如下：</p><table><thead><tr><th>状态码</th><th>分类</th><th>说明</th></tr></thead><tbody><tr><td>1xx</td><td>信息性状态码</td><td>表示临时响应，需要客户端进一步操作</td></tr><tr><td>2xx</td><td>成功状态码</td><td>表示请求成功</td></tr><tr><td>3xx</td><td>重定向状态码</td><td>表示需要客户端进一步操作</td></tr><tr><td>4xx</td><td>客户端错误状态码</td><td>表示客户端请求错误，比如 400 错误请求，401 未认证，403 禁止访问，404 未找到资源，405 方法不允许，429 请求过多</td></tr><tr><td>5xx</td><td>服务器错误状态码</td><td>表示服务器处理请求错误，比如 500 服务器错误，502 网关错误，503 服务不可用，504 网关超时</td></tr></tbody></table><ul><li>在 API 设计开发时，至少需要区分 2xx、 4xx、5xx 三种状态码。</li><li>在必要时可以细化状态码 <ul><li>创建成功：201 Created</li><li>查询成功：200 OK</li><li>更新成功：200 OK，或 204 No Content，表示执行成功但不返回数据</li><li>删除成功：200 OK；未找到资源：404 Not Found，资源已被删除或不可用 410</li></ul></li></ul><h4 id="响应体规范" tabindex="-1"><a class="header-anchor" href="#响应体规范" aria-hidden="true">#</a> 响应体规范</h4><p>尽量使用 JSON 作为默认格式默认响应格式支持 application/json。对于其他格式，需要支持 content negotiation（Accept header），仅在必要时实现。</p><p>对于响应体，推荐使用统一的响应 envelope 结构，比如：</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code><span class="token punctuation">{</span>
    <span class="token property">&quot;code&quot;</span><span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token comment">// 业务状态码，0 表示成功，非0表示失败</span>
    <span class="token property">&quot;message&quot;</span><span class="token operator">:</span> <span class="token string">&quot;success&quot;</span><span class="token punctuation">,</span> <span class="token comment">// 业务状态描述</span>
    <span class="token property">&quot;data&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>...<span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token comment">// 业务数据</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对于错误响应，也尽量保持统一的响应结构，比如：</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code><span class="token punctuation">{</span>
  <span class="token property">&quot;error&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;code&quot;</span><span class="token operator">:</span> <span class="token string">&quot;USER_NOT_FOUND&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;message&quot;</span><span class="token operator">:</span> <span class="token string">&quot;User not found&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;details&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span>
      <span class="token punctuation">{</span> <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;userId&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;message&quot;</span><span class="token operator">:</span> <span class="token string">&quot;no user with given id&quot;</span> <span class="token punctuation">}</span>
    <span class="token punctuation">]</span><span class="token punctuation">,</span>
    <span class="token property">&quot;requestId&quot;</span><span class="token operator">:</span> <span class="token string">&quot;abc-123&quot;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以上结构包含：</p><ul><li>code：机器可读的错误码</li><li>message：人类可读的错误描述</li><li>details：可选的错误详情列表</li><li>requestId：可选的请求 ID，便于追踪日志 但是要注意生产环境避免泄露堆栈或敏感内部信息。</li></ul><h3 id="兼容规范" tabindex="-1"><a class="header-anchor" href="#兼容规范" aria-hidden="true">#</a> 兼容规范</h3><p>在大型系统中，保持 API 的前向兼容和后向兼容非常关键。</p><ol><li>禁止删除或修改已有字段语义</li></ol><p>比如将 status 字段类型从 int 改为 string，是不允许的。可以通过新增 status_text 的方式解决。</p><ol start="2"><li><p>新增字段时，允许客户端忽略未知字段。</p></li><li><p>通过 X-Feature-Flag / Prefer 等可选头控制新特性。</p></li><li><p>如果做不到兼容或者兼容成本非常高，则需要对 API 做版本升级，使用新旧两个版本做兼容。</p></li></ol>`,38))])}const q=i(d,[["render",m],["__file","rest.html.vue"]]);export{q as default};
