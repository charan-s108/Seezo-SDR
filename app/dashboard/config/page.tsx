"use client"

import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  SiSlack,
  SiJira,
  SiConfluence,
  SiGoogledocs,
  SiNotion,
  SiLucid,
} from "react-icons/si"

type Integration = {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  configured: boolean
}

const iconClass = "w-6 h-6"

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: "slack",
    name: "Slack",
    description: "Send assessments and notifications to channels",
    icon: <SiSlack className={iconClass} />,
    configured: true,
  },
  {
    id: "jira",
    name: "Jira",
    description: "Create and sync issues with JIRA workflows",
    icon: <SiJira className={iconClass} />,
    configured: false,
  },
  {
    id: "servicenow",
    name: "ServiceNow",
    description: "Integrate incidents and change management system",
    icon: (
      <Image
        src="/icons/servicenow.svg"
        alt="ServiceNow"
        width={24}
        height={24}
      />
    ),
    configured: false,
  },
  {
    id: "confluence",
    name: "Confluence",
    description: "Publish security documentation and findings",
    icon: <SiConfluence className={iconClass} />,
    configured: false,
  },
  {
    id: "gdocs",
    name: "Google Docs",
    description: "Sync assessments with shared documents",
    icon: <SiGoogledocs className={iconClass} />,
    configured: true,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Embed assessments into knowledge base",
    icon: <SiNotion className={iconClass} />,
    configured: false,
  },
  {
    id: "lucid",
    name: "Lucidchart",
    description: "Visualize architecture and threat models",
    icon: <SiLucid className={iconClass} />,
    configured: true,
  },
  {
    id: "icepanel",
    name: "IcePanel",
    description: "Integrate system architecture diagrams and flows",
    icon: (
      <Image
        src="/icons/icepanel.svg"
        alt="IcePanel"
        width={28}
        height={28}
      />
    ),
    configured: false,
  },
]

function IntegrationIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-12 h-12 rounded-lg bg-muted/40 border flex items-center justify-center group-hover:scale-105 transition">
      {children}
    </div>
  )
}


export default function ConfigPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(
    INITIAL_INTEGRATIONS
  )

  const toggleIntegration = (id: string) => {
    setIntegrations(
      integrations.map((integration) =>
        integration.id === id
          ? { ...integration, configured: !integration.configured }
          : integration
      )
    )
  }

  return (
    <div className="min-h-full rounded-xl border bg-background p-6 flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Integration Configuration</h1>
        <p className="text-muted-foreground">
          Connect third-party platforms to enhance your security assessment workflow
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <Card
            key={integration.id}
            className="hover:shadow-lg transition-shadow cursor-pointer group relative overflow-hidden"
          >
            {/* Configured Badge */}
            <div className="absolute top-3 right-3 z-10">
              <Badge
                variant={integration.configured ? "default" : "secondary"}
                className="gap-1"
              >
                {integration.configured ? "✓ Configured" : "Not Configured"}
              </Badge>
            </div>

            <CardContent className="p-4 h-full flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                {/* Platform Icon */}
                <IntegrationIcon>{integration.icon}</IntegrationIcon>

                {/* Platform Info */}
                <div>
                  <h3 className="font-semibold text-base">{integration.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {integration.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => toggleIntegration(integration.id)}
                className="mt-3 w-full px-3 py-1.5 rounded-md text-xs font-medium transition-colors bg-muted hover:bg-blue-100 hover:text-blue-700"
              >
                {integration.configured ? "Manage" : "Configure"}
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
