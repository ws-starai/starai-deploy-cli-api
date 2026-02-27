/**
 * starai-deploy-cli 对外钩子接口类型，唯一维护处。
 * 供 CLI 内部、starai-database 等子项目 deploy-hooks 使用，仅此一份，勿在 CLI 内再定义。
 */

/** 部署类型：docker-build 需构建镜像，config-only 仅拉取配置并 compose up */
export type DeployType = "docker-build" | "config-only";

/** 部署流式日志级别，用于 GET /deploy-stream/:id?min_level= 过滤与 SSE 事件中的 level 字段 */
export type LogLevel = "debug" | "info" | "warn" | "error";

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

/** 钩子内网络下载选项（走 CLI 代理逻辑：可用走代理、不可用直连、失败降级直连） */
export interface DownloadWithPolicyOptions {
    authHeader?: string;
    timeoutSec?: number;
}

export interface DeployHookContext {
    deployId: string;
    phase: string;
    /** 输出到 CLI 部署日志与 stream，钩子内可用 ctx.log 或 console.log/warn/error。level 默认 info */
    log?(message: string, level?: LogLevel): void;
    /**
     * 带代理策略的下载：代理可用则走代理，不可用则直连；走代理失败时自动降级直连并打日志。
     * 钩子内用于下载 MMDB、规则文件等，与 CLI 内部 download_source 同策略。
     */
    downloadWithPolicy?(url: string, destPath: string, options?: DownloadWithPolicyOptions): Promise<void>;
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
