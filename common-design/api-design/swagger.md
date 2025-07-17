# 实践：Spring Boot 集成 Swagger

在前后端分离的开发模式下，后端开发人员首先需要提供 API 文档给前端，从而双方可以并行开发。以笔者熟悉的 Java/SpringBoot 生态为例，最佳实践就是在项目中集成 Swagger 文档，可以以文件的形式分享出去；或者通过网关，对外统一提供每个服务的 Swagger API 文档的访问


## 集成步骤

### 1. 添加依赖
在 `pom.xml` 中添加以下依赖：

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>
```

### 2. 配置 Swagger
创建配置类 `SwaggerConfig.java`：

```java
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI springShopOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("示例项目 API 文档")
                        .description("基于 SpringBoot 3.x 集成 Swagger")
                        .version("v1.0")
                        .contact(new Contact()
                                .name("作者名")
                                .email("example@email.com")));
    }
}
```

### 3. 配置 application.yml
```yaml
springdoc:
  swagger-ui:
    path: /swagger-ui.html
  api-docs:
    path: /v3/api-docs
  packages-to-scan: com.example.controller
  paths-to-match: /api/**
```

### 4. 创建示例控制器
```java
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "用户管理", description = "用户相关接口")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Operation(summary = "获取用户信息")
    @GetMapping("/{id}")
    public String getUserById(
            @Parameter(description = "用户ID") 
            @PathVariable Long id) {
        return "用户ID: " + id;
    }

    @Operation(summary = "创建新用户")
    @PostMapping
    public String createUser(
            @Parameter(description = "用户名") 
            @RequestParam String username) {
        return "创建用户: " + username;
    }
}
```

## 常用注解说明
- `@Tag`: 用于控制器类，标记接口分组
- `@Operation`: 描述接口功能
- `@Parameter`: 描述接口参数
- `@Schema`: 描述模型属性
- `@ApiResponse`: 描述接口响应

## 访问文档
启动项目后，可以通过以下地址访问 Swagger 文档：
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI 规范: http://localhost:8080/v3/api-docs

## 注意事项
1. SpringBoot 3.x 使用 springdoc-openapi 而不是 springfox-swagger
2. 确保 JDK 版本 >= 17
3. 生产环境建议关闭 Swagger，可以通过配置文件控制：
```yaml
springdoc:
  swagger-ui:
    enabled: false
  api-docs:
    enabled: false
```

## 总结
通过以上步骤，我们成功在 SpringBoot 3.x 项目中集成了 Swagger 文档。Swagger 不仅提供了清晰的 API 文档，还能作为接口调试工具，大大提高了开发效率。在实际项目中，我们还可以根据需求进行更多个性化配置，比如添加认证信息、自定义响应示例等。