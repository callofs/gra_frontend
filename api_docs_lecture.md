
# 专家讲座系统 API 文档

## 目录

1. [专家讲座管理接口](#专家讲座管理接口)
2. [讲座报名接口](#讲座报名接口)
3. [数据模型](#数据模型)
4. [错误码说明](#错误码说明)

---

## 专家讲座管理接口

### 基础路径

`/api/lecture`

### 接口列表

| 接口 | HTTP方法 | 功能描述 | 是否需要认证 |
|------|----------|----------|--------------|
| `/create` | POST | 创建讲座 | 是 |
| `/update` | PUT | 更新讲座 | 是 |
| `/delete/{lectureId}` | POST | 删除讲座（软删除） | 是 |
| `/detail/{lectureId}` | GET | 获取讲座详情 | 否 |
| `/list` | GET | 获取讲座列表（分页） | 否 |
| `/expert/{expertId}` | GET | 获取专家的讲座列表（分页） | 否 |
| `/status/{lectureId}` | PUT | 更新讲座状态 | 是 |

### 接口详情

#### 1. 创建讲座

**路径**: `POST /api/lecture/create`

**请求体**:
```json
{
  "title": "讲座标题",
  "description": "讲座描述内容",
  "lectureTime": "2024-01-15 14:00:00",
  "location": "线上直播间",
  "maxParticipants": 100,
  "status": 0
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | String | 是 | 讲座标题 |
| description | String | 是 | 讲座描述 |
| lectureTime | String | 是 | 讲座时间（格式：yyyy-MM-dd HH:mm:ss） |
| location | String | 是 | 讲座地点/直播间地址 |
| maxParticipants | Integer | 是 | 最大参与人数 |
| status | Integer | 否 | 状态（默认0：预告中） |

**成功响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "expertId": 1001,
    "title": "讲座标题",
    "description": "讲座描述内容",
    "lectureTime": "2024-01-15 14:00:00",
    "location": "线上直播间",
    "maxParticipants": 100,
    "status": 0,
    "currentParticipants": 0,
    "createTime": "2024-01-10 10:00:00",
    "updateTime": "2024-01-10 10:00:00"
  }
}
```

#### 2. 更新讲座

**路径**: `PUT /api/lecture/update`

**请求体**:
```json
{
  "id": 1,
  "title": "更新后的标题",
  "description": "更新后的描述",
  "lectureTime": "2024-01-16 15:00:00",
  "location": "线下会场A",
  "maxParticipants": 150
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 讲座ID |
| title | String | 否 | 讲座标题 |
| description | String | 否 | 讲座描述 |
| lectureTime | String | 否 | 讲座时间 |
| location | String | 否 | 讲座地点 |
| maxParticipants | Integer | 否 | 最大参与人数 |

**成功响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": "更新成功"
}
```

#### 3. 删除讲座

**路径**: `POST /api/lecture/delete/{lectureId}`

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| lectureId | Long | 讲座ID |

**成功响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": "删除成功"
}
```

**说明**: 软删除，设置 `is_delete=1`，数据保留在数据库中。

#### 4. 获取讲座详情

**路径**: `GET /api/lecture/detail/{lectureId}`

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| lectureId | Long | 讲座ID |

**成功响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "expertId": 1001,
    "title": "讲座标题",
    "description": "讲座描述",
    "lectureTime": "2024-01-15 14:00:00",
    "location": "线上直播间",
    "maxParticipants": 100,
    "status": 0,
    "currentParticipants": 30,
    "createTime": "2024-01-10 10:00:00",
    "updateTime": "2024-01-10 10:00:00"
  }
}
```

#### 5. 获取讲座列表

**路径**: `GET /api/lecture/list?page=1&size=10`

**查询参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | Long | 是 | - | 页码（从1开始） |
| size | Long | 是 | - | 每页数量 |

**成功响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [...],
    "total": 100,
    "size": 10,
    "current": 1,
    "pages": 10
  }
}
```

#### 6. 获取专家的讲座列表

**路径**: `GET /api/lecture/expert/{expertId}?page=1&size=10`

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| expertId | Long | 专家用户ID |

**查询参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | Long | 是 | - | 页码 |
| size | Long | 是 | - | 每页数量 |

**成功响应**: 同获取讲座列表

#### 7. 更新讲座状态

**路径**: `PUT /api/lecture/status/{lectureId}?status=1`

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| lectureId | Long | 讲座ID |

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | Integer | 是 | 状态值 |

**状态值说明**:
| 状态码 | 含义 |
|--------|------|
| 0 | 预告中 |
| 1 | 直播中 |
| 2 | 已结束 |
| 3 | 已取消 |

**成功响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": "状态更新成功"
}
```

---

## 讲座报名接口

### 基础路径

`/api/lecture/signup`

### 接口列表

| 接口 | HTTP方法 | 功能描述 | 是否需要认证 |
|------|----------|----------|--------------|
| `/{lectureId}` | POST | 报名讲座 | 是 |
| `/cancel/{lectureId}` | POST | 取消报名 | 是 |
| `/check/{lectureId}` | GET | 检查是否已报名 | 是 |
| `/my` | GET | 获取我的报名列表（分页） | 是 |
| `/lecture/{lectureId}` | GET | 获取讲座的报名列表（分页） | 否 |
| `/attendance/{signUpId}` | PUT | 更新到场状态 | 否 |

### 接口详情

#### 1. 报名讲座

**路径**: `POST /api/lecture/signup/{lectureId}`

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| lectureId | Long | 讲座ID |

**成功响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "userId": 2001,
    "lectureId": 1,
    "isAttend": 0,
    "createTime": "2024-01-12 09:00:00"
  }
}
```

**失败响应（已报名）**:
```json
{
  "code": 400,
  "message": "fail",
  "data": "已报名该讲座"
}
```

#### 2. 取消报名

**路径**: `POST /api/lecture/signup/cancel/{lectureId}`

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| lectureId | Long | 讲座ID |

**成功响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": "取消报名成功"
}
```

