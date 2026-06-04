# 专家咨询预约接口文档

## 1. 模块说明

该模块用于实现用户与专家之间的一对一咨询预约能力，包含以下功能：

- 获取专家可预约排班
- 用户创建咨询预约
- 用户取消咨询预约
- 用户查看自己的咨询预约列表
- 专家查看收到的咨询预约列表
- 专家处理咨询预约状态

接口统一前缀：`/api/consultReservation`

返回结构统一使用项目中的 `HttpResult<T>`。

---

## 2. 业务规则

### 2.1 用户创建预约

- 用户必须已登录
- 只能预约角色为专家的用户
- 排班必须存在且未删除
- 排班必须与专家匹配
- 排班状态必须为 `0=可预约`
- 同一用户不能重复预约同一排班的有效记录
- 创建预约成功后：
  - 预约状态默认为 `0=待确认`
  - 排班 `reservedCount + 1`
  - 若达到最大可预约人数，则排班状态更新为 `1=已满`

### 2.2 用户取消预约

- 用户必须已登录
- 只能取消自己的预约
- 取消后预约状态更新为 `4=已取消`
- 同时回滚排班 `reservedCount`
- 若排班原来为 `1=已满`，取消后会恢复为 `0=可预约`

### 2.3 专家处理预约

- 专家必须已登录
- 只有角色为 `2=专家` 的用户才能处理预约
- 只能处理属于自己的预约
- 可处理状态：
  - `1=已同意`
  - `2=已拒绝`
  - `3=已完成`
- 若专家拒绝预约，则会回滚排班 `reservedCount`

---

## 3. 状态字段说明

### 3.1 咨询类型 `consultType`

- `1`：图文
- `2`：语音
- `3`：视频

### 3.2 预约状态 `status`

- `0`：待确认
- `1`：已同意
- `2`：已拒绝
- `3`：已完成
- `4`：已取消

### 3.3 排班状态 `status`

- `0`：可预约
- `1`：已满
- `2`：已关闭

---

## 4. 接口列表

### 4.1 获取专家可预约排班

- **请求方式**：`GET`
- **请求路径**：`/api/consultReservation/schedules/{expertId}`
- **是否登录**：否

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| expertId | Long | 是 | 专家用户 ID |

#### 返回示例

```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "expertId": 2,
      "scheduleDate": "2026-05-25",
      "timeSlot": "09:00-10:00",
      "maxReserveCount": 5,
      "reservedCount": 2,
      "status": 0,
      "createTime": "2026-05-24T09:00:00",
      "updateTime": "2026-05-24T09:00:00",
      "isDelete": 0
    }
  ]
}
```

---

### 4.2 创建咨询预约

- **请求方式**：`POST`
- **请求路径**：`/api/consultReservation/create`
- **是否登录**：是
- **请求体类型**：`application/json`

#### 请求体参数

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| expertId | Long | 是 | 被预约专家 ID |
| scheduleId | Long | 是 | 排班 ID |
| consultType | Integer | 是 | 咨询类型：1图文 2语音 3视频 |
| questionDesc | String | 是 | 问题描述 |
| contactInfo | String | 是 | 联系方式 |

#### 请求示例

```json
{
  "expertId": 2,
  "scheduleId": 10,
  "consultType": 1,
  "questionDesc": "孩子最近晚上不愿意睡觉，想咨询改善建议",
  "contactInfo": "13800000000"
}
```

#### 成功返回示例

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 100,
    "userId": 8,
    "expertId": 2,
    "scheduleId": 10,
    "consultType": 1,
    "questionDesc": "孩子最近晚上不愿意睡觉，想咨询改善建议",
    "contactInfo": "13800000000",
    "status": 0,
    "createTime": "2026-05-24T16:00:00",
    "updateTime": "2026-05-24T16:00:00",
    "isDelete": 0
  }
}
```

#### 失败场景

- 未登录
- 专家不存在
- 排班不存在
- 排班与专家不匹配
- 该时间段不可预约
- 该时间段预约已满
- 您已预约该时间段

---

### 4.3 取消咨询预约

- **请求方式**：`POST`
- **请求路径**：`/api/consultReservation/cancel/{reservationId}`
- **是否登录**：是

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| reservationId | Long | 是 | 预约 ID |

#### 成功返回示例

```json
{
  "code": 200,
  "msg": "success",
  "data": "取消预约成功"
}
```

#### 失败场景

- 未登录
- 预约不存在
- 无权取消他人的预约

---

### 4.4 获取我的咨询预约列表

- **请求方式**：`GET`
- **请求路径**：`/api/consultReservation/my`
- **是否登录**：是

#### 查询参数

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| page | long | 是 | 页码 |
| size | long | 是 | 每页数量 |

#### 请求示例

```text
/api/consultReservation/my?page=1&size=10
```

#### 返回说明

返回 `IPage<ConsultReservationDTO>` 分页结构，`records` 中每项为预约记录。

---

### 4.5 专家查看收到的咨询预约列表

- **请求方式**：`GET`
- **请求路径**：`/api/consultReservation/expert/list`
- **是否登录**：是（专家）

#### 查询参数

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| page | long | 是 | 页码 |
| size | long | 是 | 每页数量 |

#### 请求示例

```text
/api/consultReservation/expert/list?page=1&size=10
```

#### 失败场景

- 未登录
- 当前用户不是专家

---

### 4.6 专家处理咨询预约状态

- **请求方式**：`PUT`
- **请求路径**：`/api/consultReservation/status/{reservationId}`
- **是否登录**：是（专家）

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| reservationId | Long | 是 | 预约 ID |

#### 查询参数

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| status | Integer | 是 | 处理状态：1已同意 2已拒绝 3已完成 |

#### 请求示例

```text
PUT /api/consultReservation/status/100?status=1
```

#### 成功返回示例

```json
{
  "code": 200,
  "msg": "success",
  "data": "处理成功"
}
```

#### 失败场景

- 未登录
- 当前用户不是专家
- 状态值不合法
- 预约不存在
- 无权处理该预约
- 该预约已取消

---

## 5. DTO 字段说明

### 5.1 ConsultReservationDTO

| 字段名 | 类型 | 说明 |
| --- | --- | --- |
| id | Long | 预约 ID |
| userId | Long | 预约用户 ID |
| expertId | Long | 被预约专家 ID |
| scheduleId | Long | 排班 ID |
| consultType | Integer | 咨询类型 |
| questionDesc | String | 问题描述 |
| contactInfo | String | 联系方式 |
| status | Integer | 预约状态 |
| createTime | LocalDateTime | 创建时间 |
| updateTime | LocalDateTime | 更新时间 |
| isDelete | Integer | 逻辑删除标记 |

### 5.2 ExpertScheduleDTO

| 字段名 | 类型 | 说明 |
| --- | --- | --- |
| id | Long | 排班 ID |
| expertId | Long | 专家 ID |
| scheduleDate | LocalDate | 排班日期 |
| timeSlot | String | 时间段 |
| maxReserveCount | Integer | 最大可预约人数 |
| reservedCount | Integer | 已预约人数 |
| status | Integer | 排班状态 |
| createTime | LocalDateTime | 创建时间 |
| updateTime | LocalDateTime | 更新时间 |
| isDelete | Integer | 逻辑删除标记 |

---

## 6. 后续建议

建议继续补充以下能力，形成完整业务闭环：

- 专家排班管理接口
- 咨询记录接口
- 用户/专家维度的预约详情扩展字段
- 预约状态流转校验增强
