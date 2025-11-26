import { useParams } from '@tanstack/react-router'
import { useShallow } from 'zustand/react/shallow'
import { useTranslation } from 'react-i18next'
import type { LockedFilters } from '@/features/search/stores/use-filters-store'
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

interface SearchSidebarProps extends React.ComponentProps<typeof Sidebar> {
  lockedFilters?: LockedFilters
}

export function SearchSidebar({ lockedFilters, ...props }: SearchSidebarProps) {
  const { t } = useTranslation()
  const { herbariaId } = useParams({ strict: false })
  const { activeFiltersCount, resetFilters } = useFilterStore(
    useShallow((state) => ({
      activeFiltersCount: state.activeFiltersCount,
      resetFilters: state.resetFilters,
    })),
  )

  // in the search of each herbarium i need to substract 1 from the active filters count
  const trueActiveFiltersCount = herbariaId !== 'all' ? activeFiltersCount - 1 : activeFiltersCount
  const lockedFiltersPresent = lockedFilters && lockedFilters.length > 0

  return (
    <Tabs defaultValue="filters" asChild>
      <Sidebar className="top-[var(--header-height)] !h-[calc(100svh-var(--header-height))]" {...props}>
        <SidebarHeader>
          <SidebarMenu className="relative">
            <SidebarMenuItem className="flex items-center justify-center">
              <TabsList className="bg-background border-input h-auto gap-1 border p-0.5">
                <TabsTrigger
                  key="filters"
                  value="filters"
                  className="data-[state=active]:bg-ring dark:data-[state=active]:bg-ring data-[state=active]:text-primary-foreground hover:cursor-pointer"
                >
                  <span className="text-[13px]">{t('search.filters.filters-switch')}</span>
                </TabsTrigger>
                <TabsTrigger
                  key="see filters"
                  value="selected-filters"
                  className="data-[state=active]:bg-ring dark:data-[state=active]:bg-ring data-[state=active]:text-primary-foreground hover:cursor-pointer"
                >
                  <span className="text-[13px]">{t('search.filters.selected-filters')}</span>
                </TabsTrigger>
              </TabsList>
            </SidebarMenuItem>
            {(!lockedFiltersPresent && activeFiltersCount > 0) || (lockedFiltersPresent && activeFiltersCount > 1) ? (
              <span className="absolute top-0.5 right-2">
                <ResetFilterButton
                  itemCount={trueActiveFiltersCount}
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
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-3 group-data-[collapsible=icon]:overflow-hidden"
          >
            <SearchFilters lockedFilters={lockedFilters} />
          </TabsContent>
          <TabsContent
            key="selected-filters"
            value="selected-filters"
            tabIndex={-1}
            className="flex min-h-0 flex-1 flex-col overflow-auto px-3 group-data-[collapsible=icon]:overflow-hidden"
          >
            <SelectedFiltersTree />
          </TabsContent>
        </SidebarContent>
        <hr className="text-input mx-2" />
        <SidebarFooter className="h-[58px] pt-0">
          <SidebarTrigger
            className="fixed bottom-3 left-3 z-[51] border-transparent bg-transparent text-transparent hover:bg-transparent"
            textShow=""
            textHide=""
          ></SidebarTrigger>
        </SidebarFooter>
      </Sidebar>
    </Tabs>
  )
}
