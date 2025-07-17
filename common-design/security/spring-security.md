
# 实践：Spring Security 简明教程

上篇介绍了认证、授权相关的理论概念，本篇以作者熟悉的 Spring Security 为例，介绍其具体使用。这里只介绍具体的使用，原理部分的介绍请参考笔者之前的博客 [深入理解 Spring Security 工作原理](https://blog.csdn.net/weixin_44510615/article/details/131588888)。

## 项目初始化

这里我们使用 Spring Boot 3.3.0 版本，对应的 Spring Security 是 6.3.0 版本。首先添加下面的依赖：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>3.3.0</version>
		<relativePath/> 
	</parent>

	<properties>
		<java.version>21</java.version>
	</properties>
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-security</artifactId>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>

</project>
```

添加完成后启动项目并访问，就会默认跳转到 SpringSecurity 内置的登录页面，要求输入用户名和密码了。

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/spring-security-01.png)

默认会生成一个随机密码，并打印在控制台中。

```log
15:29:09.081 WARN  [restartedMain] o.s.b.a.s.s.UserDetailsServiceAutoConfiguration - 

Using generated security password: 5235c839-418d-4910-9397-5509e3965f7d

This generated password is for development use only. Your security configuration must be updated before running your application in production.
```

我们也可以在配置文件中指定密码，示例如下：
```yml
# application.yml
spring:
  security:
    user:
      name: admin
      password: 123456
```

当然，在实际项目中基本都是由用户设定密码，服务从数据库中读取并校验，这个后面会做详细介绍。


## Spring Security 的工作原理

先来简单了解一下 SpringSecurity 的工作原理。

在 Java 中使用 Servlet 来处理 HTTP 请求，请求和响应被解析为 `HttpServletRequest` 和 `HttpServletResponse` 对象，最终交给 Servlet 容器来处理。具体到 Spring，其使用 `DispatcherServlet` 来处理 HTTP 请求。

```Java
public class DispatcherServlet extends FrameworkServlet {
    @Override
	protected void doService(HttpServletRequest request, HttpServletResponse response) throws Exception {
       ...
    }
}
```

在请求到达 Servlet 容器之前，会经过一系列的过滤器（Filter）来做预处理，这些 Filter 连起来就组成了一个过滤器链 `FilterChain`。

![](https://docs.spring.io/spring-security/reference/6.3/_images/servlet/architecture/filterchain.png)


```Java
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
	// do something before the rest of the application
	// 沿着过滤器链，调用下一个过滤器
    chain.doFilter(request, response); // invoke the rest of the application
    // do something after the rest of the application
}
```

Servlet 自身的生命周期与 Spring 的 ApplicationContext 是独立的。Spring 提供了一个 `DelegatingFilterProxy` 的 Bean，该类实现了 `Filter` 接口，从而可以作为 Filter 添加到 `FilterChain` 中，而在 `DelegatingFilterProxy` 中，会调用相应的 Bean Filter 来处理请求。从而实现了 Servlet 与 Spring 的 ApplicationContext 的联系。

![](https://docs.spring.io/spring-security/reference/6.3/_images/servlet/architecture/delegatingfilterproxy.png)

SpringSecurity 实现了一个名为 `FilterChainProxy` 的 Bean，该 Bean 实现了 `Filter` 接口，并持有若干个 `SecurityFilterChain` 对象，每个 `SecurityFilterChain` 包含了一系列的 `Filter`，来实现具体安全认证、授权等功能。


![](https://docs.spring.io/spring-security/reference/6.3/_images/servlet/architecture/multi-securityfilterchain.png)

图片来自 [Spring Security 官方文档](https://docs.spring.io/spring-security/reference/6.3/servlet/architecture.html#servlet-securityfilterchain)


项目启动时会打印内置的所有 Filter：

```log
Will secure any request with:
org.springframework.security.web.session.DisableEncodeUrlFilter@35b178f6,
org.springframework.security.web.context.request.async.WebAsyncManagerIntegrationFilter@2f49e1b,
org.springframework.security.web.context.SecurityContextHolderFilter@2d06ec56,
org.springframework.security.web.header.HeaderWriterFilter@fd760f,
org.springframework.web.filter.CorsFilter@79997531,
org.springframework.security.web.csrf.CsrfFilter@31c44f46,
org.springframework.security.web.authentication.logout.LogoutFilter@bb2451e,
org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter@a33e645,
org.springframework.security.web.authentication.ui.DefaultLoginPageGeneratingFilter@3d1c66af,
org.springframework.security.web.authentication.ui.DefaultLogoutPageGeneratingFilter@2f4dbe38,
org.springframework.security.web.authentication.www.BasicAuthenticationFilter@35205a49,
org.springframework.security.web.savedrequest.RequestCacheAwareFilter@3f8f2bea,
org.springframework.security.web.servletapi.SecurityContextHolderAwareRequestFilter@806e62c,
org.springframework.security.web.authentication.AnonymousAuthenticationFilter@118515ef,
org.springframework.security.web.access.ExceptionTranslationFilter@4db12af9,
org.springframework.security.web.access.intercept.AuthorizationFilter@2d6719e1

