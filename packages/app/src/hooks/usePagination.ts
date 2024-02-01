export interface UsePaginationInterface {
  totalPages: number,
  currentPage: number,
}

export const range = (start: number, end: number) => {
  const length = end - start + 1;

  return Array.from({ length }, (_, i) => start + i);
};

export const usePagination = (props: UsePaginationInterface) => {
  const {
    totalPages,
    currentPage,
  } = props

  const initialPage = 1

  const lastPage = totalPages

  const rangeStart = currentPage - 2 === initialPage ? initialPage : Math.max(currentPage - 1, 1)

  const rangeEnd = currentPage + 2 === lastPage ? lastPage : Math.min(currentPage + 1, 10)

  const baseRange = range(rangeStart, rangeEnd)

  const items = [
    'prev',
    ...(!baseRange.includes(initialPage) ? [initialPage, 'ellipsis'] : []),

    ...baseRange,

    ...(!baseRange.includes(lastPage) ? ['ellipsis', lastPage] : []),
    'next'
  ].filter((item) => !!item)

  return {
    items,
  }
}

export default usePagination
