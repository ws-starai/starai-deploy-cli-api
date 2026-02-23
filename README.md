# starai-deploy-cli-api

仅包含 [starai-deploy-cli](https://github.com/ws-starai/starai-deploy-cli) 对外钩子接口类型，供接入方（如各服务的 `deploy-hooks.ts`）做静态检查。内容由 CLI 发布流程自动同步，版本与 CLI 对齐。

## 安装

```bash
yarn add github:ws-starai/starai-deploy-cli-api#main
# 或指定版本
yarn add github:ws-starai/starai-deploy-cli-api#v1.0.0
```

## 使用

```ts
import type { DeployParams, DeployHookContext, DeployHooks } from "starai-deploy-cli-api";
```