```

我们如果要使用 Spring Security，主要就是自行配置 SecurityFilterChain，根据路径匹配不同的请求，配置相应的认证、授权处理。示例如下：

```Java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(Customizer.withDefaults())
            .authorizeHttpRequests(authorize -> authorize
                .anyRequest().authenticated()
            )
            .httpBasic(Customizer.withDefaults())
            .formLogin(Customizer.withDefaults());
        return http.build();
    }
}
```


### 3. 认证

认证和授权是最核心的功能，这里看下 Spring Security 的身份认证。

最基本的认证方式就是使用用户名和密码，在执行认证时首先需要获取用户信息。SpringSecurity 提供了 `UserDetailsService` 接口用于获取用户信息，并内置了 `InMemoryUserDetailsManager` 和 `JdbcUserDetailsManager` 实现来从内存和数据库中读取用户信息。

```Java
Configuration
public class ProjectSecurityConfig {

    @Bean
    SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests((requests) -> requests
                .requestMatchers("/myAccount", "/myBalance", "/myLoans", "/myCards").authenticated()
                .requestMatchers("/notices", "/contact", "/error").permitAll());
        http.formLogin(withDefaults());
        http.httpBasic(withDefaults());
        return http.build();
    }

    // 从内存中读取用户信息
    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails user = User.withUsername("user").password("123456").authorities("read").build();
        UserDetails admin = User.withUsername("admin").password("123456").authorities("admin").build();
        return new InMemoryUserDetailsManager(user, admin);
    }

    // 从数据库中读取用户信息
    @Bean
    public UserDetailsService userDetailsService(DataSource dataSource) {
        return new JdbcUserDetailsManager(dataSource);
    }
}
```

SpringSecurity 内置的 JDBCUserDetailsManager 使用的是框架自己预定义的 SQL 语句，来从数据库中读取用户信息。在实际项目中，我们通常是自己设计用户表结构，然后自己实现查询用户的操作。

比如我有一张 customer 表，用户使用 email 注册并作为登录名，密码存储在 pwd 字段，角色存储在 role 字段：

```SQL
CREATE TABLE `customer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(45) NOT NULL,
  `pwd` varchar(200) NOT NULL,
  `role` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
);

```
此时我们需要实现一个 UserDetailsService，来从数据库中读取用户信息。示例如下：

```Java
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final CustomerRepository customerRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Customer customer = customerRepository.findByEmail(username).orElseThrow(() -> new
                UsernameNotFoundException("User details not found for the user: " + username));
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(customer.getRole()));
        return new User(customer.getEmail(), customer.getPwd(), authorities);
    }
}
```

#### 密码加密

用户通常需要设置密码，我们决不能将密码明文存储在数据库中，需要加密处理。处理方式有三种：

- 编码：将密码编码为字符串，比如常用的 base64 编码，这种编码是可逆的，因此不安全
- 加密：通过密钥对密码进行加密，使用密钥解密，但密钥泄露会导致密码泄露
- 哈希：对密码执行哈希运算，哈希运算的结果是不可逆的，因此这是最安全的一种方式

SpringSecurity 提供了 `PasswordEncoder` 接口，并内置了一系列的实现。可以通过以下方式配置 PasswordEncoder。

```Java
@Configuration
public class ProjectSecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }   
}
```
上述配置后，SpringSecurity 会使用 `DelegatingPasswordEncoder` 来处理密码。其本质是一个 HashMap，key 是算法名称，value 是具体的 PasswordEncoder 实现。

