"use client"

import * as React from "react"
import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()
  const { isMobile, state } = useSidebar()
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null)

  const isGroupActive = (subItems?: { url: string }[]) =>
    subItems?.some((item) => pathname === item.url || pathname.startsWith(item.url + '/'))

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-semibold">
        Menu
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const groupActive = isGroupActive(item.items)

          if (state === "collapsed" && !isMobile) {
            return (
              <SidebarMenuItem key={item.title}>
                <DropdownMenu 
                  open={openDropdown === item.title}
                  onOpenChange={(open) => {
                    setOpenDropdown(open ? item.title : null)
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      className={cn(
                        "rounded-xl transition-all duration-200",
                        "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                        groupActive && "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                      )}
                    >
                      {item.icon && (
                        <item.icon className={cn(groupActive && "text-indigo-600")} />
                      )}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="min-w-48 rounded-xl shadow-lg"
                    side="right"
                    align="start"
                    sideOffset={4}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    <DropdownMenuLabel className="flex items-center gap-2">
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.title}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {item.items?.map((subItem) => {
                      const isActive = pathname === subItem.url
                      return (
                        <DropdownMenuItem 
                          key={subItem.title} 
                          asChild
                          onSelect={() => setOpenDropdown(null)}
                        >
                          <Link 
                            href={subItem.url}
                            className={cn(
                              "rounded-lg transition-colors",
                              isActive && "bg-indigo-50 text-indigo-700 font-medium"
                            )}
                          >
                            {subItem.title}
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            )
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={groupActive || item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={cn(
                      "rounded-xl transition-all duration-200 hover:bg-sidebar-accent/80",
                      groupActive && "text-indigo-700 dark:text-indigo-300"
                    )}
                  >
                    {item.icon && (
                      <item.icon
                        className={cn(
                          "transition-colors duration-200",
                          groupActive ? "text-indigo-600" : "text-muted-foreground"
                        )}
                      />
                    )}
                    <span className="font-medium">{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="mx-0 border-l-2 border-indigo-100 ml-3 pl-2">
                    {item.items?.map((subItem) => {
                      const isActive = pathname === subItem.url
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActive}
                            className={cn(
                              "rounded-lg transition-all duration-200",
                              isActive &&
                                "bg-indigo-50 text-indigo-700 font-semibold shadow-sm shadow-indigo-500/5 border-l-2 border-indigo-500 -ml-0.5 pl-3 dark:bg-indigo-950/40 dark:text-indigo-300"
                            )}
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
