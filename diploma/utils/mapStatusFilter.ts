import { getInterestNameByFilterKey, type MapSortFilterKey } from '@/constants/interests';
import { statusBelongsToCategory } from '@/constants/statuses';

export function markerMatchesStatusFilter(
  status: string | null | undefined,
  filterKey: MapSortFilterKey,
): boolean {
  if (filterKey === 'all') return true;

  const categoryTitle = getInterestNameByFilterKey(filterKey);
  if (!categoryTitle) return true;

  return statusBelongsToCategory(status, categoryTitle);
}