```Java
public final class PasswordEncoderFactories {

	private PasswordEncoderFactories() {
	}

	@SuppressWarnings("deprecation")
	public static PasswordEncoder createDelegatingPasswordEncoder() {
		String encodingId = "bcrypt";
		Map<String, PasswordEncoder> encoders = new HashMap<>();
		encoders.put(encodingId, new BCryptPasswordEncoder());
		encoders.put("ldap", new org.springframework.security.crypto.password.LdapShaPasswordEncoder());
		encoders.put("MD4", new org.springframework.security.crypto.password.Md4PasswordEncoder());
		encoders.put("MD5", new org.springframework.security.crypto.password.MessageDigestPasswordEncoder("MD5"));
		encoders.put("noop", org.springframework.security.crypto.password.NoOpPasswordEncoder.getInstance());
		encoders.put("pbkdf2", Pbkdf2PasswordEncoder.defaultsForSpringSecurity_v5_5());
		encoders.put("pbkdf2@SpringSecurity_v5_8", Pbkdf2PasswordEncoder.defaultsForSpringSecurity_v5_8());
		encoders.put("scrypt", SCryptPasswordEncoder.defaultsForSpringSecurity_v4_1());
		encoders.put("scrypt@SpringSecurity_v5_8", SCryptPasswordEncoder.defaultsForSpringSecurity_v5_8());
		encoders.put("SHA-1", new org.springframework.security.crypto.password.MessageDigestPasswordEncoder("SHA-1"));
		encoders.put("SHA-256",
				new org.springframework.security.crypto.password.MessageDigestPasswordEncoder("SHA-256"));
		encoders.put("sha256", new org.springframework.security.crypto.password.StandardPasswordEncoder());
		encoders.put("argon2", Argon2PasswordEncoder.defaultsForSpringSecurity_v5_2());
		encoders.put("argon2@SpringSecurity_v5_8", Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8());
		return new DelegatingPasswordEncoder(encodingId, encoders);
	}
}

```

DelegatingPasswordEncoder 会根据密码的前缀来决定使用哪种加密算法。比如默认的 `bcrypt` 算法，会在密码前添加 `{bcrypt}` 前缀。校验时会根据前缀来决定使用哪种加密算法。最终存储到数据库的，都是带有算法前缀的加密密码。示例如下：

- `{bcrypt}$2a$12$88.f6upbBvy0okEa7OfHFuorV29qeK.sVbB9VQ6J6dWM1bW6Qef8m` 使用 BCrypt 算法加密的密码。DelegatingPasswordEncoder 会使用 BCryptPasswordEncoder 来验证。
- `{noop}123456` 则表示不加密，直接存储明文密码。DelegatingPasswordEncoder 就会使用 NoOpPasswordEncoder 来验证。


### 自定义 AuthenticationProvider

之前提到真正的校验逻辑是在 AuthenticationProvider 中实现的，SpringSecurity 提供了多种 AuthenticationProvider 的实现，比如 `DaoAuthenticationProvider`、`InMemoryAuthenticationProvider` 等。但在实际项目中，我们通常需要满足不同形式的认证方式，比如：

- 使用用户名、密码进行认证
- JAAS 认证
- OAuth2 认证

为了满足这些需求，我们需要自己实现 AuthenticationProvider，定义具体的认证逻辑。


