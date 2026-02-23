/**
 * starai-deploy-cli 对外钩子接口类型（与 CLI 内部 src/types 保持同步）。
 * 本文件为「公开仓库 starai-deploy-cli-types」的唯一源码，由 CLI 发布流程同步更新。
 * 仅包含钩子接入方（如 starai-database deploy-hooks.ts）依赖的类型。
 */

/** 部署类型：docker-build 需构建镜像，config-only 仅拉取配置并 compose up */
export type DeployType = "docker-build" | "config-only";

/**
 * 部署参数（与 starai-api 下发 body 一致）
 */
export interface DeployParams {
    deploy_id: string;
    repo: string;
    tag: string;
    /** 可选：源码下载 URL。若提供则优先使用；否则由 repo+tag 拼 GitHub tarball URL */
    source_url?: string;
    /** 可选：下载 source_url/repo tag 时的 GitHub token，仅本次请求使用、不落盘。未提供时使用环境变量 GITHUB_PAT（私有仓库二选一即可） */
    source_download_token?: string;
    /** 可选，默认 docker-build。config-only 时跳过 docker_build 阶段 */
    deploy_type?: DeployType;
    service_name: string;
    /** docker-build 必填；config-only 可不填或填空 */
    image_name: string;
    container_name: string;
    compose_services: string;
    compose_project_name: string;
    remote_dir: string;
    gateway_location_file?: string;
    gateway_conf_name?: string;
    /** 可选：HTTP 健康检查 URL，与旧流程 HEALTH_CHECK_URL 对齐；未传时可用环境变量 HEALTH_CHECK_URL */
    health_check_url?: string;
    /** 可选：是否在健康检查阶段再次校验 Gateway 路由（nginx -t），与旧流程 CHECK_GATEWAY_ROUTE 对齐 */
    check_gateway_route?: boolean;
    /** 可选：构建时传入的 commit SHA，与旧流程 BUILD_COMMIT 对齐；未传时为 unknown */
    commit?: string;
}

export interface DeployHookContext {
    deployId: string;
    phase: string;
    /** 输出到 CLI 部署日志与 stream，钩子内可用 ctx.log 或 console.log/warn/error */
    log?(message: string): void;
}

export interface DeployHooks {
    afterDownloadSource?(params: DeployParams, ctx: DeployHookContext): void | Promise<void>;
    beforeBuild?(params: DeployParams, ctx: DeployHookContext): void | Promise<void>;
    afterBuild?(params: DeployParams, ctx: DeployHookContext): void | Promise<void>;
    beforeComposeUp?(params: DeployParams, ctx: DeployHookContext): void | Promise<void>;
    afterComposeUp?(params: DeployParams, ctx: DeployHookContext): void | Promise<void>;
    updateGatewayRoute?(params: DeployParams, ctx: DeployHookContext): void | Promise<void>;
    beforeHealthCheck?(params: DeployParams, ctx: DeployHookContext): void | Promise<void>;
    afterHealthCheck?(params: DeployParams, ctx: DeployHookContext): void | Promise<void>;
}
