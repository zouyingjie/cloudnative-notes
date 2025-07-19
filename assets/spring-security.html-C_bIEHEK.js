import{_ as o,r as l,c,o as r,a as s,d as t,b as a,e as i}from"./app-ouoXKg5d.js";const p={},u={href:"https://blog.csdn.net/weixin_44510615/article/details/131588888",target:"_blank",rel:"noopener noreferrer"},d={href:"https://docs.spring.io/spring-security/reference/6.3/servlet/architecture.html#servlet-securityfilterchain",target:"_blank",rel:"noopener noreferrer"};function v(m,n){const e=l("ExternalLinkIcon");return r(),c("div",null,[n[5]||(n[5]=s("h1",{id:"实践-spring-security-简明教程",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#实践-spring-security-简明教程","aria-hidden":"true"},"#"),a(" 实践：Spring Security 简明教程")],-1)),s("p",null,[n[1]||(n[1]=a("上篇介绍了认证、授权相关的理论概念，本篇以作者熟悉的 Spring Security 为例，介绍其具体使用。这里只介绍具体的使用，原理部分的介绍请参考笔者之前的博客 ")),s("a",u,[n[0]||(n[0]=a("深入理解 Spring Security 工作原理")),i(e)]),n[2]||(n[2]=a("。"))]),n[6]||(n[6]=t(`<h2 id="项目初始化" tabindex="-1"><a class="header-anchor" href="#项目初始化" aria-hidden="true">#</a> 项目初始化</h2><p>这里我们使用 Spring Boot 3.3.0 版本，对应的 Spring Security 是 6.3.0 版本。首先添加下面的依赖：</p><div class="language-xml line-numbers-mode" data-ext="xml"><pre class="language-xml"><code><span class="token prolog">&lt;?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?&gt;</span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>project</span> <span class="token attr-name">xmlns</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>http://maven.apache.org/POM/4.0.0<span class="token punctuation">&quot;</span></span> <span class="token attr-name"><span class="token namespace">xmlns:</span>xsi</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>http://www.w3.org/2001/XMLSchema-instance<span class="token punctuation">&quot;</span></span>
	<span class="token attr-name"><span class="token namespace">xsi:</span>schemaLocation</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>modelVersion</span><span class="token punctuation">&gt;</span></span>4.0.0<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>modelVersion</span><span class="token punctuation">&gt;</span></span>
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>parent</span><span class="token punctuation">&gt;</span></span>
		<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>groupId</span><span class="token punctuation">&gt;</span></span>org.springframework.boot<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>groupId</span><span class="token punctuation">&gt;</span></span>
		<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>artifactId</span><span class="token punctuation">&gt;</span></span>spring-boot-starter-parent<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>artifactId</span><span class="token punctuation">&gt;</span></span>
		<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>version</span><span class="token punctuation">&gt;</span></span>3.3.0<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>version</span><span class="token punctuation">&gt;</span></span>
		<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>relativePath</span><span class="token punctuation">/&gt;</span></span> 
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>parent</span><span class="token punctuation">&gt;</span></span>

	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>properties</span><span class="token punctuation">&gt;</span></span>
		<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>java.version</span><span class="token punctuation">&gt;</span></span>21<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>java.version</span><span class="token punctuation">&gt;</span></span>
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>properties</span><span class="token punctuation">&gt;</span></span>
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dependencies</span><span class="token punctuation">&gt;</span></span>
		<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dependency</span><span class="token punctuation">&gt;</span></span>
			<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>groupId</span><span class="token punctuation">&gt;</span></span>org.springframework.boot<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>groupId</span><span class="token punctuation">&gt;</span></span>
			<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>artifactId</span><span class="token punctuation">&gt;</span></span>spring-boot-starter-web<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>artifactId</span><span class="token punctuation">&gt;</span></span>
		<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>dependency</span><span class="token punctuation">&gt;</span></span>
		<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dependency</span><span class="token punctuation">&gt;</span></span>
			<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>groupId</span><span class="token punctuation">&gt;</span></span>org.springframework.boot<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>groupId</span><span class="token punctuation">&gt;</span></span>
			<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>artifactId</span><span class="token punctuation">&gt;</span></span>spring-boot-starter-security<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>artifactId</span><span class="token punctuation">&gt;</span></span>
		<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>dependency</span><span class="token punctuation">&gt;</span></span>
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>dependencies</span><span class="token punctuation">&gt;</span></span>

	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>build</span><span class="token punctuation">&gt;</span></span>
		<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>plugins</span><span class="token punctuation">&gt;</span></span>
			<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>plugin</span><span class="token punctuation">&gt;</span></span>
				<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>groupId</span><span class="token punctuation">&gt;</span></span>org.springframework.boot<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>groupId</span><span class="token punctuation">&gt;</span></span>
				<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>artifactId</span><span class="token punctuation">&gt;</span></span>spring-boot-maven-plugin<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>artifactId</span><span class="token punctuation">&gt;</span></span>
			<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>plugin</span><span class="token punctuation">&gt;</span></span>
		<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>plugins</span><span class="token punctuation">&gt;</span></span>
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>build</span><span class="token punctuation">&gt;</span></span>

<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>project</span><span class="token punctuation">&gt;</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>添加完成后启动项目并访问，就会默认跳转到 SpringSecurity 内置的登录页面，要求输入用户名和密码了。</p><p><img src="https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/spring-security-01.png" alt=""></p><p>默认会生成一个随机密码，并打印在控制台中。</p><div class="language-log line-numbers-mode" data-ext="log"><pre class="language-log"><code><span class="token time number">15:29:09.081</span> <span class="token level warning important">WARN</span>  <span class="token punctuation">[</span>restartedMain<span class="token punctuation">]</span> o<span class="token punctuation">.</span>s<span class="token punctuation">.</span>b<span class="token punctuation">.</span>a<span class="token punctuation">.</span>s<span class="token punctuation">.</span>s<span class="token punctuation">.</span>UserDetailsServiceAutoConfiguration <span class="token operator">-</span> 

<span class="token property">Using generated security password:</span> <span class="token uuid constant">5235c839-418d-4910-9397-5509e3965f7d</span>

This generated password is for development use only<span class="token punctuation">.</span> Your security configuration must be updated before running your application in production<span class="token punctuation">.</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们也可以在配置文件中指定密码，示例如下：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token comment"># application.yml</span>
<span class="token key atrule">spring</span><span class="token punctuation">:</span>
  <span class="token key atrule">security</span><span class="token punctuation">:</span>
    <span class="token key atrule">user</span><span class="token punctuation">:</span>
      <span class="token key atrule">name</span><span class="token punctuation">:</span> admin
      <span class="token key atrule">password</span><span class="token punctuation">:</span> <span class="token number">123456</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当然，在实际项目中基本都是由用户设定密码，服务从数据库中读取并校验，这个后面会做详细介绍。</p><h2 id="spring-security-的工作原理" tabindex="-1"><a class="header-anchor" href="#spring-security-的工作原理" aria-hidden="true">#</a> Spring Security 的工作原理</h2><p>先来简单了解一下 SpringSecurity 的工作原理。</p><p>在 Java 中使用 Servlet 来处理 HTTP 请求，请求和响应被解析为 <code>HttpServletRequest</code> 和 <code>HttpServletResponse</code> 对象，最终交给 Servlet 容器来处理。具体到 Spring，其使用 <code>DispatcherServlet</code> 来处理 HTTP 请求。</p><div class="language-Java line-numbers-mode" data-ext="Java"><pre class="language-Java"><code>public class DispatcherServlet extends FrameworkServlet {
    @Override
	protected void doService(HttpServletRequest request, HttpServletResponse response) throws Exception {
       ...
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在请求到达 Servlet 容器之前，会经过一系列的过滤器（Filter）来做预处理，这些 Filter 连起来就组成了一个过滤器链 <code>FilterChain</code>。</p><p><img src="https://docs.spring.io/spring-security/reference/6.3/_images/servlet/architecture/filterchain.png" alt=""></p><div class="language-Java line-numbers-mode" data-ext="Java"><pre class="language-Java"><code>public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
	// do something before the rest of the application
	// 沿着过滤器链，调用下一个过滤器
    chain.doFilter(request, response); // invoke the rest of the application
    // do something after the rest of the application
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Servlet 自身的生命周期与 Spring 的 ApplicationContext 是独立的。Spring 提供了一个 <code>DelegatingFilterProxy</code> 的 Bean，该类实现了 <code>Filter</code> 接口，从而可以作为 Filter 添加到 <code>FilterChain</code> 中，而在 <code>DelegatingFilterProxy</code> 中，会调用相应的 Bean Filter 来处理请求。从而实现了 Servlet 与 Spring 的 ApplicationContext 的联系。</p><p><img src="https://docs.spring.io/spring-security/reference/6.3/_images/servlet/architecture/delegatingfilterproxy.png" alt=""></p><p>SpringSecurity 实现了一个名为 <code>FilterChainProxy</code> 的 Bean，该 Bean 实现了 <code>Filter</code> 接口，并持有若干个 <code>SecurityFilterChain</code> 对象，每个 <code>SecurityFilterChain</code> 包含了一系列的 <code>Filter</code>，来实现具体安全认证、授权等功能。</p><p><img src="https://docs.spring.io/spring-security/reference/6.3/_images/servlet/architecture/multi-securityfilterchain.png" alt=""></p>`,21)),s("p",null,[n[4]||(n[4]=a("图片来自 ")),s("a",d,[n[3]||(n[3]=a("Spring Security 官方文档")),i(e)])]),n[7]||(n[7]=t(`<p>项目启动时会打印内置的所有 Filter：</p><div class="language-log line-numbers-mode" data-ext="log"><pre class="language-log"><code><span class="token property">Will secure any request with:</span>
org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>security<span class="token punctuation">.</span>web<span class="token punctuation">.</span>session<span class="token punctuation">.</span>DisableEncodeUrlFilter<span class="token operator">@</span><span class="token number">35b178f6</span><span class="token punctuation">,</span>
org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>security<span class="token punctuation">.</span>web<span class="token punctuation">.</span>context<span class="token punctuation">.</span>request<span class="token punctuation">.</span>async<span class="token punctuation">.</span>WebAsyncManagerIntegrationFilter<span class="token operator">@</span><span class="token number">2f49e1b</span><span class="token punctuation">,</span>
org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>security<span class="token punctuation">.</span>web<span class="token punctuation">.</span>context<span class="token punctuation">.</span>SecurityContextHolderFilter<span class="token operator">@</span><span class="token number">2d06ec56</span><span class="token punctuation">,</span>
org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>security<span class="token punctuation">.</span>web<span class="token punctuation">.</span>header<span class="token punctuation">.</span>HeaderWriterFilter<span class="token operator">@</span>fd760f<span class="token punctuation">,</span>
org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>web<span class="token punctuation">.</span>filter<span class="token punctuation">.</span>CorsFilter<span class="token operator">@</span><span class="token number">79997531</span><span class="token punctuation">,</span>
org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>security<span class="token punctuation">.</span>web<span class="token punctuation">.</span>csrf<span class="token punctuation">.</span>CsrfFilter<span class="token operator">@</span><span class="token number">31c44f46</span><span class="token punctuation">,</span>
org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>security<span class="token punctuation">.</span>web<span class="token punctuation">.</span>authentication<span class="token punctuation">.</span>logout<span class="token punctuation">.</span>LogoutFilter<span class="token operator">@</span>bb2451e<span class="token punctuation">,</span>
org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>security<span class="token punctuation">.</span>web<span class="token punctuation">.</span>authentication<span class="token punctuation">.</span>UsernamePasswordAuthenticationFilter<span class="token operator">@</span>a33e645<span class="token punctuation">,</span>
org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>security<span class="token punctuation">.</span>web<span class="token punctuation">.</span>authentication<span class="token punctuation">.</span>ui<span class="token punctuation">.</span>DefaultLoginPageGeneratingFilter<span class="token operator">@</span><span class="token number">3d1c66af</span><span class="token punctuation">,</span>
org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>security<span class="token punctuation">.</span>web<span class="token punctuation">.</span>authentication<span class="token punctuation">.</span>ui<span class="token punctuation">.</span>DefaultLogoutPageGeneratingFilter<span class="token operator">@</span><span class="token number">2f4dbe38</span><span class="token punctuation">,</span>
org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>security<span class="token punctuation">.</span>web<span class="token punctuation">.</span>authentication<span class="token punctuation">.</span>www<span class="token punctuation">.</span>BasicAuthenticationFilter<span class="token operator">@</span><span class="token number">35205a49</span><span class="token punctuation">,</span>
org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>security<span class="token punctuation">.</span>web<span class="token punctuation">.</span>savedrequest<span class="token punctuation">.</span>RequestCacheAwareFilter<span class="token operator">@</span><span class="token number">3f8f2bea</span><span class="token punctuation">,</span>
org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>security<span class="token punctuation">.</span>web<span class="token punctuation">.</span>servletapi<span class="token punctuation">.</span>SecurityContextHolderAwareRequestFilter<span class="token operator">@</span><span class="token number">806e62c</span><span class="token punctuation">,</span>
org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>security<span class="token punctuation">.</span>web<span class="token punctuation">.</span>authentication<span class="token punctuation">.</span>AnonymousAuthenticationFilter<span class="token operator">@</span><span class="token number">118515ef</span><span class="token punctuation">,</span>
org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>security<span class="token punctuation">.</span>web<span class="token punctuation">.</span>access<span class="token punctuation">.</span>ExceptionTranslationFilter<span class="token operator">@</span><span class="token number">4db12af9</span><span class="token punctuation">,</span>
org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>security<span class="token punctuation">.</span>web<span class="token punctuation">.</span>access<span class="token punctuation">.</span>intercept<span class="token punctuation">.</span>AuthorizationFilter<span class="token operator">@</span><span class="token number">2d6719e1</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们如果要使用 Spring Security，主要就是自行配置 SecurityFilterChain，根据路径匹配不同的请求，配置相应的认证、授权处理。示例如下：</p><div class="language-Java line-numbers-mode" data-ext="Java"><pre class="language-Java"><code>@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(Customizer.withDefaults())
            .authorizeHttpRequests(authorize -&gt; authorize
                .anyRequest().authenticated()
            )
            .httpBasic(Customizer.withDefaults())
            .formLogin(Customizer.withDefaults());
        return http.build();
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-认证" tabindex="-1"><a class="header-anchor" href="#_3-认证" aria-hidden="true">#</a> 3. 认证</h3><p>认证和授权是最核心的功能，这里看下 Spring Security 的身份认证。</p><p>最基本的认证方式就是使用用户名和密码，在执行认证时首先需要获取用户信息。SpringSecurity 提供了 <code>UserDetailsService</code> 接口用于获取用户信息，并内置了 <code>InMemoryUserDetailsManager</code> 和 <code>JdbcUserDetailsManager</code> 实现来从内存和数据库中读取用户信息。</p><div class="language-Java line-numbers-mode" data-ext="Java"><pre class="language-Java"><code>Configuration
public class ProjectSecurityConfig {

    @Bean
    SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests((requests) -&gt; requests
                .requestMatchers(&quot;/myAccount&quot;, &quot;/myBalance&quot;, &quot;/myLoans&quot;, &quot;/myCards&quot;).authenticated()
                .requestMatchers(&quot;/notices&quot;, &quot;/contact&quot;, &quot;/error&quot;).permitAll());
        http.formLogin(withDefaults());
        http.httpBasic(withDefaults());
        return http.build();
    }

    // 从内存中读取用户信息
    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails user = User.withUsername(&quot;user&quot;).password(&quot;123456&quot;).authorities(&quot;read&quot;).build();
        UserDetails admin = User.withUsername(&quot;admin&quot;).password(&quot;123456&quot;).authorities(&quot;admin&quot;).build();
        return new InMemoryUserDetailsManager(user, admin);
    }

    // 从数据库中读取用户信息
    @Bean
    public UserDetailsService userDetailsService(DataSource dataSource) {
        return new JdbcUserDetailsManager(dataSource);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>SpringSecurity 内置的 JDBCUserDetailsManager 使用的是框架自己预定义的 SQL 语句，来从数据库中读取用户信息。在实际项目中，我们通常是自己设计用户表结构，然后自己实现查询用户的操作。</p><p>比如我有一张 customer 表，用户使用 email 注册并作为登录名，密码存储在 pwd 字段，角色存储在 role 字段：</p><div class="language-SQL line-numbers-mode" data-ext="SQL"><pre class="language-SQL"><code>CREATE TABLE \`customer\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`email\` varchar(45) NOT NULL,
  \`pwd\` varchar(200) NOT NULL,
  \`role\` varchar(45) NOT NULL,
  PRIMARY KEY (\`id\`)
);

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>此时我们需要实现一个 UserDetailsService，来从数据库中读取用户信息。示例如下：</p><div class="language-Java line-numbers-mode" data-ext="Java"><pre class="language-Java"><code>@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final CustomerRepository customerRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Customer customer = customerRepository.findByEmail(username).orElseThrow(() -&gt; new
                UsernameNotFoundException(&quot;User details not found for the user: &quot; + username));
        List&lt;GrantedAuthority&gt; authorities = List.of(new SimpleGrantedAuthority(customer.getRole()));
        return new User(customer.getEmail(), customer.getPwd(), authorities);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="密码加密" tabindex="-1"><a class="header-anchor" href="#密码加密" aria-hidden="true">#</a> 密码加密</h4><p>用户通常需要设置密码，我们决不能将密码明文存储在数据库中，需要加密处理。处理方式有三种：</p><ul><li>编码：将密码编码为字符串，比如常用的 base64 编码，这种编码是可逆的，因此不安全</li><li>加密：通过密钥对密码进行加密，使用密钥解密，但密钥泄露会导致密码泄露</li><li>哈希：对密码执行哈希运算，哈希运算的结果是不可逆的，因此这是最安全的一种方式</li></ul><p>SpringSecurity 提供了 <code>PasswordEncoder</code> 接口，并内置了一系列的实现。可以通过以下方式配置 PasswordEncoder。</p><div class="language-Java line-numbers-mode" data-ext="Java"><pre class="language-Java"><code>@Configuration
public class ProjectSecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }   
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上述配置后，SpringSecurity 会使用 <code>DelegatingPasswordEncoder</code> 来处理密码。其本质是一个 HashMap，key 是算法名称，value 是具体的 PasswordEncoder 实现。</p><div class="language-Java line-numbers-mode" data-ext="Java"><pre class="language-Java"><code>public final class PasswordEncoderFactories {

	private PasswordEncoderFactories() {
	}

	@SuppressWarnings(&quot;deprecation&quot;)
	public static PasswordEncoder createDelegatingPasswordEncoder() {
		String encodingId = &quot;bcrypt&quot;;
		Map&lt;String, PasswordEncoder&gt; encoders = new HashMap&lt;&gt;();
		encoders.put(encodingId, new BCryptPasswordEncoder());
		encoders.put(&quot;ldap&quot;, new org.springframework.security.crypto.password.LdapShaPasswordEncoder());
		encoders.put(&quot;MD4&quot;, new org.springframework.security.crypto.password.Md4PasswordEncoder());
		encoders.put(&quot;MD5&quot;, new org.springframework.security.crypto.password.MessageDigestPasswordEncoder(&quot;MD5&quot;));
		encoders.put(&quot;noop&quot;, org.springframework.security.crypto.password.NoOpPasswordEncoder.getInstance());
		encoders.put(&quot;pbkdf2&quot;, Pbkdf2PasswordEncoder.defaultsForSpringSecurity_v5_5());
		encoders.put(&quot;pbkdf2@SpringSecurity_v5_8&quot;, Pbkdf2PasswordEncoder.defaultsForSpringSecurity_v5_8());
		encoders.put(&quot;scrypt&quot;, SCryptPasswordEncoder.defaultsForSpringSecurity_v4_1());
		encoders.put(&quot;scrypt@SpringSecurity_v5_8&quot;, SCryptPasswordEncoder.defaultsForSpringSecurity_v5_8());
		encoders.put(&quot;SHA-1&quot;, new org.springframework.security.crypto.password.MessageDigestPasswordEncoder(&quot;SHA-1&quot;));
		encoders.put(&quot;SHA-256&quot;,
				new org.springframework.security.crypto.password.MessageDigestPasswordEncoder(&quot;SHA-256&quot;));
		encoders.put(&quot;sha256&quot;, new org.springframework.security.crypto.password.StandardPasswordEncoder());
		encoders.put(&quot;argon2&quot;, Argon2PasswordEncoder.defaultsForSpringSecurity_v5_2());
		encoders.put(&quot;argon2@SpringSecurity_v5_8&quot;, Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8());
		return new DelegatingPasswordEncoder(encodingId, encoders);
	}
}

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>DelegatingPasswordEncoder 会根据密码的前缀来决定使用哪种加密算法。比如默认的 <code>bcrypt</code> 算法，会在密码前添加 <code>{bcrypt}</code> 前缀。校验时会根据前缀来决定使用哪种加密算法。最终存储到数据库的，都是带有算法前缀的加密密码。示例如下：</p><ul><li><code>{bcrypt}$2a$12$88.f6upbBvy0okEa7OfHFuorV29qeK.sVbB9VQ6J6dWM1bW6Qef8m</code> 使用 BCrypt 算法加密的密码。DelegatingPasswordEncoder 会使用 BCryptPasswordEncoder 来验证。</li><li><code>{noop}123456</code> 则表示不加密，直接存储明文密码。DelegatingPasswordEncoder 就会使用 NoOpPasswordEncoder 来验证。</li></ul><h3 id="自定义-authenticationprovider" tabindex="-1"><a class="header-anchor" href="#自定义-authenticationprovider" aria-hidden="true">#</a> 自定义 AuthenticationProvider</h3><p>之前提到真正的校验逻辑是在 AuthenticationProvider 中实现的，SpringSecurity 提供了多种 AuthenticationProvider 的实现，比如 <code>DaoAuthenticationProvider</code>、<code>InMemoryAuthenticationProvider</code> 等。但在实际项目中，我们通常需要满足不同形式的认证方式，比如：</p><ul><li>使用用户名、密码进行认证</li><li>JAAS 认证</li><li>OAuth2 认证</li></ul><p>为了满足这些需求，我们需要自己实现 AuthenticationProvider，定义具体的认证逻辑。</p><div class="language-Java line-numbers-mode" data-ext="Java"><pre class="language-Java"><code>public class EazyBankProdUsernamePwdAuthenticationProvider implements AuthenticationProvider {

    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String username = authentication.getName();
        String pwd = authentication.getCredentials().toString();
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        if (passwordEncoder.matches(pwd, userDetails.getPassword())) {
            // Fetch Age details and perform validation to check if age &gt;18
            return new UsernamePasswordAuthenticationToken(username,pwd,userDetails.getAuthorities());
        }else {
            throw new BadCredentialsException(&quot;Invalid password!&quot;);
        }
    }

    @Override
    public boolean supports(Class&lt;?&gt; authentication) {
        return (UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication));
    }
}


### 4. 授权

### 4. CORS &amp; CSRF 

#### CORS 跨域资源共享

现代浏览器默认都支持同源策略，会强制要求客户端只能向与客户端 URL 同源的资源发送请求。请求的协议、主机名、端口与客户端 URL 应完全一致。

下图是一个比较示例，如果我们的客户端请求来源不同的地址，浏览器会报错。
![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/cors-demo.png)
图片来自 [什么是 CORS](https://aws.amazon.com/cn/what-is/cross-origin-resource-sharing/#:~:text=Cross%2Dorigin%20resource%20sharing%20)。

同源策略虽然安全，但不够灵活。尤其是现代 WEB 应用很多都是前后端分离以及微服务架构，前端和后端、后端不同服务之间使用的 API 域名都有可能不同，同源策略会极大限制这些应用的灵活性。

而解决这个问题的方法就是 CORS 跨域资源共享。简单来说就是给客户端一个白名单，允许客户端向白名单中的目标资源发送请求。

HTTP 协议提供了如下几个 Header 来实现 CORS 跨域资源共享：

- \`Access-Control-Allow-Origin\`：允许访问的地址列表，* 表示允许所有地址
- \`Access-Control-Allow-Methods\`：允许访问的方法列表，* 表示允许所有方法
- \`Access-Control-Allow-Headers\`：允许访问的 Header 列表，* 表示允许所有 Header
- \`Access-Control-Allow-Credentials\`：是否允许携带 Cookie
- \`Access-Control-Max-Age\`：设置预检请求的有效期，单位为秒。

当客户端请求服务端时，服务端的响应头会包含这些 Header，告知客户端可以请求的地址、方法、Header 以及是否可以携带 Cookie。


首先，SpringSecurity 提供了一个 \`@CrossOrigin\` 注解，可以在方法或者类上单独配置，示例如下：

\`\`\`Java
// 类级别配置，可以对类中的所有方法生效
@CrossOrigin(origins = &quot;api.service1.com&quot;, allowedHeaders = &quot;*&quot;, maxAge = 3600)
@RestController
@RequiredArgsConstructor
public class AccountController {

    private final AccountsRepository accountsRepository;

	// 方法级别配置，仅对方法生效
    @CrossOrigin(origins = &quot;api.service1.com&quot;, allowedHeaders = &quot;*&quot;, maxAge = 3600)
    @GetMapping(&quot;/myAccount&quot;)
    public Accounts getAccountDetails(@RequestParam long id) {
        Accounts accounts = accountsRepository.findByCustomerId(id);
        if (accounts != null) {
            return accounts;
        } else {
            return null;
        }
    }
}

CrossOrigin 注解的方式虽然能够细粒度的控制，但配置起来比较繁琐，可能需要对各个类、方法进行单独设置。

SpringSecurity 提供了另一种方式，通过配置 \`CorsConfigurationSource\` 来实现全局配置。示例如下：


\`\`\`Java
@Configuration
public class ProjectSecurityConfig {

    @Bean
    SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {

        http.securityContext(contextConfig -&gt; contextConfig.requireExplicitSave(false))
                .cors(corsConfig -&gt; corsConfig.configurationSource(new CorsConfigurationSource() {
                    @Override
                    public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
                        CorsConfiguration config = new CorsConfiguration();
                        config.setAllowedOrigins(Arrays.asList(&quot;api.service1.com&quot;, &quot;api.service2.com&quot;)); // 允许的源
                        config.setAllowedMethods(Arrays.asList(&quot;GET&quot;, &quot;POST&quot;, &quot;PUT&quot;, &quot;DELETE&quot;, &quot;OPTIONS&quot;)); // 允许的方法
                        config.setAllowCredentials(true); // 允许携带 Cookie
                        config.setAllowedHeaders(Arrays.asList(&quot;*&quot;)); // 允许携带所有 Header
                        config.setMaxAge(3600L); // 有效期 1 小时
                        return config;
                    }
                }))
        http.formLogin(withDefaults());
        http.httpBasic(hbc -&gt; hbc.authenticationEntryPoint(new CustomBasicAuthenticationEntryPoint()));
        http.exceptionHandling(ehc -&gt; ehc.accessDeniedHandler(new CustomAccessDeniedHandler()));
        return http.build();
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在实际项目中，Get 请求一般用于查询，不会修改资源数据，风险较低。而对于 PUT、POST、DELETE 等请求，一般会修改资源数据，风险较高。需要服务器确认批准后才可以发送实际请求，该过程称为预检请求（Preflight Request）。因此一个标准的请求流程如下：</p><ul><li>客户端发送 Options 请求，询问服务器是否允许跨域请求</li><li>服务器返回 Access-Control-Allow-Origin、Access-Control-Allow-Methods、Access-Control-Allow-Headers 等 Header，告知客户端是否允许跨域请求</li><li>客户端发送实际请求</li></ul><p>客户端可以根据服务器返回的 Max-Age 来缓存结果，在缓存到期前，客户端可以直接发送实际请求，而无需再次发送 Options 请求。</p><h4 id="csrf-跨站请求伪造" tabindex="-1"><a class="header-anchor" href="#csrf-跨站请求伪造" aria-hidden="true">#</a> CSRF 跨站请求伪造</h4><p>跨站请求伪造（CSRF）是一种攻击方式，攻击者通过伪造请求来欺骗用户执行某些操作。一个典型的 CSRF 攻击流程如下：</p><ul><li>攻击者诱导用户访问一个伪造的界面，从而获取用户的 Cookie 等信息</li><li>用户被诱导执行某些恶意操作，比如转账，修改密码。因此攻击者已经获取了 cookie 等信息，因此可以像正常操作那样向服务器发送请求</li><li>服务器无法区分该请求来自攻击者，因此会执行请求的操作，导致攻击者成功执行恶意操作</li></ul><p>防止 CSRF 攻击最常见的方法就是发送一个 Token 令牌，只有持有该令牌的请求才会被服务器接受。</p><hr>`,35))])}const b=o(p,[["render",v],["__file","spring-security.html.vue"]]);export{b as default};
