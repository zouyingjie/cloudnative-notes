# 实践：SpringBoot 测试框架简介

本篇文章介绍在 SpringBoot 框架下实现单元测试的实践。



## 1. 测试框架

项目依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

其集成了如下测试框架：

| 测试框架 | 说明 |
| --- | --- |
| JUnit5 | Java中最流行和最常用的单元测试框架，提供了一套注解和断言来编写和运行单元测试。 |
| SpringTest & SpringBootTest | 基于 Spring 的测试框架，可以为测试用例配置、管理 Spring上下文 和 Bean。 |
| Mockito | Java中最流行和最强大的Mock对象库，它可以模拟复杂的真实对象行为，从而简化测试过程。 |
| AssertJ | 一个流式断言库，提供了更简洁和易读的断言语法，使测试代码更易写、易读、易维护。 |
| Hamcrest | 一个匹配器库，提供了更简洁和易读的匹配器语法，使测试代码更易写、易读、易维护。 |
| jsonassert | 一个JSON断言库，提供了更简洁和易读的JSON断言语法，使测试代码更易写、易读、易维护。 |
| JsonPath | 一个JSON路径库，提供了更简洁和易读的JSON路径语法，使测试代码更易写、易读、易维护。 |


## 2. 注解说明

- @SpringBootTest
- @ExtendWith(SpringExtension.class)
- @MockBean
- @Mock
- @InjectMocks
- @Mock
- @Test
- @BeforeEach
- @AfterEach
- @BeforeAll
- @AfterAll
- @Disabled
- @DisplayName
- @Timeout
- @RepeatedTest
- @ParameterizedTest
- @CsvSource
- @ValueSource 
- @ExtendWith
- @Mock
- @MockBean
- @InjectMocks
- @Mock
- @Spy
- @Captor
- @MockedBean
- @MockedStatic
- @ExtendWith


## 2. 基本的单元测试

如果一个类或者方法没有依赖 Spring 或者其他组件，比如一个简单的工具类那么可以使用JUnit5的@Test注解来测试。

下面是一个测试日期工具类的示例：


当然，即使是一个 Service 类，如果它没有依赖 Spring 或者其他组件，那么也可以使用JUnit5的@Test注解来测试。

``

## 3. SpringBoot 单元测试