```Java
public class EazyBankProdUsernamePwdAuthenticationProvider implements AuthenticationProvider {

    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String username = authentication.getName();
        String pwd = authentication.getCredentials().toString();
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        if (passwordEncoder.matches(pwd, userDetails.getPassword())) {
            // Fetch Age details and perform validation to check if age >18
            return new UsernamePasswordAuthenticationToken(username,pwd,userDetails.getAuthorities());
        }else {
            throw new BadCredentialsException("Invalid password!");
        }
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return (UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication));
    }
}


### 4. 授权

### 4. CORS & CSRF 

#### CORS 跨域资源共享

现代浏览器默认都支持同源策略，会强制要求客户端只能向与客户端 URL 同源的资源发送请求。请求的协议、主机名、端口与客户端 URL 应完全一致。

下图是一个比较示例，如果我们的客户端请求来源不同的地址，浏览器会报错。
![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/cors-demo.png)
图片来自 [什么是 CORS](https://aws.amazon.com/cn/what-is/cross-origin-resource-sharing/#:~:text=Cross%2Dorigin%20resource%20sharing%20)。

同源策略虽然安全，但不够灵活。尤其是现代 WEB 应用很多都是前后端分离以及微服务架构，前端和后端、后端不同服务之间使用的 API 域名都有可能不同，同源策略会极大限制这些应用的灵活性。

而解决这个问题的方法就是 CORS 跨域资源共享。简单来说就是给客户端一个白名单，允许客户端向白名单中的目标资源发送请求。

HTTP 协议提供了如下几个 Header 来实现 CORS 跨域资源共享：

- `Access-Control-Allow-Origin`：允许访问的地址列表，* 表示允许所有地址
- `Access-Control-Allow-Methods`：允许访问的方法列表，* 表示允许所有方法
- `Access-Control-Allow-Headers`：允许访问的 Header 列表，* 表示允许所有 Header
- `Access-Control-Allow-Credentials`：是否允许携带 Cookie
- `Access-Control-Max-Age`：设置预检请求的有效期，单位为秒。

当客户端请求服务端时，服务端的响应头会包含这些 Header，告知客户端可以请求的地址、方法、Header 以及是否可以携带 Cookie。


首先，SpringSecurity 提供了一个 `@CrossOrigin` 注解，可以在方法或者类上单独配置，示例如下：

```Java
// 类级别配置，可以对类中的所有方法生效
@CrossOrigin(origins = "api.service1.com", allowedHeaders = "*", maxAge = 3600)
@RestController
@RequiredArgsConstructor
public class AccountController {

    private final AccountsRepository accountsRepository;

	// 方法级别配置，仅对方法生效
    @CrossOrigin(origins = "api.service1.com", allowedHeaders = "*", maxAge = 3600)
    @GetMapping("/myAccount")
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

SpringSecurity 提供了另一种方式，通过配置 `CorsConfigurationSource` 来实现全局配置。示例如下：


```Java
@Configuration
public class ProjectSecurityConfig {

    @Bean
    SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {

        http.securityContext(contextConfig -> contextConfig.requireExplicitSave(false))
                .cors(corsConfig -> corsConfig.configurationSource(new CorsConfigurationSource() {
                    @Override
                    public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
                        CorsConfiguration config = new CorsConfiguration();
                        config.setAllowedOrigins(Arrays.asList("api.service1.com", "api.service2.com")); // 允许的源
                        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS")); // 允许的方法
                        config.setAllowCredentials(true); // 允许携带 Cookie
                        config.setAllowedHeaders(Arrays.asList("*")); // 允许携带所有 Header
                        config.setMaxAge(3600L); // 有效期 1 小时
                        return config;
                    }
                }))
        http.formLogin(withDefaults());
        http.httpBasic(hbc -> hbc.authenticationEntryPoint(new CustomBasicAuthenticationEntryPoint()));
        http.exceptionHandling(ehc -> ehc.accessDeniedHandler(new CustomAccessDeniedHandler()));
        return http.build();
    }
}
```

在实际项目中，Get 请求一般用于查询，不会修改资源数据，风险较低。而对于 PUT、POST、DELETE 等请求，一般会修改资源数据，风险较高。需要服务器确认批准后才可以发送实际请求，该过程称为预检请求（Preflight Request）。因此一个标准的请求流程如下：

- 客户端发送 Options 请求，询问服务器是否允许跨域请求
- 服务器返回 Access-Control-Allow-Origin、Access-Control-Allow-Methods、Access-Control-Allow-Headers 等 Header，告知客户端是否允许跨域请求
- 客户端发送实际请求

客户端可以根据服务器返回的 Max-Age 来缓存结果，在缓存到期前，客户端可以直接发送实际请求，而无需再次发送 Options 请求。


#### CSRF 跨站请求伪造

跨站请求伪造（CSRF）是一种攻击方式，攻击者通过伪造请求来欺骗用户执行某些操作。一个典型的 CSRF 攻击流程如下：

- 攻击者诱导用户访问一个伪造的界面，从而获取用户的 Cookie 等信息
- 用户被诱导执行某些恶意操作，比如转账，修改密码。因此攻击者已经获取了 cookie 等信息，因此可以像正常操作那样向服务器发送请求
- 服务器无法区分该请求来自攻击者，因此会执行请求的操作，导致攻击者成功执行恶意操作

防止 CSRF 攻击最常见的方法就是发送一个 Token 令牌，只有持有该令牌的请求才会被服务器接受。




---

