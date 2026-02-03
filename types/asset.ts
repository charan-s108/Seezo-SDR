export type AssetType =
  | "diagram"
  | "doc"
  | "code"
  | "url"
  | "config"
  | "text"

export type Asset = {
  _id: string
  name: string
  type: AssetType

  storage?: {
    kind: "local" | "s3" | "github" | "url"
    path?: string
  }

  size?: number
  mimeType?: string
  createdAt?: string
}
