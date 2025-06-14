import { useShallow } from 'zustand/react/shallow'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { ResetFilterButton } from '@/features/search/components/reset-filter-button'
import { SelectedFiltersTree } from '@/features/search/components/selected-filters-tree'
import { SearchFilters } from '@/features/search/components/search-filters'
import type { LockedFilters } from '@/features/search/stores/use-filters-store'

interface SearchSidebarProps extends React.ComponentProps<typeof Sidebar> {
  lockedFilters?: LockedFilters
}

export function SearchSidebar({ lockedFilters, ...props }: SearchSidebarProps) {
  const { activeFiltersCount, resetFilters } = useFilterStore(
    useShallow((state) => ({
      activeFiltersCount: state.activeFiltersCount,
      resetFilters: state.resetFilters,
    })),
  )

  return (
    <Tabs defaultValue="filters" asChild>
      <Sidebar
        className="top-[var(--header-height)] !h-[calc(100svh-var(--header-height))]"
        {...props}
      >
        <SidebarHeader>
          <SidebarMenu className="relative">
            <SidebarMenuItem className="flex items-center justify-center">
              <TabsList className="p-0.5 h-auto bg-background border border-input gap-1">
                <TabsTrigger
                  key="filters"
                  value="filters"
                  className="data-[state=active]:bg-ring data-[state=active]:text-primary-foreground"
                >
                  <span className="text-[13px]">Filters</span>
                </TabsTrigger>
                <TabsTrigger
                  key="see filters"
                  value="selected-filters"
                  className="data-[state=active]:bg-ring data-[state=active]:text-primary-foreground"
                >
                  <span className="text-[13px]">Selected filters</span>
                </TabsTrigger>
              </TabsList>
            </SidebarMenuItem>
            {(!lockedFilters && activeFiltersCount > 0) ||
            (lockedFilters && activeFiltersCount > 1) ? (
              <span className="absolute right-2 top-0.5">
                <ResetFilterButton
                  itemCount={activeFiltersCount}
                  onResetClick={() => resetFilters(lockedFilters)}
                  size="sm"
                />
              </span>
            ) : null}
          </SidebarMenu>
        </SidebarHeader>
        <hr className="text-input mx-2" />
        <SidebarContent className="gap-4">
          <TabsContent
            key="filters"
            value="filters"
            tabIndex={-1}
            className="flex min-h-0 flex-1 flex-col overflow-auto group-data-[collapsible=icon]:overflow-hidden px-3 gap-4"
          >
            <SearchFilters lockedFilters={lockedFilters} />
          </TabsContent>
          <TabsContent
            key="selected-filters"
            value="selected-filters"
            tabIndex={-1}
            className="flex min-h-0 flex-1 flex-col overflow-auto group-data-[collapsible=icon]:overflow-hidden px-3"
          >
            <SelectedFiltersTree />
          </TabsContent>
        </SidebarContent>
        <hr className="text-input mx-2" />
        <SidebarFooter className="h-[58px] pt-0">
          <SidebarTrigger
            className="z-[51] fixed left-3 bottom-3 text-transparent bg-transparent border-transparent hover:bg-transparent"
            textShow=""
            textHide=""
          ></SidebarTrigger>
        </SidebarFooter>
      </Sidebar>
    </Tabs>
  )
}
