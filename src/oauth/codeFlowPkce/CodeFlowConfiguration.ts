export type CodeFlowConfiguration = {
    client_id: string,
    client_secret?: string,
    okta_url: string,
    scopes: string[],
    redirect_uri: string,
    logout_uri: string,
    // for public client (ex: SPA)
    origin?: string
}
