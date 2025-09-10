# MySQL 开发规范

## 基础规范

1. 如无特殊要求，必须使用 InnoDB 存储引擎。

2. 尽量避免在数据库层面做计算。

3. 对于性能要求高的业务，禁止使用存储过程、视图、触发器等。

【解读】对于高并发、高性能的业务场景，上述计算会导致额外开销，并且不利于水平扩展。

4. 禁止使用外键，完整性约束由应用层实现。

5. 数据库时区必须使用 UTC 时区。

## 建表规范

1. 如无非常特殊要求，一律使用 ``utf8mb4`` 字符集。

【解读】MySQL 中的 utf8 其实是 utf8mb3，采用 1 ~ 3 字节表示字符，utf8mb4 才是真正的 UTF-8 字符集。 MySQL 8.0 已经将 utf8mb4 作为默认字符集。

2. 数据表、表字段必须有注释，最好是中文。如果是枚举类型，必须说明每种枚举值的含义。

【解读】代码是最好的注释，写在文档中的注释注定会过时。

3. 表名长度尽量控制在 52 个字符以内，最大不超过 64 字符。

【解读】MySQL 表名长度限制为[64个字符](https://dev.mysql.com/doc/refman/9.2/en/identifier-length.html)，但为了兼容性和可读性，建议不超过52个字符，为后续维护预留出 12 个 字符空间。

   
4. 表名要做到见文知意，必须使用小写字母，单词之间用下划线分隔；禁止使用拼音、拼音缩写；禁止使用保留字。

5. 表名最好使用业务域或者业务模块作为前缀，即 `{domain}_{resource}`，resource 代表业务资源，不使用复数命名。比如 shipping_order、shipping_address、payment_order 等；

6. 字典表需要使用 `dict` 前缀标识，比如 `dict_country`、`payment_dict_order_status` 等。

7. 每张表包含公共字段：id、create_time、update_time、delete_time，并且需要添加索引。
    - `id`：物理主键，unsigned bigint 类型，单表自增。
    - `create_time`：创建时间，datetime 类型，默认为 current_timestamp。
    - `update_time`：更新时间，datetime 类型，默认为 current_timestamp，且在每次更新时自动更新。
    - `delete_time`：删除时间，datetime 类型，逻辑删除标识。
  

## 索引规范

1. 

## 字段规范

1. 对于数据列，使用英文命名，单词之间用下划线分割。

2. 使用 CHAR 类型存储长度固定的数据；使用 VARCHAR 存储长度不固定的数据。
   
3. 金额使用 DECIMAL 类型，禁止使用浮点数类型。

4. 时间使用 DATETIME 类型，禁止使用 VARCHAR 或者 TIMESTAMP 类型，否则计算会出现各种错误。

5. 除非有特别原因，尽可能的使用 NOT NULL 约束。

6. 可以适当冗余字段，以提高查询性能。

## SQL 规范

## 操作规范

- 禁止删除列
- 写更新、删除语句时，先写 WHERE 条件，再写 SET 或 DELETE。