#### 3. 检查是否已报名

**路径**: `GET /api/lecture/signup/check/{lectureId}`

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| lectureId | Long | 讲座ID |

**成功响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": true  // true=已报名, false=未报名
}
```

#### 4. 获取我的报名列表

**路径**: `GET /api/lecture/signup/my?page=1&size=10`

**查询参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | Long | 是 | - | 页码 |
| size | Long | 是 | - | 每页数量 |

**成功响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [
      {
        "id": 1,
        "userId": 2001,
        "lectureId": 1,
        "isAttend": 0,
        "createTime": "2024-01-12 09:00:00"
      }
    ],
    "total": 5,
    "size": 10,
    "current": 1,
    "pages": 1
  }
}
```

#### 5. 获取讲座的报名列表

**路径**: `GET /api/lecture/signup/lecture/{lectureId}?page=1&size=10`

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| lectureId | Long | 讲座ID |

**查询参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | Long | 是 | - | 页码 |
| size | Long | 是 | - | 每页数量 |

**成功响应**: 同获取我的报名列表

#### 6. 更新到场状态

**路径**: `PUT /api/lecture/signup/attendance/{signUpId}?isAttend=1`

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| signUpId | Long | 报名记录ID |

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| isAttend | Integer | 是 | 到场状态 |

**状态值说明**:
| 状态码 | 含义 |
|--------|------|
| 0 | 未确认 |
| 1 | 已到场 |
| 2 | 未到场 |

**成功响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": "状态更新成功"
}
```

---

## 数据模型

### ExpertLectureDTO（讲座数据传输对象）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 讲座ID |
| expertId | Long | 专家用户ID |
| title | String | 讲座标题 |
| description | String | 讲座描述 |
| lectureTime | String | 讲座时间 |
| location | String | 讲座地点 |
| maxParticipants | Integer | 最大参与人数 |
| currentParticipants | Integer | 当前报名人数 |
| status | Integer | 状态 |
| isDelete | Integer | 删除标记（0=未删除，1=已删除） |
| createTime | String | 创建时间 |
| updateTime | String | 更新时间 |

### LectureSignUpDTO（报名数据传输对象）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 报名记录ID |
| userId | Long | 用户ID |
| lectureId | Long | 讲座ID |
| isAttend | Integer | 到场状态 |
| createTime | String | 创建时间 |

---

## 错误码说明

| 错误码 | 含义 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未登录/未授权 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 认证说明

所有需要认证的接口，系统通过 `HttpServletRequest.getAttribute("loginUser")` 获取当前登录用户信息。前端需要在请求时确保用户已登录，并且登录信息已正确设置到请求属性中。
